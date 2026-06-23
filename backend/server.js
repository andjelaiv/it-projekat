const express = require("express");
const cors = require("cors");
require("dotenv").config();

require("./db");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const collectionRoutes = require("./routes/collectionRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const statsRoutes = require("./routes/statsRoutes");

const { authenticateToken, isAdmin } = require("./middleware/authMiddleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend radi!" });
});

app.get("/api/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Ovo je zaštićena ruta.",
    user: req.user,
  });
});

app.get("/api/admin-test", authenticateToken, isAdmin, (req, res) => {
  res.json({
    message: "Ovo vidi samo admin.",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api", projectRoutes);
app.use("/api", reviewRoutes);
app.use("/api", favoriteRoutes);
app.use("/api", collectionRoutes);
app.use("/api", adminRoutes);
app.use("/api", userRoutes);
app.use("/api", statsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server radi na portu ${PORT}`);
});