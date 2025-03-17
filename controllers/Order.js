
import Product from "../models/OrderPanen.js";
import User from "../models/UserModel.js"; // Import model User
import Logistikdasar from "../models/DasarLogistik.js";
import TransaksiPR from "../models/TransaksiPerusahaan.js";
import Logistik from "../models/TransaksiLogistik.js";
import Perusahaan from "../models/DasarPerusahaan.js";
import Petani from "../models/RencanaTanam.js";
import Dasarpetani from "../models/DasarPetani.js";
import TransaksiPBK from "../models/TransaksiPabrik.js";
import limbahpetani from "../models/LimbahPetani.js";
import Pabrik from "../models/DasarPabrik.js";
import TransaksiLogistik from "../models/TransaksiLogistik.js"; // Model transaksi logistik
import { Op } from "sequelize"; // Import operator Sequelize
import Sequelize from "../config/Database.js";
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import Petanidasar from "../models/DasarPetani.js";

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
export const getOrderMasuk = async (req, res) => {
  try {
    let response;

    if (req.role === "perusahaan") {
      // Ambil data kategori lahan dari tabel Dasarpetani
      const lahanData = await Dasarpetani.findAll({
        attributes: ["idlahan", "kategorilahan", "namePerusahaan"],  // Perhatikan kapitalisasi idlahan di sini
      });

      // Ambil data produk dengan kondisi namaPerusahaan atau emailPerusahaan null
      const productData = await Product.findAll({
        attributes: [
          "uuid",
          "idTanam",
          "idLahan",
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
      });

      const filteredProductData = productData.filter(product => {
        // Cek apakah idLahan di Product ada di Dasarpetani (perhatikan perbedaan kapitalisasi idLahan dan idlahan)
        const lahan = lahanData.find(lahan => lahan.idlahan === product.idLahan);  // idlahan pada Dasarpetani, idLahan pada Product

        if (lahan) {
          // Jika ditemukan data yang cocok, periksa kategori lahan dan namaPerusahaan
          if (lahan.kategorilahan === "Plasma" && lahan.namePerusahaan === req.name) {
            return true; // Jika Plasma dan namePerusahaan cocok, tampilkan data
          } else if (lahan.kategorilahan === "Inti") {
            return true; // Jika kategori lahan Inti, tampilkan data
          }
        }
        return false; // Jika tidak ada kecocokan, data tidak ditampilkan
      });

      response = filteredProductData;

    }else if (req.role === "pabrik") {
      // Produk yang memiliki namaPerusahaan tetapi belum memiliki pabrik
      response = await Product.findAll({
        attributes: [
          "uuid",
          "idTanam",
          "idLahan",
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
          [Op.and]: [
            { namaPerusahaan: { [Op.ne]: null } }, // Pastikan sudah ada namaPerusahaan
            { emailPerusahaan: { [Op.ne]: null } }, // Pastikan sudah ada emailPerusahaan
            { namaPabrik: null }, // Belum ada namaPabrik
            { emailPabrik: null }, // Belum ada emailPabrik
          ],
        },
        include: [
          {
            model: User,
            attributes: ["name", "email"], // Sertakan informasi tambahan dari pengguna
          },
        ],
      });
    } else if (req.role === "logistik") {
      // Produk yang memiliki namaPabrik tetapi belum memiliki logistik
      response = await Product.findAll({
        attributes: [
          "uuid",
          "idTanam",
          "idLahan",
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
          [Op.and]: [
            { namaPabrik: { [Op.ne]: null } }, // Pastikan sudah ada namaPabrik
            { emailPabrik: { [Op.ne]: null } }, // Pastikan sudah ada emailPabrik
            { namaLogistik: null }, // Belum ada namaLogistik
            { emailLogistik: null }, // Belum ada emailLogistik
          ],
        },
        include: [
          {
            model: User,
            attributes: ["name", "email"], // Sertakan informasi tambahan dari pengguna
          },
        ],
      });
    } else if (req.role === "admin") {
      // Admin melihat semua order yang belum memiliki perusahaan, pabrik, atau logistik
      response = await Product.findAll({
        attributes: [
          "uuid",
          "idTanam",
          "idLahan",
          "tanggalPemanenan",
          "statusOrder",
          "varietasSingkong",
          "estimasiBerat",
          "estimasiHarga",
          "namaLogistik",
          "emailLogistik",
          "namaPabrik",
          "emailPabrik",
          "namaPerusahaan",
          "emailPerusahaan",
        ],
        where: {
          [Op.or]: [
            { namaPerusahaan: null },
            { emailPerusahaan: null },
            { namaPabrik: null },
            { emailPabrik: null },
            { namaLogistik: null },
            { emailLogistik: null },
          ],
        },
      });
    } else {
      // Role tidak valid
      return res.status(403).json({ msg: "Role tidak valid atau tidak memiliki akses." });
    }

    // Format data untuk biaya transportasi, estimasi harga, berat, dan limbah
const formatNumber = (value) => value ? parseInt(value).toLocaleString("id-ID") : "-";
const formatFloat = (value) => value ? parseFloat(value).toLocaleString("id-ID") : "-";

const formattedResponse = response.map((item) => {
  // Format biaya transportasi, estimasi harga, estimasi berat
  if (item.Logistik) {
    item.Logistik.biayaTransportasi = formatNumber(item.Logistik.biayaTransportasi);
  }
  item.estimasiHarga = formatNumber(item.estimasiHarga);
  item.estimasiBerat = formatFloat(item.estimasiBerat);

  if (item.TransaksiPR) {
    item.TransaksiPR.hargaaktual = formatNumber(item.TransaksiPR.hargaaktual);
  }

  // Format berat limbah (jika ada limbah petani)
  if (item.limbahpetani) {
    item.limbahpetani.beratLimbahBatang = formatFloat(item.limbahpetani.beratLimbahBatang);
    item.limbahpetani.beratLimbahDaun = formatFloat(item.limbahpetani.beratLimbahDaun);
    item.limbahpetani.beratLimbahAkar = formatFloat(item.limbahpetani.beratLimbahAkar);
  }

  return item;
});


    // Kirimkan respons dengan data yang diformat
    res.status(200).json(formattedResponse);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

  
// Controller untuk mendapatkan produk berdasarkan kondisi role(HISTORY PANEN SETIAP ROLE hanya milik dia sendiri yg dia acc)
export const getOrderBerlangsung = async (req, res) => {
  try {
    let response;

    if (req.role === "logistik") {
      response = await Product.findAll({
        where: {
          namaLogistik: req.name,
          emailLogistik: req.email,
          statusOrder: {
            [Op.ne]: "order selesai", // Tidak mengambil data dengan status selesai
          },
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
              "idKendaraan",
              "tanggalPengiriman",
              "waktuPengiriman",
              "estimasiWaktuTiba",
              "aktualWaktuTiba",
              "catatanEfisiensiRute",
              "biayaTransportasi",
              "kondisiPengiriman",
              "catatanDariPenerima",
            ],
            required: false, // Tidak memaksa adanya relasi
            where: {
              [Op.or]: [
                { orderPemanenUuid: { [Op.ne]: null } },
                { idKendaraan: { [Op.ne]: null } },
                { tanggalPengiriman: { [Op.ne]: null } },
                { waktuPengiriman: { [Op.ne]: null } },
                { estimasiWaktuTiba: { [Op.ne]: null } },
              ],
            },
            order: [
              ["orderPemanenUuid", "ASC"], // Urutkan berdasarkan orderPemanenUuid
              ["idKendaraan", "ASC"], // Jika diperlukan, urutkan juga berdasarkan idKendaraan
            ],
          },
          {
            model: TransaksiPR,
            attributes: ["orderPemanenUuid", "hargaaktual", "catatanharga", "tanggalselesai"],
            required: false,
          },
          {
            model: TransaksiPBK,
            attributes: ["orderPemanenUuid", "tanggalPenerimaan", "beratTotalDiterima", "catatanKualitas", "evaluasiKualitas"],
            required: false,
          },
          {
            model: limbahpetani,
            attributes: [
              "beratLimbahBatang",
              "catatanLimbahBatang",
              "beratLimbahDaun",
              "catatanLimbahDaun",
              "beratLimbahAkar",
              "catatanLimbahAkar",
            ],
            required: false,
          },
        ],
      });
    }  else if (req.role === "perusahaan") {
      response = await Product.findAll({
        attributes: [
          "uuid",
          "idTanam",
          "idLahan",
          "tanggalPemanenan",
          "statusOrder",
          "varietasSingkong",
          "estimasiBerat",
          "estimasiHarga",
          "namaPerusahaan",
          "emailPerusahaan",
          "namaLogistik",
          "emailLogistik",
          "namaPabrik",
          "emailPabrik",
        ],
        where: {
          namaPerusahaan: req.name,
          emailPerusahaan: req.email,
          statusOrder: {
            [Op.ne]: "order selesai",
          },
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
              "idKendaraan",
              "tanggalPengiriman",
              "waktuPengiriman",
              "estimasiWaktuTiba",
              "aktualWaktuTiba",
              "catatanEfisiensiRute",
              "biayaTransportasi",
              "kondisiPengiriman",
              "catatanDariPenerima",
            ],
            required: false, // Tidak memaksa adanya relasi
            where: {
              [Op.or]: [
                { orderPemanenUuid: { [Op.ne]: null } },
                { idKendaraan: { [Op.ne]: null } },
                { tanggalPengiriman: { [Op.ne]: null } },
                { waktuPengiriman: { [Op.ne]: null } },
                { estimasiWaktuTiba: { [Op.ne]: null } },
              ],
            },
            order: [
              ["orderPemanenUuid", "ASC"], // Urutkan berdasarkan orderPemanenUuid
              ["idKendaraan", "ASC"], // Jika diperlukan, urutkan juga berdasarkan idKendaraan
            ],
          },
          {
            model: TransaksiPR,
            attributes: ["orderPemanenUuid", "hargaaktual", "catatanharga", "tanggalselesai"],
            required: false,
          },
          {
            model: TransaksiPBK,
            attributes: ["orderPemanenUuid", "tanggalPenerimaan", "beratTotalDiterima", "catatanKualitas", "evaluasiKualitas"],
            required: false,
          },
          {
            model: limbahpetani,
            attributes: [
              "beratLimbahBatang",
              "catatanLimbahBatang",
              "beratLimbahDaun",
              "catatanLimbahDaun",
              "beratLimbahAkar",
              "catatanLimbahAkar",
            ],
            required: false,
          },
        ],
      });
    } else if (req.role === "pabrik") {
      response = await Product.findAll({
        attributes: [
          "uuid",
          "idTanam",
          "idLahan",
          "tanggalPemanenan",
          "statusOrder",
          "varietasSingkong",
          "estimasiBerat",
          "estimasiHarga",
          "namaPerusahaan",
          "emailPerusahaan",
          "namaLogistik",
          "emailLogistik",
          "namaPabrik",
          "emailPabrik",
        ],
        where: {
          namaPabrik: req.name,
          emailPabrik: req.email,
          statusOrder: {
            [Op.ne]: "order selesai",
          },
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
              "idKendaraan",
              "tanggalPengiriman",
              "waktuPengiriman",
              "estimasiWaktuTiba",
              "aktualWaktuTiba",
              "catatanEfisiensiRute",
              "biayaTransportasi",
              "kondisiPengiriman",
              "catatanDariPenerima",
            ],
            required: false, // Tidak memaksa adanya relasi
            where: {
              [Op.or]: [
                { orderPemanenUuid: { [Op.ne]: null } },
                { idKendaraan: { [Op.ne]: null } },
                { tanggalPengiriman: { [Op.ne]: null } },
                { waktuPengiriman: { [Op.ne]: null } },
                { estimasiWaktuTiba: { [Op.ne]: null } },
              ],
            },
            order: [
              ["orderPemanenUuid", "ASC"], // Urutkan berdasarkan orderPemanenUuid
              ["idKendaraan", "ASC"], // Jika diperlukan, urutkan juga berdasarkan idKendaraan
            ],
          },
          {
            model: TransaksiPR,
            attributes: ["orderPemanenUuid", "hargaaktual", "catatanharga", "tanggalselesai"],
            required: false,
          },
          {
            model: TransaksiPBK,
            attributes: ["orderPemanenUuid", "tanggalPenerimaan", "beratTotalDiterima", "catatanKualitas", "evaluasiKualitas"],
            required: false,
          },
          {
            model: limbahpetani,
            attributes: [
              "beratLimbahBatang",
              "catatanLimbahBatang",
              "beratLimbahDaun",
              "catatanLimbahDaun",
              "beratLimbahAkar",
              "catatanLimbahAkar",
            ],
            required: false,
          },
        ],
      });
    } else if (req.role === "petani") {
      response = await Product.findAll({
        attributes: [
          "uuid",
          "idTanam",
          "idLahan",
          "tanggalPemanenan",
          "statusOrder",
          "varietasSingkong",
          "estimasiBerat",
          "estimasiHarga",
          "namaLogistik",
          "emailLogistik",
          "namaPabrik",
          "emailPabrik",
          "namaPerusahaan",
          "emailPerusahaan",
        ],
        where: {
          userId: req.userId,
          statusOrder: {
            [Op.ne]: "order selesai",
          },
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
              "idKendaraan",
              "tanggalPengiriman",
              "waktuPengiriman",
              "estimasiWaktuTiba",
              "aktualWaktuTiba",
              "catatanEfisiensiRute",
              "biayaTransportasi",
              "kondisiPengiriman",
              "catatanDariPenerima",
            ],
            required: false, // Tidak memaksa adanya relasi
            where: {
              [Op.or]: [
                { orderPemanenUuid: { [Op.ne]: null } },
                { idKendaraan: { [Op.ne]: null } },
                { tanggalPengiriman: { [Op.ne]: null } },
                { waktuPengiriman: { [Op.ne]: null } },
                { estimasiWaktuTiba: { [Op.ne]: null } },
              ],
        },
        order: [
          ["orderPemanenUuid", "ASC"], // Urutkan berdasarkan orderPemanenUuid
          ["idKendaraan", "ASC"], // Jika diperlukan, urutkan juga berdasarkan idKendaraan
        ],
      },
      {
            model: TransaksiPR,
            attributes: ["orderPemanenUuid", "hargaaktual", "catatanharga", "tanggalselesai"],
            required: false,
          },
          {
            model: TransaksiPBK,
            attributes: ["orderPemanenUuid", "tanggalPenerimaan", "beratTotalDiterima", "catatanKualitas", "evaluasiKualitas"],
            required: false,
          },
          {
            model: limbahpetani,
            attributes: [
              "beratLimbahBatang",
              "catatanLimbahBatang",
              "beratLimbahDaun",
              "catatanLimbahDaun",
              "beratLimbahAkar",
              "catatanLimbahAkar",
            ],
            required: false,
          },
        ],
      });
    } else if (req.role === "admin") {
      response = await Product.findAll({
        attributes: [
          "uuid",
          "idTanam",
          "idLahan",
          "tanggalPemanenan",
          "statusOrder",
          "varietasSingkong",
          "estimasiBerat",
          "estimasiHarga",
          "namaLogistik",
          "emailLogistik",
          "namaPabrik",
          "emailPabrik",
          "namaPerusahaan",
          "emailPerusahaan",
        ],
        where: {
          statusOrder: {
            [Op.ne]: "order selesai", // Semua data dengan status selain selesai
          },
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
              "idKendaraan",
              "tanggalPengiriman",
              "waktuPengiriman",
              "estimasiWaktuTiba",
              "aktualWaktuTiba",
              "catatanEfisiensiRute",
              "biayaTransportasi",
              "kondisiPengiriman",
              "catatanDariPenerima",
            ],
            required: false, // Tidak memaksa adanya relasi
            where: {
              [Op.or]: [
                { orderPemanenUuid: { [Op.ne]: null } },
                { idKendaraan: { [Op.ne]: null } },
                { tanggalPengiriman: { [Op.ne]: null } },
                { waktuPengiriman: { [Op.ne]: null } },
                { estimasiWaktuTiba: { [Op.ne]: null } },
              ],
            },
            order: [
              ["orderPemanenUuid", "ASC"], // Urutkan berdasarkan orderPemanenUuid
              ["idKendaraan", "ASC"], // Jika diperlukan, urutkan juga berdasarkan idKendaraan
            ],
          },
          {
            model: TransaksiPR,
            attributes: ["orderPemanenUuid", "hargaaktual", "catatanharga", "tanggalselesai"],
            required: false,
          },
          {
            model: TransaksiPBK,
            attributes: ["orderPemanenUuid", "tanggalPenerimaan", "beratTotalDiterima", "catatanKualitas", "evaluasiKualitas"],
            required: false,
          },
          {
            model: limbahpetani,
            attributes: [
              "beratLimbahBatang",
              "catatanLimbahBatang",
              "beratLimbahDaun",
              "catatanLimbahDaun",
              "beratLimbahAkar",
              "catatanLimbahAkar",
            ],
            required: false,
          },
        ],
      });
    } else {
      // Role tidak valid
      return res.status(403).json({ msg: "Role tidak valid atau tidak memiliki akses." });
    }

   /// Format data untuk biaya transportasi, estimasi harga, berat, dan limbah
