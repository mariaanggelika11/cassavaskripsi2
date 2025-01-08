import express from "express";
import { getTransaksiPBK, createTransaksiPBK, updateTransaksiPBK, deleteTransaksiPBK, getTransaksiPBKById, getTransaksiPBKByUserId  } from "../controllers/PabrikTransaksi.js"; // Pastikan nama file controller sesuai

import { verifyToken } from "../middleware/AuthUser.js";

const router = express.Router();

// Route untuk mendapatkan semua data transaksiPBK
router.get("/transaksipabrik", verifyToken, getTransaksiPBK);
// Route untuk mendapatkan data transaksiPBK berdasarkan ID
router.get("/transaksipabrikid/:id", verifyToken, getTransaksiPBKById);
// Route untuk mendapatkan data transaksiPBK berdasarkan useerId
router.get("/transaksipabrikuser/:userId", verifyToken, getTransaksiPBKByUserId);
// Route untuk membuat data transaksiPBK baru
router.post("/transaksipabrik", verifyToken, createTransaksiPBK);
// Route untuk memperbarui data transaksiPBK
router.put("/transaksipabrik/:id", verifyToken, updateTransaksiPBK);
// Route untuk menghapus data transaksiPBK
router.delete("/transaksipabrik/:id", verifyToken, deleteTransaksiPBK);

export default router;
