import express from "express";
import { getPetanis, createPetani, updatePetani, getPetaniById, deletePetani } from "../controllers/Petani.js";
import { verifyToken } from "../middleware/AuthUser.js"; // Menggunakan verifyToken dari AuthUser.js

const router = express.Router();

// Route untuk mendapatkan semua petani
router.get("/petanis", verifyToken, getPetanis);
// Route untuk mendapatkan data spesifik petani
router.get("/petani/:id", verifyToken, getPetaniById);

// Route untuk membuat data petani baru
router.post("/petani", verifyToken, createPetani);
// Route untuk memperbarui data petani
router.put("/petani/:id", verifyToken, updatePetani);

// Route untuk menghapus data petani
router.delete("/petani/:id", verifyToken, deletePetani);

export default router;
