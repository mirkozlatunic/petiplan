import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = '', ...rest }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
