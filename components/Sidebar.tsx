'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Receipt,
    Landmark,
    CalendarClock,
    Calculator,
    Briefcase,
    BarChart3,
    Settings,
} from 'lucide-react';

const navItems = [
    { href: '/', label: 'ダッシュボード', icon: LayoutDashboard },
    { href: '/transactions', label: '取引一覧', icon: Receipt },
    { href: '/assets', label: '資産管理', icon: Landmark },
    { href: '/fixed-expenses', label: '固定費', icon: CalendarClock },
    { href: '/depreciation', label: '減価償却', icon: Calculator },
    { href: '/salary', label: '給与', icon: Briefcase },
    { href: '/analytics', label: '分析', icon: BarChart3 },
    { href: '/settings', label: '設定', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-[var(--border)] bg-[var(--bg-secondary)] z-40">
                <div className="p-6 border-b border-[var(--border)]">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        💰 収支管理
                    </h1>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Personal Finance Manager</p>
                </div>
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 no-underline ${isActive
                                    ? 'bg-[var(--accent)] text-white shadow-lg shadow-blue-500/20'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                                    }`}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Mobile Bottom Nav */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-secondary)] border-t border-[var(--border)] z-50 flex justify-around py-1 px-1 safe-area-bottom">
                {navItems.slice(0, 5).map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-0.5 py-2 px-2 rounded-lg text-[10px] font-medium transition-colors no-underline ${isActive
                                ? 'text-[var(--accent)]'
                                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                                }`}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
