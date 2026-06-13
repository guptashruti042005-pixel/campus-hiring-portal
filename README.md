Campus Hiring Portal

A full-stack web application for campus placements where recruiters can post jobs and students can browse them. Built to learn and demonstrate the full request → server → database flow, along with secure authentication.

Tech Stack

Frontend: React (Vite)
Backend: Node.js, Express.js
Database: MySQL
Authentication: JWT (JSON Web Tokens), bcrypt for password hashing

Features


Browse available jobs fetched live from the database
Add new jobs via a REST API endpoint
User registration with securely hashed passwords (bcrypt)
User login that issues a JWT on success
Protected routes that require a valid token (middleware-based auth)


API Endpoints

MethodEndpointDescriptionProtectedGET/jobsGet all jobsNoPOST/jobsAdd a new jobNoPOST/registerRegister a new userNoPOST/loginLog in and receive a JWTNoGET/profileGet logged-in user data (token req.)Yes

Project Structure

campus-hiring-portal/
├── server.js          # Express backend (API routes, DB connection, auth)
├── .env               # Secrets (NOT committed — see .env.example)
├── package.json
└── client/            # React frontend (Vite)
    └── src/
        └── App.jsx    # Main component — fetches and displays jobs

Prerequisites


Node.js installed
MySQL Server installed and running


Setup

1. Clone the repository

bashgit clone https://github.com/guptashruti042005-pixel/campus-hiring-portal.git
cd campus-hiring-portal

2. Set up the database

In MySQL, create the database and tables:

sqlCREATE DATABASE campus_portal;
USE campus_portal;

CREATE TABLE jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  company VARCHAR(150) NOT NULL
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

3. Configure environment variables

Create a .env file in the root folder (use .env.example as a reference):

DB_PASSWORD=your_mysql_password
JWT_SECRET=your_secret_key

4. Install backend dependencies and run

bashnpm install
node server.js

The backend runs on http://localhost:5000.

5. Install frontend dependencies and run

bashcd client
npm install
npm run dev

The frontend runs on http://localhost:5173.

Roadmap

Planned features not yet implemented:


Real-time notifications using Socket.io
Role-based access (student / recruiter / admin)
Application tracking (students apply to jobs, recruiters update status)
Frontend pages for login and registration


Notes

This project was built as a learning exercise to understand full-stack development end to end — from database design and REST APIs to authentication and connecting a React frontend to a backend.