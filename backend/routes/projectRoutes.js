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
// SVI PROJEKTI
router.get("/projects", (req, res) => {
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
      d.name AS difficulty
    FROM projects p
    JOIN users u ON p.author_id = u.id
    JOIN categories c ON p.category_id = c.id
    JOIN difficulty_levels d ON p.difficulty_id = d.id
    ORDER BY p.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Greška pri učitavanju projekata.",
        error: err,
      });
    }

    res.json(results);
  });
});
// DETALJI JEDNOG PROJEKTA
router.get("/projects/:id", (req, res) => {
  const projectId = req.params.id;

  const projectSql = `
    SELECT
      p.id,
      p.title,
      p.description,
      p.estimated_time,
      p.pattern_text,
      p.cover_image,
      p.is_featured,
      p.created_at,
      u.username AS author,
      c.name AS category,
      d.name AS difficulty
    FROM projects p
    JOIN users u ON p.author_id = u.id
    JOIN categories c ON p.category_id = c.id
    JOIN difficulty_levels d ON p.difficulty_id = d.id
    WHERE p.id = ?
  `;

  db.query(projectSql, [projectId], (err, projectResults) => {
    if (err) {
      return res.status(500).json({ message: "Greška pri učitavanju projekta.", error: err });
    }

    if (projectResults.length === 0) {
      return res.status(404).json({ message: "Projekat nije pronađen." });
    }

    const project = projectResults[0];

    const tagsSql = `
      SELECT t.id, t.name
      FROM tags t
      JOIN project_tags pt ON t.id = pt.tag_id
      WHERE pt.project_id = ?
    `;

    const materialsSql = `
      SELECT m.id, m.name
      FROM materials m
      JOIN project_materials pm ON m.id = pm.material_id
      WHERE pm.project_id = ?
    `;

    db.query(tagsSql, [projectId], (err, tags) => {
      if (err) {
        return res.status(500).json({ message: "Greška pri učitavanju tagova.", error: err });
      }

      db.query(materialsSql, [projectId], (err, materials) => {
        if (err) {
          return res.status(500).json({ message: "Greška pri učitavanju materijala.", error: err });
        }

        res.json({
          ...project,
          tags,
          materials,
        });
      });
    });
  });
});
// UREĐIVANJE PROJEKTA
router.put("/projects/:id", authenticateToken, (req, res) => {
  const projectId = req.params.id;

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

  const checkSql = "SELECT * FROM projects WHERE id = ?";

  db.query(checkSql, [projectId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Greška pri provjeri projekta.", error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Projekat nije pronađen." });
    }

    const project = results[0];

    if (project.author_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Nemaš dozvolu za uređivanje ovog projekta." });
    }

    db.beginTransaction((err) => {
      if (err) {
        return res.status(500).json({ message: "Greška pri transakciji.", error: err });
      }

      const updateSql = `
        UPDATE projects
        SET title = ?, description = ?, estimated_time = ?, pattern_text = ?,
            difficulty_id = ?, category_id = ?, cover_image = ?
        WHERE id = ?
      `;

      db.query(
        updateSql,
        [
          title,
          description,
          estimated_time,
          pattern_text,
          difficulty_id,
          category_id,
          cover_image,
          projectId,
        ],
        (err) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({ message: "Greška pri uređivanju projekta.", error: err });
            });
          }

          db.query("DELETE FROM project_tags WHERE project_id = ?", [projectId], (err) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ message: "Greška pri brisanju starih tagova.", error: err });
              });
            }

            db.query("DELETE FROM project_materials WHERE project_id = ?", [projectId], (err) => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).json({ message: "Greška pri brisanju starih materijala.", error: err });
                });
              }

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
                    res.status(500).json({ message: "Greška pri dodavanju novih tagova.", error: err });
                  });
                }

                insertMaterials((err) => {
                  if (err) {
                    return db.rollback(() => {
                      res.status(500).json({ message: "Greška pri dodavanju novih materijala.", error: err });
                    });
                  }

                  db.commit((err) => {
                    if (err) {
                      return db.rollback(() => {
                        res.status(500).json({ message: "Greška pri čuvanju izmjena.", error: err });
                      });
                    }

                    res.json({ message: "Projekat uspješno izmijenjen." });
                  });
                });
              });
            });
          });
        }
      );
    });
  });
});
// BRISANJE PROJEKTA
router.delete("/projects/:id", authenticateToken, (req, res) => {
  const projectId = req.params.id;

  const checkSql = "SELECT * FROM projects WHERE id = ?";

  db.query(checkSql, [projectId], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Greška pri provjeri projekta.",
        error: err,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Projekat nije pronađen.",
      });
    }

    const project = results[0];

    if (project.author_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Nemaš dozvolu za brisanje ovog projekta.",
      });
    }

    db.beginTransaction((err) => {
      if (err) {
        return res.status(500).json({
          message: "Greška pri transakciji.",
          error: err,
        });
      }

      db.query("DELETE FROM project_tags WHERE project_id = ?", [projectId], (err) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({
              message: "Greška pri brisanju tagova projekta.",
              error: err,
            });
          });
        }

        db.query("DELETE FROM project_materials WHERE project_id = ?", [projectId], (err) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({
                message: "Greška pri brisanju materijala projekta.",
                error: err,
              });
            });
          }

          db.query("DELETE FROM project_images WHERE project_id = ?", [projectId], (err) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({
                  message: "Greška pri brisanju slika projekta.",
                  error: err,
                });
              });
            }

            db.query("DELETE FROM reviews WHERE project_id = ?", [projectId], (err) => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).json({
                    message: "Greška pri brisanju recenzija projekta.",
                    error: err,
                  });
                });
              }

              db.query("DELETE FROM favorites WHERE project_id = ?", [projectId], (err) => {
                if (err) {
                  return db.rollback(() => {
                    res.status(500).json({
                      message: "Greška pri brisanju favorita projekta.",
                      error: err,
                    });
                  });
                }

                db.query("DELETE FROM collection WHERE project_id = ?", [projectId], (err) => {
                  if (err) {
                    return db.rollback(() => {
                      res.status(500).json({
                        message: "Greška pri brisanju kolekcije projekta.",
                        error: err,
                      });
                    });
                  }

                  db.query("DELETE FROM projects WHERE id = ?", [projectId], (err) => {
                    if (err) {
                      return db.rollback(() => {
                        res.status(500).json({
                          message: "Greška pri brisanju projekta.",
                          error: err,
                        });
                      });
                    }

                    db.commit((err) => {
                      if (err) {
                        return db.rollback(() => {
                          res.status(500).json({
                            message: "Greška pri potvrdi brisanja.",
                            error: err,
                          });
                        });
                      }

                      res.json({
                        message: "Projekat uspješno obrisan.",
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});
module.exports = router;