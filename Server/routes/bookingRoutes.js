import express from 'express';
import { createBooking, getOccupiedSeats } from '../controllers/bookingController.js';
import { requireAuth } from '../middleware/auth.js';

const bookingRouter = express.Router();

// Apply authentication middleware to all booking routes
bookingRouter.use(requireAuth);

bookingRouter.post('/create', createBooking);
bookingRouter.get('/seats/:showId', getOccupiedSeats);

export default bookingRouter;