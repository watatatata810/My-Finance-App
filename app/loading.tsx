'use client';

export default function Loading() {
    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
            {/* Top Progress Bar */}
            <div className="h-1 bg-[var(--accent)] w-full origin-left animate-loading-bar" />

            {/* Subtle glow/shadow under the bar */}
            <div className="h-6 bg-gradient-to-b from-[var(--accent)]/10 to-transparent w-full" />

            {/* Subtle overlay to indicate the page is not yet ready */}
            <div className="fixed inset-0 bg-[var(--bg-app)]/10 backdrop-blur-[1px] -z-10" />
        </div>
    );
}
