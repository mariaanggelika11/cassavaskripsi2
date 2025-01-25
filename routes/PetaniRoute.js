import express, { Router } from "express";
import { getAllrencanatanam, getRencanaTanamById, getPetanis, createPetani, updatePetani, getPetaniById, deletePetani, updateStatusRencanaTanam, getPetanisApproved } from "../controllers/Petani.js";
import { verifyToken } from "../middleware/AuthUser.js"; // Menggunakan verifyToken dari AuthUser.js


const router = express.Router();

// Route untuk mendapatkan semua petani jika admin mendapatkan semua, jika lahannya plasma hanya muncul di perusahaan terkait, jika inti, muncul di semua perusahaan
router.get("/petanis", verifyToken, getPetanis);

// Route untuk mendapatkan petani yg sudah disetujui rencana tanam
router.get("/petanisapproved", verifyToken, getPetanisApproved);

// Route untuk mendapatkan data spesifik petani
router.get("/petani/:id", verifyToken, getPetaniById);

// Route untuk membuat data petani baru
router.post("/petani", verifyToken, createPetani);

// Route untuk memperbarui data petani
router.put("/petani/:id", verifyToken, updatePetani);

// Route untuk menghapus data petani
router.delete("/petani/:id", verifyToken, deletePetani);

// Route menyetujui rencana tanam
router.patch("/rencanatanam/:id", verifyToken, updateStatusRencanaTanam);

router.get("/rencanatanam", verifyToken, getAllrencanatanam);
router.get("/rencanatanam/:id",verifyToken, getRencanaTanamById);
export default router;
