
"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Node, Edge } from 'reactflow';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Server, Database, Waypoints, ShieldCheck, Cloud, Zap, Box, Shuffle, Puzzle, BarChartBig, GitFork, Layers } from 'lucide-react';

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
import { DesignCanvas, type DesignCanvasHandles } from '@/components/design-canvas';
import type { EvaluateSystemDesignInput, EvaluateSystemDesignOutput } from '@/ai/flows/evaluate-system-design';
import { evaluateSystemDesign } from '@/ai/flows/evaluate-system-design';
import { Separator } from './ui/separator';

const formSchema = z.object({
  featureRequirements: z.string().min(20, { message: "Feature requirements should be descriptive, at least 20 characters." }),
});
type FormValues = z.infer<typeof formSchema>;

const designComponents = [
  { name: "Load Balancer", icon: Shuffle, iconName: "Shuffle", properties: {} },
  { name: "API Gateway", icon: Waypoints, iconName: "Waypoints", properties: {} },
  { name: "Web Server", icon: Server, iconName: "Server", properties: {} },
  { name: "App Server", icon: Puzzle, iconName: "Puzzle", properties: {} },
  { name: "Database", icon: Database, iconName: "Database", properties: {} },
  { name: "Cache", icon: Zap, iconName: "Zap", properties: {} },
  { name: "Message Queue", icon: GitFork, iconName: "GitFork", properties: {} },
  { name: "CDN", icon: Cloud, iconName: "Cloud", properties: {} },
  { name: "Firewall", icon: ShieldCheck, iconName: "ShieldCheck", properties: {} },
  { name: "Storage (S3)", icon: Box, iconName: "Box", properties: {} },
  { name: "Monitoring", icon: BarChartBig, iconName: "BarChartBig", properties: {} },
];

