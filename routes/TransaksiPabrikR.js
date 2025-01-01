import express from "express";
import { getTransaksiPBK, createTransaksiPBK, updateTransaksiPBK, deleteTransaksiPBK, getTransaksiPBKById } from "../controllers/PabrikTransaksi.js"; // Pastikan nama file controller sesuai

import { verifyToken } from "../middleware/AuthUser.js";

const router = express.Router();

// Route untuk mendapatkan semua data transaksiPBK
router.get("/transaksiPBK", verifyToken, getTransaksiPBK);
// Route untuk mendapatkan data transaksiPBK berdasarkan ID
router.get("/transaksiPBK/:id", verifyToken, getTransaksiPBKById);
// Route untuk membuat data transaksiPBK baru
router.post("/transaksiPBK", verifyToken, createTransaksiPBK);
// Route untuk memperbarui data transaksiPBK
router.put("/transaksiPBK/:id", verifyToken, updateTransaksiPBK);
// Route untuk menghapus data transaksiPBK
router.delete("/transaksiPBK/:id", verifyToken, deleteTransaksiPBK);

export default router;
