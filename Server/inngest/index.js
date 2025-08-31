import { Inngest } from "inngest";
import User from '../models/User.js';

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

// Inngest Function to save user's data to Database
const syncUserCreation = inngest.createFunction(
    { 
        id: 'sync-user-from-clerk',
        name: 'Sync User from Clerk to MongoDB',
        concurrency: 1,
        retries: 3,
        idempotency: 'event.user.id' // Ensure we don't process the same user multiple times
    },
    { event: 'clerk/user.created' },
    async ({ event, step }) => {
        console.log('Processing user creation event:', event);
        
        try {
            const { id, first_name, last_name, email_addresses, image_url } = event.data;
            
            // Validate required fields
            if (!id || !email_addresses?.[0]?.email) {
                throw new Error('Missing required user data');
            }

            const userData = {
                _id: id,
                email: email_addresses[0].email,
                name: first_name ? `${first_name} ${last_name || ''}`.trim() : email_addresses[0].email_address.split('@')[0],
                image: image_url || null,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            console.log('Creating user with data:', userData);

            // Check if user already exists
            const existingUser = await User.findById(id);
            if (existingUser) {
                console.log(`User ${id} already exists, updating instead`);
                const updatedUser = await User.findByIdAndUpdate(id, userData, { new: true });
                return {
                    message: `User updated successfully`,
                    userId: updatedUser._id,
                    action: 'updated'
                };
            }

            // Create new user
            const newUser = await User.create(userData);
            console.log('User created successfully:', newUser._id);
            
            return {
                message: 'User created successfully',
                userId: newUser._id,
                action: 'created'
            };
        } catch (error) {
            console.error('Error in syncUserCreation:', {
                error: error.message,
                stack: error.stack,
                event: event
            });
            throw error; // This will trigger a retry
        }
    }
);

// Inngest Function to delete user from Database
const syncUserDeletion = inngest.createFunction(
    { 
        id: 'delete-user-with-clerk',
        name: 'Delete User from MongoDB when deleted in Clerk',
        concurrency: 1,
        retries: 3
    },
    { event: 'clerk/user.deleted' },
    async ({ event, step }) => {
        console.log('Processing user deletion event:', event);
        
        try {
            const { id } = event.data;
            
            if (!id) {
                throw new Error('No user ID provided in deletion event');
            }

            console.log(`Attempting to delete user: ${id}`);
            const deletedUser = await User.findByIdAndDelete(id);

            if (deletedUser) {
                console.log(`Successfully deleted user: ${id}`);
                return {
                    message: 'User deleted successfully',
                    userId: id,
                    timestamp: new Date().toISOString()
                };
            } else {
                return {
                    message: `User with ID ${id} not found.`,
                    data: null
                };
            }
        } catch (error) {
            console.error('Error in syncUserDeletion:', error);
            throw new Error('Failed to delete user from database');
        }
    }
);

// Inngest Function to update user from Database
const syncUserUpdation = inngest.createFunction(
    { id: 'update-user-from-clerk' },
    { event: 'clerk/user.updated' },
    async ({ event }) => {
        try {
            const {id, first_name, last_name, email_addresses, image_url} = event.data;
            const userData = {
                email: email_addresses[0].email,
                name: first_name + ' ' + last_name,
                image: image_url
            };
            
            // The { new: true } option ensures findByIdAndUpdate returns the updated document.
            const updatedUser = await User.findByIdAndUpdate(id, userData, { new: true });

            if (updatedUser) {
                return {
                    message: `User with ID ${id} updated successfully.`,
                    data: updatedUser
                };
            } else {
                return {
                    message: `User with ID ${id} not found for update.`,
                    data: null
                };
            }
        } catch (error) {
            console.error('Error in syncUserUpdation:', error);
            throw new Error('Failed to update user in database');
        }
    }
);

// Create an empty array where we'll export future Inngest functions
export const functions = [
    syncUserCreation, 
    syncUserDeletion,
    syncUserUpdation,
];