const initialTemplates: { name: string; nodes: Node[]; edges: Edge[] }[] = [
  {
    name: "Basic Web Service",
    nodes: [
      { id: 'template_lb_1', type: 'custom', position: { x: 250, y: 50 }, data: { label: 'Load Balancer', iconName: 'Shuffle', properties: {} } },
      { id: 'template_ws_1', type: 'custom', position: { x: 250, y: 200 }, data: { label: 'Web Server', iconName: 'Server', properties: {} } },
      { id: 'template_db_1', type: 'custom', position: { x: 250, y: 350 }, data: { label: 'Database', iconName: 'Database', properties: {} } },
    ],
    edges: [
      { id: 'template_e_lb_ws', source: 'template_lb_1', target: 'template_ws_1', label: 'Routes to', animated: true, style: { stroke: 'hsl(var(--primary))' } },
      { id: 'template_e_ws_db', source: 'template_ws_1', target: 'template_db_1', label: 'Reads/Writes', animated: true, style: { stroke: 'hsl(var(--primary))' } },
    ],
  },
  {
    name: "Scalable API",
    nodes: [
        { id: 'template_apigw_1', type: 'custom', position: { x: 100, y: 50 }, data: { label: 'API Gateway', iconName: 'Waypoints', properties: {} } },
        { id: 'template_app_1', type: 'custom', position: { x: 100, y: 200 }, data: { label: 'App Server 1', iconName: 'Puzzle', properties: {} } },
        { id: 'template_app_2', type: 'custom', position: { x: 300, y: 200 }, data: { label: 'App Server 2', iconName: 'Puzzle', properties: {} } },
        { id: 'template_db_read_1', type: 'custom', position: { x: 200, y: 350 }, data: { label: 'DB Read Replica', iconName: 'Database', properties: {} } },
    ],
    edges: [
        { id: 'template_e_apigw_app1', source: 'template_apigw_1', target: 'template_app_1', label: 'Proxy', animated: true, style: { stroke: 'hsl(var(--primary))' } },
        { id: 'template_e_apigw_app2', source: 'template_apigw_1', target: 'template_app_2', label: 'Proxy', animated: true, style: { stroke: 'hsl(var(--primary))' } },
        { id: 'template_e_app1_db', source: 'template_app_1', target: 'template_db_read_1', label: 'Reads from', animated: true, style: { stroke: 'hsl(var(--primary))' } },
        { id: 'template_e_app2_db', source: 'template_app_2', target: 'template_db_read_1', label: 'Reads from', animated: true, style: { stroke: 'hsl(var(--primary))' } },
    ]
  }
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

  const onDragStart = (event: React.DragEvent, componentName: string, iconName: string, properties: Record<string, any>) => {
    const nodeData = { name: componentName, iconName: iconName, properties: properties || {} };
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };
  
  const loadTemplate = (nodes: Node[], edges: Edge[]) => {
    if (canvasRef.current) {
      canvasRef.current.loadTemplate(nodes, edges);
       toast({
        title: "Template Loaded",
        description: "The selected template has been loaded onto the canvas.",
        duration: 3000,
      });
    }
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
                      onDragStart={(event) => onDragStart(event, component.name, component.iconName, component.properties)}
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

            <SidebarGroup className="p-2">
               <SidebarGroupLabel className="flex items-center gap-2">
                <Layers className="h-4 w-4" /> Templates
              </SidebarGroupLabel>
              <SidebarMenu>
                {initialTemplates.map((template) => (
                  <SidebarMenuItem key={template.name}>
                    <SidebarMenuButton
                      onClick={() => loadTemplate(template.nodes, template.edges)}
                      className="text-sm"
                      tooltip={`Load ${template.name} template`}
                    >
                      <Layers className="h-4 w-4" />
                      <span>{template.name}</span>
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
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-base">Overall Assessment</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-3 text-sm text-muted-foreground">
                     {aiFeedback.overallAssessment || "No overall assessment provided."}
                  </CardContent>
                </Card>
                <Card className="shadow-none bg-card mt-2">
                  <CardContent className="p-0">
                    <Accordion type="multiple" className="w-full">
                       <AccordionItem value="strengths">
                        <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">Identified Strengths</AccordionTrigger>
                        <AccordionContent className="px-4 pb-3 text-sm text-muted-foreground">
                          {aiFeedback.identifiedStrengths && aiFeedback.identifiedStrengths.length > 0 ? (
                            <ul className="list-disc pl-5 space-y-1">
                              {aiFeedback.identifiedStrengths.map((item, idx) => <li key={`strength-${idx}`}>{item}</li>)}
                            </ul>
                          ) : "No specific strengths identified."}
                        </AccordionContent>
                      </AccordionItem>
                       <AccordionItem value="suggestions">
                        <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">General Suggestions</AccordionTrigger>
                        <AccordionContent className="px-4 pb-3 text-sm text-muted-foreground">
                           {aiFeedback.suggestionsForImprovement && aiFeedback.suggestionsForImprovement.length > 0 ? (
                            <ul className="list-disc pl-5 space-y-1">
                              {aiFeedback.suggestionsForImprovement.map((item, idx) => <li key={`suggestion-${idx}`}>{item}</li>)}
                            </ul>
                          ) : "No general suggestions provided."}
                        </AccordionContent>
                      </AccordionItem>
                      {[
                        {id: 'complexity', label: 'Complexity', data: aiFeedback.complexity},
                        {id: 'scalability', label: 'Scalability', data: aiFeedback.scalability},
                        {id: 'availability', label: 'Availability', data: aiFeedback.availability},
                        {id: 'faultTolerance', label: 'Fault Tolerance', data: aiFeedback.faultTolerance},
                        {id: 'costEfficiency', label: 'Cost Efficiency', data: aiFeedback.costEfficiency},
                        {id: 'security', label: 'Security', data: aiFeedback.security},
                        {id: 'maintainability', label: 'Maintainability', data: aiFeedback.maintainability},
                      ].map(criterion => (
                        <AccordionItem value={criterion.id} key={criterion.id}>
                          <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">
                            {criterion.label}: <span className="ml-1 font-semibold text-primary">{criterion.data.rating}</span>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-3 text-sm text-muted-foreground space-y-2">
                            <p>{criterion.data.explanation}</p>
                            {criterion.data.specificRecommendations && criterion.data.specificRecommendations.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-card-foreground mb-1">Recommendations:</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                  {criterion.data.specificRecommendations.map((rec, idx) => <li key={`${criterion.id}-rec-${idx}`}>{rec}</li>)}
                                </ul>
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                       <AccordionItem value="risks">
                        <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">Potential Risks</AccordionTrigger>
                        <AccordionContent className="px-4 pb-3 text-sm text-muted-foreground">
                          {aiFeedback.potentialRisks && aiFeedback.potentialRisks.length > 0 ? (
                            <ul className="list-disc pl-5 space-y-1">
                              {aiFeedback.potentialRisks.map((item, idx) => <li key={`risk-${idx}`}>{item}</li>)}
                            </ul>
                          ) : "No potential risks identified."}
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
        <main className="flex-1 overflow-auto p-0 h-[calc(100vh-3.5rem)] md:h-screen">
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

