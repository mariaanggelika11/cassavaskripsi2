// File routes: pabrikproduksi.js
import express from 'express';
import { createPabrikproduksi, getAllPabrikproduksi, getPabrikproduksiById, updatePabrikproduksi, deletePabrikproduksi } from "../controllers/ProduksiPBK.js";
import { verifyToken } from '../middleware/AuthUser.js';
const router = express.Router();

// Route untuk membuat data pabrik produksi
router.post('/produksi',verifyToken, createPabrikproduksi);

// Route untuk mengambil semua data pabrik produksi
router.get('/produksi',verifyToken, getAllPabrikproduksi);

// Route untuk mengambil data pabrik produksi berdasarkan ID
router.get('/produksi/:id',verifyToken, getPabrikproduksiById);

// Route untuk mengupdate data pabrik produksi
router.put('/produksi/:id',verifyToken, updatePabrikproduksi);

// Route untuk menghapus data pabrik produksi
router.delete('/produksi/:id',verifyToken, deletePabrikproduksi);

export default router;