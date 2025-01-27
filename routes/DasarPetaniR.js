import express, { Router } from "express";
import { createPetani, getpetanidasar, getPetaniById, getAllLahanOptions, getLahanById } from "../controllers/DasarPetani.js";
import { verifyToken } from "../middleware/AuthUser.js"; // Menggunakan verifyToken dari AuthUser.js

const router = express.Router();

// Route untuk melihat semua data dasar petani (sudah otomatis, petani hanya bisa melihat datanya sendiri, admin dan perusahaan semuanya)
router.get("/getpetanidasar", verifyToken, getpetanidasar);

// Route untuk mendapatkan data dasar spesifik petani menggunakan id
router.get("/petanidasar/:id", verifyToken, getPetaniById);

// Route untuk membuat data dasar petani baru
router.post("/petanidasar", verifyToken, createPetani);

// // Route untuk menghapus data petani hanya admin
// router.delete("/petani/:id", verifyToken, deletePetani);

// Route untuk drop down id lahan yang dimiliki, agar petani mudah memasukan id rencana tanam
router.get('/lahan',verifyToken, getAllLahanOptions);

// Route untuk mendapatkan data dari lahan yang spesifik menggunakan id lahan
router.get('/lahan/:idLahan',verifyToken, getLahanById);

export default router;
