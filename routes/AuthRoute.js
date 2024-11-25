import express from "express";
import { Login, Me, logOut } from "../controllers/Auth.js";
import { verifyToken } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/me", verifyToken, Me); // Verifikasi token sebelum mengakses /me
router.post("/login", Login);
router.delete("/logout", logOut);

export default router;
