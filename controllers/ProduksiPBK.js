// File controller: PabrikproduksiController.js
import Pabrikproduksi from "../models/ProduksiHarianPBK.js";
import Users from "../models/UserModel.js";
import OrderPemanen from "../models/OrderPanen.js";
import Pabrik from "../models/DasarPabrik.js";

const createPabrikproduksi = async (req, res) => {
  try {
    const {
      Idorderdipakai,
      tanggalProduksi,
      Jenisolahan,
      jumlahproduksiharian,
      kualitasOutput,
      permasalahanOperasional,
      kebutuhanPerbaikan,
      limbahcair,
      catatanlimbah,
      limbahpadat,
      catatanlimbahpadat,
    } = req.body; // Mengambil data dari request body

    // Validasi role pengguna
    if (req.role !== "pabrik") {
      return res.status(403).json({
        msg: "Hanya pengguna dengan role 'pabrik' yang dapat membuat data pabrik."
      });
    }

    // Validasi idOrderDipakai
    if (!Idorderdipakai) {
      return res.status(400).json({ msg: "idOrderDipakai harus diisi." });
    }

    const order = await OrderPemanen.findOne({ where: { uuid: Idorderdipakai } });
    if (!order) {
      return res.status(404).json({ msg: "idOrderDipakai tidak ditemukan." });
    }

    if (order.namaPabrik !== req.name) {
      return res.status(403).json({
        msg: "idOrderDipakai tidak sesuai dengan nama pabrik Anda."
      });
    }

    // Validasi kapasitas produksi
    const pabrik = await Pabrik.findOne({ where: { userId: req.userId } });
    if (!pabrik) {
      return res.status(404).json({ msg: "Pabrik tidak ditemukan untuk pengguna ini." });
    }

    if (jumlahproduksiharian > pabrik.kapasitasproduksi) {
      return res.status(400).json({
        msg: `Jumlah produksi harian tidak boleh melebihi kapasitas produksi yang tersedia (${pabrik.kapasitasproduksi}).`
      });
    }

    // Membuat data pabrik baru
    const newPabrik = await Pabrikproduksi.create({
      Idorderdipakai,
      tanggalProduksi,
      Jenisolahan,
      jumlahproduksiharian,
      kualitasOutput,
      permasalahanOperasional,
      kebutuhanPerbaikan,
      limbahcair,
      catatanlimbah,
      limbahpadat,
      catatanlimbahpadat,
      userId: req.userId, // Mengaitkan data pabrik dengan userId dari pengguna yang login
    });

    res.status(201).json({ newPabrik, msg: "Data pabrik berhasil dibuat." }); // Berikan respons dengan data pabrik baru yang dibuat
  } catch (error) {
    console.error("Error saat membuat data pabrik:", error.message); // Log error ke console
    res.status(500).json({ msg: error.message }); // Berikan respons error dengan pesan
  }
};


// Fungsi untuk mengambil semua data pabrik produksi
const getAllPabrikproduksi = async (req, res) => {
  try {
    const pabrikproduksi = await Pabrikproduksi.findAll({
      include: [{ model: Users, as: "user" }],
    });
    res.json(pabrikproduksi);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fungsi untuk mengambil data pabrik produksi berdasarkan ID
const getPabrikproduksiById = async (req, res) => {
  try {
    const id = req.params.id;
    const pabrikproduksi = await Pabrikproduksi.findByPk(id, {
      include: [{ model: Users, as: "user" }],
    });
    if (!pabrikproduksi) {
      res.status(404).json({ message: "Data pabrik produksi tidak ditemukan" });
    } else {
      res.json(pabrikproduksi);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fungsi untuk mengupdate data pabrik produksi
const updatePabrikproduksi = async (req, res) => {
  try {
    const id = req.params.id;
    const pabrikproduksi = await Pabrikproduksi.findByPk(id);
    if (!pabrikproduksi) {
      res.status(404).json({ message: "Data pabrik produksi tidak ditemukan" });
    } else {
      await pabrikproduksi.update(req.body);
      res.json(pabrikproduksi);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fungsi untuk menghapus data pabrik produksi
const deletePabrikproduksi = async (req, res) => {
  try {
    const id = req.params.id;
    const pabrikproduksi = await Pabrikproduksi.findByPk(id);
    if (!pabrikproduksi) {
      res.status(404).json({ message: "Data pabrik produksi tidak ditemukan" });
    } else {
      await pabrikproduksi.destroy();
      res.json({ message: "Data pabrik produksi berhasil dihapus" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {  createPabrikproduksi, getAllPabrikproduksi, getPabrikproduksiById, updatePabrikproduksi, deletePabrikproduksi };