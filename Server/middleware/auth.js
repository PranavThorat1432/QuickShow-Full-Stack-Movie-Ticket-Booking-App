import { clerkClient } from '@clerk/express';

export const requireAuth = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        if (!userId) {
            return res.status(401).json({
                message: 'Authentication required',
                success: false
            });
        }
        next();
    } catch (error) {
        console.log(error.message);
        res.status(401).json({
            message: 'Authentication failed',
            success: false
        });
    }
};

export const protectAdmin = async (req, res, next) => {
    try {
        const { userId } = req.auth();
        const user = await clerkClient.users.getUser(userId);

        if(user.privateMetadata.role !== 'admin') {
            return res.json({
                message: 'Not Authorizerd',
                success: false
            })
        }
        next();

    } catch (error) {
        console.log(error.message);
        res.json({
            message: error.message,
            success: false
        })
    }
}