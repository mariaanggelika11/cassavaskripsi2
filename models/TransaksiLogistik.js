import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Users from "./UserModel.js";
import OrderPemanen from "./OrderPanen.js";

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
const Logistik = db.define(
  "data_transaksilgs",
  {
    orderPemanenUuid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Data transaksional
    idPengiriman: {
      type: DataTypes.STRING,
      defaultValue: () => `TRLGS-${generateRandomString(6)}`, // Menghasilkan ID pengiriman acak dengan prefix 'TRLGS-'
      allowNull: false,
      validate: {
        notEmpty: true, // Validasi bahwa nilai tidak boleh kosong
      },
    },
    tanggalPengiriman: {
      type: DataTypes.DATEONLY, // Hanya tanggal
      allowNull: false,
      validate: {
        notEmpty: true, // Validasi bahwa nilai tidak boleh kosong
      },
    },
    waktuPengiriman: {
      type: DataTypes.TIME, // Hanya waktu
      allowNull: false,
      validate: {
        notEmpty: true, // Validasi bahwa nilai tidak boleh kosong
      },
    },
    estimasiWaktuTiba: {
      type: DataTypes.TIME, // Hanya waktu
      allowNull: false,
      validate: {
        notEmpty: true, // Validasi bahwa nilai tidak boleh kosong
      },
    },
    aktualWaktuTiba: {
      type: DataTypes.TIME, // Hanya waktu
      allowNull: true, // Boleh kosong, tidak wajib diisi
    },
    catatanEfisiensiRute: {
      type: DataTypes.TEXT,
      allowNull: true, // Boleh kosong, tidak wajib diisi
    },
    biayaTransportasi: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        notEmpty: true, // Validasi bahwa nilai tidak boleh kosong
        isFloat: true, // Memastikan input adalah angka desimal
      },
    },
    kondisiPengiriman: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    catatanDariPenerima: {
      type: DataTypes.TEXT,
      allowNull: true, // Boleh kosong, tidak wajib diisi
    },
  },
  {
    freezeTableName: true, // Nama tabel di-freeze, tidak diubah secara otomatis menjadi bentuk jamak oleh Sequelize
  }
);

// Relasi antara Users dan Logistik
Users.hasMany(Logistik); // User memiliki banyak data logistik
Logistik.belongsTo(Users, { foreignKey: "userId" }); // Data logistik milik satu user, dengan userId sebagai foreign key



// Hook untuk menghitung catatan efisiensi rute
Logistik.beforeSave((logistik, options) => {
  if (logistik.estimasiWaktuTiba && logistik.aktualWaktuTiba) {
    const estimasi = new Date(`1970-01-01T${logistik.estimasiWaktuTiba}Z`);
    const aktual = new Date(`1970-01-01T${logistik.aktualWaktuTiba}Z`);
    
    const differenceInMilliseconds = aktual - estimasi;
    const differenceInMinutes = Math.floor(differenceInMilliseconds / 60000);
    
    if (differenceInMinutes > 0) {
      logistik.catatanEfisiensiRute = `Terlambat ${differenceInMinutes} menit`;
    } else if (differenceInMinutes < 0) {
      logistik.catatanEfisiensiRute = `Lebih cepat ${Math.abs(differenceInMinutes)} menit`;
    } else {
      logistik.catatanEfisiensiRute = "Tepat waktu";
    }
  }
});

export default Logistik;