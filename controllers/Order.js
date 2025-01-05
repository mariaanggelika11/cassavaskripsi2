
import Product from "../models/OrderPanen.js";
import User from "../models/UserModel.js"; // Import model User
import Logistikdasar from "../models/DasarLogistik.js";
import TransaksiPR from "../models/TransaksiPerusahaan.js";
import Logistik from "../models/TransaksiLogistik.js";
import Perusahaan from "../models/DasarPerusahaan.js";
import Petani from "../models/RencanaTanam.js";
import TransaksiPBK from "../models/TransaksiPabrik.js";
import limbahpetani from "../models/LimbahPetani.js";
import Pabrik from "../models/DasarPabrik.js";
import TransaksiLogistik from "../models/TransaksiLogistik.js"; // Model transaksi logistik
import { Op } from "sequelize"; // Import operator Sequelize

// Controller untuk mendapatkan semua produk
// Controller untuk mendapatkan semua produk
export const getProducts = async (req, res) => {
  try {
    let response;
    // Jika role pengguna termasuk admin, perusahaan, logistik, atau pabrik
    if (["admin", "perusahaan", "logistik", "pabrik"].includes(req.role)) {
      response = await Product.findAll({
        attributes: ["uuid", "tanggalPemanenan", "statusOrder", "varietasSingkong", "estimasiBerat", "estimasiHarga", "userId","namaLogistik",  "namaPerusahaan", "namaPabrik"],
        include: [
          {
            model: User,
            attributes: ["name", "email"], // Sertakan informasi tambahan dari pengguna yang membuat produk/petani
          },
        ],
      });
    } else {
      // Jika role pengguna bukan admin, perusahaan, logistik, atau pabrik
      response = await Product.findAll({
        attributes: ["uuid", "idLahan", "tanggalPemanenan", "statusOrder", "varietasSingkong", "estimasiBerat", "estimasiHarga", "namaLogistik",  "namaPerusahaan", "namaPabrik"],
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


// Controller untuk mendapatkan produk yang belum terisi nama dan email untuk perusahaan, pabrik, dan logistik (untuk menyetujui order)
export const getUnassignedProducts = async (req, res) => {
  try {
    let response;

    if (req.role === "perusahaan") {
      // Produk yang belum memiliki perusahaan
      response = await Product.findAll({
        attributes: [
          "uuid",
          "tanggalPemanenan",
          "statusOrder",
          "varietasSingkong",
          "estimasiBerat",
          "estimasiHarga",
          "namaLogistik",
          "emailLogistik",
          "namaPabrik",
          "emailPabrik",
        ],
        where: {
          [Op.or]: [{ namaPerusahaan: null }, { emailPerusahaan: null }],
        },
        include: [
          {
            model: User,
            attributes: ["name", "email"], // Sertakan informasi tambahan dari pengguna
          },
        ],
      });
    } else if (req.role === "pabrik") {
      // Produk yang belum memiliki pabrik
      response = await Product.findAll({
        attributes: [
          "uuid",
          "tanggalPemanenan",
          "statusOrder",
          "varietasSingkong",
          "estimasiBerat",
          "estimasiHarga",
          "namaLogistik",
          "emailLogistik",
          "namaPerusahaan",
          "emailPerusahaan",
        ],
        where: {
          [Op.or]: [{ namaPabrik: null }, { emailPabrik: null }],
        },
        include: [
          {
            model: User,
            attributes: ["name", "email"], // Sertakan informasi tambahan dari pengguna
          },
        ],
      });
    } else if (req.role === "logistik") {
      // Produk yang belum memiliki logistik
      response = await Product.findAll({
        attributes: [
          "uuid",
          "tanggalPemanenan",
          "statusOrder",
          "varietasSingkong",
          "estimasiBerat",
          "estimasiHarga",
          "namaPerusahaan",
          "emailPerusahaan",
          "namaPabrik",
          "emailPabrik",
        ],
        where: {
          [Op.or]: [{ namaLogistik: null }, { emailLogistik: null }],
        },
        include: [
          {
            model: User,
            attributes: ["name", "email"], // Sertakan informasi tambahan dari pengguna
          },
        ],
      });
    } else {
      // Role tidak valid
      return res.status(403).json({ msg: "Role tidak valid atau tidak memiliki akses." });
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message }); // Tangani kesalahan server
  }
};

// Controller untuk mendapatkan produk berdasarkan kondisi role(HISTORY PANEN SETIAP ROLE hanya milik dia sendiri yg dia acc)
export const getProductsByRole = async (req, res) => {
  try {
    let response;

    // Periksa role pengguna
    if (req.role === "logistik") {
      response = await Product.findAll({
        attributes: ["uuid", "tanggalPemanenan", "statusOrder", "varietasSingkong", "estimasiBerat", "estimasiHarga", "namaPerusahaan", "emailPerusahaan","namaLogistik", "emailLogistik","namaPabrik", "emailPabrik"],
        where: {
          namaLogistik: req.name, // Sesuai dengan nama logistik yang login
          emailLogistik: req.email, // Sesuai dengan email logistik yang login
        },
        include: [
          {
            model: User,
            attributes: ["name", "email"], // Sertakan informasi pengguna
          },
        ],
      });
    } else if (req.role === "perusahaan") {
      response = await Product.findAll({
        attributes: ["uuid", "tanggalPemanenan", "statusOrder", "varietasSingkong", "estimasiBerat", "estimasiHarga", "namaPerusahaan", "emailPerusahaan","namaLogistik", "emailLogistik","namaPabrik", "emailPabrik"],
        where: {
          namaPerusahaan: req.name, // Sesuai dengan nama perusahaan yang login
          emailPerusahaan: req.email, // Sesuai dengan email perusahaan yang login
        },
        include: [
          {
            model: User,
            attributes: ["name", "email"], // Sertakan informasi pengguna
          },
        ],
      });
    } else if (req.role === "pabrik") {
      response = await Product.findAll({
        attributes: ["uuid", "tanggalPemanenan", "statusOrder", "varietasSingkong", "estimasiBerat", "estimasiHarga",  "namaPerusahaan", "emailPerusahaan","namaLogistik", "emailLogistik","namaPabrik", "emailPabrik"],
        where: {
          namaPabrik: req.nama, // Sesuai dengan nama pabrik yang login
          emailPabrik: req.email, // Sesuai dengan email pabrik yang login
        },
        include: [
          {
            model: User,
            attributes: ["name", "email"], // Sertakan informasi pengguna
          },
        ],
      });
    } else if (req.role === "petani") {
      response = await Product.findAll({
        attributes: ["uuid", "idLahan", "tanggalPemanenan", "statusOrder", "varietasSingkong", "estimasiBerat", "estimasiHarga"],
        where: {
          userId: req.userId, // Ambil data berdasarkan userId petani yang login
        },
        include: [
          {
            model: User,
            attributes: ["name", "email"], // Sertakan informasi pengguna
          },
        ],
      });
    } else {
      // Role tidak valid
      return res.status(403).json({ msg: "Role tidak valid atau tidak memiliki akses." });
    }

    // Kirimkan respons
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message }); // Tangani kesalahan server
  }
};


// Controller untuk mendapatkan produk berdasarkan ID
export const getProductById = async (req, res) => {
  try {
    // Cari produk berdasarkan UUID
    const product = await Product.findOne({
      where: {
        uuid: req.params.id,
      },
    });

    // Jika produk tidak ditemukan
    if (!product) return res.status(404).json({ msg: "Data tidak ditemukan" });

    // Ambil data transaksi terkait berdasarkan UUID produk
    const response = await Product.findOne({
      attributes: [
        "uuid",
        "idLahan",
        "tanggalPemanenan",
        "statusOrder",
        "varietasSingkong",
        "estimasiBerat",
        "estimasiHarga",
        "userId",
        "namaLogistik",
        "namaPerusahaan",
        "namaPabrik",
        "emailPerusahaan",
        "emailLogistik",
        "emailPabrik",
      ],
      where: {
        id: product.id,
      },
      include: [
        {
          model: User,
          attributes: ["name", "email"],
        },
        {
          model: Logistik,
          attributes: [
            "orderPemanenUuid",
            "tanggalPengiriman",
            "waktuPengiriman",
            "estimasiWaktuTiba",
            "aktualWaktuTiba",
            "catatanEfisiensiRute",
            "biayaTransportasi",
            "kondisiPengiriman",
            "catatanDariPenerima",
          ],
          where: {
            orderPemanenUuid: product.uuid,
          },
          required: false,
        },
        {
          model: TransaksiPBK,
          attributes: [
            "orderPemanenUuid",
            "tanggalPenerimaan",
            "beratTotalDiterima",
            "catatanKualitas",
            "evaluasiKualitas",
          ],
          where: {
            orderPemanenUuid: product.uuid,
          },
          required: false,
        },
        {
          model: TransaksiPR,
          attributes: [
            "orderPemanenUuid",
            "hargaaktual",
            "catatanharga",
            "tanggalselesai",
          ],
          where: {
            orderPemanenUuid: product.uuid,
          },
          required: false,
        },
        {
          model: limbahpetani,  // Menambahkan model limbahpetani
          attributes: [
            "beratLimbahBatang",
            "catatanLimbahBatang",
            "beratLimbahDaun",
            "catatanLimbahDaun",
            "beratLimbahAkar",
            "catatanLimbahAkar",
          ],
          where: {
            orderPemanenUuid: product.uuid,
          },
          required: false,
        },
      ],
    });
     

    // Ambil informasi lahan berdasarkan idLahan
    const lahanInfo = await Petani.findOne({
      where: { idlahan: product.idLahan },
    });

    // Jika informasi lahan tidak ditemukan
    if (!lahanInfo) {
      return res.status(404).json({ msg: "Data lahan tidak ditemukan." });
    }

    // Sertakan informasi lahan dalam respons
    const finalResponse = {
      InformasiOrder: response,
      LahanInfo: lahanInfo,
    };

    // Kirim respons akhir
    res.status(200).json(finalResponse);
  } catch (error) {
    // Tangani kesalahan server
    res.status(500).json({ msg: error.message });
  }
};


export const createProduct = async (req, res) => {
  const { idLahan, tanggalPemanenan, statusOrder, varietasSingkong, estimasiBerat } = req.body;

  // Validasi bahwa idLahan harus diisi
  if (!idLahan) {
    return res.status(400).json({ msg: "ID lahan harus diisi." });
  }

  try {
    // Ambil informasi lahan berdasarkan idLahan
    const lahan = await Petani.findOne({
      where: { idlahan: idLahan } // Ganti dengan model yang sesuai jika perlu
    });

    if (!lahan) {
      return res.status(404).json({ msg: "Data lahan tidak ditemukan." });
    }

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
    const newProduct = await Product.create({
      idLahan: petani.idlahan, // Ambil ID lahan dari data petani
      tanggalPemanenan,
      statusOrder: statusOrder || "pending", // Set status default ke 'pending' jika tidak ada status yang disediakan
      varietasSingkong,
      estimasiBerat,
      estimasiHarga, // Simpan estimasi harga yang telah dihitung
      userId: req.userId, // Asumsikan req.userId sudah diisi melalui middleware autentikasi
    });

    // Kirim respons berhasil dengan informasi produk yang telah dibuat
    res.status(201).json({
      msg: "Order Pemanenan Created Successfully",
      orderPemanenan: {
        uuid: newProduct.uuid,
        idLahan: newProduct.idLahan,
        tanggalPemanenan: newProduct.tanggalPemanenan,
        statusOrder: newProduct.statusOrder,
        varietasSingkong: newProduct.varietasSingkong,
        estimasiBerat: newProduct.estimasiBerat,
        estimasiHarga: newProduct.estimasiHarga,
        userId: newProduct.userId
      },
      lahanInfo: lahan // Sertakan informasi lahan dalam respons
    });
  } catch (error) { 
    res.status(500).json({ msg: error.message }); // Kirim respons error jika terjadi kesalahan server
  }
};


export const approveOrder = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { uuid: req.params.id },
    });

    if (!product) {
      console.log("Produk tidak ditemukan dengan UUID:", req.params.id);
      return res.status(404).json({ msg: "Produk tidak ditemukan" });
    }

    const { perusahaan, pabrik, logistik, idKendaraan } = req.body;

    let updatedStatus = product.statusOrder;
    let updatedFields = {};

    if (product.statusOrder === "ditolak untuk panen") {
      console.log("Order sudah ditolak, tidak dapat diubah:", product);
      return res.status(400).json({ msg: "Order sudah ditolak, tidak dapat mengubah status." });
    }

    if (product.statusOrder === "order selesai") {
      console.log("Order selesai, perubahan tidak diizinkan:", product);
      return res.status(400).json({ msg: "Order telah selesai, perubahan tidak diizinkan." });
    }

    // Log role untuk debugging
    console.log("Role pengguna:", req.role);

    // Perusahaan
    if (req.role === "perusahaan" && perusahaan !== undefined) {
      if (product.namaPerusahaan) {
        return res.status(400).json({ msg: "Perusahaan sudah menyetujui atau menolak, perubahan tidak diizinkan." });
      }

      if (perusahaan === true) {
        updatedStatus = "Perusahaan menyetujui, menunggu pabrik dan logistik";
        updatedFields = { statusOrder: updatedStatus, namaPerusahaan: req.name, emailPerusahaan: req.email };
      } else if (perusahaan === false) {
        updatedStatus = "ditolak untuk panen";
        updatedFields = { statusOrder: updatedStatus, namaPerusahaan: req.name, emailPerusahaan: req.email };
      }
    }

    // Pabrik
    if (req.role === "pabrik" && pabrik !== undefined) {
      if (product.namaPabrik) {
        return res.status(400).json({ msg: "Pabrik sudah menyetujui atau menolak, perubahan tidak diizinkan." });
      }

      if (product.statusOrder !== "Perusahaan menyetujui, menunggu pabrik dan logistik") {
        return res.status(400).json({ msg: "Pabrik harus menunggu persetujuan dari perusahaan terlebih dahulu." });
      }

      // Ambil data kapasitas RAM pabrik berdasarkan data login
      const pabrikData = await Pabrik.findOne({
        attributes: ["kapasitasram"],
        where: { userId: req.userId },
      });

      if (!pabrikData) {
        return res.status(404).json({ msg: "Data pabrik tidak ditemukan untuk pengguna yang login." });
      }

      const kapasitasram = pabrikData.kapasitasram;

      // Hitung total berat diterima dari database Product
      const totalBeratDiterima = await TransaksiPBK.sum("beratTotalDiterima", {
        where: {
          userId: req.userId
        },
      });

      // Validasi apakah kapasitas RAM mencukupi
      if (pabrik === true) {
        if (kapasitasram < totalBeratDiterima) {
          return res.status(400).json({
            msg: `Kapasitas RAM (${kapasitasram}) tidak mencukupi untuk total berat diterima (${totalBeratDiterima}). Tidak dapat menyetujui.`,
          });
        }

        updatedStatus = "Perusahaan dan Pabrik Menyetujui, menunggu logistik";
        updatedFields = { 
          statusOrder: updatedStatus, 
          namaPabrik: req.name, 
          emailPabrik: req.email 
        };
      } else if (pabrik === false) {
        updatedStatus = "ditolak untuk panen";
        updatedFields = { 
          statusOrder: updatedStatus, 
          namaPabrik: req.name, 
          emailPabrik: req.email 
        };
      }
    }

    // Logistik menyetujui atau menolak
    if (req.role === "logistik" && logistik !== undefined) {
      if (product.namaLogistik) {
        return res.status(400).json({ msg: "Logistik sudah menyetujui atau menolak, perubahan tidak diizinkan." });
      }

      if (product.statusOrder !== "Perusahaan dan Pabrik Menyetujui, menunggu logistik") {
        return res.status(400).json({ msg: "Logistik harus menunggu persetujuan dari perusahaan dan pabrik terlebih dahulu." });
      }

      const kendaraan = await Logistikdasar.findOne({
        where: { idKendaraan, userId: req.userId },
      });

      if (!kendaraan) {
        return res.status(400).json({ msg: "ID Kendaraan tidak valid atau tidak terdaftar pada pengguna ini." });
      }

      if (logistik === true) {
        updatedStatus = "Menunggu waktu panen";
        updatedFields = { statusOrder: updatedStatus, namaLogistik: req.name, emailLogistik: req.email };
      } else if (logistik === false) {
        updatedStatus = "ditolak untuk panen";
        updatedFields = { statusOrder: updatedStatus, namaLogistik: req.name, emailLogistik: req.email };
      }
    }

    // Update the product with the new status
    await product.update(updatedFields);

    // Send the success response with product details
    return res.status(200).json({
      msg: `Status order berhasil diperbarui menjadi ${updatedStatus}`,
      product: {
        idLahan: product.idLahan,
        tanggalPemanenan: product.tanggalPemanenan,
        statusOrder: updatedStatus,
        varietasSingkong: product.varietasSingkong,
        estimasiBerat: product.estimasiBerat,
        namaPerusahaan: product.namaPerusahaan,
        emailPerusahaan: product.emailPerusahaan,
        namaPabrik: product.namaPabrik,
        emailPabrik: product.emailPabrik,
        namaLogistik: product.namaLogistik,
        emailLogistik: product.emailLogistik,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
};


export const inputTransaksi = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { uuid: req.params.id },
    });

    if (!product) {
      console.log("Produk tidak ditemukan dengan UUID:", req.params.id);
      return res.status(404).json({ msg: "Produk tidak ditemukan" });
    }
    if (product.statusOrder === "ditolak untuk panen") {
      console.log("Order sudah ditolak, tidak dapat diubah:", product);
      return res.status(400).json({ msg: "Order sudah ditolak, tidak dapat mengubah status." });
    }

    if (product.statusOrder === "order selesai") {
      console.log("Order selesai, perubahan tidak diizinkan:", product);
      return res.status(400).json({ msg: "Order telah selesai, perubahan tidak diizinkan." });
    }

    const {
      tanggalPenerimaan,
      beratTotalDiterima,
      catatanKualitas,
      evaluasiKualitas,
      tanggalPengiriman,
      waktuPengiriman,
      estimasiWaktuTiba,
      aktualWaktuTiba,
      catatanEfisiensiRute,
      biayaTransportasi,
      kondisiPengiriman,
      tanggalselesai,
      catatanDariPenerima,
      hargaaktual,
      catatanharga,
      beratLimbahBatang,
      catatanLimbahBatang,
      beratLimbahDaun,
      catatanLimbahDaun,
      beratLimbahAkar,
      catatanLimbahAkar,
    } = req.body;

    // Logistik input data transaksi
    if (req.role === "logistik") {
      if (product.statusOrder !== "Menunggu waktu panen") {
        return res.status(400).json({
          msg: "Status order harus 'Menunggu waktu panen' untuk logistik dapat mencatat transaksi.",
        });
      }

      if (tanggalPengiriman && waktuPengiriman && estimasiWaktuTiba && aktualWaktuTiba) {
        if (product.namaLogistik !== req.name || product.emailLogistik !== req.email) {
          return res.status(400).json({ msg: "Nama atau email logistik tidak sesuai dengan data pada produk." });
        }

        const existingTransaksiLogistik = await TransaksiLogistik.findOne({
          where: {
            orderPemanenUuid: req.params.id,
            aktualWaktuTiba: { [Op.ne]: null },
          },
        });

        if (existingTransaksiLogistik) {
          return res.status(400).json({
            msg: "Aktual waktu tiba telah dicatat sebelumnya, tidak dapat membuat transaksi baru.",
          });
        }

        const transaksiLogistik = await TransaksiLogistik.create({
          orderPemanenUuid: req.params.id,
          tanggalPengiriman,
          waktuPengiriman,
          estimasiWaktuTiba,
          aktualWaktuTiba,
          catatanEfisiensiRute,
          biayaTransportasi,
          kondisiPengiriman,
          catatanDariPenerima,
          userId: req.userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const updatedStatus = "selesai diantar logistik";
        await product.update({ statusOrder: updatedStatus });
        return res.status(200).json({
          msg: `Status order berhasil diperbarui menjadi ${updatedStatus}`,
          transaksiLogistik: transaksiLogistik.dataValues,
        });
      } else {
        return res.status(400).json({ msg: "Data logistik tidak lengkap. Semua field harus diisi." });
      }
    }

    // Pabrik input data transaksi
    if (req.role === "pabrik") {
      if (product.statusOrder !== "selesai diantar logistik") {
        return res.status(400).json({
          msg: "Status order harus 'selesai diantar logistik' untuk pabrik dapat mencatat transaksi.",
        });
      }

      if (tanggalPenerimaan && beratTotalDiterima) {
        if (product.namaPabrik !== req.name || product.emailPabrik !== req.email) {
          return res.status(400).json({
            msg: "Nama atau email pabrik tidak sesuai dengan data pada produk.",
          });
        }

        const existingTransaksiPBK = await TransaksiPBK.findOne({
          where: {
            orderPemanenUuid: req.params.id,
            beratTotalDiterima: { [Op.ne]: null },
          },
        });

        if (existingTransaksiPBK) {
          return res.status(400).json({
            msg: "Berat total telah diterima sebelumnya, tidak dapat membuat transaksi baru.",
          });
        }

        const transaksiPBK = await TransaksiPBK.create({
          orderPemanenUuid: req.params.id,
          tanggalPenerimaan,
          beratTotalDiterima,
          catatanKualitas,
          evaluasiKualitas,
          userId: req.userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const updatedStatus = "diterima pabrik";
        await product.update({ statusOrder: updatedStatus });
        return res.status(200).json({
          msg: `Status order berhasil diperbarui menjadi ${updatedStatus}`,
          transaksiPBK: transaksiPBK.dataValues,
        });
      } else {
        return res.status(400).json({
          msg: "Data pabrik tidak lengkap. Semua field harus diisi.",
        });
      }
    }

    // Perusahaan input data transaksi
    if (req.role === "perusahaan") {
      if (product.statusOrder !== "diterima pabrik") {
        return res.status(400).json({
          msg: "Status order harus 'diterima pabrik' untuk perusahaan dapat mencatat transaksi.",
        });
      }

      if (hargaaktual !== undefined && catatanharga !== undefined) {
        if (product.namaPerusahaan !== req.name || product.emailPerusahaan !== req.email) {
          return res.status(400).json({
            msg: "Nama atau email perusahaan tidak sesuai dengan data pada produk.",
          });
        }
// Cek apakah data limbah dari petani telah dicatat
const existingLimbahPetani = await limbahpetani.findOne({
  where: { orderPemanenUuid: req.params.id },
});

if (!existingLimbahPetani) {
  return res.status(400).json({
    msg: "Data limbah dari petani belum tercatat. Harap selesaikan pencatatan data limbah terlebih dahulu.",
  });
}

        const existingTransaksiPR = await TransaksiPR.findOne({
          where: { orderPemanenUuid: req.params.id },
        });

        if (existingTransaksiPR) {
          return res.status(400).json({
            msg: "Transaksi perusahaan sudah ada untuk pesanan ini.",
          });
        }

        const transaksiPR = await TransaksiPR.create({
          orderPemanenUuid: req.params.id,
          hargaaktual,
          catatanharga,
          tanggalselesai,
          userId: req.userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const updatedStatus = "order selesai";
        await product.update({ statusOrder: updatedStatus });
        return res.status(200).json({
          msg: `Status order berhasil diperbarui menjadi ${updatedStatus}`,
          transaksiPR: transaksiPR.dataValues,
        });
      } else {
        return res.status(400).json({
          msg: "Data transaksi tidak lengkap. Harap lengkapi semua field yang dibutuhkan.",
        });
      }
    }

    // Petani Input data transaksi/limbah
    if (req.role === "petani" && 
        (product.statusOrder === "Menunggu waktu panen" || 
         product.statusOrder === "selesai diantar logistik" || 
         product.statusOrder === "diterima pabrik" || 
         product.statusOrder === "order selesai")) {
      if (!beratLimbahBatang || !catatanLimbahBatang || 
          !beratLimbahDaun || !catatanLimbahDaun || 
          !beratLimbahAkar || !catatanLimbahAkar) {
        return res.status(400).json({
          msg: "Masukan data dengan lengkap.",
        });
      }

      const existinglimbahPetani = await limbahpetani.findOne({
        where: {
          orderPemanenUuid: req.params.id,
          beratLimbahBatang: { [Op.ne]: null },
        },
      });

      if (existinglimbahPetani) {
        return res.status(400).json({ msg: "Data limbah sudah tercatat sebelumnya." });
      }

      const limbahPetani = await limbahpetani.create({
        orderPemanenUuid: req.params.id,
        beratLimbahBatang,
        catatanLimbahBatang,
        beratLimbahDaun,
        catatanLimbahDaun,
        beratLimbahAkar,
        catatanLimbahAkar,
        userId: req.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return res.status(200).json({
        msg: "Data limbah berhasil dicatat.",
        limbahPetani: limbahPetani.dataValues,
      });
    }

    const relatedTransaksiPBK = await TransaksiPBK.findAll({
      where: { orderPemanenUuid: req.params.id },
    });

    const relatedTransaksiLogistik = await TransaksiLogistik.findAll({
      where: { orderPemanenUuid: req.params.id },
    });

    const relatedTransaksiPR = await TransaksiPR.findAll({
      where: { orderPemanenUuid: req.params.id },
    });

    const updatedProduct = await Product.findOne({
      where: { uuid: req.params.id },
    });

    const {
      idLahan,
      tanggalPemanenan,
      varietasSingkong,
      estimasiBerat,
      namaPerusahaan,
      emailPerusahaan,
      namaPabrik,
      emailPabrik,
      namaLogistik,
      emailLogistik,
    } = updatedProduct;

    return res.status(200).json({
      msg: `Status order berhasil diperbarui`,
      product: {
        idLahan,
        tanggalPemanenan,
        statusOrder: updatedStatus,
        varietasSingkong,
        estimasiBerat,
        namaPerusahaan,
        emailPerusahaan,
        namaPabrik,
        emailPabrik,
        namaLogistik,
        emailLogistik,
      },
      transaksiPBK: relatedTransaksiPBK.map((transaksi) => transaksi.dataValues),
      transaksiLogistik: relatedTransaksiLogistik.map((transaksi) => transaksi.dataValues),
      transaksiPR: relatedTransaksiPR.map((transaksi) => transaksi.dataValues),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
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
