'use client';

import { Home, Compass, Film, Tv, LayoutGrid, Settings, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Compass, label: 'Browse', href: '/browse' },
  { icon: Film, label: 'Movies', href: '/movies' }, // This will be handled by catalogs
  { icon: Tv, label: 'Series', href: '/series' },
  { icon: LayoutGrid, label: 'Addons', href: '/addons' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-card p-6 flex flex-col gap-8">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <Film className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold tracking-tight">ProjectMovie</span>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
              pathname === item.href ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-border">
        <Link
          href="/addons"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Install Addon
        </Link>
      </div>
    </aside>
  );
}
