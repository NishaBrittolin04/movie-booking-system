// routes/movies.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Middleware
const requireAuth = (req, res, next) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
    next();
};
const requireManager = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'manager') return res.status(403).json({ error: 'Forbidden' });
    next();
};

// Get all active movies
router.get('/', requireAuth, async (req, res) => {
    try {
        const [movies] = await db.query(`
            SELECT m.*,
                COUNT(s.id) AS total_seats,
                SUM(CASE WHEN s.is_booked = 1 THEN 1 ELSE 0 END) AS booked_seats,
                SUM(CASE WHEN s.is_booked = 0 THEN 1 ELSE 0 END) AS available_seats
            FROM movies m
            LEFT JOIN seats s ON m.id = s.movie_id
            WHERE m.is_active = 1
            GROUP BY m.id
            ORDER BY m.show_date, m.show_time
        `);
        res.json(movies);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get movie details with seat breakdown by level
router.get('/:id/seats', requireAuth, async (req, res) => {
    try {
        const [movie] = await db.query('SELECT * FROM movies WHERE id = ?', [req.params.id]);
        if (!movie.length) return res.status(404).json({ error: 'Movie not found' });

        const [seats] = await db.query('SELECT * FROM seats WHERE movie_id = ? ORDER BY seat_level, seat_number', [req.params.id]);

        const [stats] = await db.query(`
            SELECT seat_level,
                COUNT(*) AS total,
                SUM(is_booked) AS booked,
                SUM(CASE WHEN is_booked = 0 THEN 1 ELSE 0 END) AS available
            FROM seats WHERE movie_id = ?
            GROUP BY seat_level
        `, [req.params.id]);

        res.json({ movie: movie[0], seats, stats });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Manager: Get full analytics for a movie
router.get('/:id/analytics', requireManager, async (req, res) => {
    try {
        const [movie] = await db.query('SELECT * FROM movies WHERE id = ?', [req.params.id]);
        if (!movie.length) return res.status(404).json({ error: 'Movie not found' });

        const [levelStats] = await db.query(`
            SELECT s.seat_level,
                COUNT(*) AS total,
                SUM(s.is_booked) AS booked,
                SUM(CASE WHEN s.is_booked = 0 THEN 1 ELSE 0 END) AS available,
                SUM(CASE WHEN s.is_booked = 1 THEN 
                    CASE s.seat_level 
                        WHEN 'upper' THEN m.price_upper 
                        WHEN 'middle' THEN m.price_middle 
                        ELSE m.price_lower 
                    END ELSE 0 END) AS revenue
            FROM seats s
            JOIN movies m ON s.movie_id = m.id
            WHERE s.movie_id = ?
            GROUP BY s.seat_level
        `, [req.params.id]);

        const [recentBookings] = await db.query(`
            SELECT b.booking_reference, u.name AS user_name, u.email,
                s.seat_level, s.seat_number, b.total_amount, b.booking_date, b.status
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN seats s ON b.seat_id = s.id
            WHERE b.movie_id = ?
            ORDER BY b.booking_date DESC
            LIMIT 20
        `, [req.params.id]);

        const [seats] = await db.query('SELECT * FROM seats WHERE movie_id = ? ORDER BY seat_level, seat_number', [req.params.id]);

        res.json({ movie: movie[0], levelStats, recentBookings, seats });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Manager: Add a movie
router.post('/', requireManager, async (req, res) => {
    const { title, genre, duration, language, rating, description, show_date, show_time, price_upper, price_middle, price_lower } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO movies (title, genre, duration, language, rating, description, show_date, show_time, price_upper, price_middle, price_lower) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, genre, duration, language, rating, description, show_date, show_time, price_upper, price_middle, price_lower]
        );
        const movieId = result.insertId;

        // Generate seats
        const upperRows = ['A', 'B', 'C'];
        const middleRows = ['D', 'E', 'F', 'G'];
        const lowerRows = ['H', 'I', 'J', 'K', 'L'];
        const seatInserts = [];

        upperRows.forEach(row => { for (let i = 1; i <= 10; i++) seatInserts.push([movieId, 'upper', `${row}${i}`]); });
        middleRows.forEach(row => { for (let i = 1; i <= 10; i++) seatInserts.push([movieId, 'middle', `${row}${i}`]); });
        lowerRows.forEach(row => { for (let i = 1; i <= 10; i++) seatInserts.push([movieId, 'lower', `${row}${i}`]); });

        await db.query('INSERT INTO seats (movie_id, seat_level, seat_number) VALUES ?', [seatInserts]);
        res.json({ success: true, movieId });
    } catch (err) {
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// Manager: Toggle movie active status
router.patch('/:id/toggle', requireManager, async (req, res) => {
    try {
        await db.query('UPDATE movies SET is_active = NOT is_active WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Manager: All movies including inactive
router.get('/all/list', requireManager, async (req, res) => {
    try {
        const [movies] = await db.query(`
            SELECT m.*,
                COUNT(s.id) AS total_seats,
                SUM(CASE WHEN s.is_booked = 1 THEN 1 ELSE 0 END) AS booked_seats,
                SUM(CASE WHEN s.is_booked = 0 THEN 1 ELSE 0 END) AS available_seats,
                COALESCE(SUM(b.total_amount), 0) AS total_revenue
            FROM movies m
            LEFT JOIN seats s ON m.id = s.movie_id
            LEFT JOIN bookings b ON b.movie_id = m.id AND b.status = 'confirmed'
            GROUP BY m.id
            ORDER BY m.show_date, m.show_time
        `);
        res.json(movies);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
