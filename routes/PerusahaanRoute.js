import express from "express";
import { getDataPerusahaan, createDataPerusahaan, updateDataPerusahaan, deleteDataPerusahaan, getDataPerusahaanById, getDataPerusahaan } from "../controllers/Perusahaan";
import { verifyUser } from "../middleware/AuthUser";

const router = express.Router();

//Route untuk mendapatkan semua data Perusahaan
router.get("/perusahaan", verifyUser, getDataPerusahaan);
//Route untuk mendapatkan semua data Perusahaan berdasarkan Id
router.get("/perusahaan/:id", verifyUser, getDataPerusahaanById);
//Route untuk membuat data perusahaaan baru
router.post("/perusahaaan", verifyUser, createDataPerusahaan);
//Route untuk memperbarui data perusahaan
router.put("/perusahaan/:id", verifyUser, updateDataPerusahaan);
//Route untuk menghapus data perusahaan
router.delete("/perusahaan", verifyUser, deleteDataPerusahaan);

export default router;
