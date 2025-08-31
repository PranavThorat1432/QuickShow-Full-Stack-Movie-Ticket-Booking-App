import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware } from '@clerk/express'
import connectDB from './configs/mongodb.js';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

// API Routes
app.get('/', (req, res) => {
    res.send('Server is Live!');
});
app.use('/api/inngest', serve({ client: inngest, functions }));


// MongoDB Connection
await connectDB();  

app.listen(PORT, () => console.log(`Server is Running on http://localhost:${PORT}`));