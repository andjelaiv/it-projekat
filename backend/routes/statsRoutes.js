const express = require("express");
const db = require("../db");

const router = express.Router();

// JAVNA STATISTIKA ZA POČETNU STRANICU
router.get("/stats/home", (req, res) => {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM projects) AS projects_count,
      (SELECT COUNT(*) FROM users) AS users_count,
      (SELECT COUNT(*) FROM reviews) AS reviews_count
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

module.exports = router;