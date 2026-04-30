import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getMesInTrimester(mes: number): number {
    if (mes >= 1 && mes <= 3) return mes;
    if (mes >= 4 && mes <= 6) return mes - 3;
    if (mes >= 7 && mes <= 9) return mes - 6;
    if (mes >= 10 && mes <= 12) return mes - 9;
    return mes;
}

