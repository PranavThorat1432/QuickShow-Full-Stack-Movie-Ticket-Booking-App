// Script to populate database with sample movies and shows
import 'dotenv/config';
import axios from 'axios';
import mongoose from 'mongoose';
import Movie from './models/Movie.js';
import Show from './models/Show.js';

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: "QuickShow"
        });
        console.log("MongoDB Connected..!");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};

// Sample movie IDs from TMDB (popular movies)
const sampleMovieIds = [
    933260, // The Substance (2024)
    1184918, // The Wild Robot (2024)
    1034541, // Terrifier 3 (2024)
    823219, // Flow (2024)
    829402, // Ultraman: Rising (2024)
    539972, // Kraven the Hunter (2024)
    912649, // Venom: The Last Dance (2024)
    1241982, // Moana 2 (2024)
    957119, // The Crow (2024)
    845781, // Red One (2024)
];

const addSampleShows = async () => {
    try {
        await connectDB();

        console.log("Adding sample movies and shows...");

        for (const movieId of sampleMovieIds) {
            try {
                // Check if movie already exists
                let movie = await Movie.findById(movieId);

                if (!movie) {
                    console.log(`Fetching movie data for ID: ${movieId}`);

                    // Fetch movie details and credits from TMDB API
                    const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
                        axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
                            headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
                        }),
                        axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
                            headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
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
                        casts: movieCreditsData.cast.slice(0, 10), // First 10 cast members
                        release_date: movieApiData.release_date,
                        original_language: movieApiData.original_language,
                        tagline: movieApiData.tagline || '',
                        vote_average: movieApiData.vote_average,
                        runtime: movieApiData.runtime
                    };

                    // Add Movie to the Database
                    movie = await Movie.create(movieDetails);
                    console.log(`Added movie: ${movie.title}`);
                }

                // Add sample shows for the next 7 days
                const showsToCreate = [];
                const today = new Date();

                for (let i = 0; i < 7; i++) {
                    const showDate = new Date(today);
                    showDate.setDate(today.getDate() + i);

                    // Add 3 show times per day
                    const showTimes = ['14:00', '18:00', '21:00'];

                    showTimes.forEach((time) => {
                        const dateTimeString = `${showDate.toISOString().split('T')[0]}T${time}:00.000Z`;
                        showsToCreate.push({
                            movie: movieId,
                            showDateTime: new Date(dateTimeString),
                            showPrice: 12.99,
                            occupiedSeats: {}
                        });
                    });
                }

                if (showsToCreate.length > 0) {
                    await Show.insertMany(showsToCreate);
                    console.log(`Added ${showsToCreate.length} shows for ${movie.title}`);
                }

            } catch (error) {
                console.error(`Error adding movie ${movieId}:`, error.message);
            }
        }

        console.log("Sample data added successfully!");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
};

addSampleShows();