const formatNumber = (value) => value ? parseInt(value).toLocaleString("id-ID") : "-";
const formatFloat = (value) => value ? parseFloat(value).toLocaleString("id-ID") : "-";

const formattedResponse = response.map((item) => {
  // Format biaya transportasi, estimasi harga, estimasi berat
  if (item.Logistik) {
    item.Logistik.biayaTransportasi = formatNumber(item.Logistik.biayaTransportasi);
  }
  item.estimasiHarga = formatNumber(item.estimasiHarga);
  item.estimasiBerat = formatFloat(item.estimasiBerat);

  if (item.TransaksiPR) {
    item.TransaksiPR.hargaaktual = formatNumber(item.TransaksiPR.hargaaktual);
  }

  // Format berat limbah (jika ada limbah petani)
  if (item.limbahpetani) {
    item.limbahpetani.beratLimbahBatang = formatFloat(item.limbahpetani.beratLimbahBatang);
    item.limbahpetani.beratLimbahDaun = formatFloat(item.limbahpetani.beratLimbahDaun);
    item.limbahpetani.beratLimbahAkar = formatFloat(item.limbahpetani.beratLimbahAkar);
  }

  return item;
});

       // Kirimkan respons dengan data yang diformat
       res.status(200).json(formattedResponse);
     } catch (error) {
       res.status(500).json({ msg: error.message });
     }
   };

