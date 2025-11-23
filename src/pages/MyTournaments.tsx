import { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Calendar, Trophy, Users } from 'lucide-react';
import { format } from 'date-fns';
import type { Tournament } from '../lib/types';

export function MyTournaments() {
    const { currentUser, tournaments, fetchTournaments } = useStore();
    const [myTournaments, setMyTournaments] = useState<Tournament[]>([]);

    useEffect(() => {
        fetchTournaments();
    }, [fetchTournaments]);

    useEffect(() => {
        if (currentUser && tournaments) {
            const joined = tournaments.filter(t =>
                t.participants.includes(currentUser.id)
            );
            setMyTournaments(joined);
        }
    }, [currentUser, tournaments]);

    if (!currentUser) {
        return <div className="p-10 text-center">Please login to view your tournaments</div>;
    }

    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">My Tournaments</h1>
                <p className="text-muted-foreground">
                    {myTournaments.length} tournament{myTournaments.length !== 1 ? 's' : ''} joined
                </p>
            </div>

            {myTournaments.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                        <h3 className="text-xl font-semibold mb-2">No Tournaments Yet</h3>
                        <p className="text-muted-foreground">
                            Join a tournament to get started!
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {myTournaments.map((tournament) => (
                        <Card key={tournament.id} className="hover:border-primary/50 transition-colors">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-xl">{tournament.title}</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">{tournament.game}</p>
                                    </div>
                                    <Badge variant={
                                        tournament.status === 'completed' ? 'secondary' :
                                            tournament.status === 'ongoing' ? 'default' : 'outline'
                                    }>
                                        {tournament.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Trophy className="h-4 w-4 text-primary" />
                                        <span>₹{tournament.prizePool}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Users className="h-4 w-4 text-primary" />
                                        <span>{tournament.currentPlayers}/{tournament.maxPlayers}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        <span>{format(new Date(tournament.startDate), 'MMM dd, yyyy')}</span>
                                    </div>
                                </div>

                                {tournament.status === 'ongoing' && tournament.roomId && (
                                    <div className="mt-4 p-3 bg-primary/10 rounded-lg space-y-1">
                                        <p className="text-sm font-medium">Room Details</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-muted-foreground">Room ID:</span>
                                            <code className="text-sm font-mono">{tournament.roomId}</code>
                                        </div>
                                        {tournament.roomPassword && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-muted-foreground">Password:</span>
                                                <code className="text-sm font-mono">{tournament.roomPassword}</code>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {tournament.status === 'completed' && tournament.winnerId === currentUser.id && (
                                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                            🏆 You won this tournament!
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
