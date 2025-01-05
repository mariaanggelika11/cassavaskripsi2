import express from "express";
import { getProducts, getUnassignedProducts, getProductById, createProduct,  deleteProduct, getProductsByRole, inputTransaksi, approveOrder} from "../controllers/Order.js";
import { verifyToken } from "../middleware/AuthUser.js"; // Menggunakan verifyToken dari AuthUser.js

const router = express.Router();

// Rute untuk mendapatkan semua produk
router.get("/products", verifyToken, getProducts);

// Rute untuk lihat order yg masuk untuk perusahaan pabrik dan logistik
router.get("/productorder", verifyToken, getUnassignedProducts);

// Rute untuk mendapatkan produk berdasarkan yg di acc/milik dia
router.get("/productrole", verifyToken, getProductsByRole);

// Rute untuk mendapatkan produk berdasarkan ID
router.get("/products/:id", verifyToken, getProductById);

// Rute untuk membuat produk baru
router.post("/products", verifyToken, createProduct);

// Rute untuk menyetujui profuk
router.patch("/products/:id", verifyToken, approveOrder);
// Rute input data transaksi
router.patch("/inputtransaksi/:id", verifyToken, inputTransaksi)

// Rute untuk menghapus produk
router.delete("/products/:id", verifyToken, deleteProduct);

// // Rute untuk perusahaan menyetujui order
// router.patch("/orders/:id/approve", verifyToken, approveOrder);


// // Rute untuk menolak order oleh perusahaan
// router.patch("/orders/:id/reject", rejectOrderByCompany);

// // Rute untuk logistik memulai keberangkatan
// router.patch("/orders/:id/start-departure", verifyToken, startDeparture);

// // Rute untuk logistik menyelesaikan keberangkatan dengan data tambahan
// router.patch("/orders/:id/complete-departure", verifyToken, completeDeparture);

// // Rute untuk memproses order di pabrik
// router.patch("/orders/:id/process-factory", verifyToken, processAtFactory);

// // Rute untuk menyelesaikan proses order
// router.patch("/orders/:id/complete", verifyToken, completeProcessing);

// // Rute untuk perusahaan mendisplay harga aktual order
// router.post("/update-price-and-display-weight", verifyToken, updatePriceAndDisplayWeight);

// // Rute untuk menyelesaikan proses order
// router.put("/complete-processing/:id", verifyToken, completeProcessing);

export default router;
