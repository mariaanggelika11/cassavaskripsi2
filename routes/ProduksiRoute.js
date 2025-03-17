// File routes: pabrikproduksi.js
import express from 'express';
import { createPabrikproduksi, getAllPabrikproduksi, getPabrikproduksiById, getPabrikproduksiUserId, updatePabrikproduksi, deletePabrikproduksi, getValidOrderUUID } from "../controllers/ProduksiPBK.js";
import { verifyToken } from '../middleware/AuthUser.js';
const router = express.Router();

// Route untuk membuat data pabrik produksi
router.post('/produksi',verifyToken, createPabrikproduksi);

// Route untuk mengambil semua data pabrik produksi
router.get('/produksi',verifyToken, getAllPabrikproduksi);

// Route untuk mengambil data pabrik produksi berdasarkan ID
router.get('/produksiid/:id',verifyToken, getPabrikproduksiById);

//Route utnuk mengambil data pabrik berdasarkan userid
router.get("/produksiuser/:userId", verifyToken, getPabrikproduksiUserId);

// Route untuk mengupdate data pabrik produksi
router.put('/produksi/:id',verifyToken, updatePabrikproduksi);

// Route untuk menghapus data pabrik produksi
router.delete('/produksi/:id',verifyToken, deletePabrikproduksi);

// Route dropdown id order untuk pabrik dengan status order selesai dan dia yg acc order
router.get('/dropdownorder', verifyToken, getValidOrderUUID);

export default router;