import React from 'react';

export function Button({ children, className, variant }: { children: React.ReactNode; className?: string; variant?: string }) {
  const base = 'px-4 py-2 rounded focus:outline-none';
  if (variant === 'outline') {
    return <button className={`${base} ${className}`}>{children}</button>;
  }
  return <button className={`${base} ${className}`}>{children}</button>;
}

export default Button;