export const getHistoryOrder = async (req, res) => {
  try {
    let response;

    // Periksa role pengguna
    if (req.role === "logistik") {
      response = await Product.findAll({
        attributes: [
          "uuid",
          "idTanam",
          "idLahan",
          "tanggalPemanenan",
          "statusOrder",
          "varietasSingkong",
          "estimasiBerat",
          "estimasiHarga",
          "namaPerusahaan",
          "emailPerusahaan",
          "namaLogistik",
          "emailLogistik",
          "namaPabrik",
          "emailPabrik",
        ],
        where: {
          namaLogistik: req.name,
          emailLogistik: req.email,
          statusOrder: {
            [Op.eq]: "order selesai", // Tidak mengambil data dengan status selesai
          },
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
          "idKendaraan",
          "tanggalPengiriman",
          "waktuPengiriman",
          "estimasiWaktuTiba",
          // Kolom berikut akan muncul tetapi bernilai null jika belum diisi
          "aktualWaktuTiba",
          "catatanEfisiensiRute",
          "biayaTransportasi",
          "kondisiPengiriman",
          "catatanDariPenerima",
        ],
        required: false, // Tidak memaksa adanya relasi
        where: {
          [Op.or]: [
            { orderPemanenUuid: { [Op.ne]: null } },
            { idKendaraan: { [Op.ne]: null } },
            { tanggalPengiriman: { [Op.ne]: null } },
            { waktuPengiriman: { [Op.ne]: null } },
            { estimasiWaktuTiba: { [Op.ne]: null } },
          ],
        },
      },
    ],
  });
}  else if (req.role === "perusahaan") {
      response = await Product.findAll({
        attributes: [
          "uuid",
          "idTanam",
          "idLahan",
          "tanggalPemanenan",
          "statusOrder",
          "varietasSingkong",
          "estimasiBerat",
          "estimasiHarga",
          "namaPerusahaan",
          "emailPerusahaan",
          "namaLogistik",
          "emailLogistik",
          "namaPabrik",
          "emailPabrik",
        ],
        where: {
          namaPerusahaan: req.name,
          emailPerusahaan: req.email,
          statusOrder: {
            [Op.eq]: "order selesai",
          },
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
              "idKendaraan",
              "tanggalPengiriman",
              "waktuPengiriman",
              "estimasiWaktuTiba",
              "aktualWaktuTiba",
              "catatanEfisiensiRute",
              "biayaTransportasi",
              "kondisiPengiriman",
              "catatanDariPenerima",
            ],
            required: false, // Tidak memaksa adanya relasi
            where: {
              [Op.or]: [
                { orderPemanenUuid: { [Op.ne]: null } },
                { idKendaraan: { [Op.ne]: null } },
                { tanggalPengiriman: { [Op.ne]: null } },
                { waktuPengiriman: { [Op.ne]: null } },
                { estimasiWaktuTiba: { [Op.ne]: null } },
              ],
            },
            order: [
              ["orderPemanenUuid", "ASC"], // Urutkan berdasarkan orderPemanenUuid
              ["idKendaraan", "ASC"], // Jika diperlukan, urutkan juga berdasarkan idKendaraan
            ],
          },
          {
            model: TransaksiPR,
            attributes: ["orderPemanenUuid", "hargaaktual", "catatanharga", "tanggalselesai"],
            required: false,
          },
          {
            model: TransaksiPBK,
            attributes: ["orderPemanenUuid", "tanggalPenerimaan", "beratTotalDiterima", "catatanKualitas", "evaluasiKualitas"],
            required: false,
          },
          {
            model: limbahpetani,
            attributes: [
              "beratLimbahBatang",
              "catatanLimbahBatang",
              "beratLimbahDaun",
              "catatanLimbahDaun",
              "beratLimbahAkar",
              "catatanLimbahAkar",
            ],
            required: false,
          },
        ],
      });
    } else if (req.role === "pabrik") {
      response = await Product.findAll({
        attributes: [
          "uuid",
          "idTanam",
          "idLahan",
          "tanggalPemanenan",
          "statusOrder",
          "varietasSingkong",
          "estimasiBerat",
          "estimasiHarga",
          "namaPerusahaan",
          "emailPerusahaan",
          "namaLogistik",
          "emailLogistik",
          "namaPabrik",
          "emailPabrik",
        ],
        where: {
          namaPabrik: req.name,
          emailPabrik: req.email,
          statusOrder: {
            [Op.eq]: "order selesai",
          },
        },
        include: [
          {
            model: User,
            attributes: ["name", "email"],
          },
          {
            model: TransaksiPBK,
            attributes: ["orderPemanenUuid", "tanggalPenerimaan", "beratTotalDiterima", "catatanKualitas", "evaluasiKualitas"],
            required: false,
          },
        ],
      });
    } else if (req.role === "petani") {
      response = await Product.findAll({
        attributes: [
          "uuid",
          "idTanam",
          "idLahan",
          "tanggalPemanenan",
          "statusOrder",
          "varietasSingkong",
          "estimasiBerat",
          "estimasiHarga",
          "namaPerusahaan",
          "emailPerusahaan",
          "namaLogistik",
          "emailLogistik",
          "namaPabrik",
          "emailPabrik",
        ],
        where: {
          userId: req.userId,
          statusOrder: {
            [Op.eq]: "order selesai",
          },
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
              "idKendaraan",
              "tanggalPengiriman",
              "waktuPengiriman",
              "estimasiWaktuTiba",
              "aktualWaktuTiba",
              "catatanEfisiensiRute",
              "biayaTransportasi",
              "kondisiPengiriman",
              "catatanDariPenerima",
            ],
            required: false, // Tidak memaksa adanya relasi
            where: {
              [Op.or]: [
                { orderPemanenUuid: { [Op.ne]: null } },
                { idKendaraan: { [Op.ne]: null } },
                { tanggalPengiriman: { [Op.ne]: null } },
                { waktuPengiriman: { [Op.ne]: null } },
                { estimasiWaktuTiba: { [Op.ne]: null } },
              ],
        },
        order: [
          ["orderPemanenUuid", "ASC"], // Urutkan berdasarkan orderPemanenUuid
          ["idKendaraan", "ASC"], // Jika diperlukan, urutkan juga berdasarkan idKendaraan
        ],
      },
      {
            model: TransaksiPR,
            attributes: ["orderPemanenUuid", "hargaaktual", "catatanharga", "tanggalselesai"],
            required: false,
          },
          {
            model: TransaksiPBK,
            attributes: ["orderPemanenUuid", "tanggalPenerimaan", "beratTotalDiterima", "catatanKualitas", "evaluasiKualitas"],
            required: false,
          },
          {
            model: limbahpetani,
            attributes: [
              "beratLimbahBatang",
              "catatanLimbahBatang",
              "beratLimbahDaun",
              "catatanLimbahDaun",
              "beratLimbahAkar",
              "catatanLimbahAkar",
            ],
            required: false,
          },
        ],
      });
    } else if (req.role === "admin") {
      response = await Product.findAll({
        attributes: [
          "uuid",
          "idTanam",
          "idLahan",
          "tanggalPemanenan",
          "statusOrder",
          "varietasSingkong",
          "estimasiBerat",
          "estimasiHarga",
          "namaLogistik",
          "emailLogistik",
          "namaPabrik",
          "emailPabrik",
          "namaPerusahaan",
          "emailPerusahaan",
        ],
        where: {
          statusOrder: {
            [Op.eq]: "order selesai", // Semua data dengan status selain selesai
          },
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
              "idKendaraan",
              "tanggalPengiriman",
              "waktuPengiriman",
              "estimasiWaktuTiba",
              "aktualWaktuTiba",
              "catatanEfisiensiRute",
              "biayaTransportasi",
              "kondisiPengiriman",
              "catatanDariPenerima",
            ],
            required: false, // Tidak memaksa adanya relasi
            where: {
              [Op.or]: [
                { orderPemanenUuid: { [Op.ne]: null } },
                { idKendaraan: { [Op.ne]: null } },
                { tanggalPengiriman: { [Op.ne]: null } },
                { waktuPengiriman: { [Op.ne]: null } },
                { estimasiWaktuTiba: { [Op.ne]: null } },
              ],
        },
        order: [
          ["orderPemanenUuid", "ASC"], // Urutkan berdasarkan orderPemanenUuid
          ["idKendaraan", "ASC"], // Jika diperlukan, urutkan juga berdasarkan idKendaraan
        ],
      },
      {
            model: TransaksiPR,
            attributes: ["orderPemanenUuid", "hargaaktual", "catatanharga", "tanggalselesai"],
            required: false,
          },
          {
            model: TransaksiPBK,
            attributes: ["orderPemanenUuid", "tanggalPenerimaan", "beratTotalDiterima", "catatanKualitas", "evaluasiKualitas"],
            required: false,
          },
          {
            model: limbahpetani,
            attributes: [
              "beratLimbahBatang",
              "catatanLimbahBatang",
              "beratLimbahDaun",
              "catatanLimbahDaun",
              "beratLimbahAkar",
              "catatanLimbahAkar",
            ],
            required: false,
          },
        ],
      });
    } else {
      // Role tidak valid
      return res.status(403).json({ msg: "Role tidak valid atau tidak memiliki akses." });
    }

    // Format data untuk biaya transportasi, estimasi harga, berat, dan limbah
