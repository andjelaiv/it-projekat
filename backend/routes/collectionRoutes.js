const express = require("express");
const db = require("../db");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// DODAJ PROJEKAT U KOLEKCIJU
router.post("/collection", authenticateToken, (req, res) => {
  const { project_id, status_id } = req.body;

  if (!project_id || !status_id) {
    return res.status(400).json({
      message: "project_id i status_id su obavezni.",
    });
  }

  const sql = `
    INSERT INTO collection (user_id, project_id, status_id)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [req.user.id, project_id, status_id], (err) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          message: "Projekat je već u kolekciji.",
        });
      }

      return res.status(500).json({
        message: "Greška pri dodavanju u kolekciju.",
        error: err,
      });
    }

    res.status(201).json({
      message: "Projekat uspješno dodat u kolekciju.",
    });
  });
});

// PRIKAZ MOJE KOLEKCIJE
router.get("/collection/me", authenticateToken, (req, res) => {
  const sql = `
    SELECT
      p.id,
      p.title,
      p.description,
      p.estimated_time,
      p.cover_image,
      p.is_featured,
      p.created_at,
      u.username AS author,
      c.name AS category,
      d.name AS difficulty,
      cs.name AS status,
      col.added_at
    FROM collection col
    JOIN projects p ON col.project_id = p.id
    JOIN users u ON p.author_id = u.id
    JOIN categories c ON p.category_id = c.id
    JOIN difficulty_levels d ON p.difficulty_id = d.id
    JOIN collection_statuses cs ON col.status_id = cs.id
    WHERE col.user_id = ?
    ORDER BY col.added_at DESC
  `;

  db.query(sql, [req.user.id], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Greška pri učitavanju kolekcije.",
        error: err,
      });
    }

    res.json(results);
  });
});

// PROMIJENI STATUS PROJEKTA U KOLEKCIJI
router.put("/collection/:projectId", authenticateToken, (req, res) => {
  const projectId = req.params.projectId;
  const { status_id } = req.body;

  if (!status_id) {
    return res.status(400).json({
      message: "status_id je obavezan.",
    });
  }

  const sql = `
    UPDATE collection
    SET status_id = ?
    WHERE user_id = ? AND project_id = ?
  `;

  db.query(sql, [status_id, req.user.id, projectId], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Greška pri izmjeni statusa.",
        error: err,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Projekat nije pronađen u kolekciji.",
      });
    }

    res.json({
      message: "Status projekta uspješno izmijenjen.",
    });
  });
});

// UKLONI PROJEKAT IZ KOLEKCIJE
router.delete("/collection/:projectId", authenticateToken, (req, res) => {
  const projectId = req.params.projectId;

  const sql = `
    DELETE FROM collection
    WHERE user_id = ? AND project_id = ?
  `;

  db.query(sql, [req.user.id, projectId], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Greška pri uklanjanju iz kolekcije.",
        error: err,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Projekat nije pronađen u kolekciji.",
      });
    }

    res.json({
      message: "Projekat uspješno uklonjen iz kolekcije.",
    });
  });
});

module.exports = router;