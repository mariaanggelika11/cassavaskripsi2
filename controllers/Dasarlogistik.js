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
 
// Fungsi untuk mengambil semua data logistik
const getAllLogistik = async (req, res) => {
  try {
    const logistik = await Logistikdasar.findAll({
      include: [{
        model: Users,
        as: "user",
        attributes: ['uuid', 'name', 'role'], // Ambil hanya uuid, name, dan role
      }],
    });
    res.json(logistik);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fungsi untuk mengambil data logistik berdasarkan UUID
const getLogistikById = async (req, res) => {
  try {
    const { id } = req.params; // Ambil UUID langsung dari parameter URL

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

    if (!logistik) {
      return res.status(404).json({ message: "Data logistik tidak ditemukan" });
    }

    res.json(logistik); // Kirim data logistik sebagai respons
  } catch (error) {
    console.error("Error saat mengambil data logistik:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Fungsi untuk mengambil data logistik berdasarkan userId
const getLogistikByUserId = async (req, res) => {
  try {
    const { userId } = req.params; // Ambil userId dari parameter URL

    if (!userId) {
      return res.status(400).json({ message: "userId tidak disediakan dalam parameter URL" });
    }

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

    if (logistik.length === 0) {
      return res.status(404).json({ message: "Data logistik tidak ditemukan untuk userId ini" });
    }

    res.json(logistik); // Kirim data logistik sebagai respons
  } catch (error) {
    console.error("Error saat mengambil data logistik berdasarkan userId:", error.message);
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

export { createLogistik, getAllLogistik,getLogistikByUserId, getLogistikById, updateLogistik, deleteLogistik };