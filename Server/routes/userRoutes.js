import express from 'express';
import { getFavorites, getUserBookings, updateFavourite } from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';

const userRouter = express.Router();

// Apply authentication middleware to all user routes
userRouter.use(requireAuth);

userRouter.get('/bookings', getUserBookings);
userRouter.post('/updateFavorite', updateFavourite);
userRouter.get('/favorites', getFavorites);

export default userRouter;