import { DraftingCompass } from 'lucide-react';

export function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2 p-2 h-14">
      <DraftingCompass className="h-8 w-8 text-primary shrink-0" />
      {!collapsed && (
         <h1 className="text-xl font-bold text-primary whitespace-nowrap overflow-hidden">Architech AI</h1>
      )}
    </div>
  );
}
