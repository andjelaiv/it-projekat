const express = require("express");
const db = require("../db");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// DODAJ PROJEKAT U FAVORITE
router.post("/favorites", authenticateToken, (req, res) => {
  const { project_id } = req.body;

  if (!project_id) {
    return res.status(400).json({ message: "project_id je obavezan." });
  }

  const sql = `
    INSERT INTO favorites (user_id, project_id)
    VALUES (?, ?)
  `;

  db.query(sql, [req.user.id, project_id], (err) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          message: "Projekat je već u favoritima.",
        });
      }

      return res.status(500).json({
        message: "Greška pri dodavanju u favorite.",
        error: err,
      });
    }

    res.status(201).json({
      message: "Projekat uspješno dodat u favorite.",
    });
  });
});

// PRIKAZ MOJIH FAVORITA
router.get("/favorites/me", authenticateToken, (req, res) => {
  const sql = `
    SELECT
      p.id,
      p.title,
      p.description,
      p.estimated_time,
      p.cover_image,
      p.is_featured,
      p.created_at,
      p.author_id,
      u.username AS author,
      c.name AS category,
      d.name AS difficulty,
      COALESCE(AVG(r.rating), 0) AS average_rating,
      COUNT(DISTINCT r.id) AS review_count
    FROM favorites f
    JOIN projects p ON f.project_id = p.id
    JOIN users u ON p.author_id = u.id
    JOIN categories c ON p.category_id = c.id
    JOIN difficulty_levels d ON p.difficulty_id = d.id
    LEFT JOIN reviews r ON p.id = r.project_id
    WHERE f.user_id = ?
    GROUP BY
      p.id,
      p.title,
      p.description,
      p.estimated_time,
      p.cover_image,
      p.is_featured,
      p.created_at,
      p.author_id,
      u.username,
      c.name,
      d.name
    ORDER BY p.created_at DESC
  `;

  db.query(sql, [req.user.id], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Greška pri učitavanju favorita.",
        error: err,
      });
    }

    res.json(results);
  });
});

// UKLONI PROJEKAT IZ FAVORITA
router.delete("/favorites/:projectId", authenticateToken, (req, res) => {
  const projectId = req.params.projectId;

  const sql = `
    DELETE FROM favorites
    WHERE user_id = ? AND project_id = ?
  `;

  db.query(sql, [req.user.id, projectId], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Greška pri uklanjanju iz favorita.",
        error: err,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Projekat nije pronađen u favoritima.",
      });
    }

    res.json({
      message: "Projekat uspješno uklonjen iz favorita.",
    });
  });
});

module.exports = router;