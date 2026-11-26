import type { ReactNode } from 'react';

export function ErrorComponent({
  icon = '⚠️',
  title,
  message,
  children,
}: {
  icon?: string;
  title: string;
  message: string;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <span className="mb-4 text-4xl" aria-hidden="true">
        {icon}
      </span>
      <h1 className="mb-2 text-xl font-bold">{title}</h1>
      <p className="mb-6 text-sm text-muted-foreground">{message}</p>
      {children}
    </div>
  );
}
