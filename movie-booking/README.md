# 🎬 CineVerse — Movie Ticket Booking System

A full-stack movie ticket booking system with **Manager** and **User** roles, built with HTML, CSS, JavaScript, Node.js, and MySQL (via XAMPP).

---

## 📁 Project Structure

```
movie-booking/
├── server.js              # Main Express server
├── package.json           # Dependencies
├── database.sql           # MySQL setup script
├── config/
│   └── db.js              # Database connection pool
├── routes/
│   ├── auth.js            # Login / Register / Logout
│   ├── movies.js          # Movie CRUD + analytics
│   └── bookings.js        # Booking management
└── public/
    ├── index.html         # Login page
    ├── manager.html       # Manager dashboard
    └── user.html          # User booking interface
```

---

## ⚙️ Setup Instructions

### Step 1: Install XAMPP
- Download from https://www.apachefriends.org/
- Start **Apache** and **MySQL** from the XAMPP Control Panel

### Step 2: Create Database
1. Open **phpMyAdmin** → http://localhost/phpmyadmin
2. Click **Import** tab
3. Choose the `database.sql` file from this project
4. Click **Go** — the database, tables, and sample data will be created

### Step 3: Install Node.js
- Download from https://nodejs.org/ (LTS version recommended)

### Step 4: Install Dependencies
Open a terminal in the project folder and run:
```bash
npm install
```

### Step 5: Start the Server
```bash
npm start
```
Or for development with auto-restart:
```bash
npm run dev
```

### Step 6: Open the App
- Visit: **http://localhost:3000**

---

## 🔑 Demo Credentials

| Role    | Email                  | Password   |
|---------|------------------------|------------|
| Manager | manager@cinema.com     | password   |
| User    | john@email.com         | password   |
| User    | jane@email.com         | password   |

---

## 🎯 Features

### Manager Dashboard
- **Dashboard Overview**: Total movies, seats, bookings, revenue
- **Movie Cards**: Each movie shows overall seat occupancy + breakdown by level
- **Level Analytics**: Upper / Middle / Lower seat counts (booked vs available)
- **Seat Map**: Visual grid showing every seat status per movie
- **Booking Records**: All recent bookings with customer details
- **Add Movie**: Create new shows with auto-generated seats (120 total)
- **Toggle Movies**: Activate/deactivate shows

### User Interface  
- **Movie Listings**: Browse all active shows with pricing & availability
- **Level Filter**: View seat availability by Upper/Middle/Lower tabs
- **Interactive Seat Map**: Click to select available seats
- **Live Booking**: Instant confirmation with unique booking reference
- **My Tickets**: View all bookings with level, seat number, status
- **Cancel Booking**: Cancel confirmed bookings

### Seat Structure (per movie)
| Level   | Rows      | Seats per Row | Total | Price   |
|---------|-----------|---------------|-------|---------|
| Upper   | A, B, C   | 10            | 30    | ₹300    |
| Middle  | D, E, F, G| 10            | 40    | ₹200    |
| Lower   | H,I,J,K,L | 10            | 50    | ₹150    |
| **Total**|          |               | **120**|        |

---

## 🛠 Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MySQL (via XAMPP)
- **Auth**: Express Session + bcrypt password hashing
- **Driver**: mysql2

---

## 🐛 Troubleshooting

**"Cannot connect to database"**  
→ Make sure XAMPP MySQL is running on port 3306  
→ Check `config/db.js` — default password is empty for XAMPP

**"Module not found"**  
→ Run `npm install` in the project folder

**Sessions not persisting**  
→ Make sure cookies are enabled in your browser

**Port 3000 in use**  
→ Change `PORT` in `server.js` to another value like 3001
