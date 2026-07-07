const express = require("express");
const db = require("../db");
const {
  authenticateToken,
} = require("../middleware/authMiddleware");

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
      (
        SELECT COUNT(*)
        FROM projects
        WHERE author_id = u.id
      ) AS projects_count,
      (
        SELECT COUNT(*)
        FROM favorites
        WHERE user_id = u.id
      ) AS favorites_count,
      (
        SELECT COUNT(*)
        FROM collection
        WHERE user_id = u.id
      ) AS collection_count,
      (
        SELECT COUNT(*)
        FROM reviews
        WHERE user_id = u.id
      ) AS reviews_count
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = ?
  `;

  db.query(sql, [userId], (error, results) => {
    if (error) {
      console.error(
        "Greška pri učitavanju profila:",
        error
      );

      return res.status(500).json({
        message: "Greška pri učitavanju profila.",
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

  db.query(
    sql,
    [username.trim(), email.trim(), userId],
    (error, result) => {
      if (error) {
        if (error.code === "ER_DUP_ENTRY") {
          return res.status(400).json({
            message: "Username ili email već postoji.",
          });
        }

        console.error(
          "Greška pri izmjeni profila:",
          error
        );

        return res.status(500).json({
          message: "Greška pri izmjeni profila.",
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
    }
  );
});

// PROJEKTI TRENUTNO ULOGOVANOG KORISNIKA
router.get(
  "/users/me/projects",
  authenticateToken,
  (req, res) => {
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
        p.author_id,
        u.username AS author,
        c.name AS category,
        d.name AS difficulty,
        COALESCE(AVG(rv.rating), 0) AS average_rating,
        COUNT(DISTINCT rv.id) AS review_count
      FROM projects p
      JOIN users u ON p.author_id = u.id
      JOIN categories c ON p.category_id = c.id
      JOIN difficulty_levels d
        ON p.difficulty_id = d.id
      LEFT JOIN reviews rv
        ON p.id = rv.project_id
      WHERE p.author_id = ?
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

    db.query(sql, [userId], (error, results) => {
      if (error) {
        console.error(
          "Greška pri učitavanju korisnikovih projekata:",
          error
        );

        return res.status(500).json({
          message:
            "Greška pri učitavanju korisnikovih projekata.",
        });
      }

      res.json(results);
    });
  }
);

// JAVNI PROFIL KORISNIKA / AUTORA
router.get("/users/:id", (req, res) => {
  const userId = Number(req.params.id);

  if (!userId) {
    return res.status(400).json({
      message: "ID korisnika nije validan.",
    });
  }

  const sql = `
    SELECT
      u.id,
      u.username,
      r.name AS role,
      u.created_at,
      (
        SELECT COUNT(*)
        FROM projects
        WHERE author_id = u.id
      ) AS projects_count,
      (
        SELECT COUNT(*)
        FROM reviews
        WHERE user_id = u.id
      ) AS reviews_count
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = ?
  `;

  db.query(sql, [userId], (error, results) => {
    if (error) {
      console.error(
        "Greška pri učitavanju javnog profila:",
        error
      );

      return res.status(500).json({
        message: "Greška pri učitavanju javnog profila.",
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

// PROJEKTI ODREĐENOG KORISNIKA
router.get("/users/:id/projects", (req, res) => {
  const userId = Number(req.params.id);

  if (!userId) {
    return res.status(400).json({
      message: "ID korisnika nije validan.",
    });
  }

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
      COALESCE(AVG(rv.rating), 0) AS average_rating,
      COUNT(DISTINCT rv.id) AS review_count
    FROM projects p
    JOIN users u ON p.author_id = u.id
    JOIN categories c ON p.category_id = c.id
    JOIN difficulty_levels d
      ON p.difficulty_id = d.id
    LEFT JOIN reviews rv
      ON p.id = rv.project_id
    WHERE p.author_id = ?
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

  db.query(sql, [userId], (error, results) => {
    if (error) {
      console.error(
        "Greška pri učitavanju projekata korisnika:",
        error
      );

      return res.status(500).json({
        message:
          "Greška pri učitavanju projekata korisnika.",
      });
    }

    res.json(results);
  });
});

// FAVORITI ODREĐENOG KORISNIKA
router.get("/users/:id/favorites", (req, res) => {
  const userId = Number(req.params.id);

  if (!userId) {
    return res.status(400).json({
      message: "ID korisnika nije validan.",
    });
  }

  const sql = `
    SELECT
      p.id,
      p.title,
      p.description,
      p.cover_image,
      p.created_at,
      p.author_id,
      p.is_featured,
      u.username AS author,
      c.name AS category,
      d.name AS difficulty,
      COALESCE(AVG(rv.rating), 0) AS average_rating,
      COUNT(DISTINCT rv.id) AS review_count
    FROM favorites f
    JOIN projects p ON f.project_id = p.id
    JOIN users u ON p.author_id = u.id
    JOIN categories c ON p.category_id = c.id
    JOIN difficulty_levels d
      ON p.difficulty_id = d.id
    LEFT JOIN reviews rv
      ON rv.project_id = p.id
    WHERE f.user_id = ?
    GROUP BY
      p.id,
      p.title,
      p.description,
      p.cover_image,
      p.created_at,
      p.author_id,
      p.is_featured,
      u.username,
      c.name,
      d.name
    ORDER BY p.created_at DESC
  `;

  db.query(sql, [userId], (error, results) => {
    if (error) {
      console.error(
        "Greška pri učitavanju favorita korisnika:",
        error
      );

      return res.status(500).json({
        message:
          "Greška pri učitavanju favorita korisnika.",
      });
    }

    res.json(results);
  });
});

// KOLEKCIJA ODREĐENOG KORISNIKA
router.get("/users/:id/collection", (req, res) => {
  const userId = Number(req.params.id);

  if (!userId) {
    return res.status(400).json({
      message: "ID korisnika nije validan.",
    });
  }

  const sql = `
    SELECT
      p.id,
      p.title,
      p.description,
      p.cover_image,
      p.created_at,
      p.author_id,
      p.is_featured,
      u.username AS author,
      c.name AS category,
      d.name AS difficulty,
      cs.id AS status_id,
      cs.name AS status_name,
      COALESCE(AVG(rv.rating), 0) AS average_rating,
      COUNT(DISTINCT rv.id) AS review_count
    FROM collection col
    JOIN projects p ON col.project_id = p.id
    JOIN users u ON p.author_id = u.id
    JOIN categories c ON p.category_id = c.id
    JOIN difficulty_levels d
      ON p.difficulty_id = d.id
    JOIN collection_statuses cs
      ON col.status_id = cs.id
    LEFT JOIN reviews rv
      ON rv.project_id = p.id
    WHERE col.user_id = ?
    GROUP BY
      p.id,
      p.title,
      p.description,
      p.cover_image,
      p.created_at,
      p.author_id,
      p.is_featured,
      u.username,
      c.name,
      d.name,
      cs.id,
      cs.name,
      col.added_at
    ORDER BY col.added_at DESC
  `;

  db.query(sql, [userId], (error, results) => {
    if (error) {
      console.error(
        "Greška pri učitavanju kolekcije korisnika:",
        error
      );

      return res.status(500).json({
        message:
          "Greška pri učitavanju kolekcije korisnika.",
      });
    }

    res.json(results);
  });
});

module.exports = router;