// controllers/productController.js

import Product from "../models/OrderPemanenModel.js";
import User from "../models/UserModel.js"; // Import model User
import OrderHistory from "../models/OrderHistory.js"; // Import model OrderHistory
import Perusahaan from "../models/DataPerusahaanModel.js";
import Petani from "../models/DataPetaniModel.js";
import { Op } from "sequelize"; // Import operator Sequelize

// Controller untuk mendapatkan semua produk
export const getProducts = async (req, res) => {
  try {
    let response;
    // Jika role pengguna termasuk admin, perusahaan, logistik, atau pabrik
    if (["admin", "perusahaan", "logistik", "pabrik"].includes(req.role)) {
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
      // Jika role pengguna bukan admin, perusahaan, logistik, atau pabrik
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
    res.status(200).json(response); // Kirim respons dengan produk yang didapat
  } catch (error) {
    res.status(500).json({ msg: error.message }); // Kirim respons error jika terjadi kesalahan server
  }
};

// Controller untuk mendapatkan produk berdasarkan ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!product) return res.status(404).json({ msg: "Data tidak ditemukan" }); // Kirim respons jika produk tidak ditemukan

    let response;
    // Jika role pengguna termasuk admin, perusahaan, pabrik, atau logistik
    if (["admin", "perusahaan", "pabrik", "logistik"].includes(req.role)) {
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
      // Jika role pengguna bukan admin, perusahaan, pabrik, atau logistik
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
    if (!response) return res.status(404).json({ msg: "Produk tidak ditemukan atau tidak dapat diakses" }); // Kirim respons jika produk tidak ditemukan atau tidak dapat diakses
    res.status(200).json(response); // Kirim respons dengan produk yang didapat
  } catch (error) {
    res.status(500).json({ msg: error.message }); // Kirim respons error jika terjadi kesalahan server
  }
};

export const createProduct = async (req, res) => {
  const { idLahan, tanggalPemanenan, statusOrder, varietasSingkong, estimasiBerat } = req.body;

  // Validasi bahwa idLahan harus diisi
  if (!idLahan) {
    return res.status(400).json({ msg: "ID lahan harus diisi." });
  }

  try {
    // Ambil harga terakhir yang diperbarui dari perusahaan
    const perusahaanData = await Perusahaan.findOne({
      order: [['tanggalupdateharga', 'DESC']],
      limit: 1,
      attributes: ['hargaGradeA', 'hargaGradeB', 'hargaGradeC'] // Ambil semua harga
    });

    if (!perusahaanData) {
      return res.status(400).json({ msg: "Data harga tidak ditemukan" });
    }

    // Ambil harga berdasarkan varietas singkong
    let hargaGrade;
    if (varietasSingkong === "Grade A") {
      hargaGrade = perusahaanData.hargaGradeA || 0; // Ambil harga grade A
    } else if (varietasSingkong === "Grade B") {
      hargaGrade = perusahaanData.hargaGradeB || 0; // Ambil harga grade B
    } else if (varietasSingkong === "Grade C") {
      hargaGrade = perusahaanData.hargaGradeC || 0; // Ambil harga grade C
    } else {
      return res.status(400).json({ msg: "Varietas singkong tidak valid" });
    }

    // Hitung estimasi harga
    const estimasiHarga = estimasiBerat * hargaGrade;

    // Ambil data petani berdasarkan userId
    const petani = await Petani.findOne({
      where: { userId: req.userId }, // Ambil data petani berdasarkan userId
    });

    if (!petani) {
      return res.status(400).json({ msg: "Data petani tidak ditemukan" });
    }

    // Verifikasi bahwa idLahan yang diberikan adalah milik petani
    if (petani.idlahan !== idLahan) {
      return res.status(403).json({ msg: "Anda tidak memiliki akses ke ID lahan ini." });
    }

    // Buat produk baru
    await Product.create({
      idLahan: petani.idlahan, // Ambil ID lahan dari data petani
      tanggalPemanenan,
      statusOrder: statusOrder || "pending", // Set status default ke 'pending' jika tidak ada status yang disediakan
      varietasSingkong,
      estimasiBerat,
      estimasiHarga, // Simpan estimasi harga yang telah dihitung
      userId: req.userId, // Asumsikan req.userId sudah diisi melalui middleware autentikasi
    });

    res.status(201).json({ msg: "Order Pemanenan Created Successfully" }); // Kirim respons berhasil
  } catch (error) {
    res.status(500).json({ msg: error.message }); // Kirim respons error jika terjadi kesalahan server
  }
};

