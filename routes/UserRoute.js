import express from "express";
import { getAllPerusahaanNames, getUsers, getUserById, createUser, updateUser, deleteUser } from "../controllers/Users.js";
import { verifyToken, adminOnly } from "../middleware/AuthUser.js";
import multer from "multer";

const router = express.Router();

// Konfigurasi multer seperti yang sudah Anda definisikan
const upload = multer({
  storage: multer.diskStorage({
      destination: './uploads/img/profile/',
      filename: function (req, file, cb) {
          cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
      }
  }),
  fileFilter: (req, file, cb) => {
      if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
          cb(null, true);
      } else {
          cb(null, false);
      }
  },
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
});



router.get("/users", verifyToken, adminOnly, getUsers);
router.get("/users/:uuid", verifyToken, getUserById);
router.post("/users", verifyToken, adminOnly, createUser);
router.patch("/users/:uuid", verifyToken, upload.single("foto"), updateUser );
router.delete("/users/:uuid", verifyToken, adminOnly, deleteUser);
router.get("/perusahaanterdaftar",verifyToken,getAllPerusahaanNames);
export default router;
