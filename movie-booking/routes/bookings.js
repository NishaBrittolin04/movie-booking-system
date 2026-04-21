// routes/bookings.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const requireAuth = (req, res, next) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
    next();
};

// Book a seat
router.post('/', requireAuth, async (req, res) => {
    const { movie_id, seat_id } = req.body;
    const user_id = req.session.user.id;
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        // Check seat availability
        const [seatRows] = await conn.query('SELECT s.*, m.price_upper, m.price_middle, m.price_lower FROM seats s JOIN movies m ON s.movie_id = m.id WHERE s.id = ? AND s.movie_id = ? FOR UPDATE', [seat_id, movie_id]);
        if (!seatRows.length) throw new Error('Seat not found');
        const seat = seatRows[0];
        if (seat.is_booked) throw new Error('Seat already booked');

        // Calculate price
        let price = seat.seat_level === 'upper' ? seat.price_upper : seat.seat_level === 'middle' ? seat.price_middle : seat.price_lower;

        // Mark seat as booked
        await conn.query('UPDATE seats SET is_booked = 1 WHERE id = ?', [seat_id]);

        // Create booking
        const ref = 'BK' + uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
        await conn.query('INSERT INTO bookings (user_id, movie_id, seat_id, booking_reference, total_amount) VALUES (?, ?, ?, ?, ?)', [user_id, movie_id, seat_id, ref, price]);

        await conn.commit();
        res.json({ success: true, booking_reference: ref, amount: price });
    } catch (err) {
        await conn.rollback();
        res.status(400).json({ error: err.message });
    } finally {
        conn.release();
    }
});

// Get user's bookings
router.get('/my', requireAuth, async (req, res) => {
    try {
        const [bookings] = await db.query(`
            SELECT b.*, m.title, m.show_date, m.show_time, m.genre, m.language,
                s.seat_level, s.seat_number
            FROM bookings b
            JOIN movies m ON b.movie_id = m.id
            JOIN seats s ON b.seat_id = s.id
            WHERE b.user_id = ?
            ORDER BY b.booking_date DESC
        `, [req.session.user.id]);
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Cancel a booking
router.patch('/:id/cancel', requireAuth, async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const [rows] = await conn.query('SELECT * FROM bookings WHERE id = ? AND user_id = ?', [req.params.id, req.session.user.id]);
        if (!rows.length) throw new Error('Booking not found');
        if (rows[0].status === 'cancelled') throw new Error('Already cancelled');

        await conn.query('UPDATE bookings SET status = "cancelled" WHERE id = ?', [req.params.id]);
        await conn.query('UPDATE seats SET is_booked = 0 WHERE id = ?', [rows[0].seat_id]);

        await conn.commit();
        res.json({ success: true });
    } catch (err) {
        await conn.rollback();
        res.status(400).json({ error: err.message });
    } finally {
        conn.release();
    }
});

module.exports = router;
