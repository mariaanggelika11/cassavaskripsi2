import Petani from "../models/RencanaTanam.js";
import Petanidasar from "../models/DasarPetani.js";
import User from "../models/UserModel.js";
import Product from "../models/OrderPanen.js";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";

const JWT_SECRET = process.env.JWT_SECRET || "bbyifdrdd6r09u8fdxesesedtghbjkjkn";


export const getPetanis= async (req, res) => {
  try {
    const { role, userId, name: namePerusahaan } = req;
    let response;

    // Langkah 1: Filter awal berdasarkan statusRencanaTanam "Belum Disetujui"
    const petaniRecords = await Petani.findAll({
      where: { statusRencanaTanam: "Belum Disetujui" },
      attributes: [
        "idlahan",
        "userId",
        "estimasiproduksi",
        "jumlahpupuk",
      ],
    });

    if (!petaniRecords.length) {
      return res.status(200).json([]); // Jika tidak ada data
    }

    const validLahanIds = petaniRecords.map((record) => record.idlahan);

    // Langkah 2: Proses berdasarkan role
    if (role === "admin") {
      response = await Petanidasar.findAll({
        where: { idlahan: { [Op.in]: validLahanIds } },
      });
    } else if (role === "petani") {
      response = await Petanidasar.findAll({
        where: { idlahan: { [Op.in]: validLahanIds }, userId },
      });
    } else if (role === "perusahaan") {
      response = await Petanidasar.findAll({
        where: {
          idlahan: { [Op.in]: validLahanIds },
          [Op.or]: [{ namePerusahaan }, { namePerusahaan: null }],
        },
      });
    } else {
      return res.status(403).json({ msg: "Akses Ditolak" });
    }

    if (!response || !Array.isArray(response) || response.length === 0) {
      return res.status(200).json([]);
    }

    const formatNumber = (value) =>
      new Intl.NumberFormat("id-ID", { minimumFractionDigits: 0 }).format(value);

    const getRencanaTanamInfo = async (idlahan) => {
      const petaniData = await Petani.findAll({
        where: { idlahan, statusRencanaTanam: "Belum Disetujui" },
        attributes: [
          "idtanam",
          "varietassingkong",
          "estimasiproduksi",
          "jenispupuk",
          "jumlahpupuk",
          "catatantambahan",
          "tanggalRencanaTanam",
          "tanggalRencanaPanen",
          "statusRencanaTanam"
        ],
      });
      return petaniData.map((p) => ({
        idtanam: p.idtanam,
        statusRencanaTanam: p.statusRencanaTanam,
        varietassingkong: p.varietassingkong,
        estimasiproduksi: formatNumber(p.estimasiproduksi || 0),
        jenispupuk: p.jenispupuk,
        jumlahpupuk: formatNumber(p.jumlahpupuk || 0),
        catatantambahan: p.catatantambahan,
        tanggalRencanaTanam: p.tanggalRencanaTanam,
        tanggalRencanaPanen: p.tanggalRencanaPanen,
        statusRencanaTanam: p.statusRencanaTanam,
      }));
    };

    const formattedResponse = await Promise.all(
      response.map(async (record) => {
        const petanidasar = {
          idlahan: record.idlahan,
          kategorilahan: record.kategorilahan,
          namePerusahaan: record.namePerusahaan || null,
          userId: record.userId,
          userUuid: record.userUuid,
          lokasilahan: record.lokasilahan,
          luaslahan: formatNumber(record.luaslahan || 0),
          periodeTanamMulai: record.periodeTanamMulai,
          periodeTanamSelesai: record.periodeTanamSelesai,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
        };

        const rencanaTanamInfo = await getRencanaTanamInfo(record.idlahan);

        return {
          petanidasar,
          rencanaTanamInfo,
        };
      })
    );

    res.status(200).json({ status: "success", data: formattedResponse });
  } catch (error) {
    console.error("Error saat mendapatkan data petani:", error.message);
    res.status(500).json({ msg: error.message });
  }
};


