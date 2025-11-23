import { Request, Response } from 'express';
import { prisma } from '../index';

export const getTransactions = async (req: Request, res: Response) => {
    const { userId } = req.query; // Admin can see all, user sees own
    // In real app, get userId from token and check role

    try {
        const where = userId ? { user_id: String(userId) } : {};
        const transactions = await prisma.transactions.findMany({
            where,
            orderBy: { created_at: 'desc' },
            include: { profiles: true }
        });
        res.json(transactions);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const requestDeposit = async (req: Request, res: Response) => {
    const { userId, amount, upiRef } = req.body;

    try {
        const transaction = await prisma.transactions.create({
            data: {
                user_id: userId,
                type: 'deposit',
                amount: Number(amount),
                upi_ref: upiRef,
                status: 'pending'
            }
        });
        res.status(201).json(transaction);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const requestWithdrawal = async (req: Request, res: Response) => {
    const { userId, amount, upiId } = req.body;

    try {
        const user = await prisma.profiles.findUnique({ where: { id: userId } });
        if (!user) throw new Error("User not found");

        if (Number(user.balance) < Number(amount)) {
            return res.status(400).json({ error: "Insufficient balance" });
        }

        // Deduct balance immediately and create transaction
        await prisma.$transaction([
            prisma.profiles.update({
                where: { id: userId },
                data: { balance: { decrement: Number(amount) } }
            }),
            prisma.transactions.create({
                data: {
                    user_id: userId,
                    type: 'withdrawal',
                    amount: Number(amount),
                    user_upi_id: upiId,
                    status: 'pending'
                }
            })
        ]);

        res.status(201).json({ message: "Withdrawal requested" });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const approveTransaction = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const tx = await prisma.transactions.findUnique({ where: { id } });
        if (!tx || tx.status !== 'pending') return res.status(400).json({ error: "Invalid transaction" });

        if (tx.type === 'deposit') {
            // Add balance
            await prisma.$transaction([
                prisma.transactions.update({
                    where: { id },
                    data: { status: 'approved' }
                }),
                prisma.profiles.update({
                    where: { id: tx.user_id! },
                    data: { balance: { increment: tx.amount } }
                })
            ]);
        } else {
            // Withdrawal: Balance already deducted, just update status
            await prisma.transactions.update({
                where: { id },
                data: { status: 'approved' }
            });
        }

        res.json({ message: "Transaction approved" });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const rejectTransaction = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const tx = await prisma.transactions.findUnique({ where: { id } });
        if (!tx || tx.status !== 'pending') return res.status(400).json({ error: "Invalid transaction" });

        if (tx.type === 'withdrawal') {
            // Refund balance
            await prisma.$transaction([
                prisma.transactions.update({
                    where: { id },
                    data: { status: 'rejected' }
                }),
                prisma.profiles.update({
                    where: { id: tx.user_id! },
                    data: { balance: { increment: tx.amount } }
                })
            ]);
        } else {
            // Deposit: Just update status
            await prisma.transactions.update({
                where: { id },
                data: { status: 'rejected' }
            });
        }

        res.json({ message: "Transaction rejected" });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
