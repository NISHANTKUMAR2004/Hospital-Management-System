const express = require("express");
const db = require("../db");

const router = express.Router();

/**
 * ADD STAFF MEMBER
 * POST /api/staff
 */
router.post("/", (req, res) => {
  const { name, role, shift, contact } = req.body;

  if (!name || !role || !shift || !contact) {
    return res.json({
      success: false,
      message: "Missing required staff fields"
    });
  }

  const query = `
    INSERT INTO staff (name, role, shift, contact)
    VALUES (?, ?, ?, ?)
  `;

  db.run(query, [name, role, shift, contact], function (err) {
    if (err) {
      return res.json({
        success: false,
        message: "Database error while adding staff"
      });
    }

    res.json({
      success: true,
      message: "Staff member added successfully",
      staffId: this.lastID
    });
  });
});

/**
 * GET ALL STAFF
 * GET /api/staff
 */
router.get("/", (req, res) => {
  db.all("SELECT * FROM staff", [], (err, rows) => {
    if (err) {
      return res.json({
        success: false,
        message: "Failed to fetch staff"
      });
    }

    res.json({
      success: true,
      data: rows
    });
  });
});

module.exports = router;
