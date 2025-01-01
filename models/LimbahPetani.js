import { Sequelize } from "sequelize"; // Mengimpor Sequelize dari modul sequelize
import db from "../config/Database.js"; // Mengimpor konfigurasi database dari file Database.js
import Users from "./UserModel.js"; // Mengimpor model Users dari file UserModel.js

const { DataTypes } = Sequelize; // Mendestrukturisasi DataTypes dari Sequelize

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

// Definisi model limbah
const limbahpetani = db.define(
  "limbah_petani", // Nama tabel di database
  {
    orderPemanenUuid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    uuid: {
      type: DataTypes.STRING, // Tipe data string
      defaultValue: () => `LMB-${generateRandomString(6)}`, // Menggunakan fungsi untuk menambahkan 'LMB-' diikuti oleh string acak
      allowNull: false, // Tidak boleh null
      validate: {
        notEmpty: true, // Validasi bahwa kolom ini tidak boleh kosong
      },
    },
    beratLimbahBatang: {
      type: DataTypes.FLOAT, // Tipe data float untuk berat limbah batang
      allowNull: false, // Tidak boleh kosong
      validate: {
        notEmpty: true, // Validasi bahwa nilai tidak boleh kosong
        isFloat: true, // Validasi bahwa nilai harus berupa angka desimal
      },
    },
    catatanLimbahBatang: {
      type: DataTypes.TEXT, // Tipe data teks untuk catatan limbah batang
      allowNull: true, // Boleh kosong
    },
    beratLimbahDaun: {
      type: DataTypes.FLOAT, // Tipe data float untuk berat limbah daun
      allowNull: false, // Tidak boleh kosong
      validate: {
        notEmpty: true, // Validasi bahwa nilai tidak boleh kosong
        isFloat: true, // Validasi bahwa nilai harus berupa angka desimal
      },
    },
    catatanLimbahDaun: {
      type: DataTypes.TEXT, // Tipe data teks untuk catatan limbah daun
      allowNull: true, // Boleh kosong
    },
    beratLimbahAkar: {
      type: DataTypes.FLOAT, // Tipe data float untuk berat limbah akar
      allowNull: false, // Tidak boleh kosong
      validate: {
        notEmpty: true, // Validasi bahwa nilai tidak boleh kosong
        isFloat: true, // Validasi bahwa nilai harus berupa angka desimal
      },
    },
    catatanLimbahAkar: {
      type: DataTypes.TEXT, // Tipe data teks untuk catatan limbah akar
      allowNull: true, // Boleh kosong
    },
  },
  {
    freezeTableName: true, // Menggunakan nama tabel sesuai dengan nama model
  }
);

// Hubungan dengan model Users
Users.hasMany(limbahpetani, { foreignKey: "userId" }); // Membuat relasi bahwa setiap user dapat memiliki banyak limbah
limbahpetani.belongsTo(Users, { foreignKey: "userId" }); // Menambahkan foreign key userId pada limbah yang merujuk ke Users

// Mengekspor model limbah agar bisa digunakan di bagian lain dari aplikasi
export default limbahpetani;