// Controller untuk memperbarui produk
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!product) return res.status(404).json({ msg: "Data tidak ditemukan" }); // Kirim respons jika produk tidak ditemukan

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

      res.status(200).json({ msg: "Produk berhasil diperbarui" }); // Kirim respons berhasil
    } else {
      // Jika pengguna bukan bagian dari role yang diperbolehkan
      return res.status(403).json({ msg: "Akses terlarang" }); // Kirim respons akses terlarang
    }
  } catch (error) {
    res.status(500).json({ msg: error.message }); // Kirim respons error jika terjadi kesalahan server
  }
};

// Controller untuk menghapus produk
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!product) return res.status(404).json({ msg: "Data tidak ditemukan" }); // Kirim respons jika produk tidak ditemukan

    // Hanya admin yang dapat menghapus produk
    if (req.role !== "admin") {
      return res.status(403).json({ msg: "Akses terlarang" }); // Kirim respons akses terlarang
    }

    await Product.destroy({
      where: {
        id: product.id,
      },
    });

    res.status(200).json({ msg: "Produk berhasil dihapus" }); // Kirim respons berhasil
  } catch (error) {
    res.status(500).json({ msg: error.message }); // Kirim respons error jika terjadi kesalahan server
  }
};

// Controller untuk menyetujui order
export const approveOrder = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!product) return res.status(404).json({ msg: "Data tidak ditemukan" });

    // Cek status order berdasarkan peran
    if (product.statusOrder === "pending" && req.role === "perusahaan") {
      // Jika perusahaan menyetujui
      await Product.update(
        { 
          statusOrder: "menunggu pabrik dan logistik menyetujui", 
          logistikApproved: false, // Reset status logistik
          pabrikApproved: false // Reset status pabrik
        }, 
        { where: { id: product.id } }
      );
      return res.status(200).json({ msg: "Order disetujui oleh perusahaan, menunggu pabrik dan logistik menyetujui" });
    }

    if (product.statusOrder === "menunggu pabrik dan logistik menyetujui" && req.role === "pabrik") {
      // Jika pabrik menyetujui
      await Product.update(
        { 
          statusOrder: "menunggu logistik menyetujui", 
          pabrikApproved: true // Tandai pabrik telah menyetujui
        }, 
        { where: { id: product.id } }
      );
      return res.status(200).json({ msg: "Order disetujui oleh pabrik, menunggu logistik menyetujui" });
    }

    if (product.statusOrder === "menunggu logistik menyetujui" && req.role === "logistik") {
      // Jika logistik menyetujui
      await Product.update(
        { 
          statusOrder: "menunggu panen", 
          logistikApproved: true // Tandai logistik telah menyetujui
        }, 
        { where: { id: product.id } }
      );
      return res.status(200).json({ msg: "Order disetujui oleh logistik, status sekarang: menunggu panen" });
    }

    // Jika status order tidak sesuai dengan yang diharapkan
    return res.status(400).json({ msg: "Status order tidak dapat diubah" });

  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

// Controller untuk menolak order oleh perusahaan
export const rejectOrderByCompany = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!product) return res.status(404).json({ msg: "Data tidak ditemukan" }); // Kirim respons jika produk tidak ditemukan

    // Cek apakah pengguna adalah perusahaan
    if (req.role === "perusahaan") {
      // Update status order menjadi 'dibatalkan'
      await Product.update({ statusOrder: "dibatalkan" }, { where: { id: product.id } });

      // Tambahkan entri baru ke OrderHistory
      await createOrderHistoryEntry(product.id, req.userId, "dibatalkan", product.namaLogistik, product.namaPerusahaan);

      res.status(200).json({ msg: "Order telah dibatalkan" }); // Kirim respons berhasil
    } else {
      res.status(403).json({ msg: "Akses terlarang" }); // Kirim respons akses terlarang
    }
  } catch (error) {
    res.status(500).json({ msg: error.message }); // Kirim respons error jika terjadi kesalahan server
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

