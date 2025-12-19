const express = require("express");
const router = express.Router();
const db = require("../db");

/* ================= GET ALL APPOINTMENTS ================= */
router.get("/", (req, res) => {
  db.all("SELECT * FROM appointments", [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true, data: rows });
  });
});

/* ================= CREATE APPOINTMENT ================= */
router.post("/", (req, res) => {
  const { patient_id, doctor_id, date, time, status } = req.body;

  db.run(
    `INSERT INTO appointments (patient_id, doctor_id, date, time, status)
     VALUES (?, ?, ?, ?, ?)`,
    [patient_id, doctor_id, date, time, status],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false });
      }
      res.json({
        success: true,
        appointment_id: this.lastID
      });
    }
  );
});

/* ================= RESOLVE APPOINTMENT ================= */
router.put("/:id", (req, res) => {
  const { diagnosis, treatment } = req.body;
  const appointmentId = req.params.id;

  // 1️⃣ Get appointment details
  db.get(
    `SELECT a.id, a.patient_id, a.doctor_id, a.date, a.time,
            p.name AS patient_name,
            d.name AS doctor_name
     FROM appointments a
     LEFT JOIN patients p ON p.id = a.patient_id
     LEFT JOIN doctors d ON d.id = a.doctor_id
     WHERE a.id = ?`,
    [appointmentId],
    (err, row) => {
      if (err || !row) {
        console.error(err);
        return res.status(500).json({ success: false });
      }

      const patientId = row.patient_id;

      // 2️⃣ Update appointment status
      db.run(
        `UPDATE appointments
         SET status = 'Completed',
             diagnosis = ?,
             treatment = ?
         WHERE id = ?`,
        [diagnosis, treatment, appointmentId],
        function (err) {
          if (err) {
            console.error(err);
            return res.status(500).json({ success: false });
          }

          // 3️⃣ DELETE patient automatically
          db.run(
            "DELETE FROM patients WHERE id = ?",
            [patientId],
            () => {
              // 4️⃣ Send discharge slip data
              res.json({
                success: true,
                slip: {
                  appointment_id: row.id,
                  patient_id: row.patient_id,
                  patient_name: row.patient_name,
                  doctor_id: row.doctor_id,
                  doctor_name: row.doctor_name,
                  date: row.date,
                  time: row.time,
                  diagnosis,
                  treatment,
                  discharge_date: new Date().toLocaleDateString()
                }
              });
            }
          );
        }
      );
    }
  );
});

module.exports = router;