export const getPetanisApproved = async (req, res) => {
  try {
    const { role, userId, name: namePerusahaan } = req;
    let response;

    // Langkah 1: Filter awal berdasarkan statusRencanaTanam "Rencana Tanam Disetujui"
    const petaniRecords = await Petani.findAll({
      where: { statusRencanaTanam: "Rencana Tanam Disetujui" },
      attributes: [
        "idlahan",
        "userId",
        "statusRencanaTanam",
        "estimasiproduksi",
        "jumlahpupuk",
      ],
    });

    if (!petaniRecords.length) {
      return res.status(200).json([]); // Jika tidak ada data
    }

    const validLahanIds = petaniRecords.map((record) => record.idlahan);

    // Langkah 2: Proses berdasarkan role
    if (role === "admin") {
      response = await Petanidasar.findAll({
        where: { idlahan: { [Op.in]: validLahanIds } },
      });
    } else if (role === "petani") {
      response = await Petanidasar.findAll({
        where: { idlahan: { [Op.in]: validLahanIds }, userId },
      });
    } else if (role === "perusahaan") {
      response = await Petanidasar.findAll({
        where: {
          idlahan: { [Op.in]: validLahanIds },
          [Op.or]: [{ namePerusahaan }, { namePerusahaan: null }],
        },
      });
    } else {
      return res.status(403).json({ msg: "Akses Ditolak" });
    }

    // Validasi response sebelum melakukan mapping
    if (!response || !Array.isArray(response) || response.length === 0) {
      return res.status(200).json([]); // Jika tidak ada data
    }

    // Langkah 3: Format angka untuk hasil akhir
    const formatNumber = (value) =>
      new Intl.NumberFormat("id-ID", { minimumFractionDigits: 0 }).format(value);

    // Langkah 4: Ambil Rencana Tanam Info dari Petani berdasarkan idlahan
    const getRencanaTanamInfo = async (idlahan) => {
      const petaniData = await Petani.findAll({
        where: { idlahan, statusRencanaTanam: "Rencana Tanam Disetujui" },
        attributes: [
          "idtanam",
          "statusRencanaTanam",
          "varietassingkong",
          "estimasiproduksi",
          "jenispupuk",
          "jumlahpupuk",
          "catatantambahan",
          "tanggalRencanaTanam",
          "tanggalRencanaPanen",
        ],
      });
      return petaniData.map((p) => ({
        idtanam: p.idtanam,
        statusRencanaTanam: p.statusRencanaTanam,
        varietassingkong: p.varietassingkong,
        estimasiproduksi: formatNumber(p.estimasiproduksi || 0),
        jenispupuk: p.jenispupuk,
        jumlahpupuk: formatNumber(p.jumlahpupuk || 0),
        catatantambahan: p.catatantambahan,
        tanggalRencanaTanam: p.tanggalRencanaTanam,
        tanggalRencanaPanen: p.tanggalRencanaPanen,
      }));
    };

    const formattedResponse = await Promise.all(
      response.map(async (record) => {
        const petanidasar = {
          idlahan: record.idlahan,
          kategorilahan: record.kategorilahan,
          namePerusahaan: record.namePerusahaan || null,
          userId: record.userId,
          userUuid: record.userUuid,
          lokasilahan: record.lokasilahan,
          luaslahan: formatNumber(record.luaslahan || 0),
          periodeTanamMulai: record.periodeTanamMulai,
          periodeTanamSelesai: record.periodeTanamSelesai,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
        };

        // Ambil informasi Rencana Tanam berdasarkan idlahan
        const rencanaTanamInfo = await getRencanaTanamInfo(record.idlahan);

        return {
          petanidasar,
          rencanaTanamInfo,
        };
      })
    );

    res.status(200).json(formattedResponse);
  } catch (error) {
    console.error("Error saat mendapatkan data petani:", error.message);
    res.status(500).json({ msg: error.message });
  }
};


