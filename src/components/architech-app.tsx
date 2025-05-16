
"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Server, Database, Waypoints, ShieldCheck, Cloud, Zap, Box, Shuffle, Puzzle, BarChartBig, GitFork } from 'lucide-react';

import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent as ShadSidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  useSidebar,
} from '@/components/ui/sidebar';

import { Logo } from '@/components/logo';
import { DesignCanvas, type DesignCanvasHandles } from '@/components/design-canvas'; // Updated import
import type { EvaluateSystemDesignInput, EvaluateSystemDesignOutput } from '@/ai/flows/evaluate-system-design';
import { evaluateSystemDesign } from '@/ai/flows/evaluate-system-design';
import { Separator } from './ui/separator';

const formSchema = z.object({
  featureRequirements: z.string().min(20, { message: "Feature requirements should be descriptive, at least 20 characters." }),
});
type FormValues = z.infer<typeof formSchema>;

const designComponents = [
  { name: "Load Balancer", icon: Shuffle, iconName: "Shuffle" },
  { name: "API Gateway", icon: Waypoints, iconName: "Waypoints" },
  { name: "Web Server", icon: Server, iconName: "Server" },
  { name: "App Server", icon: Puzzle, iconName: "Puzzle" },
  { name: "Database", icon: Database, iconName: "Database" },
  { name: "Cache", icon: Zap, iconName: "Zap" },
  { name: "Message Queue", icon: GitFork, iconName: "GitFork" },
  { name: "CDN", icon: Cloud, iconName: "Cloud" },
  { name: "Firewall", icon: ShieldCheck, iconName: "ShieldCheck" },
  { name: "Storage (S3)", icon: Box, iconName: "Box" },
  { name: "Monitoring", icon: BarChartBig, iconName: "BarChartBig" },
];

function AppContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<EvaluateSystemDesignOutput | null>(null);
  const { toast } = useToast();
  const { state: sidebarState } = useSidebar();
  const canvasRef = useRef<DesignCanvasHandles>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      featureRequirements: "",
    },
  });

  const onDragStart = (event: React.DragEvent, componentName: string, iconName: string) => {
    const nodeData = { name: componentName, iconName: iconName };
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setAiFeedback(null);

    try {
      let designDiagramJson = JSON.stringify({
        info: "Default diagram data if canvas is not available.",
        nodes: [],
        edges: [],
      });

      if (canvasRef.current) {
        designDiagramJson = canvasRef.current.getDiagramJson();
      }
      
      const evaluationInput: EvaluateSystemDesignInput = {
        requirements: data.featureRequirements,
        designDiagram: designDiagramJson,
      };

      const feedback = await evaluateSystemDesign(evaluationInput);
      setAiFeedback(feedback);
      toast({
        title: "Evaluation Complete",
        description: "AI feedback has been generated successfully.",
        duration: 5000,
      });
    } catch (error) {
      console.error("Error evaluating system design:", error);
      toast({
        title: "Evaluation Error",
        description: "Failed to generate AI feedback. Check console for details.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader className="p-0">
          <Logo collapsed={sidebarState === 'collapsed'} />
        </SidebarHeader>
        <ShadSidebarContent className="p-0">
          <ScrollArea className="h-full">
            <SidebarGroup className="p-2">
              <SidebarGroupLabel className="flex items-center gap-2">
                <Box className="h-4 w-4" /> Components
              </SidebarGroupLabel>
              <SidebarMenu>
                {designComponents.map((component) => (
                  <SidebarMenuItem key={component.name}>
                    <SidebarMenuButton
                      draggable={true}
                      onDragStart={(event) => onDragStart(event, component.name, component.iconName)}
                      className="text-sm cursor-grab"
                      tooltip={component.name}
                    >
                      <component.icon className="h-4 w-4" />
                      <span>{component.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
            
            <Separator className="my-2" />

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <SidebarGroup className="p-2">
                  <SidebarGroupLabel className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> Feature Requirements
                  </SidebarGroupLabel>
                  <FormField
                    control={form.control}
                    name="featureRequirements"
                    render={({ field }) => (
                      <FormItem className="px-2">
                        <FormLabel className="sr-only">Feature Requirements</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Build a YouTube-like video streaming platform for millions of users..."
                            className="min-h-[120px] text-sm bg-input"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <div className="px-2 mt-2">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      Evaluate Design
                    </Button>
                  </div>
                </SidebarGroup>
              </form>
            </Form>

            {isLoading && (
              <Card className="m-4 shadow-none border-dashed">
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">AI is analyzing your design...</p>
                </CardContent>
              </Card>
            )}

            {aiFeedback && !isLoading && (
              <>
              <Separator className="my-2" />
              <SidebarGroup className="p-2">
                <SidebarGroupLabel className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> AI Feedback
                </SidebarGroupLabel>
                <Card className="shadow-none bg-card mt-2">
                  <CardContent className="p-0">
                    <Accordion type="single" collapsible defaultValue="suggestions" className="w-full">
                      <AccordionItem value="suggestions">
                        <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">Suggestions</AccordionTrigger>
                        <AccordionContent className="px-4 pb-3 text-sm text-muted-foreground">
                          {aiFeedback.suggestions || "No specific suggestions provided."}
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="complexity">
                        <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">Complexity</AccordionTrigger>
                        <AccordionContent className="px-4 pb-3 text-sm text-muted-foreground">
                          {aiFeedback.complexity}
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="scalability">
                        <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">Scalability</AccordionTrigger>
                        <AccordionContent className="px-4 pb-3 text-sm text-muted-foreground">
                          {aiFeedback.scalability}
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="availability">
                        <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">Availability</AccordionTrigger>
                        <AccordionContent className="px-4 pb-3 text-sm text-muted-foreground">
                          {aiFeedback.availability}
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="faultTolerance">
                        <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">Fault Tolerance</AccordionTrigger>
                        <AccordionContent className="px-4 pb-3 text-sm text-muted-foreground">
                          {aiFeedback.faultTolerance}
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="costEfficiency">
                        <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">Cost Efficiency</AccordionTrigger>
                        <AccordionContent className="px-4 pb-3 text-sm text-muted-foreground">
                          {aiFeedback.costEfficiency}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </SidebarGroup>
              </>
            )}
          </ScrollArea>
        </ShadSidebarContent>
        <SidebarFooter className="p-2 border-t border-sidebar-border">
            <p className="text-xs text-muted-foreground text-center w-full group-data-[collapsible=icon]:hidden">
              Architech AI &copy; {new Date().getFullYear()}
            </p>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="p-0 md:p-0 md:m-0 md:rounded-none">
        <header className="h-14 flex items-center px-4 border-b md:hidden">
            <SidebarTrigger />
            <span className="ml-2 font-semibold text-lg text-primary">Architech AI</span>
        </header>
        <main className="flex-1 overflow-auto p-0 h-[calc(100vh-3.5rem)] md:h-screen"> {/* Adjusted padding and height */}
            <DesignCanvas ref={canvasRef} />
        </main>
      </SidebarInset>
    </>
  );
}


export function ArchitechApp() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; 
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppContent />
    </SidebarProvider>
  );
}
