import mongoose from 'mongoose';

// MongoDB Connection
const connectDB = async () => {
    try {
        // Exit if MONGODB_URI is not set
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable is not set');
        }

        // Connection options
        const options = {
            dbName: 'QuickShow',
            serverSelectionTimeoutMS: 10000, // 10 seconds timeout
            socketTimeoutMS: 45000, // 45 seconds socket timeout
            maxPoolSize: 10, // Maintain up to 10 socket connections
            connectTimeoutMS: 10000, // 10 seconds connection timeout
        };

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, options);
        
        // Log successful connection
        console.log('MongoDB Connected Successfully');
        
        // Log any connection errors after initial connection was established
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });
        
        return mongoose.connection;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        // Exit process with failure
        process.exit(1);
    }
};

export default connectDB;