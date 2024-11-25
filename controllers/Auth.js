import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "bbyifdrdd6r09u8fdxesesedtghbjkjkn";

export const Login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Cari pengguna berdasarkan email
    const user = await User.findOne({
      where: { email: email },
    });

    // Jika pengguna tidak ditemukan, kirim respons error
    if (!user) {
      return res.status(404).json({ msg: "Mohon login ke akun Anda!" });
    }

    // Bandingkan password yang dimasukkan dengan hash yang disimpan di database
    const match = await bcrypt.compare(password, user.password);

    // Jika password tidak cocok, kirim respons error
    if (!match) {
      return res.status(401).json({ msg: "Mohon login ke akun Anda!" });
    }

    // Jika berhasil, buat token JWT
    const token = jwt.sign({ id: user.uuid }, JWT_SECRET, {
      expiresIn: "1d", // Token berlaku selama 1 hari
    });

    console.log("Generated token:", token); // Log token yang dihasilkan

    // Kirim respons sukses bersama dengan token dan data pengguna
    res.status(200).json({
      token,
      userId: user.uuid,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    // Tangani kesalahan server jika terjadi
    console.error("Login error:", error);
    res.status(500).json({ msg: "Terjadi kesalahan saat login" });
  }
};

export const Me = async (req, res) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");

    console.log("Received token:", token);

    // Verify token using JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    console.log("Decoded token:", decoded);

    // Find user based on decoded ID from token
    const user = await User.findOne({
      where: { uuid: decoded.id },
      attributes: ["uuid", "name", "email", "role"],
    });

    console.log("Found user:", user);

    // If user not found, return 404
    if (!user) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    // Return user data in response
    res.status(200).json(user);
  } catch (error) {
    // Handle errors, such as invalid token
    console.error("Me error:", error);
    res.status(500).json({ msg: error.message });
  }
};

export const logOut = (req, res) => {
  try {
    // Di sini Anda dapat menangani proses logout sesuai kebutuhan aplikasi Anda
    res.status(200).json({ msg: "Anda telah logout" });
  } catch (error) {
    console.error("Error saat logout:", error);
    res.status(500).json({ msg: "Terjadi kesalahan saat logout" });
  }
};
