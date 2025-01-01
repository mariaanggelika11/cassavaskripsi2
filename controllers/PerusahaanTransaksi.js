import TransaksiPR from "../models/TransaksiPerusahaan.js";
import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "bbyifdrdd6r09u8fdxesesedtghbjkjkn";

// Fungsi untuk mendapatkan data TransaksiPR berdasarkan peran pengguna
export const getTransaksiPR = async (req, res) => {
  try {
    let response;
    if (req.role === "admin" || req.role === "perusahaan") {
      // Jika pengguna adalah admin atau perusahaan, ambil semua data TransaksiPR
      response = await TransaksiPR.findAll({
        include: [
          {
            model: User,
            attributes: ["name", "email"], // Sertakan informasi pengguna yang terkait
          },
        ],
        order: [["updatedAt", "DESC"]], // Urutkan berdasarkan updatedAt secara menurun
      });
    } else {
      return res.status(403).json({ msg: "Akses Ditolak" });
    }
    res.status(200).json(response);
  } catch (error) {
    console.error("Error saat mendapatkan data TransaksiPR:", error.message);
    res.status(500).json({ msg: "Terjadi kesalahan saat mengambil data TransaksiPR." });
  }
};

// Fungsi untuk mendapatkan satu data TransaksiPR berdasarkan ID
export const getTransaksiPRById = async (req, res) => {
  const { id } = req.params;

  try {
    const transaksiPR = await TransaksiPR.findOne({
      where: { id: id },
      include: [
        {
          model: User,
          attributes: ["name", "email"],
        },
      ],
    });

    if (!transaksiPR) {
      return res.status(404).json({ msg: "Data TransaksiPR tidak ditemukan." });
    }

    if (req.role === "admin" || req.role === "perusahaan") {
      return res.status(200).json(transaksiPR);
    } else {
      return res.status(403).json({ msg: "Akses ditolak." });
    }
  } catch (error) {
    console.error("Error saat mendapatkan data TransaksiPR:", error.message);
    res.status(500).json({ msg: "Terjadi kesalahan saat mengambil data TransaksiPR." });
  }
};

// Fungsi untuk membuat data TransaksiPR baru
export const createTransaksiPR = async (req, res) => {
  try {
    const data = req.body;
    if (req.role !== "perusahaan") {
      return res.status(403).json({ msg: "Hanya pengguna dengan peran 'perusahaan' yang dapat membuat data TransaksiPR." });
    }

    const newTransaksiPR = await TransaksiPR.create({
      ...data,
      userId: req.userId,
    });

    res.status(201).json({ newTransaksiPR, msg: "Data TransaksiPR berhasil dibuat." });
  } catch (error) {
    console.error("Error saat membuat data TransaksiPR:", error.message);
    res.status(500).json({ msg: "Terjadi kesalahan saat membuat data TransaksiPR." });
  }
};

// Fungsi untuk memperbarui data TransaksiPR berdasarkan ID
export const updateTransaksiPR = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    if (req.role !== "perusahaan") {
      return res.status(403).json({ msg: "Hanya pengguna dengan peran 'perusahaan' yang dapat memperbarui data TransaksiPR." });
    }

    const transaksiPRToUpdate = await TransaksiPR.findOne({ where: { id: id, userId: req.userId } });

    if (!transaksiPRToUpdate) {
      return res.status(404).json({ msg: "Data TransaksiPR tidak ditemukan atau Anda tidak memiliki hak akses untuk mengupdate data ini." });
    }

    await transaksiPRToUpdate.update(data);
    res.status(200).json({ msg: "Data TransaksiPR berhasil diupdate." });
  } catch (error) {
    console.error("Error saat mengupdate data TransaksiPR:", error.message);
    res.status(500).json({ msg: "Terjadi kesalahan saat mengupdate data TransaksiPR." });
  }
};

// Fungsi untuk menghapus data TransaksiPR berdasarkan ID
export const deleteTransaksiPR = async (req, res) => {
  const { id } = req.params;

  try {
    if (req.role !== "admin") {
      return res.status(403).json({ msg: "Hanya admin yang dapat menghapus data TransaksiPR." });
    }

    const deleted = await TransaksiPR.destroy({ where: { id: id } });

    if (deleted === 0) {
      return res.status(404).json({ msg: "Data TransaksiPR tidak ditemukan." });
    }

    res.status(200).json({ msg: "Data TransaksiPR berhasil dihapus." });
  } catch (error) {
    console.error("Error saat menghapus data TransaksiPR:", error.message);
    res.status(500).json({ msg: "Terjadi kesalahan saat menghapus data TransaksiPR." });
  }
};