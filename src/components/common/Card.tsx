import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "glass rounded-2xl sm:rounded-3xl overflow-hidden card-hover shadow-lg hover:shadow-2xl transition-all duration-300",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className, children, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "p-4 sm:p-5 md:p-6 border-b border-white/20 bg-gradient-to-r from-white/5 to-transparent",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardTitle({ className, children, ...props }: CardProps) {
    return (
        <h3
            className={cn(
                "font-bold text-base sm:text-lg md:text-xl text-slate-800 tracking-tight",
                className
            )}
            {...props}
        >
            {children}
        </h3>
    );
}

export function CardContent({ className, children, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "p-4 sm:p-5 md:p-6",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
