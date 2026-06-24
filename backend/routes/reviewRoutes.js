const express = require("express");
const db = require("../db");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// DODAVANJE RECENZIJE / KOMENTARA
router.post("/reviews", authenticateToken, (req, res) => {
  const { project_id, rating, comment } = req.body;

  if (!project_id || !rating) {
    return res.status(400).json({
      message: "Projekat i ocjena su obavezni.",
    });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({
      message: "Ocjena mora biti između 1 i 5.",
    });
  }

  const sql = `
    INSERT INTO reviews (user_id, project_id, rating, comment)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [req.user.id, project_id, rating, comment], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Greška pri dodavanju recenzije.",
        error: err,
      });
    }

    res.status(201).json({
      message: "Recenzija uspješno dodata.",
      reviewId: result.insertId,
    });
  });
});

// PRIKAZ RECENZIJA ZA PROJEKAT
router.get("/reviews/:projectId", (req, res) => {
  const projectId = req.params.projectId;

  const sql = `
    SELECT
      r.id,
      r.user_id,
      r.project_id,
      r.rating,
      r.comment,
      r.created_at,
      u.username
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.project_id = ?
    ORDER BY r.created_at DESC
  `;

  db.query(sql, [projectId], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Greška pri učitavanju komentara.",
        error: err,
      });
    }

    res.json(results);
  });
});

// BRISANJE RECENZIJE
router.delete("/reviews/:id", authenticateToken, (req, res) => {
  const reviewId = req.params.id;

  const checkSql = "SELECT * FROM reviews WHERE id = ?";

  db.query(checkSql, [reviewId], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Greška pri provjeri recenzije.",
        error: err,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Recenzija nije pronađena.",
      });
    }

    const review = results[0];

    if (review.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Nemaš dozvolu za brisanje ove recenzije.",
      });
    }

    db.query("DELETE FROM reviews WHERE id = ?", [reviewId], (err) => {
      if (err) {
        return res.status(500).json({
          message: "Greška pri brisanju recenzije.",
          error: err,
        });
      }

      res.json({
        message: "Recenzija uspješno obrisana.",
      });
    });
  });
});

module.exports = router;