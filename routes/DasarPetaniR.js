import express, { Router } from "express";
import { createPetani, getpetanidasar, getPetaniById, getAllLahanOptions, getLahanById } from "../controllers/DasarPetani.js";
import { verifyToken } from "../middleware/AuthUser.js"; // Menggunakan verifyToken dari AuthUser.js

const router = express.Router();

// Route untuk mendapatkan semua petani
router.get("/getpetanidasar", verifyToken, getpetanidasar);

// Route untuk mendapatkan data spesifik petani
router.get("/petanidasar/:id", verifyToken, getPetaniById);

// Route untuk membuat data petani baru
router.post("/petanidasar", verifyToken, createPetani);

// // Route untuk menghapus data petani hanya admin
// router.delete("/petani/:id", verifyToken, deletePetani);

// Route untuk mendapatkan semua ID lahan dari semua petani
router.get('/lahan',verifyToken, getAllLahanOptions);

// Route untuk mendapatkan data dari ID lahan yang spesifik
router.get('/lahan/:idLahan',verifyToken, getLahanById);

export default router;
