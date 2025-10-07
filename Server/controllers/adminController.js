import Booking from "../models/Booking.js"
import Show from "../models/Show.js";
import User from "../models/User.js";


// API to check if user is admin
export const isAdmin = async (req, res) => {
    res.json({
        isAdmin: true,
        success: true
    })
}

// API to get Dashboard data
export const getDashboardData = async (req, res) => {
    try {
        const bookings = await Booking.find({isPaid: true});
        const activeShows = await Show.find({showTime: {$gte: new Date()}}).populate('movie');

        const totalUser = await User.countDocuments();

        const dashboarData = {
            totalBookings: bookings.length,
            totalRevenue: bookings.reduce((acc, booking) => acc + booking.amount, 0),
            activeShows,
            totalUser
        }

        res.json({
            dashboarData,
            success: true
        })

    } catch (error) {
        console.log(error.message);
        res.json({
            message: error.message,
            success: false
        });
    }
}

// API to get All Shows
export const getAllShows = async (req, res) => {
    try {
        const shows = await Show.find({showTime: {$gte: new Date()}}).populate('movie').sort({ showDateTime: 1});
        res.json({
            shows,
            success: true
        });

    } catch (error) {
        console.log(error.message);
        res.json({
            message: error.message,
            success: false
        });
    }
}

// API to get all bookingRoutes
export const getAllBookings = async (req, res) => {
    try {
        
        const bookings = await Booking.find({}).populate('user').populate({
            path: 'show',
            populate: {path: 'movie'}
        }).sort({ createdAt: -1 })

        res.json({
            bookings,
            success: true
        });
 
    } catch (error) {
        console.log(error.message);
        res.json({
            message: error.message,
            success: false
        });
    }
}