// Fungsi untuk membuat data petani baru
export const createPetani = async (req, res) => {
  const { idlahan, tanggalRencanaTanam, tanggalRencanaPanen, varietassingkong, estimasiproduksi, catatantambahan, jenispupuk, jumlahpupuk } = req.body;

  // Validasi input wajib
  if (!idlahan || !tanggalRencanaTanam || !tanggalRencanaPanen || !varietassingkong || !estimasiproduksi || !jenispupuk || !jumlahpupuk) {
    return res.status(400).json({ msg: "Semua input wajib diisi." });
  }

  try {
    // Ambil token dari header Authorization
    const token = req.header("Authorization");
    if (!token) {
      return res.status(401).json({ msg: "Token tidak ditemukan." });
    }

    // Verifikasi token
    let userUuid;
    try {
      const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
      userUuid = decoded.id;
    } catch (error) {
      return res.status(401).json({ msg: "Token tidak valid." });
    }

    // Ambil data pengguna dari UUID
    const user = await User.findOne({ where: { uuid: userUuid } });
    if (!user) {
      return res.status(403).json({ msg: "Pengguna tidak ditemukan." });
    }

    // Validasi idlahan dan userId dari Petanidasar
    const lahanDasar = await Petanidasar.findOne({ where: { idlahan } });
    if (!lahanDasar) {
      return res.status(404).json({ msg: "Data lahan tidak ditemukan." });
    }

    if (lahanDasar.userId !== user.id) {
      return res.status(403).json({ msg: "Anda tidak memiliki akses ke lahan ini." });
    }

    // Periksa role pengguna
    if (user.role !== "petani" && user.role !== "admin") {
      return res.status(403).json({
        msg: "Hanya pengguna dengan role 'petani' atau 'admin' yang dapat membuat data petani.",
      });
    }

    // Membuat entri baru di tabel petani
    const newPetani = await Petani.create({
      userId: user.id,
      userUuid,
      idlahan,
      tanggalRencanaTanam,
      tanggalRencanaPanen,
      varietassingkong,
      estimasiproduksi,
      catatantambahan,
      jenispupuk,
      jumlahpupuk,
    });

    // Format angka dengan tanda titik
    const formatNumber = (value) =>
      new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 0,
      }).format(value);

    // Format nilai numerik sebelum dikirim dalam respons
    const formattedPetaniData = {
      ...newPetani.dataValues,
      estimasiproduksi: formatNumber(newPetani.estimasiproduksi),
      jumlahpupuk: formatNumber(newPetani.jumlahpupuk),
    };

    // Berikan respons sukses
    res.status(201).json({
      msg: "Order pemanenan berhasil dibuat",
      petaniData: formattedPetaniData,
      lahanInfo: lahanDasar.dataValues,
    });
  } catch (error) {
    console.error("Error saat membuat data petani:", error.message);
    res.status(500).json({ msg: error.message });
  }
};


export const updateStatusRencanaTanam = async (req, res) => {
  const { id } = req.params; // ID idtanam yang akan diupdate
  const { statusRencanaTanam } = req.body; // Status baru dikirim dalam body request

  try {
    // Memastikan hanya pengguna dengan peran 'perusahaan' yang bisa mengubah status
    if (req.role !== "perusahaan") {
      return res.status(403).json({ msg: "Hanya pengguna dengan role 'perusahaan' yang dapat mengubah status rencana tanam." });
    }

    // Validasi input statusRencanaTanam
    const validStatuses = ["Rencana Tanam Disetujui", "Rencana Tanam Ditolak"];
    if (!validStatuses.includes(statusRencanaTanam)) {
      return res.status(400).json({
        msg: "Status rencana tanam tidak valid. Hanya dapat diubah menjadi 'Rencana Tanam Disetujui' atau 'Rencana Tanam Ditolak'.",
      });
    }

    // Cari data berdasarkan idtanam
    const petani = await Petani.findOne({ where: { idtanam: id } });

    if (!petani) {
      return res.status(404).json({ msg: "Data dengan idtanam tersebut tidak ditemukan." });
    }

    // Periksa apakah status sudah diubah dari default
    if (petani.statusRencanaTanam !== "Belum Disetujui") {
      return res.status(400).json({ msg: "Status rencana tanam sudah diubah dan tidak dapat diubah lagi." });
    }

    // Update status rencana tanam
    await petani.update({ statusRencanaTanam });

    res.status(200).json({ msg: `Status rencana tanam berhasil diubah menjadi '${statusRencanaTanam}'` });
  } catch (error) {
    console.error("Error saat mengubah status rencana tanam:", error.message);
    res.status(500).json({ msg: error.message });
  }
};

