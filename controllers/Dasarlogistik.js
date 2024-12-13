// File controller: LogistikdasarController.js
import Logistikdasar from "../models/LogistikDasarModels.js";
import Users from "../models/UserModel.js";

// Fungsi untuk membuat data logistik
const createLogistik = async (req, res) => {
  try {
    const userId = req.user.id;
    const logistik = await Logistikdasar.create({ ...req.body, userId });
    res.json(logistik);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fungsi untuk mengambil semua data logistik
const getAllLogistik = async (req, res) => {
  try {
    const logistik = await Logistikdasar.findAll({
      include: [{ model: Users, as: "user" }],
    });
    res.json(logistik);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fungsi untuk mengambil data logistik berdasarkan ID
const getLogistikById = async (req, res) => {
  try {
    const id = req.params.id;
    const logistik = await Logistikdasar.findByPk(id, {
      include: [{ model: Users, as: "user" }],
    });
    if (!logistik) {
      res.status(404).json({ message: "Data logistik tidak ditemukan" });
    } else {
      res.json(logistik);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fungsi untuk mengupdate data logistik
const updateLogistik = async (req, res) => {
  try {
    const id = req.params.id;
    const logistik = await Logistikdasar.findByPk(id);
    if (!logistik) {
      res.status(404).json({ message: "Data logistik tidak ditemukan" });
    } else {
      await logistik.update(req.body);
      res.json(logistik);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fungsi untuk menghapus data logistik
const deleteLogistik = async (req, res) => {
  try {
    const id = req.params.id;
    const logistik = await Logistikdasar.findByPk(id);
    if (!logistik) {
      res.status(404).json({ message: "Data logistik tidak ditemukan" });
    } else {
      await logistik.destroy();
      res.json({ message: "Data logistik berhasil dihapus" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { createLogistik, getAllLogistik, getLogistikById, updateLogistik, deleteLogistik };