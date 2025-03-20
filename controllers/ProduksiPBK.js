// File controller: PabrikproduksiController.js
import Pabrikproduksi from "../models/ProduksiHarianPBK.js";
import TransaksiPBK from "../models/TransaksiPabrik.js";
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

    // Ambil data order berdasarkan UUID
    const order = await OrderPemanen.findOne({ where: { uuid: Idorderdipakai } });
    if (!order) {
      return res.status(404).json({ msg: "idOrderDipakai tidak ditemukan." });
    }

    if (order.namaPabrik !== req.name) {
      return res.status(403).json({
        msg: "idOrderDipakai tidak sesuai dengan nama pabrik Anda."
      });
    }

    // Ambil total berat diterima dari TransaksiPBK berdasarkan orderPemanenUUID
    const transaksi = await TransaksiPBK.findOne({
      where: { orderPemanenUuid: Idorderdipakai },
    });

    if (!transaksi) {
      return res.status(404).json({ msg: "Data TransaksiPBK tidak ditemukan untuk order ini." });
    }

    const beratTotalDiterima = transaksi.beratTotalDiterima || 0;

    // Ambil total jumlah produksi harian yang sudah ada untuk Idorderdipakai
    const totalProduksiSebelumnya = await Pabrikproduksi.sum("jumlahproduksiharian", {
      where: { Idorderdipakai },
    });

    const sisaBerat = beratTotalDiterima - (totalProduksiSebelumnya || 0);

    // Validasi jika jumlah produksi harian melebihi sisa berat yang tersedia
    if (jumlahproduksiharian > sisaBerat) {
      return res.status(400).json({
        msg: `Jumlah produksi harian (${jumlahproduksiharian}) melebihi kapasitas sisa berat singkong id tersebut  (${sisaBerat}).`
      });
    }

    // Validasi kapasitas produksi pabrik
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
      userId: req.userId,
    });

    res.status(201).json({ newPabrik, msg: "Data pabrik berhasil dibuat." });

  } catch (error) {
    console.error("Error saat membuat data pabrik:", error.message);
    res.status(500).json({ msg: error.message });
  }
};


export const getValidOrderUUID = async (req, res) => {
  try {
    // Validasi role pengguna harus 'pabrik'
    if (req.role !== "pabrik") {
      return res.status(403).json({
        msg: "Hanya pengguna dengan role 'pabrik' yang dapat mengakses daftar order."
      });
    }

    // Ambil total berat diterima dari tabel TransaksiPBK berdasarkan userId
    const totalBeratDiterima = await TransaksiPBK.sum("beratTotalDiterima", {
      where: { userId: req.userId },
    });

    // Ambil total produksi harian dari tabel PabrikProduksi berdasarkan userId
    const totalProduksiHarian = await Pabrikproduksi.sum("jumlahproduksiharian", {
      where: { userId: req.userId },
    });

    // Hitung sisa berat yang masih tersedia
    const sisaBerat = (totalBeratDiterima || 0) - (totalProduksiHarian || 0);

    // Jika sisa berat sudah 0 atau kurang, tidak menampilkan UUID
    if (sisaBerat <= 0) {
      return res.status(200).json([]); // Kirim array kosong jika kapasitas sudah habis
    }

    // Ambil order yang sesuai dengan kondisi
    const orders = await OrderPemanen.findAll({
      attributes: ["uuid"],
      where: {
        namaPabrik: req.name, // Hanya order untuk pabrik ini
        statusorder: "order selesai", // Hanya order yang sudah selesai
      },
    });

    if (!orders.length) {
      return res.status(404).json({ msg: "Tidak ada order selesai untuk pabrik ini." });
    }

    // Mengambil hanya UUID yang valid
    const orderUUIDs = orders.map((order) => order.uuid);

    res.status(200).json(orderUUIDs);
  } catch (error) {
    console.error("Error saat mengambil daftar order UUID:", error.message);
    res.status(500).json({ msg: error.message });
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

// Fungsi untuk mengambil data pabrik produksi berdasarkan userId
const getPabrikproduksiUserId = async (req, res) => {
  try {
    const { userId } = req.params; // Ambil userId dari parameter URL

    // Validasi apakah userId ada
    if (!userId) {
      return res.status(400).json({ message: "userId tidak disediakan dalam parameter URL" });
    }

    // Validasi akses berdasarkan peran pengguna
    if (
      req.role !== "admin" && // Admin memiliki akses penuh
      req.role !== "perusahaan" && // Perusahaan juga memiliki akses
      req.userId !== parseInt(userId) // Pengguna pabrik hanya dapat mengakses data miliknya
    ) {
      return res.status(403).json({ message: "Anda tidak memiliki izin untuk mengakses data ini." });
    }

    // Cari data pabrik produksi berdasarkan userId
    const pabrikproduksi = await Pabrikproduksi.findAll({
      where: { userId },
      include: [{ model: Users, as: "user" }],
    });

    // Jika data tidak ditemukan
    if (!pabrikproduksi || pabrikproduksi.length === 0) {
      return res.status(404).json({ message: "Data pabrik produksi tidak ditemukan untuk userId ini." });
    }

    // Kirimkan data pabrik produksi
    res.status(200).json(pabrikproduksi);
  } catch (error) {
    console.error("Error saat mengambil data pabrik produksi:", error.message);
    res.status(500).json({ message: "Terjadi kesalahan saat mengambil data pabrik produksi." });
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


export {  createPabrikproduksi, getAllPabrikproduksi, getPabrikproduksiById, getPabrikproduksiUserId, updatePabrikproduksi, deletePabrikproduksi };