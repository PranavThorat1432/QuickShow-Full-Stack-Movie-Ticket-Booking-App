import mongoose from "mongoose";

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: "QuickShow",
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        });
        console.log("MongoDB Connected Successfully!");
        return mongoose.connection;
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1); // Exit process with failure
    }
};

// Handle MongoDB connection events
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed due to app termination');
    process.exit(0);
});

export default connectDB;