import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY',
    }).format(amount);
}

export function formatNumberWithCommas(num: number | string): string {
    const value = typeof num === 'string' ? parseFloat(num.replace(/,/g, '')) : num;
    if (isNaN(value)) return '';
    return new Intl.NumberFormat('ja-JP').format(value);
}
