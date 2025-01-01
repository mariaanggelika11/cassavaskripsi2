import { Sequelize } from "sequelize"; // Mengimpor Sequelize dari modul sequelize
import db from "../config/Database.js"; // Mengimpor konfigurasi database dari file Database.js
import Users from "./UserModel.js"; // Mengimpor model Users dari file UserModel.js
const { DataTypes } = Sequelize; // Mendestrukturisasi DataTypes dari Sequelize
import OrderPemanen from "./OrderPanen.js";


// Fungsi untuk menghasilkan string acak dengan panjang tertentu
function generateRandomString(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; // Karakter yang digunakan untuk string acak
  let result = ""; // Inisialisasi hasil sebagai string kosong
  const charactersLength = characters.length; // Panjang dari karakter yang tersedia
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength)); // Menambahkan karakter acak ke hasil
  }
  return result; // Mengembalikan hasil
}

// Definisi model TransaksiPBK
const TransaksiPR = db.define(
  "data_transaksipr", // Nama tabel di database
  {
    orderPemanenUuid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    idTransaksiPR: {
      type: DataTypes.STRING, // Tipe data string
      defaultValue: () => `TRPR-${generateRandomString(6)}`, // Menggunakan fungsi untuk menambahkan 'ORD-' diikuti oleh string acak
      allowNull: false, // Tidak boleh null
      validate: {
        notEmpty: true, // Validasi bahwa kolom ini tidak boleh kosong
      },
    },
    tanggalselesai: {
      type: DataTypes.DATE, // Mengubah tipe data menjadi DATE untuk menyertakan waktu
      allowNull: false, // Tidak boleh null
      defaultValue: Sequelize.fn("NOW"), // Menggunakan waktu saat ini sebagai default
      validate: {
        notEmpty: true, // Validasi bahwa nilai tidak boleh kosong
      },
    },
    hargaaktual: {
      type: DataTypes.FLOAT, // Tipe data float (angka desimal)
      allowNull: false,
      validate: {
        notEmpty: true, // Validasi bahwa nilai tidak boleh kosong
        isFloat: true, // Validasi bahwa nilai harus berupa angka desimal
      },
    },
    catatanharga: {
      type: DataTypes.TEXT, // Tipe data teks (panjang)
      allowNull: true, // Boleh kosong
      validate: {
        notEmpty: false, // Kolom ini opsional
      },
    },
  },
  {
    freezeTableName: true, // Menggunakan nama tabel sesuai dengan nama model
  }
);

// Hubungan dengan model Users
Users.hasMany(TransaksiPR, { foreignKey: "userId" }); // Membuat relasi bahwa setiap user dapat memiliki banyak transaksi PBK
TransaksiPR.belongsTo(Users, { foreignKey: "userId" }); // Menambahkan foreign key userId pada TransaksiPBK yang merujuk ke Users


// Mengekspor model TransaksiPBK agar bisa digunakan di bagian lain dari aplikasi
export default TransaksiPR;
