import express from "express";
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, approveOrder, startDeparture, completeDeparture, processAtFactory, completeProcessing, updatePriceAndDisplayWeight } from "../controllers/Order.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

// Rute untuk mendapatkan semua produk
router.get("/products", getProducts);

// Rute untuk mendapatkan produk berdasarkan ID
router.get("/products/:id", getProductById);

// Rute untuk membuat produk baru
router.post("/products", createProduct);

// Rute untuk memperbarui produk
router.patch("/products/:id", updateProduct);

// Rute untuk menghapus produk
router.delete("/products/:id", deleteProduct);

// Rute untuk perusahaan menyetujui order
router.patch("/orders/:id/approve", approveOrder);

// Rute untuk logistik memulai keberangkatan
router.patch("/orders/:id/start-departure", startDeparture);

// Rute untuk logistik menyelesaikan keberangkatan dengan data tambahan
router.patch("/orders/:id/complete-departure", completeDeparture);

// Rute untuk memproses order di pabrik
router.patch("/orders/:id/process-factory", processAtFactory);

// Rute untuk menyelesaikan proses order
router.patch("/orders/:id/complete", completeProcessing);

// Rute untuk perusahaan mendisplay harga aktual order
router.post("/update-price-and-display-weight", updatePriceAndDisplayWeight);

// Rote History order jika pesanan selesai
router.put("/complete-processing/:id", completeProcessing);

export default router;
