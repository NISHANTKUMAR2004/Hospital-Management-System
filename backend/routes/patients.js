const express = require("express");
const db = require("../db");

const router = express.Router();

/**
 * REGISTER NEW PATIENT
 * POST /api/patients
 */
router.post("/", (req, res) => {
  const {
    id,
    name,
    age,
    gender,
    disease,
    contact,
    priority,
    doctor_assigned,
    status
  } = req.body;

  if (!id || !name || !age || !gender) {
    return res.json({
      success: false,
      message: "Missing required patient fields"
    });
  }

  const query = `
    INSERT INTO patients
    (id, name, age, gender, disease, contact, priority, doctor_assigned, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [
      id,
      name,
      age,
      gender,
      disease,
      contact,
      priority,
      doctor_assigned,
      status
    ],
    function (err) {
      if (err) {
        return res.json({
          success: false,
          message: "Patient already exists or database error"
        });
      }

      res.json({
        success: true,
        message: "Patient registered successfully",
        patientId: id
      });
    }
  );
});

/**
 * GET ALL PATIENTS
 * GET /api/patients
 */
router.get("/", (req, res) => {
  db.all("SELECT * FROM patients", [], (err, rows) => {
    if (err) {
      return res.json({
        success: false,
        message: "Failed to fetch patients"
      });
    }

    res.json({
      success: true,
      data: rows
    });
  });
});

module.exports = router;
