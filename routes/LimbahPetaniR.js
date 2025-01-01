import express from "express";
import { getLimbah, getLimbahById, createLimbah, updateLimbah, deleteLimbah } from "../controllers/LimbahPetani.js"; 
import { verifyToken } from "../middleware/AuthUser.js"; // Menggunakan verifyToken dari AuthUser.js

const router = express.Router();

// Route untuk mendapatkan semua data pabrik
router.get("/limbah", verifyToken, getLimbah);
// Route untuk mendapatkan data pabrik berdasarkan Id
router.get("/limbah/:id", verifyToken, getLimbahById);
// Route untuk membuat data pabrik baru
router.post("/limbah", verifyToken, createLimbah);
// Route untuk memperbarui data pabrik
router.put("/limbah/:id", verifyToken, updateLimbah);
// Route untuk menghapus data pabrik
router.delete("/limbah/:id", verifyToken, deleteLimbah);

export default router;
