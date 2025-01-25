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

// Definisi model Petani
const Petani = db.define(
  "rencana_tanam", // Nama tabel di database
  {
    idtanam: {
      type: DataTypes.STRING, // Tipe data string
      defaultValue: () => `TNM-${generateRandomString(6)}`, // Menghasilkan ID lahan acak dengan prefix 'LHN-'
      allowNull: false, // Tidak boleh null
      validate: {
        notEmpty: true, // Validasi bahwa nilai tidak boleh kosong
      },
    },
    idlahan: {
      type: DataTypes.STRING, // Tipe data string
      allowNull: false, // Tidak boleh null
      validate: {
        notEmpty: true, // Validasi bahwa kolom ini tidak boleh kosong
      },
    },
    statusRencanaTanam: {
      type: DataTypes.STRING,
      defaultValue: "Belum Disetujui",
      field: 'statusorder'  // Menyesuaikan nama kolom di database jika menggunakan huruf kecil
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
    varietassingkong: {
      type: DataTypes.STRING, // Tipe data string
      validate: {
        isIn: [['Grade A', 'Grade B', 'Grade C']] // Validasi agar hanya menerima Grade A, Grade B, dan Grade C
      }
    },
    estimasiproduksi: {
      type: DataTypes.INTEGER,
      allowNull: false, // Tambahkan jika tidak boleh null
      validate: {
        notEmpty: true, // Pastikan nilainya tidak kosong
        isInt: true, // Validasi bahwa nilai harus integer
      },
    },
    jenispupuk: DataTypes.STRING, // Tipe data string
    jumlahpupuk: DataTypes.INTEGER, // Tipe data string
    catatantambahan: DataTypes.STRING(1500), // Tipe data string
    tanggalRencanaTanam: { 
      type: DataTypes.DATEONLY, // Tipe data tanggal (hanya tanggal, tanpa waktu)
      allowNull: false, // Tidak boleh null
      validate: {
        notEmpty: true, // Validasi bahwa nilai tidak boleh kosong
      },
    },
   tanggalRencanaPanen: {
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
Users.hasMany(Petani); // User memiliki banyak data petani
Petani.belongsTo(Users, { foreignKey: "userId" }); // Data petani milik satu user, dengan userId sebagai foreign key



export default Petani; // Mengekspor model Petani agar bisa digunakan di bagian lain dari aplikasi
