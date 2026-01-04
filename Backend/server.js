const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const moment = require('moment');
const setupWebSocketServer = require('./websocket');

const app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// MySQL connection setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'attendance_tracking'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// Create HTTP server
const server = http.createServer(app);
const { broadcast } = setupWebSocketServer(server);

// Sign-Up Endpoint
app.post('/api/signup', (req, res) => {
  const { name, email, password, position, role } = req.body;
  const createdAt = new Date();

  const sql = `INSERT INTO employees (name, email, password, position, role, created_at) VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(sql, [name, email, password, position, role, createdAt], (err) => {
    if (err) {
      console.error('Error during sign-up:', err);
      return res.status(500).send('Error during sign-up');
    }
    res.send('Sign-up successful');
  });
});

// Login Endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  const sql = `SELECT * FROM employees WHERE email = ? AND password = ?`;
  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).send('Error during login');
    }
    if (results.length > 0) {
      const user = results[0];
      res.send({
        name: user.name,
        role: user.role,
        employeeId: user.id
      });
    } else {
      res.status(401).send('Invalid credentials');
    }
  });
});

// Profile Endpoint
app.post('/api/profile', (req, res) => {
  const { email } = req.body;

  const sql = `SELECT name, email, position FROM employees WHERE email = ?`;
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Error fetching profile:', err);
      return res.status(500).send('Error fetching profile');
    }
    if (results.length > 0) {
      res.send(results[0]);
    } else {
      res.status(404).send('Profile not found');
    }
  });
});

// Automatic Check-In Endpoint
app.post('/checkin', (req, res) => {
  const { employeeId, latitude, longitude } = req.body;
  const location = `${latitude}, ${longitude}`;

  const sql = `INSERT INTO attendance (employee_id, check_in_time, location) VALUES (?, NOW(), ?)`;
  db.query(sql, [employeeId, location], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error during check-in');
    }

    const checkInData = {
      employeeId,
      location,
      check_in_time: new Date()
    };
    broadcast({ type: 'CHECKIN', data: checkInData });
    res.send('Check-in successful');
  });
});

// Manual Check-In Endpoint
app.post('/manual-checkin', (req, res) => {
  const { employeeId, location } = req.body;

  const sql = `INSERT INTO attendance (employee_id, check_in_time, location) VALUES (?, NOW(), ?)`;
  db.query(sql, [employeeId, location], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error during manual check-in');
    }

    const manualCheckInData = {
      employeeId,
      location,
      check_in_time: new Date()
    };
    broadcast({ type: 'MANUAL_CHECKIN', data: manualCheckInData });
    res.send('Manual check-in successful');
  });
});

// Check-Out Endpoint
app.post('/checkout', (req, res) => {
  const { employeeId } = req.body;

  const sql = `SELECT id, check_in_time FROM attendance WHERE employee_id = ? AND check_out_time IS NULL ORDER BY check_in_time DESC LIMIT 1`;
  db.query(sql, [employeeId], (err, result) => {
    if (err) {
      console.error('Error retrieving check-in record:', err);
      return res.status(500).send('Error during check-out');
    }
    if (result.length === 0) {
      return res.status(400).send('No active check-in found');
    }

    const attendanceId = result[0].id;
    const updateSql = `UPDATE attendance SET check_out_time = NOW() WHERE id = ?`;
    db.query(updateSql, [attendanceId], (err) => {
      if (err) {
        console.error('Error updating check-out time:', err);
        return res.status(500).send('Error updating check-out time');
      }

      const verifySql = `SELECT * FROM attendance WHERE id = ?`;
      db.query(verifySql, [attendanceId], (err, updatedResult) => {
        if (err) {
          console.error('Error verifying check-out time:', err);
          return res.status(500).send('Error during verification');
        }

        const updatedRecord = updatedResult[0];
        const checkOutData = {
          employeeId,
          check_in_time: updatedRecord.check_in_time,
          check_out_time: updatedRecord.check_out_time
        };
        broadcast({ type: 'CHECKOUT', data: checkOutData });
        res.send('Check-out successful');
      });
    });
  });
});

// Manual Check-Out Endpoint
app.post('/manual-checkout', (req, res) => {
  const { employeeId, location } = req.body;

  const sql = `UPDATE attendance SET check_out_time = NOW() WHERE employee_id = ? AND check_out_time IS NULL`;
  db.query(sql, [employeeId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error during manual check-out');
    }

    const manualCheckOutData = {
      employeeId,
      location,
      check_out_time: new Date()
    };
    broadcast({ type: 'MANUAL_CHECKOUT', data: manualCheckOutData });
    res.send('Manual check-out successful');
  });
});

// Attendance Records Endpoint
app.get('/attendance/:employeeId', (req, res) => {
  const { employeeId } = req.params;

  const sql = `SELECT * FROM attendance WHERE employee_id = ? ORDER BY check_in_time DESC`;
  db.query(sql, [employeeId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error retrieving attendance records');
    }
    res.json(result);
  });
});

// Nearby Locations Endpoint
app.post('/nearby-locations', (req, res) => {
  const { latitude, longitude } = req.body;
  const locations = [
    { name: "Remote Office", lat: "28.7041", lng: "77.1025" },
    { name: "Client Site", lat: "28.7040", lng: "77.1030" },
    { name: "Partner Office", lat: "28.7035", lng: "77.1020" }
  ];
  res.json({ locations });
});

// Total Hours Calculation Endpoint
app.get('/total-hours', (req, res) => {
  const { employeeId, date } = req.query;
  const selectedDate = date || new Date().toISOString().split('T')[0];

  const sql = `SELECT check_in_time, check_out_time FROM attendance WHERE employee_id = ? AND DATE(check_in_time) = ? AND check_out_time IS NOT NULL`;
  db.query(sql, [employeeId, selectedDate], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error fetching attendance records');
    }

    let totalMinutes = 0;
    results.forEach(record => {
      const checkIn = new Date(record.check_in_time);
      const checkOut = new Date(record.check_out_time);
      if (checkOut > checkIn) {
        const diffMs = checkOut - checkIn;
        const diffMins = diffMs / (1000 * 60);
        totalMinutes += diffMins;
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    res.json({ totalHours: `${hours} hours and ${minutes} minutes` });
  });
});

// Add new employee
app.post('/api/employees', (req, res) => {
    const { name, email, password, position, role } = req.body;
    const createdAt = new Date();

    const sql = `INSERT INTO employees (name, email, password, position, role, created_at) VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(sql, [name, email, password, position, role, createdAt], (err, result) => {
        if (err) {
            console.error('Error adding employee:', err);
            return res.status(500).send('Error adding employee');
        }
        res.send('Employee added successfully');
    });
});

