import { useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useStore } from '../../lib/store';
import { Check, X } from 'lucide-react';

export function AdminTransactions() {
    const { transactions, approveTransaction, rejectTransaction, fetchTransactions } = useStore();

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const pendingTransactions = transactions.filter(t => t.status === 'pending');
    const historyTransactions = transactions.filter(t => t.status !== 'pending').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Transaction Requests</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {pendingTransactions.length === 0 ? (
                            <p className="text-muted-foreground">No pending requests.</p>
                        ) : (
                            pendingTransactions.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={tx.type === 'deposit' ? 'default' : 'secondary'}>
                                                {tx.type.toUpperCase()}
                                            </Badge>
                                            <span className="font-bold">₹{tx.amount}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            User ID: {tx.userId}
                                        </p>
                                        {tx.type === 'deposit' ? (
                                            <p className="text-sm font-mono mt-1">UTR: {tx.upiRef}</p>
                                        ) : (
                                            <p className="text-sm font-mono mt-1">UPI: {tx.userUpiId}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(tx.date).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="text-green-500 hover:text-green-600" onClick={() => approveTransaction(tx.id)}>
                                            <Check className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600" onClick={() => rejectTransaction(tx.id)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {historyTransactions.slice(0, 10).map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg opacity-75">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium capitalize">{tx.type}</span>
                                        <span className="font-bold">₹{tx.amount}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(tx.date).toLocaleDateString()}
                                    </p>
                                </div>
                                <Badge variant={tx.status === 'approved' ? 'outline' : 'destructive'}>
                                    {tx.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
