// File controller: LogistikdasarController.js
import Logistikdasar from "../models/DasarLogistik.js";
import Users from "../models/UserModel.js";

// Fungsi untuk membuat data logistik
const createLogistik = async (req, res) => {
  try {
    const userId = req.userId;
    const logistik = await Logistikdasar.create({ ...req.body, userId });
    res.json(logistik);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
 
const getAllLogistik = async (req, res) => {
  try {
    let logistik;

    // Validasi peran pengguna
    if (req.role === "admin" || req.role === "perusahaan") {
      // Admin dan perusahaan dapat melihat semua data
      logistik = await Logistikdasar.findAll({
        include: [{
          model: Users,
          as: "user",
          attributes: ['uuid', 'name', 'role'], // Ambil hanya uuid, name, dan role
        }],
      });
    } else {
      // Pengguna lain hanya dapat melihat data miliknya sendiri
      logistik = await Logistikdasar.findAll({
        where: { userId: req.userId },
        include: [{
          model: Users,
          as: "user",
          attributes: ['uuid', 'name', 'role'], // Ambil hanya uuid, name, dan role
        }],
      });
    }

    // Jika tidak ada data ditemukan
    if (logistik.length === 0) {
      return res.status(404).json({ message: "Data logistik tidak ditemukan" });
    }

    res.json(logistik); // Kirim data logistik sebagai respons
  } catch (error) {
    console.error("Error saat mengambil data logistik:", error.message);
    res.status(500).json({ message: error.message });
  }
};


// Fungsi untuk mengambil data logistik berdasarkan UUID
const getLogistikById = async (req, res) => {
  try {
    const { id } = req.params; // Ambil UUID dari parameter URL

    // Validasi apakah id disediakan
    if (!id) {
      return res.status(400).json({ message: "UUID tidak disediakan dalam parameter URL" });
    }

    const logistik = await Logistikdasar.findOne({
      where: { id }, // Pastikan id benar-benar UUID
      include: [
        {
          model: Users,
          as: "user",
          attributes: ['uuid', 'name', 'role'], // Ambil hanya uuid, name, dan role
        },
      ],
    });

    // Jika data logistik tidak ditemukan
    if (!logistik) {
      return res.status(404).json({ message: "Data logistik tidak ditemukan" });
    }

    // Validasi akses berdasarkan peran pengguna
    if (
      req.role !== "admin" && // Admin memiliki akses penuh
      req.role !== "perusahaan" && // Perusahaan memiliki akses
      req.userId !== logistik.userId // Logistik hanya dapat mengakses data miliknya
    ) {
      return res.status(403).json({
        message: "Anda tidak memiliki izin untuk mengakses data logistik ini.",
      });
    }

    res.json(logistik); // Kirim data logistik sebagai respons
  } catch (error) {
    console.error("Error saat mengambil data logistik:", error.message);
    res.status(500).json({ message: error.message });
  }
};


const getLogistikByUserId = async (req, res) => {
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
      req.userId !== parseInt(userId) // Pengguna logistik hanya dapat mengakses data miliknya
    ) {
      return res.status(403).json({
        message: "Anda tidak memiliki izin untuk mengakses data logistik ini.",
      });
    }

    // Ambil data logistik dari database
    const logistik = await Logistikdasar.findAll({
      where: { userId },
      include: [
        {
          model: Users,
          as: "user",
          attributes: ['uuid', 'name', 'role'], // Ambil hanya uuid, name, dan role
        },
      ],
    });

    // Jika data logistik tidak ditemukan
    if (logistik.length === 0) {
      return res.status(404).json({ message: "Data logistik tidak ditemukan untuk userId ini" });
    }

    // Kirim data logistik sebagai respons
    res.json(logistik);
  } catch (error) {
    console.error("Error saat mengambil data logistik berdasarkan userId:", error.message);
    res.status(500).json({ message: error.message });
  }
};




// Fungsi untuk mengupdate data logistik
const updateLogistik = async (req, res) => {

    const { id } = req.params; // Ambil ID dari parameter URL
    try {
      // Cari data logistik berdasarkan ID
      const logistik = await Logistikdasar.findByPk(id);
  
      if (!logistik) {
        return res.status(404).json({ message: "Data logistik tidak ditemukan" });
      }
  

    // Periksa apakah pengguna adalah admin atau pemilik data logistik
    if (req.role !== "admin" && req.userId !== logistik.userId) {
      return res
        .status(403)
        .json({ message: "Anda tidak memiliki izin untuk mengupdate data logistik ini." });
    }

    // Update data logistik
    await logistik.update(req.body);

    res.status(200).json({
      message: "Data logistik berhasil diperbarui.",
      data: logistik,
    });
  } catch (error) {
    console.error("Error saat mengupdate data logistik:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Fungsi untuk menghapus data logistik
const deleteLogistik = async (req, res) => {
  const { id } = req.params; // Ambil ID dari parameter URL

  try {
    // Cari data logistik berdasarkan ID
    const logistik = await Logistikdasar.findByPk(id);

    if (!logistik) {
      return res.status(404).json({ message: "Data logistik tidak ditemukan" });
    }

    // Periksa apakah pengguna adalah admin atau pemilik data logistik
    if (req.role !== "admin" && req.userId !== logistik.userId) {
      return res
        .status(403)
        .json({ message: "Anda tidak memiliki izin untuk menghapus data logistik ini." });
    }

    // Hapus data logistik
    await logistik.destroy();
    res.status(200).json({ message: "Data logistik berhasil dihapus." });
  } catch (error) {
    console.error("Error saat menghapus data logistik:", error.message);
    res.status(500).json({ message: error.message });
  }
};



export { createLogistik, getAllLogistik,getLogistikByUserId, getLogistikById, updateLogistik, deleteLogistik };