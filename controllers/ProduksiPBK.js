// File controller: PabrikproduksiController.js
import Pabrikproduksi from "../models/DataProduksiPbk.js";
import Users from "../models/UserModel.js";

// Fungsi untuk membuat data pabrik produksi
const createPabrikproduksi = async (req, res) => {
  try {
    const userId = req.user.id;
    const pabrikproduksi = await Pabrikproduksi.create({ ...req.body, userId });
    res.json(pabrikproduksi);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

export { createPabrikproduksi, getAllPabrikproduksi, getPabrikproduksiById, updatePabrikproduksi, deletePabrikproduksi };