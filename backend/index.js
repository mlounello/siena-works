import { env } from "./config/env.js";
import express from "express";
import cors from "cors";
import adminRoutes from "./routes/admin.js";

const app = express();

// Support multiple origins, fallback to localhost
const allowedOrigins = (env.CORS_ORIGIN || "http://localhost:5173").split(",");

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow no-origin requests (like mobile clients or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("Blocked by CORS:", origin);
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