export const updateStatusToPanenSelesai = async (req, res) => {
  const { id } = req.params; // ID idtanam yang akan diupdate

  try {
    // Memastikan hanya pengguna dengan peran 'petani' atau 'perusahaan' yang bisa mengubah status
    if (req.role !== "petani" && req.role !== "perusahaan") {
      return res.status(403).json({
        msg: "Hanya pengguna dengan role 'petani' atau 'perusahaan' yang dapat mengubah status menjadi 'Selesai Panen'.",
      });
    }

    // Cari data berdasarkan idtanam
    const petani = await Petani.findOne({ where: { idtanam: id } });

    if (!petani) {
      return res.status(404).json({ msg: "Data dengan idtanam tersebut tidak ditemukan." });
    }

    // Periksa apakah status sudah "Selesai Panen"
    if (petani.statusRencanaTanam === "Selesai Panen") {
      return res.status(400).json({ msg: "Status rencana tanam sudah menjadi 'Selesai Panen' dan tidak dapat diubah lagi." });
    }

    // Update status menjadi "Selesai Panen"
    await petani.update({ statusRencanaTanam: "Selesai Panen" });

    res.status(200).json({
      msg: `Status rencana tanam berhasil diubah menjadi 'Selesai Panen'`,
    });
  } catch (error) {
    console.error("Error saat mengubah status ke 'Selesai Panen':", error.message);
    res.status(500).json({ msg: error.message });
  }
};


