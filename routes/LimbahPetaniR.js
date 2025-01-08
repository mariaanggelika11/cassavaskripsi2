import express from "express";
import { getLimbah, getLimbahById, updateLimbah, getLimbahByUserId} from "../controllers/LimbahPetani.js"; 
import { verifyToken } from "../middleware/AuthUser.js"; // Menggunakan verifyToken dari AuthUser.js

const router = express.Router();

// Route untuk mendapatkan semua data limbah
router.get("/limbah", verifyToken, getLimbah);

// Route untuk mendapatkan data limbah berdasarkan Id
router.get("/limbahid/:id", verifyToken, getLimbahById);


// Route untuk mendapatkan data limbah berdasarkan userId
router.get("/limbahuser/:userId", verifyToken, getLimbahByUserId);

// // Route untuk membuat data limbah baru
// router.post("/limbah", verifyToken, createLimbah);

// Route untuk memperbarui data limbah
router.put("/limbah/:id", verifyToken, updateLimbah);

// // Route untuk menghapus data limbah
// router.delete("/limbah/:id", verifyToken, deleteLimbah);

export default router;
