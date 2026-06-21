const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

// REGISTRACIJA
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Sva polja su obavezna." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // role_id = 2 je običan user
    const sql = `
      INSERT INTO users (username, email, password_hash, role_id)
      VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [username, email, hashedPassword, 2], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ message: "Korisnik već postoji." });
        }

        return res.status(500).json({ message: "Greška pri registraciji.", error: err });
      }

      res.status(201).json({ message: "Registracija uspješna." });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error });
  }
});

// LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email i lozinka su obavezni." });
  }

  const sql = `
    SELECT users.id, users.username, users.email, users.password_hash, roles.name AS role
    FROM users
    JOIN roles ON users.role_id = roles.id
    WHERE users.email = ?
  `;

  db.query(sql, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Greška pri loginu.", error: err });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Pogrešan email ili lozinka." });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Pogrešan email ili lozinka." });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login uspješan.",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  });
});

module.exports = router;