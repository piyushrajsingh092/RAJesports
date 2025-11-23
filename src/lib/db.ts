import type { User, Tournament, Transaction } from './types';

const STORAGE_KEYS = {
    USERS: 'esports_users',
    TOURNAMENTS: 'esports_tournaments',
    TRANSACTIONS: 'esports_transactions',
    CURRENT_USER: 'esports_current_user',
};

// Initial Mock Data
const INITIAL_TOURNAMENTS: Tournament[] = [
    {
        id: '1',
        title: 'BGMI Pro Championship',
        game: 'BGMI',
        entryFee: 100,
        prizePool: 5000,
        startDate: '2025-11-25T18:00:00',
        status: 'upcoming',
        maxPlayers: 100,
        currentPlayers: 45,
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
        description: 'The ultimate BGMI showdown. Join now to prove your skills.',
        rules: 'No hacking. Mobile only.',
        participants: []
    },
    {
        id: '2',
        title: 'Valorant Community Cup',
        game: 'Valorant',
        entryFee: 500,
        prizePool: 20000,
        startDate: '2025-11-26T20:00:00',
        status: 'upcoming',
        maxPlayers: 20,
        currentPlayers: 12,
        image: 'https://images.unsplash.com/photo-1624138784181-dc7f5b75e52e?w=800&q=80',
        description: '5v5 Tactical Shooter Tournament.',
        rules: 'Standard competitive rules.',
        participants: []
    }
];

const INITIAL_USERS: User[] = [
    {
        id: 'admin',
        username: 'admin',
        email: 'admin@esports.com',
        balance: 0,
        role: 'admin'
    },
    {
        id: 'user1',
        username: 'gamer123',
        email: 'gamer@test.com',
        balance: 1000,
        role: 'user'
    }
];

class MockDB {
    constructor() {
        this.init();
    }

    private init() {
        if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.TOURNAMENTS)) {
            localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(INITIAL_TOURNAMENTS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
            localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
        }
    }

    getUsers(): User[] {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    }

    getUser(id: string): User | undefined {
        return this.getUsers().find(u => u.id === id);
    }

    getTournaments(): Tournament[] {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.TOURNAMENTS) || '[]');
    }

    getTransactions(): Transaction[] {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    }

    getCurrentUser(): User | null {
        const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        return stored ? JSON.parse(stored) : null;
    }

    login(username: string): User | null {
        const users = this.getUsers();
        const user = users.find(u => u.username === username);
        if (user) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
            return user;
        }
        // Auto-register for demo if not found (except admin)
        if (username !== 'admin') {
            const newUser: User = {
                id: Math.random().toString(36).substr(2, 9),
                username,
                email: `${username}@example.com`,
                balance: 0,
                role: 'user'
            };
            users.push(newUser);
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
            return newUser;
        }
        return null;
    }

    logout() {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }

    joinTournament(userId: string, tournamentId: string): boolean {
        const users = this.getUsers();
        const tournaments = this.getTournaments();

        const userIndex = users.findIndex(u => u.id === userId);
        const tournamentIndex = tournaments.findIndex(t => t.id === tournamentId);

        if (userIndex === -1 || tournamentIndex === -1) return false;

        const user = users[userIndex];
        const tournament = tournaments[tournamentIndex];

        if (user.balance < tournament.entryFee) return false;
        if (tournament.currentPlayers >= tournament.maxPlayers) return false;

        // Deduct balance
        user.balance -= tournament.entryFee;
        tournament.currentPlayers += 1;
        if (!tournament.participants) tournament.participants = [];
        tournament.participants.push(userId);

        users[userIndex] = user;
        tournaments[tournamentIndex] = tournament;

        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(tournaments));

        // Update current user if it's the one logged in
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        }

        return true;
    }

    createTransaction(transaction: Omit<Transaction, 'id'>) {
        const transactions = this.getTransactions();
        const newTransaction: Transaction = {
            ...transaction,
            id: Math.random().toString(36).substr(2, 9)
        };
        transactions.push(newTransaction);
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    }

    updateTransactionStatus(transactionId: string, status: 'approved' | 'rejected') {
        const transactions = this.getTransactions();
        const users = this.getUsers();

        const txIndex = transactions.findIndex(t => t.id === transactionId);
        if (txIndex === -1) return;

        const tx = transactions[txIndex];
        if (tx.status !== 'pending') return;

        tx.status = status;
        transactions[txIndex] = tx;

        if (status === 'approved') {
            const userIndex = users.findIndex(u => u.id === tx.userId);
            if (userIndex !== -1) {
                if (tx.type === 'deposit') {
                    users[userIndex].balance += tx.amount;
                } else if (tx.type === 'withdrawal') {
                    users[userIndex].balance -= tx.amount;
                }
                localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

                // Update current user if logged in
                const currentUser = this.getCurrentUser();
                if (currentUser && currentUser.id === tx.userId) {
                    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(users[userIndex]));
                }
            }
        }

        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    }

    createTournament(data: Omit<Tournament, 'id' | 'currentPlayers' | 'status' | 'participants'>) {
        const tournaments = this.getTournaments();
        const newTournament: Tournament = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            currentPlayers: 0,
            status: 'upcoming',
            participants: []
        };
        tournaments.push(newTournament);
        localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(tournaments));
    }

    updateTournament(id: string, data: Partial<Tournament>) {
        const tournaments = this.getTournaments();
        const index = tournaments.findIndex(t => t.id === id);
        tournaments[index] = { ...tournaments[index], ...data };
        localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(tournaments));
    }
    declareWinner(tournamentId: string, winnerId: string) {
        const tournaments = this.getTournaments();
        const users = this.getUsers();

        const tIndex = tournaments.findIndex(t => t.id === tournamentId);
        const uIndex = users.findIndex(u => u.id === winnerId);

        if (tIndex === -1 || uIndex === -1) return;

        const tournament = tournaments[tIndex];
        const winner = users[uIndex];

        // Update Tournament
        tournament.status = 'completed';
        tournament.winnerId = winnerId;
        tournaments[tIndex] = tournament;

        // Update Winner Balance
        winner.balance += tournament.prizePool;
        users[uIndex] = winner;

        // Create Transaction Record
        this.createTransaction({
            userId: winnerId,
            type: 'deposit',
            amount: tournament.prizePool,
            status: 'approved',
            date: new Date().toISOString(),
            upiRef: `WIN-${tournament.title.substring(0, 5)}-${Date.now()}`
        });

        localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(tournaments));
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

        // Update current user if logged in
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === winnerId) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(winner));
        }
    }
}

export const db = new MockDB();
