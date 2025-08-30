import mongoose from "mongoose";

//MongoDB Connection
const connectDB = async () => {
    mongoose.connect( process.env.MONGODB_URI, {
        dbName: "QuickShow: Movie Ticket Booking App"
    }).then(() => {
        console.log("MongoDB Connected..!")
    }).catch((err) => {
        console.log(err)
    });
};


export default connectDB;