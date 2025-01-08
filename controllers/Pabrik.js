import Pabrik from "../models/DasarPabrik.js"; // Import model Pabrik dari path yang sesuai
import User from "../models/UserModel.js"; // Import model User dari path yang sesuai

// Fungsi untuk mendapatkan semua data pabrik
export const getPabrik = async (req, res) => {
  try {
    let response;
    if (req.role === "admin" || req.role === "perusahaan") {
      // Jika pengguna adalah admin atau perusahaan, ambil semua data pabrik
      response = await Pabrik.findAll({
        include: [
          {
            model: User,
            attributes: ["name", "email"], // Sertakan informasi pengguna terkait
          },
        ],
        order: [["updatedAt", "DESC"]], // Urutkan berdasarkan waktu terakhir diperbarui secara menurun
      });
    } else if (req.role === "pabrik") {
      // Jika pengguna adalah pabrik, hanya ambil data yang dibuat oleh pabrik tersebut
      response = await Pabrik.findAll({
        where: {
          userId: req.userId, // Ambil data berdasarkan userId dari pengguna yang login
        },
        include: [
          {
            model: User,
            attributes: ["name", "email"], // Sertakan informasi pengguna terkait
          },
        ],
        order: [["updatedAt", "DESC"]], // Urutkan berdasarkan waktu terakhir diperbarui secara menurun
      });
    } else {
      // Jika role pengguna tidak dikenali atau tidak diizinkan melihat data
      return res.status(403).json({ msg: "Akses Ditolak" });
    }
    res.status(200).json(response); // Berikan respons dengan data yang ditemukan
  } catch (error) {
    console.error("Error saat mendapatkan data pabrik:", error.message); // Log error ke console
    res.status(500).json({ msg: error.message }); // Berikan respons error dengan pesan
  }
};
// Fungsi untuk mendapatkan data pabrik berdasarkan ID
export const getPabrikById = async (req, res) => {
  const { id } = req.params; // Mengambil ID dari parameter URL

  try {
    // Menemukan data pabrik berdasarkan ID
    const pabrik = await Pabrik.findOne({
      where: { id: id },
      include: [
        {
          model: User,
          attributes: ["name", "email"], // Sertakan informasi pengguna terkait
        },
      ],
    });

    // Jika pabrik tidak ditemukan
    if (!pabrik) {
      return res.status(404).json({ msg: "Data pabrik tidak ditemukan." });
    }

    // Jika pengguna adalah admin, perusahaan, atau pengguna pabrik dengan akses ke pabrik miliknya
    if (
      req.role === "admin" || 
      req.role === "perusahaan" || 
      (req.role === "pabrik" && req.userId === pabrik.userId)
    ) {
      return res.status(200).json(pabrik); // Berikan respons dengan data pabrik
    }

    // Jika pengguna tidak diizinkan melihat data
    return res.status(403).json({ msg: "Akses ditolak. Anda tidak memiliki izin untuk mengakses data ini." });
  } catch (error) {
    console.error("Error saat mendapatkan data pabrik:", error.message); // Log error ke console
    res.status(500).json({ msg: error.message }); // Berikan respons error dengan pesan
  }
};


// Fungsi untuk membuat data pabrik baru
export const createPabrik = async (req, res) => {
  try {
    const data = req.body; // Mengambil data dari request body
    if (req.role !== "admin" && req.role !== "pabrik") {
      return res.status(403).json({ msg: "Hanya pengguna dengan role 'admin' atau 'pabrik' yang dapat membuat data pabrik." });
    }

    // Cek apakah user sudah memiliki data pabrik
    const existingPabrik = await Pabrik.findOne({
      where: { userId: req.userId }, // Mencari data pabrik berdasarkan userId
    });

    if (existingPabrik) {
      return res.status(400).json({ msg: "Setiap pengguna hanya dapat memiliki satu data pabrik." });
    }

    // Gunakan req.userId sebagai pabrikUuid
    const pabrikUuid = req.email; // Menggunakan email sebagai pabrikUuid

    // Membuat data pabrik baru
    const newPabrik = await Pabrik.create({
      ...data,
      userId: req.userId, // Mengaitkan data pabrik dengan userId dari pengguna yang login
      pabrikUuid, // Menetapkan email sebagai pabrikUuid
    });

    res.status(201).json({ newPabrik, msg: "Data pabrik berhasil dibuat." }); // Memberikan respons dengan data pabrik baru yang dibuat
  } catch (error) {
    console.error("Error saat membuat data pabrik:", error.message); // Log error ke console
    res.status(500).json({ msg: error.message }); // Memberikan respons error dengan pesan
  }
};

// Fungsi untuk memperbarui data pabrik
export const updatePabrik = async (req, res) => {
  const { id } = req.params; // Mengambil ID dari parameter URL
  const data = req.body; // Mengambil data dari request body

  try {
    // Validasi role pengguna
    if (req.role !== "pabrik") {
      return res.status(403).json({ msg: "Hanya pengguna dengan role 'pabrik' yang dapat mengupdate data pabrik." });
    }

    // Cari data pabrik yang akan diperbarui berdasarkan userId yang sedang login
    const pabrikToUpdate = await Pabrik.findOne({ where: { id: id, userId: req.userId } });

    if (!pabrikToUpdate) {
      return res.status(404).json({ msg: "Data pabrik tidak ditemukan atau Anda tidak memiliki hak akses untuk mengupdate data ini." });
    }

    // Perbarui data pabrik
    await pabrikToUpdate.update(data);

    res.status(200).json({ msg: "Data pabrik berhasil diupdate." }); // Berikan respons sukses
  } catch (error) {
    console.error("Error saat mengupdate data pabrik:", error.message); // Log error ke console
    res.status(500).json({ msg: error.message }); // Berikan respons error dengan pesan
  }
};


// Fungsi untuk menghapus data pabrik
export const deletePabrik = async (req, res) => {
  const { id } = req.params; // Mengambil ID dari parameter URL

  try {
    if (req.role !== "admin" && req.role !== "pabrik") {
      return res.status(403).json({ msg: "Hanya admin dan pabrik yang dapat menghapus data pabrik." });
    }

    const deleted = await Pabrik.destroy({
      where: { id: id }, // Hapus data pabrik berdasarkan ID
    });

    if (deleted === 0) {
      return res.status(404).json({ msg: "Data pabrik tidak ditemukan." });
    }

    res.status(200).json({ msg: "Data pabrik berhasil dihapus." }); // Berikan respons sukses
  } catch (error) {
    console.error("Error saat menghapus data pabrik:", error.message); // Log error ke console
    res.status(500).json({ msg: error.message }); // Berikan respons error dengan pesan
  }
};
