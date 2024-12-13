// File route: logistikdasar.route.js
import express from "express";
import { createLogistik, getAllLogistik, getLogistikById, updateLogistik, deleteLogistik } from "../controllers/Dasarlogistik.js";

const router = express.Router();

// Route untuk membuat data logistik
router.post("/logistikdasar", createLogistik);

// Route untuk mengambil semua data logistik
router.get("/logistikdasar", getAllLogistik);

// Route untuk mengambil data logistik berdasarkan ID
router.get("/logistikdasar/:id", getLogistikById);

// Route untuk mengupdate data logistik
router.put("/logistikdasar/:id", updateLogistik);

// Route untuk menghapus data logistik
router.delete("/logistikdasar/:id", deleteLogistik);

export default router;