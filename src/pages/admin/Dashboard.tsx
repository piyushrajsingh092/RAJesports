import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useStore } from '../../lib/store';
import { Users, Trophy, CreditCard, AlertCircle } from 'lucide-react';

export function AdminDashboard() {
    const { users, tournaments, transactions, fetchUsers, fetchTournaments, fetchTransactions } = useStore();

    useEffect(() => {
        fetchUsers();
        fetchTournaments();
        fetchTransactions();
    }, [fetchUsers, fetchTournaments, fetchTransactions]);

    const pendingTransactions = transactions.filter(t => t.status === 'pending').length;
    const totalUsers = users.length;
    const activeTournaments = tournaments.filter(t => t.status === 'upcoming' || t.status === 'ongoing').length;
    const totalDeposits = transactions
        .filter(t => t.type === 'deposit' && t.status === 'approved')
        .reduce((acc, t) => acc + Number(t.amount), 0);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Tournaments</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeTournaments}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingTransactions}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalDeposits}</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
