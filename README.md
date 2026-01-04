# 📍 Attendance-tracking-web-application OR Geolocation Attendance Management Application (GAMA)

GAMA is a comprehensive full-stack web application designed to manage employee attendance efficiently using real-time geolocation tracking. It provides secure check-in/check-out functionality, role-based access control, and powerful reporting tools to streamline organizational attendance management for businesses of all sizes.

---

## 🚀 Project Overview

GAMA leverages modern web technologies to ensure accurate, secure, and location-based attendance tracking. With separate portals for administrators and employees, the system ensures data integrity, operational transparency, and ease of use across desktop and mobile devices.

---

## ✨ Features

### 👨‍💼 Admin Features
- User management (add, update, delete employees and roles)
- Attendance monitoring and filtering
- Attendance report generation for audits and analysis
- Office geolocation and boundary management (geofencing)
- Admin dashboard with real-time data insights

### 👨‍💻 Employee Features
- Secure check-in and check-out using geolocation
- Real-time attendance status
- Attendance history tracking
- Profile management (personal details and credentials)
- Dedicated employee dashboard

### 🔐 Security & Scalability
- Role-based access control (Admin & Employee)
- Geofencing to restrict attendance marking to authorized locations
- Secure authentication and session management
- Scalable backend architecture

### ⚙️ System Capabilities
- SQL-based data storage with phpMyAdmin
- RESTful APIs for frontend-backend communication
- Cross-browser compatibility
- Responsive UI for mobile and desktop devices
- Real-time data synchronization

---

## 🛠️ Tech Stack

**Frontend**
- React.js
- Material-UI
- CSS
- Axios
- React Router

**Backend**
- Node.js
- Express.js
- RESTful APIs

**Database**
- MySQL (managed via phpMyAdmin)

**Geolocation**
- Geolocation API
- Haversine Formula

**Tools**
- XAMPP
- Git & GitHub

---

## 📂 Project Structure
GAMA/
├── Backend/
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── .env
│ ├── app.js
│ └── server.js
│
├── Frontend/
│ ├── public/
│ ├── src/
│ │ ├── components/
│ │ │ ├── AdminSidebar.jsx
│ │ │ ├── EmployeeSidebar.jsx
│ │ │ └── Navbar.jsx
│ │ ├── pages/
│ │ │ ├── LoginPage.jsx
│ │ │ ├── SignUpPage.jsx
│ │ │ └── Dashboard.jsx
│ │ ├── App.js
│ │ └── index.js
│ ├── .env
│ ├── package.json
│ └── package-lock.json
│
├── Attendance_Geolocation.sql
├── README.md
└── LICENSE



---

## ⚙️ Getting Started

### Step 1: Start XAMPP Server
1. Install XAMPP
2. Start **Apache** and **MySQL**
3. Open phpMyAdmin:

---

### Step 2: Import Database
1. Create a database named:
2. Import:

---
Step 3: Start Backend Server
cd Backend
npm install
nodemon server.js

Step 4: Start Frontend Server
cd Frontend
npm install
npm start

Step 5: Access Application
http://localhost:3000
Login using existing credentials from the database
Or sign up as a new user (Admin / Employee) to explore both portals

🔍 How It Works

User logs in securely
System captures real-time geolocation
Distance is calculated using the Haversine Formula
Attendance is marked only if user is within the authorized office location
Data is stored securely in the MySQL database

🎯 Learning Outcomes

Full-stack web application development
Geolocation-based system design
Role-based access control
REST API development
SQL database integration
Real-time data handling
Git & GitHub version control

