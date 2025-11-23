import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useStore } from '../../lib/store';
import { User } from 'lucide-react';

export function AdminUsers() {
    const { users, fetchUsers } = useStore();

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">User Management</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Registered Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {users.map((user) => (
                            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                                        <User className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-bold">{user.username}</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">Balance: ₹{user.balance}</p>
                                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                        {user.role}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
