import express from "express";
import { getLogistik, createLogistik, updateLogistik, deleteLogistik, getLogistikById, getLogistikByUserId } from "../controllers/LogistikTransaksi.js";
import { verifyToken } from "../middleware/AuthUser.js";

const router = express.Router();

// Route untuk mendapatkan semua data logistik
router.get("/logistik", verifyToken, getLogistik);
// Route untuk mendapatkan data logistik berdasarkan ID
router.get("/logistikid/:id", verifyToken, getLogistikById);

// (tidak perlu dipakai) Route untuk membuat data logistik baru 
router.post("/logistik", verifyToken, createLogistik);

router.get("/logistikuser/:userId",verifyToken, getLogistikByUserId);

// (tidak perlu dipakai) Route untuk memperbarui data logistik
router.put("/logistik/:id", verifyToken, updateLogistik);

// Route untuk menghapus data logistik
router.delete("/logistik/:id", verifyToken, deleteLogistik);

export default router;
