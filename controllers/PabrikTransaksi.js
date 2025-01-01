import TransaksiPBK from "../models/TransaksiPabrik.js";
import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "bbyifdrdd6r09u8fdxesesedtghbjkjkn";


// Fungsi untuk mendapatkan data transaksiPBK berdasarkan peran pengguna
export const getTransaksiPBK = async (req, res) => {
    try {
      let response;
      if (req.role === "admin" || req.role === "perusahaan") {
        // Jika pengguna adalah admin atau perusahaan, ambil semua data transaksiPBK
        response = await TransaksiPBK.findAll({
          include: [
            {
              model: User,
              attributes: ["name", "email"], // Sertakan informasi pengguna yang terkait
            },
          ],
          order: [["updatedAt", "DESC"]], // Urutkan hasil berdasarkan field updatedAt secara menurun
        });
      } else if (req.role === "logistik") {
        // Jika pengguna adalah logistik, ambil hanya data yang dia buat
        response = await TransaksiPBK.findAll({
          where: {
            userId: req.userId, // Hanya ambil data yang dibuat oleh pengguna ini
          },
          include: [
            {
              model: User,
              attributes: ["name", "email"], // Sertakan informasi pengguna yang terkait
            },
          ],
          order: [["updatedAt", "DESC"]], // Urutkan hasil berdasarkan field updatedAt secara menurun
        });
      } else {
        // Jika peran pengguna tidak dikenali atau tidak diizinkan melihat data
        return res.status(403).json({ msg: "Akses Ditolak" });
      }
      res.status(200).json(response); // Kirim data yang diambil sebagai respons
    } catch (error) {
      console.error("Error saat mendapatkan data transaksiPBK:", error.message);
      res.status(500).json({ msg: "Terjadi kesalahan saat mengambil data transaksiPBK." });
    }
  };
  
  // Fungsi untuk mendapatkan satu data transaksiPBK berdasarkan ID
  export const getTransaksiPBKById = async (req, res) => {
    const { id } = req.params; // Ambil ID dari parameter URL
  
    try {
      // Temukan data transaksiPBK berdasarkan ID
      const transaksiPBK = await TransaksiPBK.findOne({
        where: { id: id },
        include: [
          {
            model: User,
            attributes: ["name", "email"], // Sertakan informasi pengguna yang terkait
          },
        ],
      });
  
      // Jika data transaksiPBK tidak ditemukan
      if (!transaksiPBK) {
        return res.status(404).json({ msg: "Data transaksiPBK tidak ditemukan." });
      }
  
      // Jika pengguna adalah admin, perusahaan, atau pengguna logistik yang membuat data tersebut
      if (req.role === "admin" || req.role === "perusahaan" || (req.role === "logistik" && req.userId === transaksiPBK.userId)) {
        return res.status(200).json(transaksiPBK); // Kirim data yang diambil sebagai respons
      } else {
        // Jika pengguna tidak diizinkan melihat data
        return res.status(403).json({ msg: "Akses ditolak." });
      }
    } catch (error) {
      console.error("Error saat mendapatkan data transaksiPBK:", error.message);
      res.status(500).json({ msg: "Terjadi kesalahan saat mengambil data transaksiPBK." });
    }
  };
  
  // Fungsi untuk membuat data transaksiPBK baru
  export const createTransaksiPBK = async (req, res) => {
    try {
      const data = req.body;
      if (req.role !== "perusahaan" && req.role !== "pabrik") {
        return res.status(403).json({ msg: "Hanya pengguna dengan peran 'admin' atau 'pabrik' yang dapat membuat data transaksiPBK." });
      }
  
      // Buat data transaksiPBK baru dengan data dari body permintaan
      const newTransaksiPBK = await TransaksiPBK.create({
        ...data,
        userId: req.userId, // Setel userId ke ID pengguna yang membuat permintaan
      });
  
      res.status(201).json({ newTransaksiPBK, msg: "Data transaksiPBK berhasil dibuat." }); // Kirim data yang dibuat sebagai respons
    } catch (error) {
      console.error("Error saat membuat data transaksiPBK:", error.message);
      res.status(500).json({ msg: "Terjadi kesalahan saat membuat data transaksiPBK." });
    }
  };
  
  // Fungsi untuk memperbarui data transaksiPBK yang ada berdasarkan ID
  export const updateTransaksiPBK = async (req, res) => {
    const { id } = req.params; // Ambil ID dari parameter URL
    const data = req.body;
  
    try {
      if (req.role !== "perusahaan" && req.role !== "pabrik") {
        return res.status(403).json({ msg: "Hanya pengguna dengan peran 'perusahaan' atau 'pabrik' yang dapat mengupdate data transaksiPBK." });
      }
  
      // Izinkan admin mengupdate semua data, dan pengguna logistik hanya data mereka sendiri
      const condition = req.role === "perusahaan" ? { id: id } : { id: id, userId: req.userId };
  
      // Temukan data transaksiPBK yang akan diperbarui
      const transaksiPBKToUpdate = await TransaksiPBK.findOne({ where: condition });
  
      // Jika data tidak ditemukan
      if (!transaksiPBKToUpdate) {
        return res.status(404).json({ msg: "Data transaksiPBK tidak ditemukan atau Anda tidak memiliki hak akses untuk mengupdate data ini." });
      }
  
      await transaksiPBKToUpdate.update(data); // Perbarui data transaksiPBK
  
      res.status(200).json({ msg: "Data transaksiPBK berhasil diupdate." }); // Kirim respons sukses
    } catch (error) {
      console.error("Error saat mengupdate data transaksiPBK:", error.message);
      res.status(500).json({ msg: "Terjadi kesalahan saat mengupdate data transaksiPBK." });
    }
  };
  
  // Fungsi untuk menghapus data transaksiPBK berdasarkan ID
  export const deleteTransaksiPBK = async (req, res) => {
    const { id } = req.params; // Ambil ID dari parameter URL
  
    try {
      if (req.role !== "perusahaan") {
        return res.status(403).json({ msg: "Hanya admin yang dapat menghapus data transaksiPBK." });
      }
  
      const deleted = await TransaksiPBK.destroy({
        where: { id: id }, // Hapus data transaksiPBK berdasarkan ID
      });
  
      if (deleted === 0) {
        return res.status(404).json({ msg: "Data transaksiPBK tidak ditemukan." });
      }
  
      res.status(200).json({ msg: "Data transaksiPBK berhasil dihapus." }); // Kirim respons sukses
    } catch (error) {
      console.error("Error saat menghapus data transaksiPBK:", error.message);
      res.status(500).json({ msg: "Terjadi kesalahan saat menghapus data transaksiPBK." });
    }
  };