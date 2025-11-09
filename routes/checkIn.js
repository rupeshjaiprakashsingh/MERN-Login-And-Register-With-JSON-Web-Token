const express = require('express');
const router = express.Router();
const { 
    createCheckIn, 
    getUserCheckIns, 
    getCheckIn,
    getTodayCheckIn 
} = require('../controllers/checkIn');
const authenticateUser = require('../middleware/auth');

// All routes require authentication
router.use(authenticateUser);

// Test authentication
router.get('/test', (req, res) => {
    res.json({ 
        message: 'Authentication working', 
        user: req.user 
    });
});

// Create new check-in
router.post('/', createCheckIn);

// Get all check-ins for the user
router.get('/', getUserCheckIns);

// Get today's check-in status
router.get('/today', getTodayCheckIn);

// Get specific check-in by ID
router.get('/:id', getCheckIn);

module.exports = router;