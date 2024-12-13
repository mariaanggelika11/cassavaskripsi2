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

// Definisi model Logistik
const Logistikdasar = db.define(
    "dasar_logistik",
    //data dasar logsistik, bisa banyak
    {
      idKendaraan: {
          type: DataTypes.STRING,
          defaultValue: () => `KND-${generateRandomString(6)}`, // Menghasilkan ID pengiriman acak dengan prefix 'LGS-'
          allowNull: false,
          validate: {
            notEmpty: true, // Validasi bahwa nilai tidak boleh kosong
          },
        },
      asal: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true, // Validasi bahwa nilai tidak boleh kosong
        },
      },
      tujuan: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true, // Validasi bahwa nilai tidak boleh kosong
        },
      },
      nomorPolisiKendaraan: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true, // Validasi bahwa nilai tidak boleh kosong
        },
      },
      jenisKendaraan: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true, // Validasi bahwa nilai tidak boleh kosong
        },
      },
      kapasitasAngkut: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          notEmpty: true, // Validasi bahwa nilai tidak boleh kosong
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: Users,
          key: 'id'
        }
      },
    },
    {
      freezeTableName: true, // Nama tabel di-freeze, tidak diubah secara otomatis menjadi bentuk jamak oleh Sequelize
    }
  );
  
  // Relasi antara Users dan Logistik
  Users.hasMany(Logistikdasar); // User memiliki banyak data logistik
  Logistikdasar.belongsTo(Users, { foreignKey: "userId" }); // Data logistik milik satu user, dengan userId sebagai foreign key
  
  export default Logistikdasar;