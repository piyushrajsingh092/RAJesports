import { Request, Response } from 'express';
import { prisma } from '../index';

export const declareWinner = async (req: Request, res: Response) => {
    const { tournamentId, winnerId } = req.body;

    try {
        // Get tournament details
        const tournament = await prisma.tournaments.findUnique({
            where: { id: tournamentId },
            select: { prize_pool: true, title: true, status: true }
        });

        if (!tournament) {
            return res.status(404).json({ error: "Tournament not found" });
        }

        if (tournament.status === 'completed') {
            return res.status(400).json({ error: "Tournament already completed" });
        }

        // Get winner details
        const winner = await prisma.profiles.findUnique({
            where: { id: winnerId },
            select: { balance: true }
        });

        if (!winner) {
            return res.status(404).json({ error: "Winner not found" });
        }

        // Transaction: Update tournament, add prize to winner, create transaction record
        await prisma.$transaction([
            // Mark tournament as completed with winner
            prisma.tournaments.update({
                where: { id: tournamentId },
                data: {
                    status: 'completed',
                    winner_id: winnerId
                }
            }),
            // Add prize pool to winner's balance
            prisma.profiles.update({
                where: { id: winnerId },
                data: {
                    balance: { increment: tournament.prize_pool }
                }
            }),
            // Record prize as a transaction
            prisma.transactions.create({
                data: {
                    user_id: winnerId,
                    type: 'prize',
                    amount: tournament.prize_pool,
                    status: 'approved',
                    upi_ref: `WIN-${tournament.title.substring(0, 10)}-${Date.now()}`
                }
            })
        ]);

        res.json({
            message: "Winner declared successfully",
            prizePool: tournament.prize_pool
        });
    } catch (error: any) {
        console.error('Declare Winner Error:', error);
        res.status(500).json({ error: error.message });
    }
};
