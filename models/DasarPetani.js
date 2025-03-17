import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Users from "./UserModel.js";
import Petani from "./RencanaTanam.js";

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

// Definisi model Petani
const Petanidasar = db.define(
  "dasar_petani", // Nama tabel di database
  {
    idlahan: {
      type: DataTypes.STRING, // Tipe data string
      defaultValue: () => `LHN-${generateRandomString(6)}`, // Menghasilkan ID lahan acak dengan prefix 'LHN-'
      allowNull: false, // Tidak boleh null
      validate: {
        notEmpty: true, // Validasi bahwa nilai tidak boleh kosong
      },
    },
    kategorilahan: {
      type: DataTypes.ENUM("Plasma", "Inti"), // Hanya menerima 'Plasma' atau 'Inti'
      allowNull: false, // Tidak boleh null
      validate: {
        isIn: [["Plasma", "Inti"]], // Validasi nilai agar sesuai dengan ENUM
      },
    },
    namePerusahaan: {
      type: DataTypes.STRING, // Nama perusahaan (jika Plasma)
      allowNull: true, // Awalnya dapat null, namun divalidasi kustom
      validate: {
        customValidation(value) {
          if (this.kategorilahan === "Inti" && (!value || value.trim() === "")) {
            throw new Error("Nama perusahaan harus diisi jika kategorilahan adalah 'Inti'.");
          }
        },
      },
    },
    userId: {
      type: DataTypes.INTEGER, // Tipe data integer
      allowNull: false, // Tidak boleh null
      validate: {
        notEmpty: true, // Validasi bahwa nilai tidak boleh kosong
      },
    },
    userUuid: {
      type: DataTypes.STRING, // Pastikan ini sesuai dengan tipe UUID Anda
      allowNull: false,
    },
    lokasilahan: DataTypes.STRING, // Tipe data string
    luaslahan: DataTypes.INTEGER, // Tipe data string
    periodeTanamMulai: { //KAPAN PERTANA KALI DIJADIKAN UNTUK MENANAM
      type: DataTypes.DATEONLY, // Tipe data tanggal (hanya tanggal, tanpa waktu)
      allowNull: false, // Tidak boleh null
      validate: {
        notEmpty: true, // Validasi bahwa nilai tidak boleh kosong
      },
    },
    periodeTanamSelesai: {
      type: DataTypes.DATEONLY, // Tipe data tanggal (hanya tanggal, tanpa waktu)
      allowNull: false, // Tidak boleh null
      validate: {
        notEmpty: true, // Validasi bahwa nilai tidak boleh kosong
      },
    },
  },
  {
    freezeTableName: true, // Nama tabel tidak akan diubah secara otomatis menjadi bentuk jamak oleh Sequelize
  }
);

// Membuat relasi antara Users dan Petani
Users.hasMany(Petanidasar); // User memiliki banyak data petani
Petanidasar.belongsTo(Users, { foreignKey: "userId" }); // Data petani milik satu user, dengan userId sebagai foreign key
// Membuat relasi antara Petanidasar dan Petani menggunakan idlahan
Petanidasar.hasMany(Petani, { foreignKey: "idlahan", sourceKey: "idlahan" }); // Petanidasar memiliki banyak Petani berdasarkan idlahan
Petani.belongsTo(Petanidasar, { foreignKey: "idlahan", targetKey: "idlahan" }); // Petani terkait dengan satu Petanidasar berdasarkan idlahan



export default Petanidasar; // Mengekspor model Petani agar bisa digunakan di bagian lain dari aplikasi
