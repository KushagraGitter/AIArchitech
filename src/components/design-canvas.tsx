import { Card, CardContent } from '@/components/ui/card';
import { PackageSearch } from 'lucide-react';

export function DesignCanvas() {
  return (
    <Card className="flex-1 w-full h-full shadow-inner bg-background">
      <CardContent className="h-full flex flex-col items-center justify-center p-6">
        <PackageSearch className="w-24 h-24 text-muted-foreground/50 mb-6" strokeWidth={1} />
        <h2 className="text-3xl font-semibold text-muted-foreground/80 mb-2">System Design Canvas</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Drag and drop components from the sidebar to design your system. Connect them to visualize architecture and get AI-powered feedback.
        </p>
        <div className="mt-8 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground border border-dashed border-muted-foreground/30">
            React Flow canvas will be initialized here.
        </div>
      </CardContent>
    </Card>
  );
}
