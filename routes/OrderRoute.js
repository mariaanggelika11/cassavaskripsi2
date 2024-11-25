import express from "express";
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, approveOrder, startDeparture, completeDeparture, processAtFactory, completeProcessing, updatePriceAndDisplayWeight } from "../controllers/Order.js";
import { verifyToken } from "../middleware/AuthUser.js"; // Menggunakan verifyToken dari AuthUser.js

const router = express.Router();

// Rute untuk mendapatkan semua produk
router.get("/products", verifyToken, getProducts);

// Rute untuk mendapatkan produk berdasarkan ID
router.get("/products/:id", verifyToken, getProductById);

// Rute untuk membuat produk baru
router.post("/products", verifyToken, createProduct);


// Rute untuk memperbarui produk
router.patch("/products/:id", verifyToken, updateProduct);

// Rute untuk menghapus produk
router.delete("/products/:id", verifyToken, deleteProduct);

// Rute untuk perusahaan menyetujui order
router.patch("/orders/:id/approve", verifyToken, approveOrder);

// Rute untuk logistik memulai keberangkatan
router.patch("/orders/:id/start-departure", verifyToken, startDeparture);

// Rute untuk logistik menyelesaikan keberangkatan dengan data tambahan
router.patch("/orders/:id/complete-departure", verifyToken, completeDeparture);

// Rute untuk memproses order di pabrik
router.patch("/orders/:id/process-factory", verifyToken, processAtFactory);

// Rute untuk menyelesaikan proses order
router.patch("/orders/:id/complete", verifyToken, completeProcessing);

// Rute untuk perusahaan mendisplay harga aktual order
router.post("/update-price-and-display-weight", verifyToken, updatePriceAndDisplayWeight);

// Rute untuk menyelesaikan proses order
router.put("/complete-processing/:id", verifyToken, completeProcessing);

export default router;
