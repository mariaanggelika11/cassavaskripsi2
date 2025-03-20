import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "bbyifdrdd6r09u8fdxesesedtghbjkjkn";

export const Login = async (req, res) => {
  const { email, password } = req.body;
  const startTime = Date.now(); // Catat waktu mulai eksekusi

  try {
    // Timeout handler untuk mencegah proses terlalu lama
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), 5000)
    );

    const processLogin = (async () => {
      // Log permintaan masuk
      console.log(`[${new Date().toISOString()}] Login attempt: ${email}`);

      // Cari pengguna berdasarkan email
      const user = await User.findOne({ where: { email: email } });

      if (!user) {
        console.warn(`[${new Date().toISOString()}] User not found: ${email}`);
        return res.status(404).json({ msg: "Akun tidak ditemukan. Mohon daftar terlebih dahulu!" });
      }

      // Bandingkan password yang dimasukkan dengan hash di database
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        console.warn(`[${new Date().toISOString()}] Password mismatch for user: ${email}`);
        return res.status(401).json({ msg: "Password salah. Coba lagi!" });
      }

      // Buat token JWT
      const token = jwt.sign({ id: user.uuid }, JWT_SECRET, { expiresIn: "1d" });

      console.log(`[${new Date().toISOString()}] Token generated for user: ${email}`);
      console.log(`Login process took ${Date.now() - startTime} ms`); // Cek durasi proses

      // Kirim respons sukses
      res.status(200).json({
        token,
        userId: user.uuid,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    })();

    // Jalankan proses dengan timeout
    await Promise.race([processLogin, timeout]);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Login error:`, error);

    if (error.message === "Request timeout") {
      return res.status(408).json({ msg: "Permintaan terlalu lama, coba lagi nanti!" });
    }

    res.status(500).json({ msg: "Terjadi kesalahan saat login, silakan coba lagi!" });
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
