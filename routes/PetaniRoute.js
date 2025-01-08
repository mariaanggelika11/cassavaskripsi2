import express, { Router } from "express";
import { getPetanis, createPetani, updatePetani, getPetaniById, deletePetani, getAllLahanOptions, getLahanById } from "../controllers/Petani.js";
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

// Route untuk mendapatkan semua ID lahan dari semua petani
router.get('/lahan',verifyToken, getAllLahanOptions);

// Route untuk mendapatkan data dari ID lahan yang spesifik
router.get('/lahan/:idLahan',verifyToken, getLahanById);

export default router;
