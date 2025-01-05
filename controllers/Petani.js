import Petani from "../models/RencanaTanam.js";
import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";

const JWT_SECRET = process.env.JWT_SECRET || "bbyifdrdd6r09u8fdxesesedtghbjkjkn";

// Fungsi untuk mendapatkan semua data petani
export const getPetanis = async (req, res) => {
  try {
    let response;
    if (req.role === "admin" || req.role === "perusahaan") {
      response = await Petani.findAll({
        include: [
          {
            model: User,
            attributes: ["name", "email"],
          },
        ],
        order: [["updatedAt", "DESC"]],
      });
    } else {
      return res.status(403).json({ msg: "Akses Ditolak" });
    }
    res.status(200).json(response);
  } catch (error) {
    console.error("Error saat mendapatkan data petani:", error.message);
    res.status(500).json({ msg: error.message });
  }
};


// Fungsi untuk membuat data petani baru
export const createPetani = async (req, res) => {
  try {
    const {
      lokasilahan,
      luaslahan,
      statuskepemilikanlahan,
      periodeTanamMulai,
      periodeTanamSelesai,
      varietassingkong,
      estimasiproduksi,
      produksiaktual,
      catatantambahan,
      jenispupuk,
      jumlahpupuk,
    } = req.body;

    // Ambil token dari header Authorization
    const token = req.header("Authorization").replace("Bearer ", "");

    // Verifikasi token
    const decoded = jwt.verify(token, JWT_SECRET);
    const userUuid = decoded.id; // Ambil UUID dari token

    // Memeriksa apakah pengguna memiliki peran 'petani' atau 'admin'
    const user = await User.findOne({ where: { uuid: userUuid } });
    if (!user || (user.role !== "petani" && user.role !== "admin")) {
      return res.status(403).json({ msg: "Hanya pengguna dengan role 'petani' atau 'admin' yang dapat membuat data petani." });
    }

    // Membuat entri baru di tabel petani
    const newPetani = await Petani.create({
      userId: user.id, // Mengaitkan data petani dengan pengguna yang sedang login
      userUuid, // Menyimpan UUID pengguna
      lokasilahan,
      luaslahan,
      statuskepemilikanlahan,
      periodeTanamMulai,
      periodeTanamSelesai,
      varietassingkong,
      estimasiproduksi,
      produksiaktual,
      catatantambahan,
      jenispupuk,
      jumlahpupuk,
    });

    res.status(201).json({ newPetani, msg: "Data petani berhasil dibuat" });
  } catch (error) {
    console.error("Error saat membuat data petani:", error.message);
    res.status(500).json({ msg: error.message });
  }
};

// Fungsi untuk memperbarui data petani
export const updatePetani = async (req, res) => {
  const { id } = req.params; // Asumsi ID data petani yang akan diupdate dikirim melalui parameter URL
  const { lokasilahan, luaslahan, statuskepemilikanlahan, periodeTanamMulai, periodeTanamSelesai, varietassingkong, estimasiproduksi, produksiaktual, catatantambahan, jenispupuk, jumlahpupuk, hargajual, totalpendapatan, pendapatanbersih } =
    req.body;

  try {
    // Memastikan hanya pengguna dengan peran 'petani' atau 'admin' yang bisa melakukan update
    if (req.role !== "petani" && req.role !== "admin") {
      return res.status(403).json({ msg: "Hanya pengguna dengan role 'petani' atau 'admin' yang dapat mengupdate data petani." });
    }

    // Tambahan validasi untuk memastikan pengguna 'petani' hanya dapat mengupdate data miliknya sendiri
    let condition = req.role === "admin" ? { id: id } : { id: id, userId: req.userId };

    const petaniToUpdate = await Petani.findOne({ where: condition });

    if (!petaniToUpdate) {
      return res.status(404).json({ msg: "Data petani tidak ditemukan atau Anda tidak memiliki hak akses untuk mengupdate data ini." });
    }

    await petaniToUpdate.update({
      lokasilahan,
      luaslahan,
      statuskepemilikanlahan,
      periodeTanamMulai,
      periodeTanamSelesai,
      varietassingkong,
      estimasiproduksi,
      produksiaktual,
      catatantambahan,
      jenispupuk,
      jumlahpupuk,
    });

    res.status(200).json({ msg: "Data petani berhasil diupdate" });
  } catch (error) {
    console.error("Error saat mengupdate data petani:", error.message);
    res.status(500).json({ msg: error.message });
  }
};

// Fungsi untuk mendapatkan data petani berdasarkan ID
export const getPetaniById = async (req, res) => {
  const { id } = req.params;  // Asumsikan id adalah userUuid

  try {
    const petani = await Petani.findOne({
      where: { userUuid: id },  // Pencarian berdasarkan userUuid
      include: [
        {
          model: User,
          attributes: ["name", "email"],
        },
      ],
    });

    if (!petani) {
      return res.status(404).json({ msg: "Data petani tidak ditemukan." });
    }

    res.status(200).json(petani);
  } catch (error) {
    console.error("Error saat mendapatkan data petani:", error.message);
    res.status(500).json({ msg: error.message });
  }
};

// Fungsi untuk menghapus data petani
export const deletePetani = async (req, res) => {
  const { id } = req.params; // Mengambil ID dari parameter URL untuk menentukan data petani yang akan dihapus

  try {
    // Memeriksa peran pengguna, mengizinkan penghapusan hanya jika pengguna adalah admin
    if (req.role !== "admin") {
      return res.status(403).json({ msg: "Hanya admin yang dapat menghapus data petani." });
    }

    // Menemukan dan menghapus data petani berdasarkan ID
    const deleted = await Petani.destroy({
      where: { id: id },
    });

    // Jika tidak ada data yang dihapus (karena tidak ditemukan), kembalikan pesan error
    if (deleted === 0) {
      return res.status(404).json({ msg: "Data petani tidak ditemukan." });
    }

    res.status(200).json({ msg: "Data petani berhasil dihapus." });
  } catch (error) {
    console.error("Error saat menghapus data petani:", error.message);
    res.status(500).json({ msg: error.message });
  }
};

/// Fungsi untuk mendapatkan semua ID lahan dari semua petani
export const getAllLahanOptions = async (req, res) => {
  try {
    const petani = await Petani.findAll({
      attributes: ['idlahan'], // Ambil hanya ID lahan
    });

    if (!petani.length) {
      return res.status(404).json({ msg: "Tidak ada lahan yang ditemukan." });
    }

    // Mengambil hanya ID lahan
    const lahanOptions = petani.map(p => p.idlahan);
    res.status(200).json(lahanOptions); // Kirim respons dengan ID lahan
  } catch (error) {
    res.status(500).json({ msg: error.message }); // Kirim respons error jika terjadi kesalahan server
  }
};

// Fungsi untuk mendapatkan data dari ID lahan yang spesifik
export const getLahanById = async (req, res) => {
  const { idLahan } = req.params; // Ambil ID lahan dari parameter URL

  try {
    const lahan = await Petani.findOne({
      where: { idlahan: idLahan }, // Ambil data berdasarkan ID lahan
    });

    if (!lahan) {
      return res.status(404).json({ msg: "Lahan tidak ditemukan." });
    }

    res.status(200).json(lahan); // Kirim respons dengan data lahan
  } catch (error) {
    res.status(500).json({ msg: error.message }); // Kirim respons error jika terjadi kesalahan server
  }
};