const express = require("express");
const db = require("../db");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// PRIKAZ PROFILA TRENUTNO ULOGOVANOG KORISNIKA
router.get("/users/me", authenticateToken, (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT
      u.id,
      u.username,
      u.email,
      r.name AS role,
      u.created_at,
      (SELECT COUNT(*) FROM projects WHERE author_id = u.id) AS projects_count,
      (SELECT COUNT(*) FROM favorites WHERE user_id = u.id) AS favorites_count,
      (SELECT COUNT(*) FROM collection WHERE user_id = u.id) AS collection_count,
      (SELECT COUNT(*) FROM reviews WHERE user_id = u.id) AS reviews_count
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Greška pri učitavanju profila.",
        error: err,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Korisnik nije pronađen.",
      });
    }

    res.json(results[0]);
  });
});

// IZMJENA PROFILA TRENUTNO ULOGOVANOG KORISNIKA
router.put("/users/me", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({
      message: "Username i email su obavezni.",
    });
  }

  const sql = `
    UPDATE users
    SET username = ?, email = ?
    WHERE id = ?
  `;

  db.query(sql, [username, email, userId], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          message: "Username ili email već postoji.",
        });
      }

      return res.status(500).json({
        message: "Greška pri izmjeni profila.",
        error: err,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Korisnik nije pronađen.",
      });
    }

    res.json({
      message: "Profil uspješno izmijenjen.",
    });
  });
});

// PROJEKTI KOJE JE TRENUTNO ULOGOVANI KORISNIK OBJAVIO
router.get("/users/me/projects", authenticateToken, (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT
      p.id,
      p.title,
      p.description,
      p.estimated_time,
      p.cover_image,
      p.is_featured,
      p.created_at,
      c.name AS category,
      d.name AS difficulty,
      COALESCE(AVG(r.rating), 0) AS average_rating,
      COUNT(DISTINCT r.id) AS review_count
    FROM projects p
    JOIN categories c ON p.category_id = c.id
    JOIN difficulty_levels d ON p.difficulty_id = d.id
    LEFT JOIN reviews r ON p.id = r.project_id
    WHERE p.author_id = ?
    GROUP BY
      p.id, p.title, p.description, p.estimated_time, p.cover_image,
      p.is_featured, p.created_at, c.name, d.name
    ORDER BY p.created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Greška pri učitavanju korisnikovih projekata.",
        error: err,
      });
    }

    res.json(results);
  });
});
// JAVNI PROFIL KORISNIKA / AUTORA
router.get("/users/:id", (req, res) => {
  const userId = req.params.id;

  const sql = `
    SELECT
      u.id,
      u.username,
      r.name AS role,
      u.created_at,
      (SELECT COUNT(*) FROM projects WHERE author_id = u.id) AS projects_count,
      (SELECT COUNT(*) FROM reviews WHERE user_id = u.id) AS reviews_count
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Greška pri učitavanju javnog profila.",
        error: err,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Korisnik nije pronađen.",
      });
    }

    res.json(results[0]);
  });
});

// PROJEKTI KOJE JE ODREĐENI KORISNIK OBJAVIO
router.get("/users/:id/projects", (req, res) => {
  const userId = req.params.id;

  const sql = `
    SELECT
      p.id,
      p.title,
      p.description,
      p.estimated_time,
      p.cover_image,
      p.is_featured,
      p.created_at,
      c.name AS category,
      d.name AS difficulty,
      COALESCE(AVG(r.rating), 0) AS average_rating,
      COUNT(DISTINCT r.id) AS review_count
    FROM projects p
    JOIN categories c ON p.category_id = c.id
    JOIN difficulty_levels d ON p.difficulty_id = d.id
    LEFT JOIN reviews r ON p.id = r.project_id
    WHERE p.author_id = ?
    GROUP BY
      p.id, p.title, p.description, p.estimated_time, p.cover_image,
      p.is_featured, p.created_at, c.name, d.name
    ORDER BY p.created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Greška pri učitavanju projekata korisnika.",
        error: err,
      });
    }

    res.json(results);
  });
});
module.exports = router;