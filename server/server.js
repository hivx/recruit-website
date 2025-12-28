// server/server.js
require("dotenv").config();
const path = require("node:path");

const cors = require("cors");
const express = require("express");

// Swagger
const swaggerUi = require("swagger-ui-express");

const swaggerSpec = require("./swagger");
const prisma = require("./utils/prisma");

// Khởi tạo app
const app = express();

// Tắt header X-Powered-By để tăng cường bảo mật
app.set("x-powered-by", false);

// Middleware
const clientUrl = new Set(
  (process.env.CLIENT_URL || "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean),
);

const isProd = process.env.NODE_ENV === "production";

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (!isProd && origin.startsWith("http://localhost")) {
      return callback(null, true);
    }

    if (clientUrl.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked: ${origin} not allowed`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Khởi tạo event handlers
require("./events/init");

// Khởi chạy cron rebuild vector định kỳ
require("./utils/cronSchedules");

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check: kiểm tra kết nối MySQL/Prisma
app.get("/sql", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, db: "mysql" });
  } catch (e) {
    console.error("DB health error:", e);
    res.status(500).json({ ok: false, error: "DB not reachable" });
  }
});

// Route đơn giản test
app.get("/", (req, res) => {
  res.send("Hello từ API Tuyển dụng (MySQL/Prisma)!");
});

// Routes chính
app.use("/api/auth", require("./routes/auth"));
app.use("/api/jobs", require("./routes/job"));
app.use("/api/applications", require("./routes/application"));
app.use("/api/users", require("./routes/user"));
app.use("/api/companies", require("./routes/company"));
app.use("/api/preferences", require("./routes/preference"));
app.use("/api/skills", require("./routes/skill"));
app.use("/api/recommendations", require("./routes/recommendation"));

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Graceful shutdown: đóng Prisma khi dừng app
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
  console.log(`Swagger Docs: http://localhost:${PORT}/api-docs`);
});
