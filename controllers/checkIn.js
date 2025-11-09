const CheckIn = require('../models/CheckIn');
const { StatusCodes } = require('http-status-codes');

const createCheckIn = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('User from auth:', req.user);
        
        // Defensive check: ensure the authentication middleware provided a user
        if (!req.user || !req.user.userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Unauthorized. Missing or invalid token' });
        }
        
        const { checkInLocation, latitude, longitude, currentAddress } = req.body;

        // Check if user already checked in today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const existingCheckIn = await CheckIn.findOne({
            user: req.user.userId,
            createdAt: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        if (existingCheckIn) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                msg: 'You have already checked in today'
            });
        }

        // Create check-in with the user ID from the authenticated request
        const checkIn = await CheckIn.create({
            user: req.user.userId,
            checkInLocation,
            latitude,
            longitude,
            currentAddress
        });

        res.status(StatusCodes.CREATED).json({ checkIn });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ msg: error.message });
    }
};

const getUserCheckIns = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = { user: req.user.userId };

        // Add date range filter if provided
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const checkIns = await CheckIn.find(query)
            .sort('-createdAt')
            .select('checkInLocation currentAddress createdAt dateTime');

        // Format the response with date information
        const formattedCheckIns = checkIns.map(checkIn => ({
            id: checkIn._id,
            location: checkIn.checkInLocation,
            address: checkIn.currentAddress,
            date: checkIn.createdAt.toLocaleDateString(),
            time: checkIn.createdAt.toLocaleTimeString()
        }));

        res.status(StatusCodes.OK).json({ 
            checkIns: formattedCheckIns, 
            count: checkIns.length 
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
    }
};

const getCheckIn = async (req, res) => {
    try {
        const { id: checkInId } = req.params;
        const checkIn = await CheckIn.findOne({
            _id: checkInId,
            user: req.user.userId
        });

        if (!checkIn) {
            return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Check-in not found' });
        }

        res.status(StatusCodes.OK).json({ checkIn });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
    }
};

const getTodayCheckIn = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const checkIn = await CheckIn.findOne({
            user: req.user.userId,
            createdAt: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        res.status(StatusCodes.OK).json({ 
            hasCheckedIn: !!checkIn,
            checkIn 
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
    }
};

module.exports = {
    createCheckIn,
    getUserCheckIns,
    getCheckIn,
    getTodayCheckIn
};