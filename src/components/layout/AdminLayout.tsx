import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { LayoutDashboard, Trophy, Users, CreditCard, LogOut, Menu, X } from "lucide-react";
import { Button } from "../ui/Button";

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Trophy, label: "Tournaments", href: "/admin/tournaments" },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: CreditCard, label: "Transactions", href: "/admin/transactions" },
    { icon: Menu, label: "Notifications", href: "/admin/notifications" },
];

export function AdminLayout() {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 border-b bg-muted/30">
                <h2 className="text-xl font-bold text-primary">Admin Panel</h2>
                <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                    {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </div>

            {/* Sidebar */}
            <aside className={cn(
                "w-full md:w-64 border-r bg-muted/30 flex-col transition-all duration-300 ease-in-out md:flex",
                isSidebarOpen ? "flex" : "hidden"
            )}>
                <div className="p-6 border-b hidden md:block">
                    <h2 className="text-xl font-bold text-primary">Admin Panel</h2>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {sidebarItems.map((item) => (
                        <Link key={item.href} to={item.href} onClick={() => setIsSidebarOpen(false)}>
                            <Button
                                variant={location.pathname === item.href ? "secondary" : "ghost"}
                                className={cn("w-full justify-start gap-2", location.pathname === item.href && "bg-secondary")}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Button>
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t">
                    <Link to="/">
                        <Button variant="outline" className="w-full gap-2">
                            <LogOut className="h-4 w-4" />
                            Exit Admin
                        </Button>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}
