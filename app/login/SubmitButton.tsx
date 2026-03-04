'use client';

import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';

interface SubmitButtonProps {
    children: React.ReactNode;
    className?: string;
    pendingText?: string;
    formAction?: string | ((formData: FormData) => void | Promise<void>);
}

export function SubmitButton({ children, className, pendingText, formAction }: SubmitButtonProps) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            formAction={formAction}
            className={`${className} flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed`}
        >
            {pending && <Loader2 size={18} className="animate-spin" />}
            <span>{pending && pendingText ? pendingText : children}</span>
        </button>
    );
}
