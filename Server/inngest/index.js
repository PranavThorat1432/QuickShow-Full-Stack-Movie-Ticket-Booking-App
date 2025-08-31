import { Inngest } from "inngest";
import User from '../models/User.js';

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

// Inngest Function to save user's data to Database
const syncUserCreation = inngest.createFunction(
    { id: 'sync-user-from-clerk' },
    { event: 'clerk/user.created' },
    async ({ event }) => {
        try {
            const {id, first_name, last_name, email_addresses, image_url} = event.data;
            const userData = {
                _id: id,
                email: email_addresses[0].email,
                name: first_name + ' ' + last_name,
                image: image_url
            }
            // Use await to ensure the operation completes.
            const newUser = await User.create(userData);
            
            // The function must return a value for the Inngest run output.
            return {
                message: `User created successfully with ID: ${newUser._id}`,
                data: newUser
            };
        } catch (error) {
            // Log the error for debugging and re-throw to fail the Inngest run
            console.error('Error in syncUserCreation:', error);
            throw new Error('Failed to create user in database');
        }
    }
);

// Inngest Function to delete user from Database
const syncUserDeletion = inngest.createFunction(
    { id: 'delete-user-with-clerk' },
    { event: 'clerk/user.deleted' },
    async ({ event }) => {
        try {
            const {id} = event.data;
            const deletedUser = await User.findByIdAndDelete(id);

            // Return a meaningful response based on the operation
            if (deletedUser) {
                return {
                    message: `User with ID ${id} deleted successfully.`,
                    data: deletedUser
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
