const express = require("express");
const db = require("../db");
const {
  authenticateToken,
  isAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ADMIN - STATISTIKA
router.get(
  "/admin/stats",
  authenticateToken,
  isAdmin,
  (req, res) => {
    const sql = `
      SELECT
        (SELECT COUNT(*) FROM users) AS users_count,
        (SELECT COUNT(*) FROM projects) AS projects_count,
        (SELECT COUNT(*) FROM reviews) AS reviews_count,
        (SELECT COUNT(*) FROM favorites) AS favorites_count
    `;

    db.query(sql, (error, results) => {
      if (error) {
        return res.status(500).json({
          message: "Greška pri učitavanju statistike.",
          error,
        });
      }

      res.json(results[0]);
    });
  }
);

// ADMIN - PREGLED SVIH KORISNIKA
router.get(
  "/admin/users",
  authenticateToken,
  isAdmin,
  (req, res) => {
    const sql = `
      SELECT
        u.id,
        u.username,
        u.email,
        r.name AS role,
        u.created_at
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC
    `;

    db.query(sql, (error, results) => {
      if (error) {
        return res.status(500).json({
          message: "Greška pri učitavanju korisnika.",
          error,
        });
      }

      res.json(results);
    });
  }
);

// ADMIN - PROMJENA ROLE KORISNIKA
router.put(
  "/admin/users/:id/role",
  authenticateToken,
  isAdmin,
  (req, res) => {
    const userId = Number(req.params.id);
    const roleId = Number(req.body.role_id);

    if (!userId) {
      return res.status(400).json({
        message: "ID korisnika nije validan.",
      });
    }

    if (roleId !== 1 && roleId !== 2) {
      return res.status(400).json({
        message: "Rola nije validna.",
      });
    }

    const sql = `
      UPDATE users
      SET role_id = ?
      WHERE id = ?
    `;

    db.query(sql, [roleId, userId], (error, result) => {
      if (error) {
        return res.status(500).json({
          message: "Greška pri promjeni role.",
          error,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Korisnik nije pronađen.",
        });
      }

      const newRole = roleId === 1 ? "admin" : "user";

      res.json({
        message: "Rola korisnika uspješno promijenjena.",
        role: newRole,
      });
    });
  }
);

// ADMIN - BRISANJE KORISNIKA
router.delete(
  "/admin/users/:id",
  authenticateToken,
  isAdmin,
  (req, res) => {
    const userId = Number(req.params.id);

    if (!userId) {
      return res.status(400).json({
        message: "ID korisnika nije validan.",
      });
    }

    db.beginTransaction((transactionError) => {
      if (transactionError) {
        return res.status(500).json({
          message: "Greška pri pokretanju transakcije.",
          error: transactionError,
        });
      }

      db.query(
        "DELETE FROM reviews WHERE user_id = ?",
        [userId],
        (reviewsError) => {
          if (reviewsError) {
            return db.rollback(() => {
              res.status(500).json({
                message:
                  "Greška pri brisanju recenzija korisnika.",
                error: reviewsError,
              });
            });
          }

          db.query(
            "DELETE FROM favorites WHERE user_id = ?",
            [userId],
            (favoritesError) => {
              if (favoritesError) {
                return db.rollback(() => {
                  res.status(500).json({
                    message:
                      "Greška pri brisanju favorita korisnika.",
                    error: favoritesError,
                  });
                });
              }

              db.query(
                "DELETE FROM collection WHERE user_id = ?",
                [userId],
                (collectionError) => {
                  if (collectionError) {
                    return db.rollback(() => {
                      res.status(500).json({
                        message:
                          "Greška pri brisanju kolekcije korisnika.",
                        error: collectionError,
                      });
                    });
                  }

                  db.query(
                    "DELETE FROM users WHERE id = ?",
                    [userId],
                    (userError, result) => {
                      if (userError) {
                        return db.rollback(() => {
                          res.status(500).json({
                            message:
                              "Greška pri brisanju korisnika.",
                            error: userError,
                          });
                        });
                      }

                      if (result.affectedRows === 0) {
                        return db.rollback(() => {
                          res.status(404).json({
                            message:
                              "Korisnik nije pronađen.",
                          });
                        });
                      }

                      db.commit((commitError) => {
                        if (commitError) {
                          return db.rollback(() => {
                            res.status(500).json({
                              message:
                                "Greška pri potvrdi brisanja.",
                              error: commitError,
                            });
                          });
                        }

                        res.json({
                          message:
                            "Korisnik uspješno obrisan.",
                        });
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  }
);

module.exports = router;