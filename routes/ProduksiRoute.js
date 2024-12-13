// File routes: pabrikproduksi.js
import express from 'express';
import { createPabrikproduksi, getAllPabrikproduksi, getPabrikproduksiById, updatePabrikproduksi, deletePabrikproduksi } from "../controllers/ProduksiPBK.js";

const router = express.Router();

// Route untuk membuat data pabrik produksi
router.post('/produksi', createPabrikproduksi);

// Route untuk mengambil semua data pabrik produksi
router.get('/produksi', getAllPabrikproduksi);

// Route untuk mengambil data pabrik produksi berdasarkan ID
router.get('/produksi/:id', getPabrikproduksiById);

// Route untuk mengupdate data pabrik produksi
router.put('/produksi/:id', updatePabrikproduksi);

// Route untuk menghapus data pabrik produksi
router.delete('/produksi/:id', deletePabrikproduksi);

export default router;