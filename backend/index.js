import { env } from "./config/env.js";
import express from "express";
import cors from "cors";
import adminRoutes from "./routes/admin.js";

const app = express();

const allowedOrigin = env.CORS_ORIGIN || "http://localhost:5173";
const allowedOrigins = process.env.CORS_ORIGIN.split(",");
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => res.send("Backend running OK"));

app.use("/api", (req, res) => {
  res.status(404).json({ message: "Not found" });
});

const PORT = env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));