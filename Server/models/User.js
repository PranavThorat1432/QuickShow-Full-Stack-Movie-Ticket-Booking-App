import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    _id: { 
        type: String, 
        required: [true, 'User ID is required']
    },
    name: { 
        type: String, 
        required: [true, 'Name is required'],
        trim: true
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
    },
    image: { 
        type: String,
        default: null
    },
    // Additional fields can be added here as needed
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
    toJSON: {
        transform: function(doc, ret) {
            delete ret.__v; // Remove version key from output
            return ret;
        }
    },
    toObject: {
        transform: function(doc, ret) {
            delete ret.__v; // Remove version key from output
            return ret;
        }
    }
});

// Add index for frequently queried fields
userSchema.index({ email: 1 });

// Middleware to handle duplicate key errors
userSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
        next(new Error('Email already exists'));
    } else {
        next(error);
    }
});

const User = mongoose.model('User', userSchema);

export default User;