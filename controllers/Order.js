import Product from "../models/OrderPemanenModel.js";
import User from "../models/UserModel.js";
import { Op } from "sequelize";
import OrderHistory from "../models/OrderHistory.js";

// Mendapatkan semua produk
export const getProducts = async (req, res) => {
  try {
    let response;
    if (["admin", "perusahaan", "logistik", "pabrik"].includes(req.role)) {
      // Admin, perusahaan, logistik, dan pabrik bisa melihat semua produk dengan detail tambahan
      response = await Product.findAll({
        attributes: ["uuid", "tanggalPemanenan", "statusOrder", "varietasSingkong", "estimasiBerat", "estimasiHarga", "userId", "namaLogistik", "noHpLogistik", "platnoLogistik", "namaPerusahaan", "noHpPerusahaan"],
        include: [
          {
            model: User,
            attributes: ["name", "email"], // Sertakan informasi tambahan dari pengguna yang membuat produk
          },
        ],
      });
    } else {
      // Pengguna lain hanya bisa melihat produk yang mereka buat dengan informasi terbatas
      response = await Product.findAll({
        attributes: ["uuid", "tanggalPemanenan", "statusOrder", "varietasSingkong", "estimasiBerat", "estimasiHarga", "namaLogistik", "noHpLogistik", "platnoLogistik", "namaPerusahaan", "noHpPerusahaan"],
        where: {
          userId: req.userId, // Ambil data berdasarkan userId pengguna yang sedang login
        },
        include: [
          {
            model: User,
            attributes: ["name", "email"], // Sertakan informasi tambahan dari pengguna yang membuat produk
          },
        ],
      });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Mendapatkan produk berdasarkan ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!product) return res.status(404).json({ msg: "Data tidak ditemukan" });

    let response;
    if (["admin", "perusahaan", "pabrik", "logistik"].includes(req.role)) {
      // Admin, pabrik, dan logistik bisa melihat semua detail produk
      response = await Product.findOne({
        attributes: ["uuid", "tanggalPemanenan", "statusOrder", "varietasSingkong", "estimasiBerat", "estimasiHarga", "userId", "namaLogistik", "noHpLogistik", "platnoLogistik", "namaPerusahaan", "noHpPerusahaan"],
        where: {
          id: product.id,
        },
        include: [
          {
            model: User,
            attributes: ["name", "email"], // Sertakan informasi tambahan dari pengguna yang membuat produk
          },
        ],
      });
    } else {
      // Pengguna lain hanya bisa melihat detail terbatas dari produk yang mereka buat
      response = await Product.findOne({
        attributes: ["uuid", "tanggalPemanenan", "statusOrder", "varietasSingkong", "estimasiBerat", "estimasiHarga", "noHpLogistik"],
        where: {
          [Op.and]: [{ id: product.id }, { userId: req.userId }], // Pastikan data milik pengguna yang sedang login
        },
        include: [
          {
            model: User,
            attributes: ["name", "email"], // Sertakan informasi tambahan dari pengguna yang membuat produk
          },
        ],
      });
    }
    if (!response) return res.status(404).json({ msg: "Produk tidak ditemukan atau tidak dapat diakses" });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Membuat produk baru
export const createProduct = async (req, res) => {
  const { tanggalPemanenan, statusOrder, varietasSingkong, estimasiBerat, estimasiHarga, noHpLogistik } = req.body;
  try {
    await Product.create({
      tanggalPemanenan,
      statusOrder: statusOrder || "pending", // Set status default ke 'pending' jika tidak ada status yang disediakan
      varietasSingkong,
      estimasiBerat,
      estimasiHarga,
      noHpLogistik,
      userId: req.userId, // Asumsikan req.userId sudah diisi melalui middleware autentikasi
    });
    res.status(201).json({ msg: "Order Pemanenan Created Successfully" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Memperbarui produk
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!product) return res.status(404).json({ msg: "Data tidak ditemukan" });

    // Data baru yang akan diperbarui
    const { namaLogistik, noHpLogistik, platnoLogistik, namaPerusahaan, noHpPerusahaan, statusOrder, beratSingkong, beratBatang, beratDaun } = req.body;

    // Memeriksa apakah pengguna adalah admin, logistik, pabrik, atau perusahaan
    if (["admin", "logistik", "pabrik", "perusahaan"].includes(req.role)) {
      // Hanya admin, logistik, pabrik, dan perusahaan yang dapat memperbarui data
      await Product.update(
        {
          namaLogistik,
          noHpLogistik,
          platnoLogistik,
          namaPerusahaan,
          noHpPerusahaan,
          statusOrder,
          beratSingkong,
          beratBatang,
          beratDaun,
        },
        {
          where: {
            id: product.id,
          },
        }
      );

      // Jika status pesanan adalah 'selesai', tambahkan ke riwayat pesanan
      if (statusOrder === "selesai") {
        await OrderHistory.create({
          orderId: product.id,
          userId: req.userId,
          statusOrder: statusOrder,
          namaLogistik: namaLogistik,
          namaPabrik: namaPerusahaan,
        });
      }

      res.status(200).json({ msg: "Produk berhasil diperbarui" });
    } else {
      // Jika pengguna bukan bagian dari role yang diperbolehkan
      return res.status(403).json({ msg: "Akses terlarang" });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Menghapus produk
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!product) return res.status(404).json({ msg: "Data tidak ditemukan" });

    // Hanya admin yang dapat menghapus produk
    if (req.role !== "admin") {
      return res.status(403).json({ msg: "Akses terlarang" });
    }

    await Product.destroy({
      where: {
        id: product.id,
      },
    });

    res.status(200).json({ msg: "Produk berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Fungsi untuk perusahaan menyetujui order
export const approveOrder = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!product) return res.status(404).json({ msg: "Data tidak ditemukan" });

    if (req.role === "perusahaan") {
      await Product.update({ statusOrder: "menunggu dipanen" }, { where: { id: product.id } });
      res.status(200).json({ msg: "Order disetujui, menunggu dipanen" });
    } else {
      res.status(403).json({ msg: "Akses terlarang" });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Fungsi untuk logistik memulai keberangkatan
export const startDeparture = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!product) return res.status(404).json({ msg: "Data tidak ditemukan" });

    if (req.role === "logistik") {
      await Product.update({ statusOrder: "menuju pabrik" }, { where: { id: product.id } });
      res.status(200).json({ msg: "Keberangkatan dimulai, menuju pabrik" });
    } else {
      res.status(403).json({ msg: "Akses terlarang" });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Fungsi untuk logistik menyelesaikan keberangkatan dengan data tambahan
export const completeDeparture = async (req, res) => {
  const { beratSingkong, beratBatang, beratDaun } = req.body;
  try {
    const product = await Product.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!product) return res.status(404).json({ msg: "Data tidak ditemukan" });

    if (req.role === "logistik") {
      await Product.update(
        {
          statusOrder: "menunggu diproses",
          beratSingkong,
          beratBatang,
          beratDaun,
        },
        { where: { id: product.id } }
      );

      // Meminta perusahaan untuk mengisi harga aktual
      res.status(200).json({ msg: "Keberangkatan selesai, data berat diperbarui. Mohon perusahaan untuk mengisi harga aktual dan menampilkan berat." });
    } else {
      res.status(403).json({ msg: "Akses terlarang" });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Fungsi untuk memproses order di pabrik
export const processAtFactory = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!product) return res.status(404).json({ msg: "Data tidak ditemukan" });

    if (req.role === "pabrik") {
      await Product.update({ statusOrder: "diproses pabrik" }, { where: { id: product.id } });
      res.status(200).json({ msg: "Proses di pabrik dimulai" });
    } else {
      res.status(403).json({ msg: "Akses terlarang" });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Endpoint untuk perusahaan mengisi harga aktual dan menampilkan berat yang sudah diperbarui
export const updatePriceAndDisplayWeight = async (req, res) => {
  const { productId, hargaAktual } = req.body;
  try {
    // Cek apakah pengguna memiliki peran perusahaan
    if (req.role !== "perusahaan") {
      return res.status(403).json({ msg: "Akses terlarang" });
    }

    // Temukan produk berdasarkan ID
    const product = await Product.findOne({
      where: {
        uuid: productId,
      },
    });

    // Jika produk tidak ditemukan
    if (!product) return res.status(404).json({ msg: "Data tidak ditemukan" });

    // Update harga aktual dan status pesanan menjadi 'menunggu diproses'
    await Product.update(
      {
        hargaAktual,
        statusOrder: "menunggu diproses",
      },
      { where: { id: product.id } }
    );

    // Mengembalikan respons dengan berat yang diperbarui dan harga aktual
    res.status(200).json({
      msg: "Harga aktual berhasil disimpan, berikut adalah berat yang diperbarui:",
      beratSingkong: product.beratSingkong,
      beratBatang: product.beratBatang,
      beratDaun: product.beratDaun,
      hargaAktual: product.hargaAktual,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Fungsi untuk membuat entri baru di OrderHistory
export const createOrderHistoryEntry = async (orderId, userId, statusOrder, namaLogistik, namaPabrik) => {
  try {
    const orderHistory = await OrderHistory.create({
      orderId,
      userId,
      statusOrder,
      namaLogistik,
      namaPabrik,
      // Tambahkan kolom lain sesuai kebutuhan
    });
    return orderHistory;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Fungsi untuk menyelesaikan proses order
export const completeProcessing = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!product) return res.status(404).json({ msg: "Data tidak ditemukan" });

    if (["admin", "pabrik"].includes(req.role)) {
      // Update status pesanan menjadi 'selesai'
      await Product.update({ statusOrder: "selesai" }, { where: { id: product.id } });

      // Tambahkan entri baru ke OrderHistory
      await createOrderHistoryEntry(product.id, req.userId, "selesai", product.namaLogistik, product.namaPerusahaan);

      res.status(200).json({ msg: "Proses selesai, history order telah ditambahkan" });
    } else {
      res.status(403).json({ msg: "Akses terlarang" });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
