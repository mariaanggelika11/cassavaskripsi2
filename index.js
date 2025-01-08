import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/Database.js";
import UserRoute from "./routes/UserRoute.js";
import OrderRoute from "./routes/OrderRoute.js";
import AuthRoute from "./routes/AuthRoute.js";
import PetaniRoute from "./routes/PetaniRoute.js";
import LogistikdasarR from "./routes/LogistikdasarR.js";
import LogistikRoute from "./routes/TransaksiLogistikRoute.js";
import PabrikRoute from "./routes/PabrikRoute.js";
import ProduksiRoute from "./routes/ProduksiRoute.js";
import PerusahaanRoute from "./routes/PerusahaanRoute.js";
import SearchRoute from "./routes/SearchRoute.js";
import TransaksiPBK from "./routes/TransaksiPabrikR.js";
import limbahpetaniR from "./routes/LimbahPetaniR.js";
import TransaksiLogistikRoute from "./routes/TransaksiLogistikRoute.js";
import TransaksiPerusahaanR from "./routes/TransaksiPerusahaanR.js";

dotenv.config();
const app = express();

const JWT_SECRET =
  process.env.JWT_SECRET || "bbyifdrdd6r09u8fdxesesedtghbjkjkn";
console.log("JWT_SECRET:", JWT_SECRET); // Verifikasi bahwa JWT_SECRET dimuat

// Middleware untuk logging request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// List of allowed origins
const allowedOrigins = ["*", "https://cassava-telti.isi-net.org"];

// Enable CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS" , "PATCH"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
    credentials: true,
  })
);


// Handle preflight requests
app.options(
  "*",
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
    credentials: true,
  }),
  (req, res) => {
    res.sendStatus(204);
  }
);

app.use("/profile", express.static("uploads/img/profile"));
app.use(express.json());

// Sinkronisasi Database
(async () => {
  try {
    await db.sync({ alter: true, logging: console.log }); // Perbarui skema tanpa menghapus data
    console.log("Database synced successfully.");
  } catch (error) {
    console.error("Database sync failed:", error);
  }
})();

// Gunakan routes yang sudah memiliki middleware JWT
app.use(UserRoute);
app.use(OrderRoute);
app.use(AuthRoute);
app.use(PetaniRoute);
app.use(LogistikdasarR);
app.use(LogistikRoute);
app.use(PabrikRoute);
app.use(ProduksiRoute);
app.use(SearchRoute);
app.use(PerusahaanRoute);
app.use(TransaksiLogistikRoute)
app.use(limbahpetaniR)
app.use(TransaksiPBK)
app.use(TransaksiPerusahaanR)

app.listen(process.env.APP_PORT, () => {
  console.log(
    `Server up and running... at http://localhost:${process.env.APP_PORT}`
  );
});
