const multer = require("multer");
const path = require("path");
const express = require("express");
const db = require("../db");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });
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
// SVI PROJEKTI + PRETRAGA + FILTERI + SORTIRANJE
router.get("/projects", (req, res) => {
  const { search, category, difficulty, tag, material, rating, sort } = req.query;

  let sql = `
    SELECT DISTINCT
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
      COALESCE(AVG(r.rating), 0) AS average_rating,
      COUNT(DISTINCT r.id) AS review_count
    FROM projects p
    JOIN users u ON p.author_id = u.id
    JOIN categories c ON p.category_id = c.id
    JOIN difficulty_levels d ON p.difficulty_id = d.id
    LEFT JOIN reviews r ON p.id = r.project_id
    LEFT JOIN project_tags pt ON p.id = pt.project_id
    LEFT JOIN project_materials pm ON p.id = pm.project_id
    WHERE 1 = 1
  `;

  const params = [];

  if (search) {
    sql += " AND p.title LIKE ?";
    params.push(`%${search}%`);
  }

  if (category) {
    sql += " AND p.category_id = ?";
    params.push(category);
  }

  if (difficulty) {
    sql += " AND p.difficulty_id = ?";
    params.push(difficulty);
  }

  if (tag) {
    sql += " AND pt.tag_id = ?";
    params.push(tag);
  }

  if (material) {
    sql += " AND pm.material_id = ?";
    params.push(material);
  }

  sql += `
    GROUP BY 
      p.id, p.title, p.description, p.estimated_time, p.cover_image,
      p.is_featured, p.created_at, u.username, c.name, d.name
  `;

  if (rating) {
    sql += " HAVING average_rating >= ?";
    params.push(rating);
  }

  if (sort === "rating") {
    sql += " ORDER BY average_rating DESC";
  } else if (sort === "popular") {
    sql += " ORDER BY review_count DESC";
  } else {
    sql += " ORDER BY p.created_at DESC";
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Greška pri učitavanju projekata.",
        error: err,
      });
    }

    res.json(results);
  });
});
// FEATURED PROJEKTI
// FEATURED PROJEKTI
router.get("/projects/featured", (req, res) => {
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
      COALESCE(AVG(r.rating), 0) AS average_rating,
      COUNT(DISTINCT r.id) AS review_count
    FROM projects p
    JOIN users u ON p.author_id = u.id
    JOIN categories c ON p.category_id = c.id
    JOIN difficulty_levels d ON p.difficulty_id = d.id
    LEFT JOIN reviews r ON p.id = r.project_id
    WHERE p.is_featured = true
    GROUP BY
      p.id, p.title, p.description, p.estimated_time, p.cover_image,
      p.is_featured, p.created_at, u.username, c.name, d.name
    ORDER BY p.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Greška pri učitavanju featured projekata.",
        error: err,
      });
    }

    res.json(results);
  });
});
// ADMIN - OZNAČAVANJE PROJEKTA KAO FEATURED
router.put("/projects/:id/featured", authenticateToken, (req, res) => {
  const projectId = req.params.id;
  const { is_featured } = req.body;

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Samo admin može označiti projekat kao featured.",
    });
  }

  const sql = "UPDATE projects SET is_featured = ? WHERE id = ?";

  db.query(sql, [is_featured, projectId], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Greška pri ažuriranju featured statusa.",
        error: err,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Projekat nije pronađen.",
      });
    }

    res.json({
      message: "Featured status uspješno ažuriran.",
    });
  });
});
// SLIKE PROJEKTA
router.get("/projects/:id/images", (req, res) => {
  const projectId = req.params.id;

  const sql = `
    SELECT 
      id,
      project_id,
      image_url,
      image_type
    FROM project_images
    WHERE project_id = ?
    ORDER BY id ASC
  `;

  db.query(sql, [projectId], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Greška pri učitavanju slika projekta.",
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
        u.id AS author_id,
        u.username AS author,
        c.id AS category_id,
        c.name AS category,
        d.id AS difficulty_id,
        d.name AS difficulty,
        COALESCE((SELECT AVG(r.rating) FROM reviews r WHERE r.project_id = p.id), 0) AS average_rating,
        (SELECT COUNT(*) FROM reviews r WHERE r.project_id = p.id) AS review_count
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
// UPLOAD COVER SLIKE
router.post(
  "/projects/:id/cover",
  authenticateToken,
  upload.single("cover"),
  (req, res) => {
    const projectId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ message: "Slika nije poslata." });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    const sql = "UPDATE projects SET cover_image = ? WHERE id = ?";

    db.query(sql, [imagePath, projectId], (err) => {
      if (err) {
        return res.status(500).json({
          message: "Greška pri čuvanju cover slike.",
          error: err,
        });
      }

      res.json({
        message: "Cover slika uspješno uploadovana.",
        cover_image: imagePath,
      });
    });
  }
);
// UPLOAD DODATNIH SLIKA PROJEKTA
router.post(
  "/projects/:id/images",
  authenticateToken,
  upload.array("images", 10),
  (req, res) => {
    const projectId = req.params.id;
    const { image_type } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Nijedna slika nije poslata." });
    }

    if (!image_type) {
      return res.status(400).json({ message: "Tip slike je obavezan." });
    }

    const values = req.files.map((file) => [
      projectId,
      `/uploads/${file.filename}`,
      image_type,
    ]);

    const sql = `
      INSERT INTO project_images (project_id, image_url, image_type)
      VALUES ?
    `;

    db.query(sql, [values], (err) => {
      if (err) {
        return res.status(500).json({
          message: "Greška pri čuvanju slika.",
          error: err,
        });
      }

      res.status(201).json({
        message: "Slike uspješno uploadovane.",
        images: values,
      });
    });
  }
);
// SLIČNI PROJEKTI
router.get("/projects/:id/similar", (req, res) => {
  const projectId = req.params.id;

  const sql = `
    SELECT DISTINCT
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
    LEFT JOIN project_tags pt ON p.id = pt.project_id
    WHERE p.id != ?
      AND (
        p.category_id = (SELECT category_id FROM projects WHERE id = ?)
        OR pt.tag_id IN (
          SELECT tag_id FROM project_tags WHERE project_id = ?
        )
      )
    ORDER BY p.created_at DESC
    LIMIT 4
  `;

  db.query(sql, [projectId, projectId, projectId], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Greška pri učitavanju sličnih projekata.",
        error: err,
      });
    }

    res.json(results);
  });
});
module.exports = router;