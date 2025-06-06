import { DraftingCompass } from 'lucide-react';

interface LogoProps {
  variant?: 'full' | 'icon';
}

export function Logo({ variant = 'full' }: LogoProps) {
  return (
    <div className="flex items-center gap-2 h-full"> {/* Ensure full height for flex alignment */}
      <DraftingCompass className="h-7 w-7 text-primary shrink-0" />
      {variant === 'full' && (
         <h1 className="text-xl font-bold text-primary whitespace-nowrap overflow-hidden">Architech AI</h1>
      )}
    </div>
  );
}
