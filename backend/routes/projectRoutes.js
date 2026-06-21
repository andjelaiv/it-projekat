const express = require("express");
const db = require("../db");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/categories", (req, res) => {
  db.query("SELECT * FROM categories ORDER BY name", (err, results) => {
    if (err) return res.status(500).json({ message: "Greška.", error: err });
    res.json(results);
  });
});

router.get("/difficulty-levels", (req, res) => {
  db.query("SELECT * FROM difficulty_levels ORDER BY id", (err, results) => {
    if (err) return res.status(500).json({ message: "Greška.", error: err });
    res.json(results);
  });
});

router.get("/materials", (req, res) => {
  db.query("SELECT * FROM materials ORDER BY name", (err, results) => {
    if (err) return res.status(500).json({ message: "Greška.", error: err });
    res.json(results);
  });
});

router.get("/tags", (req, res) => {
  db.query("SELECT * FROM tags ORDER BY name", (err, results) => {
    if (err) return res.status(500).json({ message: "Greška.", error: err });
    res.json(results);
  });
});

router.get("/collection-statuses", (req, res) => {
  db.query("SELECT * FROM collection_statuses ORDER BY id", (err, results) => {
    if (err) return res.status(500).json({ message: "Greška.", error: err });
    res.json(results);
  });
});

// DODAVANJE PROJEKTA
router.post("/projects", authenticateToken, (req, res) => {
  const {
    title,
    description,
    estimated_time,
    pattern_text,
    difficulty_id,
    category_id,
    cover_image,
    tag_ids,
    material_ids,
  } = req.body;

  if (!title || !description || !pattern_text || !difficulty_id || !category_id) {
    return res.status(400).json({ message: "Obavezna polja nisu popunjena." });
  }

  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ message: "Greška pri transakciji.", error: err });
    }

    const projectSql = `
      INSERT INTO projects 
      (title, description, estimated_time, pattern_text, difficulty_id, author_id, category_id, cover_image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      projectSql,
      [
        title,
        description,
        estimated_time,
        pattern_text,
        difficulty_id,
        req.user.id,
        category_id,
        cover_image,
      ],
      (err, result) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ message: "Greška pri dodavanju projekta.", error: err });
          });
        }

        const projectId = result.insertId;

        const tagValues = Array.isArray(tag_ids)
          ? tag_ids.map((tagId) => [projectId, tagId])
          : [];

        const materialValues = Array.isArray(material_ids)
          ? material_ids.map((materialId) => [projectId, materialId])
          : [];

        const insertTags = (callback) => {
          if (tagValues.length === 0) return callback();

          db.query(
            "INSERT INTO project_tags (project_id, tag_id) VALUES ?",
            [tagValues],
            callback
          );
        };

        const insertMaterials = (callback) => {
          if (materialValues.length === 0) return callback();

          db.query(
            "INSERT INTO project_materials (project_id, material_id) VALUES ?",
            [materialValues],
            callback
          );
        };

        insertTags((err) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({ message: "Greška pri dodavanju tagova.", error: err });
            });
          }

          insertMaterials((err) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ message: "Greška pri dodavanju materijala.", error: err });
              });
            }

            db.commit((err) => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).json({ message: "Greška pri čuvanju projekta.", error: err });
                });
              }

              res.status(201).json({
                message: "Projekat uspješno dodat.",
                projectId,
              });
            });
          });
        });
      }
    );
  });
});

module.exports = router;