import { Sequelize } from "sequelize"; // Mengimpor Sequelize dari modul sequelize
import db from "../config/Database.js"; // Mengimpor konfigurasi database dari file Database.js
import Users from "./UserModel.js"; // Mengimpor model Users dari file UserModel.js

const { DataTypes } = Sequelize; // Mendestrukturisasi DataTypes dari Sequelize


// Definisi model TransaksiPBK
const TransaksiPBK = db.define(
  "data_transaksipbk", // Nama tabel di database
  {
    orderPemanenUuid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tanggalPenerimaan: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    beratTotalDiterima: {
      type: DataTypes.FLOAT, // Tipe data float (angka desimal)
      allowNull: false,
      validate: {
        notEmpty: true, // Validasi bahwa nilai tidak boleh kosong
        isFloat: true, // Validasi bahwa nilai harus berupa angka desimal
      },
    },
    catatanKualitas: {
      type: DataTypes.TEXT, // Tipe data teks (panjang)
      allowNull: true, // Boleh kosong
      validate: {
        notEmpty: false, // Kolom ini opsional
      },
    },
    evaluasiKualitas: {
      type: DataTypes.TEXT, // Tipe data teks untuk evaluasi kualitas
      allowNull: false, // Tidak boleh kosong
      validate: {
        notEmpty: true, // Validasi bahwa nilai tidak boleh kosong
      },
    },
  },
  {
    freezeTableName: true, // Menggunakan nama tabel sesuai dengan nama model
  }
);

// Hubungan dengan model Users
Users.hasMany(TransaksiPBK, { foreignKey: "userId" }); // Membuat relasi bahwa setiap user dapat memiliki banyak transaksi PBK
TransaksiPBK.belongsTo(Users, { foreignKey: "userId" }); // Menambahkan foreign key userId pada TransaksiPBK yang merujuk ke Users



// Mengekspor model TransaksiPBK agar bisa digunakan di bagian lain dari aplikasi
export default TransaksiPBK;
