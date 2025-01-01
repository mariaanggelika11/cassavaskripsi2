import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Users from "./UserModel.js";

const { DataTypes } = Sequelize;

// Fungsi untuk menghasilkan string acak dengan panjang tertentu
function generateRandomString(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// Definisi model Pabrik
const Pabrikproduksi = db.define(
  "dataproduksi_pabrik", // Nama tabel di database
  {
    idProduksiharian: {
      type: DataTypes.STRING,
      defaultValue: () => `PRD-${generateRandomString(6)}`, // Menghasilkan ID pengiriman acak dengan prefix 'PBK-'
      allowNull: false,
      validate: {
        notEmpty: true, // Validasi bahwa nilai tidak boleh kosong
      },
    },
    Idorderdipakai: {
        type:DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
        tanggalProduksi: {
          type: DataTypes.DATEONLY, // Mengubah tipe data menjadi DATE untuk menyertakan waktu
          allowNull: false, // Tidak boleh null
          validate: {
            notEmpty: true, // Validasi bahwa nilai tidak boleh kosong
          },
        },
        Jenisolahan: {
          type: DataTypes.STRING, // Tipe data float (angka desimal)
          allowNull: false,
          validate: {
            notEmpty: true, // Validasi bahwa nilai tidak boleh kosong
          },
        },
         jumlahproduksiharian: {
            type: DataTypes.FLOAT, // Tipe data float (angka desimal)
            allowNull: false,
            validate: {
              notEmpty: true, // Validasi bahwa nilai tidak boleh kosong
            },
          },
          kualitasOutput: {
            type: DataTypes.STRING, // Misal: 'Standard', 'Premium'
            allowNull: false,
            validate: {
              notEmpty: true, // Validasi bahwa nilai tidak boleh kosong
            },
          },
          permasalahanOperasional: {
            type: DataTypes.TEXT, // Tipe data teks (panjang)
            allowNull: true, // Boleh kosong
          },
          kebutuhanPerbaikan: {
            type: DataTypes.TEXT, // Tipe data teks (panjang)
            allowNull: true, // Boleh kosong
          },
          limbahcair: {
            type: DataTypes.FLOAT,
            allowNull:false,
            validate: {
              notEmpty: true,
            },
          },
          catatanlimbah: {
            type: DataTypes.TEXT,
            allowNull: false, 
          },
          limbahpadat: {
            type: DataTypes.FLOAT,
            allowNull:false,
            validate: {
              notEmpty: true,
            },
          },
          catatanlimbahpadat: {
            type: DataTypes.TEXT,
            allowNull: false, 
          },
  },
  {
    freezeTableName: true, // Nama tabel tidak akan diubah secara otomatis menjadi bentuk jamak oleh Sequelize
  }
);


// Membuat relasi antara Users dan Pabrik
Users.hasMany(Pabrikproduksi); // User memiliki banyak data pabrik
Pabrikproduksi.belongsTo(Users, { foreignKey: "userId" }); // Data pabrik milik satu user, dengan userId sebagai foreign key

export default Pabrikproduksi; // Mengekspor model Pabrik agar bisa digunakan di bagian lain dari aplikasi
