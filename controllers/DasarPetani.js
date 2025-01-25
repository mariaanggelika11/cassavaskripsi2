import Petani from "../models/DasarPetani.js";
import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";

const JWT_SECRET = process.env.JWT_SECRET || "bbyifdrdd6r09u8fdxesesedtghbjkjkn";

// Fungsi untuk mendapatkan semua data petani
export const getpetanidasar = async (req, res) => {
  try {
    let response;

    // Cek jika role adalah admin atau perusahaan, ambil semua data petani
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
    } else if (req.role === "petani") {
      // Jika role adalah petani, hanya ambil data petani yang userId-nya sama dengan req.userID
      response = await Petani.findAll({
        where: { userId: req.userId },
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

    // Format angka dengan tanda titik sesuai lokal Indonesia
    const formatNumber = (value) =>
      new Intl.NumberFormat("id-ID", { minimumFractionDigits: 0 }).format(value);

    // Iterasi respons untuk memformat nilai numerik
    const formattedResponse = response.map((petani) => {
      const data = petani.dataValues;
      return {
        ...data,
        luaslahan: formatNumber(data.luaslahan),
      };
    });

    res.status(200).json(formattedResponse);
  } catch (error) {
    console.error("Error saat mendapatkan data petani:", error.message);
    res.status(500).json({ msg: error.message });
  }
};

// Fungsi untuk membuat data petani baru
export const createPetani = async (req, res) => {
  try {
    const {
      kategorilahan,
      namePerusahaan,
      lokasilahan,
      luaslahan,
      periodeTanamMulai,
      periodeTanamSelesai,
    } = req.body;

    // Ambil token dari header Authorization
    const token = req.header("Authorization").replace("Bearer ", "");

    // Verifikasi token
    const decoded = jwt.verify(token, JWT_SECRET);
    const userUuid = decoded.id; // Ambil UUID dari token

    // Memeriksa apakah pengguna memiliki peran 'petani' atau 'admin'
    const user = await User.findOne({ where: { uuid: userUuid } });
    if (!user || (user.role !== "petani" && user.role !== "admin")) {
      return res.status(403).json({
        msg: "Hanya pengguna dengan role 'petani' atau 'admin' yang dapat membuat data petani.",
      });
    }

    // Membuat entri baru di tabel petani
    const newPetani = await Petani.create({
      userId: user.id, // Mengaitkan data petani dengan pengguna yang sedang login
      userUuid, // Menyimpan UUID pengguna
      kategorilahan,
      namePerusahaan,
      lokasilahan,
      luaslahan,
      periodeTanamMulai,
      periodeTanamSelesai,
    });

    // Format angka dengan tanda titik
    const formatNumber = (value) =>
      new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 0,
      }).format(value);

    // Format nilai numerik sebelum dikirim dalam respons
    const formattedPetaniData = {
      ...newPetani.dataValues,
      luaslahan: formatNumber(newPetani.luaslahan),
    };

    res.status(201).json({
      newPetani: formattedPetaniData,
      msg: "Data petani berhasil dibuat",
    });
  } catch (error) {
    console.error("Error saat membuat data petani:", error.message);
    res.status(500).json({ msg: error.message });
  }
};


// Fungsi untuk mendapatkan data petani berdasarkan ID
export const getPetaniById = async (req, res) => {
  const { id } = req.params; // Asumsikan id adalah userUuid

  try {
    const petani = await Petani.findOne({
      where: { userUuid: id }, // Pencarian berdasarkan userUuid
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

    // Format angka dengan tanda titik sesuai lokal Indonesia
    const formatNumber = (value) =>
      new Intl.NumberFormat("id-ID", { minimumFractionDigits: 0 }).format(value);

    // Format properti numerik
    const formattedPetani = {
      ...petani.dataValues,
      luaslahan: formatNumber(petani.luaslahan),
      estimasiproduksi: formatNumber(petani.estimasiproduksi),
      produksiaktual: formatNumber(petani.produksiaktual),
      jumlahpupuk: formatNumber(petani.jumlahpupuk),
    };

    res.status(200).json(formattedPetani);
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