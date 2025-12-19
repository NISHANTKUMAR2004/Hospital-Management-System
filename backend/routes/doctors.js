const express = require("express");
const db = require("../db");

const router = express.Router();

/**
 * ADD NEW DOCTOR
 * POST /api/doctors
 */
router.post("/", (req, res) => {
  const { name, specialization, availability, contact, status } = req.body;

  if (!name || !specialization || !availability || !contact) {
    return res.json({
      success: false,
      message: "Missing required doctor fields"
    });
  }

  const query = `
    INSERT INTO doctors
    (name, specialization, availability, contact, status)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [name, specialization, availability, contact, status || "Active"],
    function (err) {
      if (err) {
        return res.json({
          success: false,
          message: "Database error while adding doctor"
        });
      }

      res.json({
        success: true,
        message: "Doctor added successfully",
        doctorId: this.lastID
      });
    }
  );
});

/**
 * GET ALL DOCTORS
 * GET /api/doctors
 */
router.get("/", (req, res) => {
  db.all("SELECT * FROM doctors", [], (err, rows) => {
    if (err) {
      return res.json({
        success: false,
        message: "Failed to fetch doctors"
      });
    }

    res.json({
      success: true,
      data: rows
    });
  });
});

module.exports = router;
