import { clerkClient } from "@clerk/express";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";


// API Controller Function to get User Bookings
export const getUserBookings = async (req, res) => {
    try {
        const user = req.auth().userId;

        const bookings = await Booking.find({user}).populate({
            path: 'show',
            populate: {path: 'movie'}
        }).sort({createdAt: -1})

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

// API Controller Function to Update Favourite Movie in Clerk User Metadata
export const updateFavourite = async (req, res) => {
    try {
        const {movieId} = req.body;
        const userId = req.auth().userId;

        const user = await clerkClient.users.getUser(userId);
        if(!user.privateMetadata.favorites) {
            user.privateMetadata.favorites = [];
        }

        if(!user.privateMetadata.favorites.includes(movieId)) {
            user.privateMetadata.favorites.push(movieId);

        } else {
            user.privateMetadata.favorites = user.privateMetadata.favorites.filter(item => item !== movieId);
        }

        await clerkClient.users.updateUserMetadata(userId, {privateMetadata: user.privateMetadata});

        res.json({
            message: 'Favourite Movies Updated',
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

export const getFavorites = async (req, res) => {
    try {
        const user = await clerkClient.users.getUser(req.auth().userId);
        const favorites = user.privateMetadata.favorites;

        // Get Movies from Database
        const movies = await Movie.find({_id: {$in: favorites}});

        res.json({
            movies,
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