import { Sequelize } from "sequelize"; // Mengimpor Sequelize dari modul sequelize
import db from "../config/Database.js"; // Mengimpor konfigurasi database dari file Database.js
import Users from "./UserModel.js"; // Mengimpor model Users dari file UserModel.js
import Petani from "./RencanaTanam.js";
import PerusahaanUser from "./UserPerusahaan.js";
import Logistikdasar from "./DasarLogistik.js";
import Logistik from "./TransaksiLogistik.js";
import Dasarpetani from "./DasarPetani.js";
import TransaksiPBK from "./TransaksiPabrik.js";
import TransaksiPR from "./TransaksiPerusahaan.js";
import limbahpetani from "./LimbahPetani.js";
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

// Definisi model OrderPemanen
const OrderPemanen = db.define(
  "order_pemanen", // Nama tabel di database
  {
    uuid: {
      type: DataTypes.STRING, // Tipe data string
      defaultValue: () => `ORD-${generateRandomString(6)}`, // Menggunakan fungsi untuk menambahkan 'ORD-' diikuti oleh string acak
      allowNull: false, // Tidak boleh null
      unique: true, 
      validate: {
        notEmpty: true, // Validasi bahwa kolom ini tidak boleh kosong
      },
    },
    idLahan: {
      type: DataTypes.STRING, // Tipe data string
      allowNull: false, // Tidak boleh null
      validate: {
        notEmpty: true, // Validasi bahwa kolom ini tidak boleh kosong
      },
    },
    idTanam: {
      type: DataTypes.STRING, // Tipe data string
      allowNull: false, // Tidak boleh null
      validate: {
        notEmpty: true, // Validasi bahwa kolom ini tidak boleh kosong
      },
    },
    tanggalPemanenan: {
      type: DataTypes.STRING, // Tipe data string
      allowNull: false, // Tidak boleh null
      validate: {
        notEmpty: true, // Validasi bahwa kolom ini tidak boleh kosong
        len: [3, 100], // Validasi panjang string antara 3 dan 100 karakter
      },
    },
    statusOrder: {
      type: DataTypes.STRING,
      defaultValue: "pending",
      field: 'statusorder'  // Menyesuaikan nama kolom di database jika menggunakan huruf kecil
    },
    
    varietasSingkong: { //
      type: DataTypes.STRING, // Tipe data string
    },
    estimasiBerat: {
      type: DataTypes.INTEGER, // Tipe data integer
    },
    estimasiHarga: {
      type: DataTypes.INTEGER, // Tipe data integer
    },
     namaPerusahaan: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      emailPerusahaan:{
        type:DataTypes.STRING,
        allowNull: true,
      },
      
      namaPabrik: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      emailPabrik:{
        type:DataTypes.STRING,
        allowNull: true,
      },
      namaLogistik: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      emailLogistik:{
        type:DataTypes.STRING,
        allowNull: true,
      },
    userId: {
      type: DataTypes.INTEGER, // Tipe data integer
      allowNull: true, // Boleh null
      validate: {
        notEmpty: true, // Validasi bahwa kolom ini tidak boleh kosong
      },
    },
  },
{
    freezeTableName: true, // Menggunakan nama tabel sesuai dengan nama model
  }
);

// Hubungan dengan model Users
Users.hasMany(OrderPemanen, { foreignKey: "userId" });
OrderPemanen.belongsTo(Users, { foreignKey: "userId" });

Users.hasMany(Petani, { foreignKey: "userId" });
Petani.belongsTo(Users, { foreignKey: "userId" });

Users.hasMany(Logistikdasar, { foreignKey: "userId" });
Logistikdasar.belongsTo(Users, { foreignKey: "userId" });

// Definisikan relasi
OrderPemanen.belongsTo(PerusahaanUser, { foreignKey: 'userId' }); // Relasi ke UserPerusahaan

// Product.js
OrderPemanen.hasMany(TransaksiPBK, { foreignKey: 'orderPemanenUuid', sourceKey: 'uuid' });
TransaksiPBK.belongsTo(OrderPemanen, { foreignKey: 'orderPemanenUuid', targetKey: 'uuid' });

OrderPemanen.hasMany(TransaksiPR, { foreignKey: 'orderPemanenUuid', sourceKey: 'uuid' });
TransaksiPR.belongsTo(OrderPemanen, { foreignKey: 'orderPemanenUuid', targetKey: 'uuid' });

OrderPemanen.hasMany(Logistik, { foreignKey: 'orderPemanenUuid', sourceKey: 'uuid' });
Logistik.belongsTo(OrderPemanen, { foreignKey: 'orderPemanenUuid', targetKey: 'uuid' });

OrderPemanen.hasMany(limbahpetani, {foreignKey:'orderPemanenUuid', sourceKey: 'uuid' });
limbahpetani.belongsTo(OrderPemanen,{foreignKey:'orderPemanenUuid', sourceKey: 'uuid' });

OrderPemanen.belongsTo(Dasarpetani, { foreignKey: 'idlahan' });

// Mengekspor model OrderPemanen agar bisa digunakan di bagian lain dari aplikasi
export default OrderPemanen;
