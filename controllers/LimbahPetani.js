import limbahpetani from "../models/LimbahPetani.js";
import User from "../models/UserModel.js";

// Fungsi untuk mendapatkan data limbah berdasarkan peran pengguna
export const getLimbah = async (req, res) => {
  try {
    let response;
    if (req.role === "admin" || req.role === "perusahaan") {
      // Jika pengguna adalah admin atau perusahaan, ambil semua data limbah
      response = await limbahpetani.findAll({
        include: [
          {
            model: User,
            attributes: ["name", "email"], // Sertakan informasi pengguna yang terkait
          },
        ],
        order: [["updatedAt", "DESC"]], // Urutkan hasil berdasarkan field updatedAt secara menurun
      });
    } else if (req.role === "petani") {
      // Jika pengguna adalah petani, ambil hanya data yang dia buat
      response = await limbahpetani.findAll({
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
    console.error("Error saat mendapatkan data limbah:", error.message);
    res.status(500).json({ msg: error.message }); // Kirim respons kesalahan jika terjadi sesuatu yang salah
  }
};

// Fungsi untuk mendapatkan satu data limbah berdasarkan ID
export const getLimbahById = async (req, res) => {
  const { id } = req.params; // Ambil ID dari parameter URL

  try {
    // Temukan data limbah berdasarkan ID
    const limbah = await limbahpetani.findOne({
      where: { id: id },
      include: [
        {
          model: User,
          attributes: ["name", "email"], // Sertakan informasi pengguna yang terkait
        },
      ],
    });

    // Jika data limbah tidak ditemukan
    if (!limbah) {
      return res.status(404).json({ msg: "Data limbah tidak ditemukan." });
    }

    // Jika pengguna adalah admin, perusahaan, atau petani yang membuat data tersebut
    if (
      req.role === "admin" ||
      req.role === "perusahaan" ||
      (req.role === "petani" && req.userId === limbah.userId)
    ) {
      return res.status(200).json(limbah); // Kirim data yang diambil sebagai respons
    } else {
      // Jika pengguna tidak diizinkan melihat data
      return res.status(403).json({ msg: "Akses ditolak." });
    }
  } catch (error) {
    console.error("Error saat mendapatkan data limbah:", error.message);
    res.status(500).json({ msg: error.message }); // Kirim respons kesalahan jika terjadi sesuatu yang salah
  }
};

// Fungsi untuk membuat data limbah baru
export const createLimbah = async (req, res) => {
  try {
    const data = req.body;
    if (req.role !== "admin" && req.role !== "petani") {
      return res.status(403).json({
        msg: "Hanya pengguna dengan peran 'admin' atau 'petani' yang dapat membuat data limbah.",
      });
    }

    // Buat data limbah baru dengan data dari body permintaan
    const newLimbah = await limbahpetani.create({
      ...data,
      userId: req.userId, // Setel userId ke ID pengguna yang membuat permintaan
    });

    res.status(201).json({ newLimbah, msg: "Data limbah berhasil dibuat." }); // Kirim data yang dibuat sebagai respons
  } catch (error) {
    console.error("Error saat membuat data limbah:", error.message);
    res.status(500).json({ msg: error.message }); // Kirim respons kesalahan jika terjadi sesuatu yang salah
  }
};

// Fungsi untuk memperbarui data limbah yang ada berdasarkan ID
export const updateLimbah = async (req, res) => {
  const { id } = req.params; // Ambil ID dari parameter URL
  const data = req.body;

  try {
    if (req.role !== "admin" && req.role !== "petani") {
      return res.status(403).json({
        msg: "Hanya pengguna dengan peran 'admin' atau 'petani' yang dapat mengupdate data limbah.",
      });
    }

    // Izinkan admin mengupdate semua data, dan petani hanya data mereka sendiri
    const condition = req.role === "admin" ? { id: id } : { id: id, userId: req.userId };

    // Temukan data limbah yang akan diperbarui
    const limbahToUpdate = await limbahpetani.findOne({ where: condition });

    // Jika data tidak ditemukan
    if (!limbahToUpdate) {
      return res.status(404).json({
        msg: "Data limbah tidak ditemukan atau Anda tidak memiliki hak akses untuk mengupdate data ini.",
      });
    }

    await limbahToUpdate.update(data); // Perbarui data limbah

    res.status(200).json({ msg: "Data limbah berhasil diupdate." }); // Kirim respons sukses
  } catch (error) {
    console.error("Error saat mengupdate data limbah:", error.message);
    res.status(500).json({ msg: error.message }); // Kirim respons kesalahan jika terjadi sesuatu yang salah
  }
};

// Fungsi untuk menghapus data limbah berdasarkan ID
export const deleteLimbah = async (req, res) => {
  const { id } = req.params; // Ambil ID dari parameter URL

  try {
    if (req.role !== "admin") {
      return res.status(403).json({ msg: "Hanya admin yang dapat menghapus data limbah." });
    }

    const deleted = await limbahpetani.destroy({
      where: { id: id }, // Hapus data limbah berdasarkan ID
    });

    if (deleted === 0) {
      return res.status(404).json({ msg: "Data limbah tidak ditemukan." });
    }

    res.status(200).json({ msg: "Data limbah berhasil dihapus." }); // Kirim respons sukses
  } catch (error) {
    console.error("Error saat menghapus data limbah:", error.message);
    res.status(500).json({ msg: error.message }); // Kirim respons kesalahan jika terjadi sesuatu yang salah
  }
};
