
'use client';

import { Button } from "@/components/ui/button";
import { Building2, PlusCircle, LogOut, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "../actions";
import { useRouter } from "next/navigation";

export function AdminHeader() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    }

    return (
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
            <Link
                href="/report"
                className="flex items-center gap-2 text-lg font-semibold md:text-base"
            >
                <Building2 className="h-6 w-6 text-primary" />
                <span className="sr-only">Daily Progress Tracker</span>
            </Link>
            <Link
                href="/admin"
                className={`transition-colors hover:text-foreground ${pathname === '/admin' ? 'text-foreground font-bold' : 'text-muted-foreground'}`}
            >
                Dashboard
            </Link>
            </nav>
            <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4 justify-end">
                <Button asChild>
                    <Link href="/report">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Report
                    </Link>
                </Button>
                 <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>
      </header>
    )
}
