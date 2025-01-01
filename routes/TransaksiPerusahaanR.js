import express from "express";
import {getTransaksiPR, getTransaksiPRById, createTransaksiPR, updateTransaksiPR, deleteTransaksiPR,} from "../controllers/PerusahaanTransaksi.js";
import { verifyToken } from "../middleware/AuthUser.js";


const router = express.Router();

// Endpoint untuk mendapatkan semua data transaksiPR
router.get("/transaksi-pr",verifyToken, getTransaksiPR);

// Endpoint untuk mendapatkan satu data transaksiPR berdasarkan ID
router.get("/transaksi-pr/:id",verifyToken, getTransaksiPRById);

// Endpoint untuk membuat data transaksiPR baru
router.post("/transaksi-pr",verifyToken,createTransaksiPR);

// Endpoint untuk memperbarui data transaksiPR berdasarkan ID
router.put("/transaksi-pr/:id",verifyToken, updateTransaksiPR);

// Endpoint untuk menghapus data transaksiPR berdasarkan ID
router.delete("/transaksi-pr/:id",verifyToken,deleteTransaksiPR);

export default router;