// Fungsi untuk memperbarui data petani berdasarkan idtanam
export const updatePetani = async (req, res) => {
  const { idtanam } = req.params; // Mengambil ID tanam dari parameter URL
  const { varietassingkong, estimasiproduksi, catatantambahan, jenispupuk, jumlahpupuk } = req.body;

  try {
    // Memastikan hanya pengguna dengan peran 'petani' atau 'admin' yang bisa melakukan update
    if (req.role !== "petani" && req.role !== "admin") {
      return res.status(403).json({ msg: "Hanya pengguna dengan role 'petani' atau 'admin' yang dapat mengupdate data petani." });
    }

    // Jika pengguna adalah petani, pastikan hanya bisa mengupdate data miliknya
    let condition = req.role === "admin" ? { idtanam } : { idtanam, userId: req.userId };

    const petaniToUpdate = await Petani.findOne({ where: condition });

    if (!petaniToUpdate) {
      return res.status(404).json({ msg: "Data petani dengan ID tanam tersebut tidak ditemukan atau Anda tidak memiliki hak akses untuk mengupdate data ini." });
    }

    // Melakukan pembaruan data
    await petaniToUpdate.update({
      varietassingkong,
      estimasiproduksi,
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


export const getAllrencanatanam = async (req, res) => {
  try {
    const userId = req.userId; // Pastikan req.user.id sudah di-set dari middleware autentikasi

    const petani = await Petani.findAll({
      where: { userId }, // Ambil hanya ID lahan milik petani yang login
      attributes: ['idtanam'],
    });

    if (!petani.length) {
      return res.status(404).json({ msg: "Tidak ada rencana tanam yang ditemukan untuk pengguna ini." });
    }

    // Mengambil hanya ID rencana tanam 
    const RencanaTanam = petani.map(p => p.idtanam);
    res.status(200).json(RencanaTanam); // Kirim respons dengan ID rencana tanam 
  } catch (error) {
    res.status(500).json({ msg: error.message }); // Kirim respons error jika terjadi kesalahan server
  }
};

// Fungsi untuk mendapatkan data dari ID tanam yang spesifik
export const getRencanaTanamById = async (req, res) => {
  const { idtanam } = req.params; // Ambil ID rencana tanam dari parameter URL

  try {
    const tanam = await Petani.findOne({
      where: { idtanam }, // Ambil data berdasarkan ID rencana tanam
    });

    if (!tanam) {
      return res.status(404).json({ msg: "Lahan tidak ditemukan." });
    }

    res.status(200).json(tanam); // Kirim respons dengan data rencana tanam
  } catch (error) {
    res.status(500).json({ msg: error.message }); // Kirim respons error jika terjadi kesalahan server
  }
};

export const countPetaniByGrade = async (req, res) => {
  try {
    const { role, userId } = req;

    // Filter awal berdasarkan role
    let whereClause = {
      statusRencanaTanam: { [Op.ne]: "Selesai Panen" }, // Menyaring petani dengan status "Selesai Panen"
    };

    if (role === "petani") {
      whereClause.userId = userId;
    }

    // Query data petani berdasarkan varietassingkong dan statusRencanaTanam
    const gradeCounts = await Petani.findAll({
      where: whereClause,
      attributes: [
        "varietassingkong",
        [
          Petani.sequelize.fn("COUNT", Petani.sequelize.col("varietassingkong")),
          "count",
        ],
      ],
      group: ["varietassingkong"],
    });

    // Format hasil menjadi objek terstruktur
    const result = {
      GradeA: 0,
      GradeB: 0,
      GradeC: 0,
    };

    gradeCounts.forEach((record) => {
      const grade = record.varietassingkong;
      const count = parseInt(record.dataValues.count, 10);

      if (grade === "Grade A") result.GradeA += count;
      else if (grade === "Grade B") result.GradeB += count;
      else if (grade === "Grade C") result.GradeC += count;
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error saat menghitung jumlah petani per grade:", error.message);
    res.status(500).json({ msg: error.message });
  }
};

export const getHistoryRencanaTanam = async (req, res) => { 
  try {
    const { role, userId, name: namePerusahaan } = req;
    let response;

    // Langkah 1: Filter awal dengan statusRencanaTanam selain "Selesai Panen"
    const petaniRecords = await Petani.findAll({
      where: { statusRencanaTanam: { [Op.eq]: "Selesai Panen" } },
      attributes: [
        "idlahan",
        "userId",
        "statusRencanaTanam",
        "estimasiproduksi",
        "jumlahpupuk",
      ],
    });

    if (!petaniRecords.length) {
      return res.status(200).json([]); // Jika tidak ada data
    }

    const validLahanIds = petaniRecords.map((record) => record.idlahan);

    // Langkah 2: Proses berdasarkan role
    if (role === "admin") {
      response = await Petanidasar.findAll({
        where: { idlahan: { [Op.in]: validLahanIds } },
      });
    } else if (role === "petani") {
      response = await Petanidasar.findAll({
        where: { idlahan: { [Op.in]: validLahanIds }, userId },
      });
    } else if (role === "perusahaan") {
      response = await Petanidasar.findAll({
        where: {
          idlahan: { [Op.in]: validLahanIds },
          [Op.or]: [{ namePerusahaan }, { namePerusahaan: null }],
        },
      });
    } else {
      return res.status(403).json({ msg: "Akses Ditolak" });
    }

    // Validasi response sebelum melakukan mapping
    if (!response || !Array.isArray(response) || response.length === 0) {
      return res.status(200).json([]); // Jika tidak ada data
    }

    // Langkah 3: Format angka untuk hasil akhir
    const formatNumber = (value) =>
      new Intl.NumberFormat("id-ID", { minimumFractionDigits: 0 }).format(value);

    // Langkah 4: Ambil Rencana Tanam Info dari Petani berdasarkan idlahan
  // Langkah 4: Ambil Rencana Tanam Info dari Petani berdasarkan idlahan
const getRencanaTanamInfo = async (idlahan) => {
  const petaniData = await Petani.findAll({
    where: {
      idlahan,
      statusRencanaTanam: { [Op.eq]: "Selesai Panen" }, // Hanya ambil status selain "Selesai Panen"
    },
    attributes: [
      "idtanam",
      "statusRencanaTanam",
      "varietassingkong",
      "estimasiproduksi",
      "jenispupuk",
      "jumlahpupuk",
      "catatantambahan",
      "tanggalRencanaTanam",
      "tanggalRencanaPanen",
    ],
  });

  return petaniData.map((p) => ({
    idtanam: p.idtanam,
    statusRencanaTanam: p.statusRencanaTanam,
    varietassingkong: p.varietassingkong,
    estimasiproduksi: formatNumber(p.estimasiproduksi || 0),
    jenispupuk: p.jenispupuk,
    jumlahpupuk: formatNumber(p.jumlahpupuk || 0),
    catatantambahan: p.catatantambahan,
    tanggalRencanaTanam: p.tanggalRencanaTanam,
    tanggalRencanaPanen: p.tanggalRencanaPanen,
  }));
};

    const formattedResponse = await Promise.all(
      response.map(async (record) => {
        const petanidasar = {
          idlahan: record.idlahan,
          kategorilahan: record.kategorilahan,
          namePerusahaan: record.namePerusahaan || null,
          userId: record.userId,
          userUuid: record.userUuid,
          lokasilahan: record.lokasilahan,
          luaslahan: formatNumber(record.luaslahan || 0),
          periodeTanamMulai: record.periodeTanamMulai,
          periodeTanamSelesai: record.periodeTanamSelesai,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
        };

        // Ambil informasi Rencana Tanam berdasarkan idlahan
        const rencanaTanamInfo = await getRencanaTanamInfo(record.idlahan);

        return {
          petanidasar,
          rencanaTanamInfo,
        };
      })
    );

    res.status(200).json(formattedResponse);
  } catch (error) {
    console.error("Error saat mendapatkan riwayat rencana tanam:", error.message);
    res.status(500).json({ msg: error.message });
  }
};





