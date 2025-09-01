import axios from "axios"
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";

// API to get Now Playing Movies from TMDB API
export const getNowPlayingMovies = async (req, res) => {
    try {
        const { data } = await axios.get('https://api.themoviedb.org/3/movie/now_playing', {
            headers: {Authorization: `Bearer ${process.env.TMDB_API_KEY}`}
        })

        const movies = data.results;
        res.json({
            movies: movies,
            success: true
        })

    } catch (error) {
        console.log(error.message);
        res.json({
            message: error.message,
            success: false
        })
    }
}

// API to add a New Show to the Database
export const addNewShow = async (req, res) => {
    try {
        const { movieId, showsInput, showPrice } = req.body;

        let movie = await Movie.findById(movieId);

        if(!movie) {
            // Fetch movie details and credits from TMDB API
            const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
                    headers: {Authorization: `Bearer ${process.env.TMDB_API_KEY}`}
                }),

                axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
                    headers: {Authorization: `Bearer ${process.env.TMDB_API_KEY}`}
                })
            ]);

            const movieApiData = movieDetailsResponse.data;
            const movieCreditsData = movieCreditsResponse.data;

            const movieDetails = {
                _id: movieId,
                title: movieApiData.title,
                overview: movieApiData.overview,
                poster_path: movieApiData.poster_path,
                backdrop_path: movieApiData.backdrop_path,
                genres: movieApiData.genres,
                casts: movieCreditsData.cast,
                release_date: movieApiData.release_date,
                original_language: movieApiData.original_language,
                tagline: movieApiData.tagline || '',
                vote_average: movieApiData.vote_average,
                runtime: movieApiData.runtime
            }

            // Add Movie to the Database
            movie = await Movie.create(movieDetails);
        }

        const showsToCreate = [];
        showsInput.forEach(show => {
            const showDate = show.date;
            show.time.forEach((time) => {
                const dateTimeString = `${showDate}T${time}`;
                showsToCreate.push({
                    movie: movieId,
                    showDateTime: new Date(dateTimeString),
                    showPrice,
                    occupiedSeats: {}
                })
            })
        });

        if(showsToCreate.length > 0) {
            await Show.insertMany(showsToCreate);
        }

        res.json({
            message: 'Show Added Successfully!',
            success: true
        })

    } catch (error) {
        console.log(error.message);
        res.json({
            message: error.message,
            success: false
        })
    }
}

// API to get All Shows from the Database
export const getShows = async (req, res) => {
    try {
        const shows = await Show.find({showDateTime: {$gte: new Date()}}).populate('movie').sort({ showDateTime: 1 });

        // Filter Unique Shows 
        const uniqueShows = new Set(shows.map(show => show.movie))

        res.json({
            shows: Array.from(uniqueShows),
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

// API to get a Single Show from the Database
export const getShow = async (req, res) => {
    try {
        const { movieId } = req.params;

        //Get all upcoming shows for the movie
        const shows = await Show.find({movie: movieId, showDateTime: {$gte: new Date()}})

        const movie = await Movie.findById(movieId);
        const dateTime = {};

        shows.forEach((show) => {
            const date = show.showDateTime.toISOString().split('T')[0];
            if(!dateTime[date]) {
                dateTime[date] = [];
            }
            dateTime[date].push({ time: show.showDateTime, showId: show._id });
        })

        res.json({
            movie, 
            dateTime,
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