import { Request, Response } from 'express';
import { supabase } from '../supabaseClient';
import { prisma } from '../index';
import { sendAdminAlert } from '../utils/emailService';

export const signup = async (req: Request, res: Response) => {
    const { email, password, username } = req.body;

    try {
        // 1. Create user in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username }
            }
        });

        if (error) throw error;

        if (data.user) {
            // 2. Profile is created by DB trigger, but we can verify or update if needed
            // For now, we trust the trigger.

            // Notify Admin
            await sendAdminAlert(
                'New User Registration',
                `New user registered: ${username} (${email})`
            );

            res.status(201).json({ message: 'User created successfully', user: data.user });
        } else {
            res.status(400).json({ message: 'User creation failed' });
        }
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        res.json({ session: data.session, user: data.user });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getProfile = async (req: Request, res: Response) => {
    // This endpoint expects a valid JWT in the Authorization header
    // But for now, we'll just use the ID passed in params or body for testing
    // In a real app, we'd verify the token middleware.
    const { userId } = req.params;

    try {
        const profile = await prisma.profiles.findUnique({
            where: { id: userId }
        });
        res.json(profile);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
