import express, { Router } from "express";
import { getHistoryRencanaTanam, countPetaniByGrade, getAllrencanatanam, getRencanaTanamById, getPetanis, createPetani, updatePetani, getPetaniById, deletePetani, updateStatusRencanaTanam, getPetanisApproved, updateStatusToPanenSelesai } from "../controllers/Petani.js";
import { verifyToken } from "../middleware/AuthUser.js"; // Menggunakan verifyToken dari AuthUser.js


const router = express.Router();

// Route untuk melihat rencana tanam yang sudah di input,jika petani hanya melihat punya sendiri, jika admin mendapatkan semua, jika lahannya plasma hanya muncul di perusahaan terkait, jika inti, muncul di semua perusahaan
router.get("/petanis", verifyToken, getPetanis);

// Route untuk mendapatkan petani yg sudah disetujui rencana tanam (jika order rencana tanam disetujui
// maka akan masuk kesini, dan di /petanis akan terhapus otomatis)
router.get("/petanisapproved", verifyToken, getPetanisApproved);

// Route untuk mendapatkan data spesifik petani (tidak usah dipakai)
router.get("/petani/:id", verifyToken, getPetaniById);

// Route untuk order rencana tanam oleh petani
router.post("/petani", verifyToken, createPetani);

// Route untuk mengedit rencana tanam oleh petani, jika order di setujui (ini dimasukan ke bagian petanis approved)
router.put("/petanisapproved/:idtanam", verifyToken, updatePetani);

// Route untuk menghapus data petani (tidak usah dipakai)
router.delete("/petani/:id", verifyToken, deletePetani);

// Route menyetujui rencana tanam oleh perusahaan 
router.patch("/rencanatanam/:id", verifyToken, updateStatusRencanaTanam);

// Route untuk dropdown rencena tanam ketika ingin add order panen
router.get("/rencanatanam", verifyToken, getAllrencanatanam);

// Route untuk melihat lebih detail dari id tanam
router.get("/rencanatanam/:idtanam",verifyToken, getRencanaTanamById);

//Route jumlah varietas yang sedang ditanam 
router.get("/jumlahvarietas", verifyToken, countPetaniByGrade);

// Rute menyelesaikan rencana tanam jika order panen sudah selesai, dimasukan pada order rencana tanam berlangsung
router.patch("/rencanatanamselesai/:id" , verifyToken, updateStatusToPanenSelesai);

// Rute history rencana tanam selesai
router.get("/historytanam", verifyToken, getHistoryRencanaTanam);
export default router;