// Edit employee profile
app.put('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, position, role } = req.body;

    const sql = `UPDATE employees SET name = ?, email = ?, position = ?, role = ? WHERE id = ?`;
    db.query(sql, [name, email, position, role, id], (err, result) => {
        if (err) {
            console.error('Error updating employee:', err);
            return res.status(500).send('Error updating employee');
        }
        res.send('Employee updated successfully');
    });
});

// Delete employee profile
app.delete('/api/employees/:id', (req, res) => {
    const { id } = req.params;

    const sql = `DELETE FROM employees WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error deleting employee:', err);
            return res.status(500).send('Error deleting employee');
        }
        res.send('Employee deleted successfully');
    });
});

// View all employee profiles
app.get('/api/employees', (req, res) => {
    const sql = `SELECT * FROM employees ORDER BY created_at DESC`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching employees:', err);
            return res.status(500).send('Error fetching employees');
        }
        res.json(results);
    });
});

// View attendance records for an employee
app.get('/api/attendance/:employeeId', (req, res) => {
    const { employeeId } = req.params;

    const sql = `SELECT * FROM attendance WHERE employee_id = ? ORDER BY check_in_time DESC`;
    db.query(sql, [employeeId], (err, results) => {
        if (err) {
            console.error('Error fetching attendance records:', err);
            return res.status(500).send('Error fetching attendance records');
        }
        res.json(results);
    });
});

// Update attendance record (e.g., approve/reject check-in request)
app.put('/api/attendance/:id', (req, res) => {
    const { id } = req.params;
    const { check_in_time, check_out_time, approved } = req.body;

    const sql = `UPDATE attendance SET check_in_time = ?, check_out_time = ?, approved = ? WHERE id = ?`;
    db.query(sql, [check_in_time, check_out_time, approved, id], (err, result) => {
        if (err) {
            console.error('Error updating attendance record:', err);
            return res.status(500).send('Error updating attendance record');
        }
        res.send('Attendance record updated successfully');
    });
});

// Delete employee profile
app.delete('/api/employees/:id', (req, res) => {
    const { id } = req.params;

    const sql = `DELETE FROM employees WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error deleting employee:', err);
            return res.status(500).send('Error deleting employee');
        }
        res.send('Employee deleted successfully');
    });
});


// Start server
const PORT = 5003;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
