import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { useStore } from '../lib/store';
import { Trophy, Users, Calendar, Search } from 'lucide-react';

export function Tournaments() {
    const { tournaments, fetchTournaments } = useStore();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchTournaments();
    }, [fetchTournaments]);

    const filteredTournaments = tournaments.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.game.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || t.game.toLowerCase() === filter.toLowerCase();
        return matchesSearch && matchesFilter;
    });

    const games = Array.from(new Set(tournaments.map(t => t.game)));

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">All Tournaments</h1>
                    <p className="text-muted-foreground">Find and join the best esports tournaments.</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search tournaments..."
                            className="pl-8 w-full sm:w-[250px]"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                        <Button
                            variant={filter === 'all' ? 'default' : 'outline'}
                            onClick={() => setFilter('all')}
                            size="sm"
                        >
                            All
                        </Button>
                        {games.map(game => (
                            <Button
                                key={game}
                                variant={filter === game ? 'default' : 'outline'}
                                onClick={() => setFilter(game)}
                                size="sm"
                            >
                                {game}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredTournaments.map((tournament) => (
                    <Card key={tournament.id} className="overflow-hidden border-muted/50 bg-muted/20 transition-colors hover:border-primary/50">
                        <div className="aspect-video w-full overflow-hidden">
                            <img
                                src={tournament.image}
                                alt={tournament.title}
                                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                        </div>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <Badge>{tournament.game}</Badge>
                                <Badge variant={tournament.status === 'upcoming' ? 'secondary' : 'default'}>
                                    {tournament.status}
                                </Badge>
                            </div>
                            <CardTitle className="line-clamp-1">{tournament.title}</CardTitle>
                            <CardDescription className="line-clamp-2">{tournament.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Trophy className="h-4 w-4 text-yellow-500" />
                                <span>Prize Pool: ₹{tournament.prizePool}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-blue-500" />
                                <span>{tournament.currentPlayers}/{tournament.maxPlayers} Players</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-green-500" />
                                <span>{new Date(tournament.startDate).toLocaleDateString()}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Link to={`/tournaments/${tournament.id}`} className="w-full">
                                <Button className="w-full">Join for ₹{tournament.entryFee}</Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
                {filteredTournaments.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        No tournaments found matching your criteria.
                    </div>
                )}
            </div>
        </div>
    );
}
