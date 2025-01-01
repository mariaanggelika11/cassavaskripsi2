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
const Pabrik = db.define(
  "data_pabrik", // Nama tabel di database
  {
    iddatadasarpbk: {
      type: DataTypes.STRING,
      defaultValue: () => `PBKD-${generateRandomString(6)}`, // Menghasilkan ID pengiriman acak dengan prefix 'PBK-'
      allowNull: false,
      validate: {
        notEmpty: true, // Validasi bahwa nilai tidak boleh kosong
      },
    },
    pabrikUuid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    kapasitasram: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      kapasitasproduksi: {
        type: DataTypes.FLOAT, // Tipe data float (angka desimal)
        allowNull: false,
        validate: {
          notEmpty: true, // Validasi bahwa nilai tidak boleh kosong
        },
      },
      memproduksi: {
        type:DataTypes.STRING, // Tipe data teks (panjang)
          allowNull: false, // Boleh kosong
          validate: {
          notEmpty: true, // validasi bahwa nilai tidak boleh kosong
        },
        },
  },
  {
    freezeTableName: true, // Nama tabel tidak akan diubah secara otomatis menjadi bentuk jamak oleh Sequelize
  }
);


// Membuat relasi antara Users dan Pabrik
Users.hasMany(Pabrik); // User memiliki banyak data pabrik
Pabrik.belongsTo(Users, { foreignKey: "userId" }); // Data pabrik milik satu user, dengan userId sebagai foreign key

export default Pabrik; // Mengekspor model Pabrik agar bisa digunakan di bagian lain dari aplikasi
