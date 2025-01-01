import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Users from "./UserModel.js";

const { DataTypes } = Sequelize;

// Function to generate a random string of a certain length
function generateRandomString(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// Model definition for 'Perusahaan'
const Perusahaan = db.define(
  "data_perusahaan", // Table name in the database
  {
    tanggalupdateharga: {
      type: DataTypes.DATEONLY, // Date type (date only, no time)
      allowNull: false, // Cannot be null
      validate: {
        notEmpty: true, // Validation: cannot be empty
      },
    },
    idharga: {
      type: DataTypes.STRING,
      defaultValue: () => `PRS-${generateRandomString(6)}`, // Generate a random price ID with prefix 'PRS-'
      allowNull: false,
      validate: {
        notEmpty: true, // Validation: cannot be empty
      },
    },
    // Grade A
    hargaGradeA: {
      type: DataTypes.FLOAT, // Float data type for price
      allowNull: false,
      validate: {
        notEmpty: true, // Validation: cannot be empty
      },
    },
    catatanGradeA: {
      type: DataTypes.TEXT, // Text data type for notes related to Grade A
      allowNull: true, // Notes can be null/empty
    },
    // Grade B
    hargaGradeB: {
      type: DataTypes.FLOAT, // Float data type for price
      allowNull: false,
      validate: {
        notEmpty: true, // Validation: cannot be empty
      },
    },
    catatanGradeB: {
      type: DataTypes.TEXT, // Text data type for notes related to Grade B
      allowNull: true, // Notes can be null/empty
    },
    // Grade C
    hargaGradeC: {
      type: DataTypes.FLOAT, // Float data type for price
      allowNull: false,
      validate: {
        notEmpty: true, // Validation: cannot be empty
      },
    },
    catatanGradeC: {
      type: DataTypes.TEXT, // Text data type for notes related to Grade C
      allowNull: true, // Notes can be null/empty
    },
  },
  {
    freezeTableName: true, // The table name won't be changed to plural automatically by Sequelize
  }
);

// Define relationship between Users and Perusahaan
Users.hasMany(Perusahaan); // One user can have many 'Perusahaan' records
Perusahaan.belongsTo(Users, { foreignKey: "userId" }); // Each 'Perusahaan' record belongs to a user (using 'userId' as the foreign key)

export default Perusahaan; // Export the model to be used in other parts of the application
