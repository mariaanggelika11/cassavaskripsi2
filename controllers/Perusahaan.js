import DataPerusahaan from "../models/DataPerusahaanModel.js"; // Pastikan path sesuai
import User from "../models/UserModel.js"; // Pastikan path sesuai
import { Op } from "sequelize";

// Fungsi untuk mendapatkan semua data perusahaan
export const getDataPerusahaan = async (req, res) => {
  try {
    let response;
    // Jika pengguna adalah admin, logistik, perusahaan, pabrik, atau petani
    if (req.role === "admin" || req.role === "logistik" || req.role === "perusahaan" || req.role === "pabrik" || req.role === "petani") {
      // Ambil semua data perusahaan
      response = await DataPerusahaan.findAll({
        attributes: ["idharga", "tanggalupdateharga", "hargaGradeA", "hargaGradeB", "hargaGradeC", "catatan"],
        include: [
          {
            model: User,
            attributes: ["name", "email"], // Informasi tambahan dari pengguna yang membuat DataPerusahaan
          },
        ],
      });
    }
    res.status(200).json(response); // Kirim respons dengan data yang ditemukan
  } catch (error) {
    res.status(500).json({ msg: error.message }); // Kirim respons error jika terjadi kesalahan
  }
};

// Fungsi untuk mendapatkan data perusahaan berdasarkan ID
export const getDataPerusahaanById = async (req, res) => {
  try {
    // Cari data perusahaan berdasarkan UUID yang diberikan
    const DataPerusahaan = await DataPerusahaan.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!DataPerusahaan) return res.status(404).json({ msg: "Data tidak ditemukan" });

    let response;
    // Jika pengguna adalah admin, logistik, pabrik, atau petani
    if (req.role === "admin" || req.role === "logistik" || req.role === "pabrik" || req.role === "petani") {
      response = await DataPerusahaan.findOne({
        attributes: ["idharga", "tanggalupdateharga", "hargaGradeA", "hargaGradeB", "hargaGradeC", "catatan"],
        where: {
          id: DataPerusahaan.id,
        },
        include: [
          {
            model: User,
            attributes: ["name", "email"], // Informasi tambahan dari pengguna yang membuat DataPerusahaan
          },
        ],
      });
    } else {
      // Jika pengguna tidak memiliki peran yang diizinkan, hanya ambil data yang dibuat oleh pengguna yang login
      response = await DataPerusahaan.findOne({
        attributes: ["idharga", "tanggalupdateharga", "hargaGradeA", "hargaGradeB", "hargaGradeC", "catatan"],
        where: {
          [Op.and]: [{ id: DataPerusahaan.id }, { userId: req.userId }],
        },
        include: [
          {
            model: User,
            attributes: ["name", "email"], // Informasi tambahan dari pengguna yang membuat DataPerusahaan
          },
        ],
      });
    }
    if (!response) return res.status(404).json({ msg: "DataPerusahaan tidak ditemukan atau tidak dapat diakses" });
    res.status(200).json(response); // Kirim respons dengan data yang ditemukan
  } catch (error) {
    res.status(500).json({ msg: error.message }); // Kirim respons error jika terjadi kesalahan
  }
};

// Fungsi untuk membuat data perusahaan baru
export const createDataPerusahaan = async (req, res) => {
  const { idharga, tanggalupdateharga, hargaGradeA, hargaGradeB, hargaGradeC, catatan } = req.body;
  try {
    await DataPerusahaan.create({
      idharga: idharga,
      tanggalupdateharga: tanggalupdateharga,
      hargaGradeA: hargaGradeA,
      hargaGradeB: hargaGradeB,
      hargaGradeC: hargaGradeC,
      catatan: catatan,
      userId: req.userId, // Mengaitkan data perusahaan dengan pengguna yang login
    });
    res.status(201).json({ msg: "Order Pemanenan Created Successfully" }); // Kirim respons sukses
  } catch (error) {
    res.status(500).json({ msg: error.message }); // Kirim respons error jika terjadi kesalahan
  }
};

// Fungsi untuk memperbarui data perusahaan
export const updateDataPerusahaan = async (req, res) => {
  try {
    // Cari data perusahaan berdasarkan UUID yang diberikan
    const DataPerusahaan = await DataPerusahaan.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!DataPerusahaan) return res.status(404).json({ msg: "Data tidak ditemukan" });

    // Data baru yang akan diperbarui
    const { idharga, tanggalupdateharga, hargaGradeA, hargaGradeB, hargaGradeC, catatan } = req.body;

    // Memeriksa apakah pengguna adalah admin atau perusahaan
    if (["admin", "perusahaan"].includes(req.role)) {
      // Hanya admin atau perusahaan yang dapat memperbarui
      await DataPerusahaan.update(
        {
          idharga,
          tanggalupdateharga,
          hargaGradeA,
          hargaGradeB,
          hargaGradeC,
          catatan,
        },
        {
          where: {
            id: DataPerusahaan.id,
          },
        }
      );
      res.status(200).json({ msg: "Data Perusahaan berhasil diperbarui" }); // Kirim respons sukses
    } else {
      return res.status(403).json({ msg: "Akses terlarang" }); // Kirim respons error jika pengguna tidak diizinkan memperbarui
    }
  } catch (error) {
    res.status(500).json({ msg: error.message }); // Kirim respons error jika terjadi kesalahan
  }
};

// Fungsi untuk menghapus data perusahaan
export const deleteDataPerusahaan = async (req, res) => {
  try {
    // Cari data perusahaan berdasarkan UUID yang diberikan
    const DataPerusahaan = await DataPerusahaan.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!DataPerusahaan) return res.status(404).json({ msg: "Data tidak ditemukan" });

    // Memeriksa apakah pengguna adalah admin atau perusahaan
    if (req.role !== "admin" && req.role !== "perusahaan") {
      return res.status(403).json({ msg: "Akses terlarang" }); // Kirim respons error jika pengguna tidak diizinkan menghapus
    }

    await DataPerusahaan.destroy({
      where: {
        id: DataPerusahaan.id,
      },
    });

    res.status(200).json({ msg: "DataPerusahaan berhasil dihapus" }); // Kirim respons sukses
  } catch (error) {
    res.status(500).json({ msg: error.message }); // Kirim respons error jika terjadi kesalahan
  }
};
