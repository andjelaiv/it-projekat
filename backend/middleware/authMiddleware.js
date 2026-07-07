const jwt = require("jsonwebtoken");
const db = require("../db");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Token nije poslat.",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (error, decodedUser) => {
    if (error) {
      return res.status(403).json({
        message: "Token nije validan.",
      });
    }

    const sql = `
      SELECT
        u.id,
        u.username,
        u.email,
        r.name AS role
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `;

    db.query(sql, [decodedUser.id], (databaseError, results) => {
      if (databaseError) {
        console.error(
          "Greška pri provjeri korisnika:",
          databaseError
        );

        return res.status(500).json({
          message: "Greška pri provjeri korisnika.",
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          message: "Korisnik više ne postoji.",
        });
      }

      req.user = results[0];

      next();
    });
  });
};

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Pristup dozvoljen samo adminu.",
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  isAdmin,
};