// File route: logistikdasar.route.js
import express from "express";
import { createLogistik, getAllLogistik, getLogistikById, updateLogistik, deleteLogistik } from "../controllers/Dasarlogistik.js";
import { verifyToken } from "../middleware/AuthUser.js"; // Menggunakan verifyToken dari AuthUser.js


const router = express.Router();
// Route untuk membuat data logistik
router.post("/logistikdasar", verifyToken, createLogistik);

// Route untuk mengambil semua data logistik
router.get("/logistikdasar", verifyToken, getAllLogistik);

// Route untuk mengambil data logistik berdasarkan ID
router.get("/logistikdasar/:id", verifyToken, getLogistikById);

// Route untuk mengupdate data logistik
router.put("/logistikdasar/:id", verifyToken, updateLogistik);

// Route untuk menghapus data logistik
router.delete("/logistikdasar/:id", verifyToken, deleteLogistik);

export default router;