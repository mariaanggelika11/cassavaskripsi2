import express from "express";
import { getPabrik, createPabrik, updatePabrik, deletePabrik, getPabrikById } from "../controllers/Pabrik.js";
import { verifyToken } from "../middleware/AuthUser.js"; // Menggunakan verifyToken dari AuthUser.js

const router = express.Router();

// Route untuk mendapatkan semua data pabrik
router.get("/pabrik", verifyToken, getPabrik);
// Route untuk mendapatkan data pabrik berdasarkan Id
router.get("/pabrik/:id", verifyToken, getPabrikById);
// Route untuk membuat data pabrik baru
router.post("/pabrik", verifyToken, createPabrik);
// Route untuk memperbarui data pabrik
router.put("/pabrik/:id", verifyToken, updatePabrik);
// Route untuk menghapus data pabrik
router.delete("/pabrik/:id", verifyToken, deletePabrik);

export default router;