const formatNumber = (value) => value ? parseInt(value).toLocaleString("id-ID") : "-";
const formatFloat = (value) => value ? parseFloat(value).toLocaleString("id-ID") : "-";

const formattedResponse = response.map((item) => {
  // Format biaya transportasi, estimasi harga, estimasi berat
  if (item.Logistik) {
    item.Logistik.biayaTransportasi = formatNumber(item.Logistik.biayaTransportasi);
  }
  item.estimasiHarga = formatNumber(item.estimasiHarga);
  item.estimasiBerat = formatFloat(item.estimasiBerat);

  if (item.TransaksiPR) {
    item.TransaksiPR.hargaaktual = formatNumber(item.TransaksiPR.hargaaktual);
  }

  // Format berat limbah (jika ada limbah petani)
  if (item.limbahpetani) {
    item.limbahpetani.beratLimbahBatang = formatFloat(item.limbahpetani.beratLimbahBatang);
    item.limbahpetani.beratLimbahDaun = formatFloat(item.limbahpetani.beratLimbahDaun);
    item.limbahpetani.beratLimbahAkar = formatFloat(item.limbahpetani.beratLimbahAkar);
  }

  return item;
});


    // Kirimkan respons dengan data yang diformat
    res.status(200).json(formattedResponse);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};


