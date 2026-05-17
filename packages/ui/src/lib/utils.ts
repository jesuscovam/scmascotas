import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { WithoutChild, WithoutChildrenOrChild } from 'bits-ui';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export type WithElementRef<T, El extends Element = Element> = T & { ref?: El | null };

export type { WithoutChild, WithoutChildrenOrChild };
