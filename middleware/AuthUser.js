import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";

// Middleware untuk memverifikasi JWT dan logging
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("Unauthorized access attempt");
    return res.status(401).json({ msg: "Mohon login ke akun Anda!" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ where: { uuid: decoded.id } });
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

    req.userId = user.id;
    req.role = user.role;
    req.name = user.name;
    req.email = user.email;
    console.log(`User ${user.email} authenticated successfully`);
    next();
  } catch (error) {
    console.log("Invalid token:", error.message);
    return res.status(401).json({ msg: "Token tidak valid" });
  }
  
};

export const adminOnly = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "Mohon login ke akun Anda!" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ where: { uuid: decoded.id } });
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });
    if (user.role !== "admin") return res.status(403).json({ msg: "Akses terlarang, anda bukan admin!" });

    req.userId = user.id;
    req.role = user.role;
    console.log(`admin ${user.email} authenticated successfully`);
    next();
  } catch (error) {
    console.log("Invalid token:", error.message);
    return res.status(401).json({ msg: "Token tidak valid" });
  }
};





