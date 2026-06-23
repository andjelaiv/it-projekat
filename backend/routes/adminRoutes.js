const express = require("express");
const db = require("../db");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// ADMIN - STATISTIKA
router.get("/admin/stats", authenticateToken, isAdmin, (req, res) => {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM users) AS users_count,
      (SELECT COUNT(*) FROM projects) AS projects_count,
      (SELECT COUNT(*) FROM reviews) AS reviews_count,
      (SELECT COUNT(*) FROM favorites) AS favorites_count
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Greška pri učitavanju statistike.",
        error: err,
      });
    }

    res.json(results[0]);
  });
});

// ADMIN - PREGLED SVIH KORISNIKA
router.get("/admin/users", authenticateToken, isAdmin, (req, res) => {
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

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Greška pri učitavanju korisnika.",
        error: err,
      });
    }

    res.json(results);
  });
});

// ADMIN - PROMJENA ROLE KORISNIKA
router.put("/admin/users/:id/role", authenticateToken, isAdmin, (req, res) => {
  const userId = req.params.id;
  const { role_id } = req.body;

  if (!role_id) {
    return res.status(400).json({
      message: "role_id je obavezan.",
    });
  }

  const sql = "UPDATE users SET role_id = ? WHERE id = ?";

  db.query(sql, [role_id, userId], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Greška pri promjeni role.",
        error: err,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Korisnik nije pronađen.",
      });
    }

    res.json({
      message: "Rola korisnika uspješno promijenjena.",
    });
  });
});

// ADMIN - BRISANJE KORISNIKA
router.delete("/admin/users/:id", authenticateToken, isAdmin, (req, res) => {
  const userId = req.params.id;

  if (Number(userId) === req.user.id) {
    return res.status(400).json({
      message: "Ne možeš obrisati svoj nalog dok si ulogovana kao admin.",
    });
  }

  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({
        message: "Greška pri transakciji.",
        error: err,
      });
    }

    db.query("DELETE FROM reviews WHERE user_id = ?", [userId], (err) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).json({ message: "Greška pri brisanju recenzija korisnika.", error: err });
        });
      }

      db.query("DELETE FROM favorites WHERE user_id = ?", [userId], (err) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ message: "Greška pri brisanju favorita korisnika.", error: err });
          });
        }

        db.query("DELETE FROM collection WHERE user_id = ?", [userId], (err) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({ message: "Greška pri brisanju kolekcije korisnika.", error: err });
            });
          }

          db.query("DELETE FROM users WHERE id = ?", [userId], (err, result) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ message: "Greška pri brisanju korisnika.", error: err });
              });
            }

            if (result.affectedRows === 0) {
              return db.rollback(() => {
                res.status(404).json({ message: "Korisnik nije pronađen." });
              });
            }

            db.commit((err) => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).json({ message: "Greška pri potvrdi brisanja.", error: err });
                });
              }

              res.json({
                message: "Korisnik uspješno obrisan.",
              });
            });
          });
        });
      });
    });
  });
});

module.exports = router;