export const getHistoryOrderPdf = async (req, res) => {
  try {
    // Cari produk berdasarkan UUID
    const product = await Product.findOne({
      where: {
        uuid: req.params.id, // Menggunakan UUID dari parameter URL
      }
    });

    // Jika produk tidak ditemukan
    if (!product) return res.status(404).json({ msg: "Data tidak ditemukan" });

    // Periksa role pengguna
    if (req.role !== "admin") {
      // Pastikan produk sesuai dengan name, email, atau userId pengguna
      if (
        product.userId !== req.userId &&
        product.namaLogistik !== req.name &&
        product.namaPerusahaan !== req.name &&
        product.namaPabrik !== req.name &&
        product.emailLogistik !== req.email &&
        product.emailPerusahaan !== req.email &&
        product.emailPabrik !== req.email
      ) {
        return res
          .status(403)
          .json({ msg: "Anda tidak memiliki akses ke data ini." });
      }
    }

    // Ambil data transaksi terkait berdasarkan UUID produk
    const response = await Product.findOne({
      attributes: [
        "uuid",
        "idTanam",
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
            "idKendaraan",
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
          required: false, // Tidak memaksa adanya relasi
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
          model: limbahpetani,
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
      raw: true, // Clean up the response by excluding metadata
    });

    // Ambil informasi lahan berdasarkan idLahan
    const lahanInfo = await Petani.findOne({
      where: { idlahan: product.idLahan },
      raw: true, // Clean up the response by excluding metadata
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

    // Membuat PDF
    const doc = new PDFDocument();
    doc.fontSize(16).text("History Order", { align: "center" });
    doc.moveDown();
    doc.fontSize(12);

    // Menulis data ke dalam PDF
    // Loop melalui semua atribut untuk mencetaknya
    const printData = (data, indent = "") => {
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          // Cetak hanya jika data bukan metadata atau atribut Sequelize
          if (key !== "includeValidated" && key !== "raw" && key !== "isNewRecord") {
            if (typeof data[key] === "object" && data[key] !== null) {
              // Jika data adalah objek atau array, rekursif
              doc.text(`${indent}${key}:`);
              printData(data[key], indent + "  ");
            } else {
              // Jika data bukan objek, cetak data
              doc.text(`${indent}${key}: ${data[key]}`);
            }
          }
        }
      }
    };

    // Cetak data dari InformasiOrder
    printData(finalResponse.InformasiOrder);

    // Cetak data dari LahanInfo
    doc.text("--------------------------------------");
    doc.text("Informasi Lahan:");
    printData(finalResponse.LahanInfo);

    // Jika ada transaksi atau limbah, tambahkan ke PDF
    if (finalResponse.InformasiOrder.Logistik) {
      doc.text("--------------------------------------");
      doc.text("Logistik:");
      finalResponse.InformasiOrder.Logistik.forEach(log => {
        printData(log, "  ");
      });
    }

    if (finalResponse.InformasiOrder.TransaksiPBK) {
      doc.text("--------------------------------------");
      doc.text("TransaksiPBK:");
      finalResponse.InformasiOrder.TransaksiPBK.forEach(tx => {
        printData(tx, "  ");
      });
    }

    if (finalResponse.InformasiOrder.TransaksiPR) {
      doc.text("--------------------------------------");
      doc.text("TransaksiPR:");
      finalResponse.InformasiOrder.TransaksiPR.forEach(tx => {
        printData(tx, "  ");
      });
    }

    if (finalResponse.InformasiOrder.limbahpetani) {
      doc.text("--------------------------------------");
      doc.text("Limbah Petani:");
      finalResponse.InformasiOrder.limbahpetani.forEach(limbah => {
        printData(limbah, "  ");
      });
    }

    // Mengirim PDF langsung ke pengguna
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="historyOrder.pdf"');

    doc.pipe(res); // Stream langsung ke respons HTTP
    doc.end();

  } catch (error) {
    // Tangani kesalahan server
    res.status(500).json({ msg: error.message });
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

     // Periksa role pengguna
     if (req.role !== "admin") {
      // Pastikan produk sesuai dengan name, email, atau userId pengguna
      if (
        product.userId !== req.userId &&
        product.namaLogistik !== req.name &&
        product.namaPerusahaan !== req.name &&
        product.namaPabrik !== req.name &&
        product.emailLogistik !== req.email &&
        product.emailPerusahaan !== req.email &&
        product.emailPabrik !== req.email
      ) {
      return res
        .status(403)
        .json({ msg: "Anda tidak memiliki akses ke data ini." });
    }
  }
    // Ambil data transaksi terkait berdasarkan UUID produk
    const response = await Product.findOne({
      attributes: [
        "uuid",
        "idTanam",
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
            "idKendaraan",
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
          required: false, // Tidak memaksa adanya relasi
          where: {
            [Op.or]: [
              { orderPemanenUuid: { [Op.ne]: null } },
              { idKendaraan: { [Op.ne]: null } },
              { tanggalPengiriman: { [Op.ne]: null } },
              { waktuPengiriman: { [Op.ne]: null } },
              { estimasiWaktuTiba: { [Op.ne]: null } },
            ],
          },
          order: [
            ["orderPemanenUuid", "ASC"], // Urutkan berdasarkan orderPemanenUuid
            ["idKendaraan", "ASC"], // Jika diperlukan, urutkan juga berdasarkan idKendaraan
          ],
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
          model: limbahpetani,
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

    // Format data untuk biaya transportasi, estimasi harga, berat, dan limbah
    const formatCurrency = (value) => value ? `Rp ${parseInt(value).toLocaleString("id-ID")}` : "-";
const formatWeight = (value) => value ? `${parseFloat(value).toLocaleString("id-ID")} kg` : "-";

    const formattedResponse = response.map((item) => {
      
      // Format biaya transportasi, estimasi harga, estimasi berat
      if (item.Logistik) {
        item.Logistik.biayaTransportasi = formatCurrency(item.Logistik.biayaTransportasi);
      }
      item.estimasiHarga = formatCurrency(item.estimasiHarga);
      item.estimasiBerat = formatWeight(item.estimasiBerat);

      if (item.TransaksiPR) {
        item.TransaksiPR.hargaaktual = formatCurrency(item.TransaksiPR.hargaaktual);
      }

      // Format berat limbah (jika ada limbah petani)
      if (item.limbahpetani) {
        item.limbahpetani.beratLimbahBatang = formatWeight(item.limbahpetani.beratLimbahBatang);
        item.limbahpetani.beratLimbahDaun = formatWeight(item.limbahpetani.beratLimbahDaun);
        item.limbahpetani.beratLimbahAkar = formatWeight(item.limbahpetani.beratLimbahAkar);
      }

      return item;
    });

    // Kirimkan respons dengan data yang diformat
    res.status(200).json(formattedResponse);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};


export const createProduct = async (req, res) => {
  const { idTanam, tanggalPemanenan, statusOrder, varietasSingkong, estimasiBerat } = req.body;

  // Validasi input idTanam
  if (!idTanam) {
    return res.status(400).json({ msg: "ID Rencana Tanam harus diisi." });
  }

  try {
    // Cek apakah idTanam valid pada database Petani
    const tanam = await Petani.findOne({ where: { idtanam: idTanam } });
    if (!tanam) {
      return res.status(404).json({ msg: "ID Tanam tidak ditemukan di database Petani." });
    }

    // Cek apakah userId pada idTanam cocok dengan req.userId
    if (tanam.userId !== req.userId) {
      return res.status(403).json({ msg: "Anda tidak memiliki akses untuk menggunakan ID Tanam ini." });
    }

    // Ambil data harga terbaru dari database Perusahaan
    const perusahaanData = await Perusahaan.findOne({
      order: [['tanggalupdateharga', 'DESC']],
      limit: 1,
      attributes: ['hargaGradeA', 'hargaGradeB', 'hargaGradeC']
    });

    if (!perusahaanData) {
      return res.status(400).json({ msg: "Data harga tidak ditemukan." });
    }

    // Validasi varietas singkong dan hitung harga
    let hargaGrade;
    if (varietasSingkong === "Grade A") {
      hargaGrade = perusahaanData.hargaGradeA || 0;
    } else if (varietasSingkong === "Grade B") {
      hargaGrade = perusahaanData.hargaGradeB || 0;
    } else if (varietasSingkong === "Grade C") {
      hargaGrade = perusahaanData.hargaGradeC || 0;
    } else {
      return res.status(400).json({ msg: "Varietas singkong tidak valid." });
    }

    const estimasiHarga = estimasiBerat * hargaGrade;

    // Ambil idLahan dari data Petani berdasarkan idTanam
    const idLahan = tanam.idlahan;

    // Buat produk baru pada database Product
    const newProduct = await Product.create({
      idTanam: tanam.idtanam,
      idLahan, // Menyimpan idLahan yang terkait
      tanggalPemanenan,
      statusOrder: statusOrder || "pending",
      varietasSingkong,
      estimasiBerat,
      estimasiHarga,
      userId: req.userId,
    });

    // Format estimasi harga ke format dengan titik sebagai pemisah ribuan
    const formattedEstimasiHarga = newProduct.estimasiHarga.toLocaleString('id-ID', {
      minimumFractionDigits: 0, // Tanpa desimal
      maximumFractionDigits: 0,
    });

    // Format estimasi berat ke format dengan titik sebagai pemisah ribuan
    const formattedEstimasiBerat = newProduct.estimasiBerat.toLocaleString('id-ID', {
      minimumFractionDigits: 0, // Tanpa desimal
      maximumFractionDigits: 0,
    });

    // Kirim respon
    res.status(201).json({
      msg: "Order Pemanenan Created Successfully",
      orderPemanenan: {
        uuid: newProduct.uuid,
        idTanam: newProduct.idTanam,
        idLahan: newProduct.idLahan, // Sertakan idLahan dalam respon
        tanggalPemanenan: newProduct.tanggalPemanenan,
        statusOrder: newProduct.statusOrder,
        varietasSingkong: newProduct.varietasSingkong,
        estimasiBerat: formattedEstimasiBerat,
        estimasiHarga: formattedEstimasiHarga,
        userId: newProduct.userId,
      },
      tanamInfo: {
        idTanam: tanam.idtanam,
        idLahan: tanam.idlahan, // Sertakan idLahan dalam informasi tanam
        userId: tanam.userId,
        kategoriLahan: tanam.kategoriLahan,
        lokasiLahan: tanam.lokasiLahan,
        luasLahan: tanam.luasLahan,
        periodeTanamMulai: tanam.periodeTanamMulai,
        periodeTanamSelesai: tanam.periodeTanamSelesai,
      }
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
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

    const { perusahaan, pabrik, logistik, idKendaraan, estimasiWaktuTiba, waktuPengiriman, tanggalPengiriman } = req.body;

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

  if (!estimasiWaktuTiba) {
    return res.status(400).json({ msg: "Logistik harus memasukkan estimasi waktu tiba." });
  }

  if (!waktuPengiriman) {
    return res.status(400).json({ msg: "Logistik harus memasukkan waktu kedatangan." });
  }

  
  if (!tanggalPengiriman) {
    return res.status(400).json({ msg: "Logistik harus memasukkan tanggal pengiriman." });
  }



  // Menambahkan data ke database TransaksiLogistik
  await TransaksiLogistik.create({
    idKendaraan,
    estimasiWaktuTiba,
    waktuPengiriman,
    tanggalPengiriman,
    userId: req.userId,
    orderPemanenUuid: req.params.id, // Menggunakan data dari produk terkait
  });

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

  if (aktualWaktuTiba) {
    if (product.namaLogistik !== req.name || product.emailLogistik !== req.email) {
      return res.status(400).json({ msg: "Nama atau email logistik tidak sesuai dengan data pada produk." });
    }

    // Gunakan transaksi Sequelize untuk menjaga konsistensi data
    const t = await Sequelize.transaction();

    try {
      // Cari apakah transaksi logistik dengan orderPemanenUuid yang sama sudah ada
      const existingTransaksiLogistik = await TransaksiLogistik.findOne({
        where: { orderPemanenUuid: req.params.id },
        transaction: t,
      });

      let transaksiLogistik;

      if (existingTransaksiLogistik) {
        // Jika data sudah ada, perbarui data yang ada
        transaksiLogistik = await existingTransaksiLogistik.update(
          {
            aktualWaktuTiba,
            catatanEfisiensiRute,
            biayaTransportasi,
            kondisiPengiriman,
         
          },
          { transaction: t }
        );
      } else {
        // Jika data belum ada, buat data baru
        transaksiLogistik = await TransaksiLogistik.create(
          {
            aktualWaktuTiba,
            catatanEfisiensiRute,
            biayaTransportasi,
            kondisiPengiriman,
         
            userId: req.userId,
          },
          { transaction: t }
        );
      }

      // Perbarui status order produk
      const updatedStatus = "selesai diantar logistik";
      await product.update({ statusOrder: updatedStatus }, { transaction: t });

      // Commit transaksi
      await t.commit();

      return res.status(200).json({
        msg: `Status order berhasil diperbarui menjadi ${updatedStatus}`,
        transaksiLogistik: transaksiLogistik.dataValues,
      });
    } catch (error) {
      // Rollback transaksi jika ada error
      await t.rollback();
      return res.status(500).json({ msg: "Terjadi kesalahan saat mencatat transaksi logistik.", error: error.message });
    }
  } else {
    return res.status(400).json({ msg: "Data logistik tidak lengkap. Semua field harus diisi." });
  }
}


if (req.role === "pabrik") {
  if (product.statusOrder !== "selesai diantar logistik") {
    return res.status(400).json({
      msg: "Status order harus 'selesai diantar logistik' untuk pabrik dapat mencatat transaksi.",
    });
  }

  if (tanggalPenerimaan && beratTotalDiterima && catatanDariPenerima) {
    if (product.namaPabrik !== req.name || product.emailPabrik !== req.email) {
      return res.status(400).json({
        msg: "Nama atau email pabrik tidak sesuai dengan data pada produk.",
      });
    }

    const t = await Sequelize.transaction();

    try {
      // Cari transaksi logistik terkait
      const transaksiLogistik = await TransaksiLogistik.findOne({
        where: { orderPemanenUuid: req.params.id },
        transaction: t,
      });

      if (!transaksiLogistik) {
        await t.rollback();
        return res.status(400).json({
          msg: "Data logistik terkait tidak ditemukan, tidak dapat menyimpan catatan dari penerima.",
        });
      }

      // Simpan hanya catatanDariPenerima ke TransaksiLogistik
      await transaksiLogistik.update(
        { catatanDariPenerima },
        { transaction: t }
      );

      // Simpan data transaksi pabrik
      const existingTransaksiPBK = await TransaksiPBK.findOne({
        where: {
          orderPemanenUuid: req.params.id,
          beratTotalDiterima: { [Op.ne]: null },
        },
        transaction: t,
      });

      if (existingTransaksiPBK) {
        await t.rollback();
        return res.status(400).json({
          msg: "Berat total telah diterima sebelumnya, tidak dapat membuat transaksi baru.",
        });
      }

      const transaksiPBK = await TransaksiPBK.create(
        {
          orderPemanenUuid: req.params.id,
          tanggalPenerimaan,
          beratTotalDiterima,
          catatanKualitas,
          evaluasiKualitas,
          userId: req.userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { transaction: t }
      );

      // Perbarui status order produk
      const updatedStatus = "diterima pabrik";
      await product.update({ statusOrder: updatedStatus }, { transaction: t });

      await t.commit();
      return res.status(200).json({
        msg: `Status order berhasil diperbarui menjadi ${updatedStatus}`,
        transaksiPBK: transaksiPBK.dataValues,
      });
    } catch (error) {
      await t.rollback();
      return res.status(500).json({
        msg: "Terjadi kesalahan saat mencatat transaksi pabrik.",
        error: error.message,
      });
    }
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
