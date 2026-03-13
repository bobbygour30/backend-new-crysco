import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import productRoutes from "./routes/product.js";
import cartRoutes from "./routes/cartRoutes.js";
import bulkPaymentRoutes from "./routes/bulkPaymentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import buyNowRoutes from "./routes/buyNowRoutes.js";
import bulkRoutes from "./routes/bulkRoutes.js";
import { promises as dns } from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();

// Connect DB (IMPORTANT: call inside handler safe way in production)
connectDB();

app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "https://crysco-frontend.vercel.app",
  "https://cryscoindia.com",
  "https://www.cryscoindia.com"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products/bulk", bulkRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/bulk-payment", bulkPaymentRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/buy-now", buyNowRoutes);  

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});




export default app;