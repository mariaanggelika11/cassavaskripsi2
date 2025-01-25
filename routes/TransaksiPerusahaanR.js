import express from "express";
import {getTransaksiPR, getTransaksiPRById, createTransaksiPR, updateTransaksiPR, deleteTransaksiPR,} from "../controllers/PerusahaanTransaksi.js";
import { verifyToken } from "../middleware/AuthUser.js";


const router = express.Router();

// Endpoint untuk mendapatkan semua data transaksiPR
router.get("/transaksipr",verifyToken, getTransaksiPR);

// Endpoint untuk mendapatkan satu data transaksiPR berdasarkan ID
router.get("/transaksipr/:id",verifyToken, getTransaksiPRById);

// Endpoint untuk membuat data transaksiPR baru
router.post("/transaksipr",verifyToken,createTransaksiPR);

// Endpoint untuk memperbarui data transaksiPR berdasarkan ID
router.put("/transaksipr/:id",verifyToken, updateTransaksiPR);

// Endpoint untuk menghapus data transaksiPR berdasarkan ID
router.delete("/transaksipr/:id",verifyToken,deleteTransaksiPR);

export default router;
