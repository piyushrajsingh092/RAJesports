import { Request, Response } from 'express';
import { prisma } from '../index';

export const cancelTournament = async (req: Request, res: Response) => {
    const { tournamentId } = req.body;

    try {
        // Get tournament details
        const tournament = await prisma.tournaments.findUnique({
            where: { id: tournamentId },
            select: {
                entry_fee: true,
                title: true,
                status: true,
                tournament_participants: {
                    select: {
                        user_id: true
                    }
                }
            }
        });

        if (!tournament) {
            return res.status(404).json({ error: "Tournament not found" });
        }

        if (tournament.status === 'cancelled') {
            return res.status(400).json({ error: "Tournament already cancelled" });
        }

        if (tournament.status === 'completed') {
            return res.status(400).json({ error: "Cannot cancel a completed tournament" });
        }

        const participants = tournament.tournament_participants;

        // Build transaction array for atomic operation
        const transactionOperations: any[] = [
            // Update tournament status to cancelled
            prisma.tournaments.update({
                where: { id: tournamentId },
                data: { status: 'cancelled' }
            })
        ];

        // For each participant, refund entry fee and create refund transaction
        participants.forEach(participant => {
            // Refund balance
            transactionOperations.push(
                prisma.profiles.update({
                    where: { id: participant.user_id },
                    data: { balance: { increment: tournament.entry_fee } }
                })
            );

            // Create refund transaction record
            transactionOperations.push(
                prisma.transactions.create({
                    data: {
                        user_id: participant.user_id,
                        type: 'refund',
                        amount: tournament.entry_fee,
                        status: 'approved',
                        upi_ref: `REFUND-${tournament.title.substring(0, 10)}-${Date.now()}`
                    }
                })
            );
        });

        // Execute all operations atomically
        await prisma.$transaction(transactionOperations);

        res.json({
            message: "Tournament cancelled and refunds processed",
            refundedParticipants: participants.length,
            refundAmount: tournament.entry_fee
        });
    } catch (error: any) {
        console.error('Cancel Tournament Error:', error);
        res.status(500).json({ error: error.message });
    }
};
