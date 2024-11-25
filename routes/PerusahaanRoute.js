import express from "express";
import { getPerusahaan, createPerusahaan, updatePerusahaan, deletePerusahaan, getPerusahaanById, getHargaForChart } from "../controllers/Perusahaan.js";
import { verifyToken } from "../middleware/AuthUser.js"; // Menggunakan verifyToken dari AuthUser.js

const router = express.Router();

// Route untuk mendapatkan semua data Perusahaan
router.get("/perusahaan", verifyToken, getPerusahaan);
// Route untuk mendapatkan data Perusahaan berdasarkan Id
router.get("/perusahaan/:id", verifyToken, getPerusahaanById);
// Route untuk membuat data perusahaaan baru
router.post("/perusahaan", verifyToken, createPerusahaan);
// Route untuk memperbarui data perusahaan
router.put("/perusahaan/:id", verifyToken, updatePerusahaan);
// Route untuk menghapus data perusahaan
router.delete("/perusahaan/:id", verifyToken, deletePerusahaan);
// Route untuk  data harga berdasarkan tanggal (grafik)
router.get("/hargaforchart", verifyToken, getHargaForChart);
export default router;
