// UserPerusahaan.js
import { Sequelize } from "sequelize";
import db from "../config/Database.js";
const { DataTypes } = Sequelize;

function generateRandomString(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const PerusahaanUser = db.define(
  "perusahaanusers", 
  {
    uuid: {
      type: DataTypes.STRING,
      defaultValue: () => `PRN-${generateRandomString(6)}`,
      allowNull: false,
      validate: { notEmpty: true },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true, len: [3, 100] },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true, isEmail: true },
    },
    nohp: { type: DataTypes.STRING },
    alamat: { type: DataTypes.STRING },
    foto: { type: DataTypes.STRING },
    url: { type: DataTypes.STRING },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
  },
  {
    freezeTableName: true,
  }
);

// Menggunakan dynamic import untuk menghindari error saat inisialisasi
async function setAssociations() {
  const { default: Users } = await import("./UserModel.js");  // Import secara dinamis
  PerusahaanUser.belongsTo(Users, { foreignKey: 'userId' });
}

setAssociations();

export default PerusahaanUser;
