import express from 'express';
import { addNewShow, getNowPlayingMovies, getShow, getShows } from '../controllers/showController.js';
import { protectAdmin } from '../middleware/auth.js';

const showRouter = express.Router();

showRouter.get('/now-playing',protectAdmin, getNowPlayingMovies);
showRouter.post('/add-show',protectAdmin, addNewShow);
showRouter.get('/all-shows', getShows);
showRouter.get('/:movieId', getShow);


export default showRouter;