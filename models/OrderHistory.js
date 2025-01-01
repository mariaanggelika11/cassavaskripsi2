import { DataTypes } from "sequelize"; // Mengimpor DataTypes dari modul sequelize
import db from "../config/Database.js"; // Mengimpor konfigurasi database dari file Database.js


const OrderHistory = db.define('OrderHistory', 
  {
  // Menyimpan ID unik untuk setiap riwayat
  idOrder: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,  //
    primaryKey: true,
    references: {
      model: 'order_pemanen', // Pastikan mengacu pada nama tabel yang benar (misalnya Products)
      key: 'uuid', // Mengacu pada kolom yang sesuai di tabel Product
    },
  },
  
  // Menyimpan status order yang baru
  statusOrder: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  // Menyimpan nama pengguna yang relevan (misalnya nama perusahaan, pabrik, atau logistik)
  namaPerusahaan: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  
  namaPabrik: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  
  namaLogistik: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  // Tanggal dan waktu perubahan status order
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: db.NOW,
    allowNull: false,
  },
}, {
  // Nama tabel untuk menyimpan data OrderHistory
  tableName: 'order_histories',
  timestamps: false, // Matikan timestamp otomatis (createdAt, updatedAt)
});

export default OrderHistory;
