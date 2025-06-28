
"use client";

import React, { useMemo, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import type { Node, Edge } from 'reactflow';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent as ShadSidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Form } from '@/components/ui/form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Layers, FileText, Search, Wand2, BookCopy } from 'lucide-react';
import type { NodeData } from '@/components/design-canvas';
import type { EvaluateSystemDesignOutput } from '@/ai/flows/evaluate-system-design';
import type { ComponentGroup, ComponentConfig } from '@/components/designComponents'; 
import { cn } from '@/lib/utils';

const formSchema = z.object({}); 
type FormValues = z.infer<typeof formSchema>;

interface AppSidebarProps {
  form: UseFormReturn<FormValues>;
  onSubmit: (data: FormValues) => Promise<void>;
  isLoadingEvaluation: boolean;
  aiFeedback: EvaluateSystemDesignOutput | null;
  groupedDesignComponents: ComponentGroup[]; 
  initialTemplates: { name: string; nodes: Node<NodeData>[]; edges: Edge[] }[];
  onDragStart: (event: React.DragEvent, component: ComponentConfig, color: string, borderColor: string) => void;
  onLoadTemplate: (nodes: Node<NodeData>[], edges: Edge[], templateName: string) => void;
  isGeneratingDesign: boolean;
  onGenerateDesign: () => void;
}

export function AppSidebar({
  form,
  onSubmit,
  isLoadingEvaluation,
  aiFeedback,
  groupedDesignComponents, 
  initialTemplates,
  onDragStart,
  onLoadTemplate,
  isGeneratingDesign,
  onGenerateDesign,
}: AppSidebarProps) {
  const [componentSearchTerm, setComponentSearchTerm] = useState('');

  const filteredComponentGroups = useMemo(() => {
    if (!componentSearchTerm.trim()) {
      return groupedDesignComponents;
    }
    const lowerSearchTerm = componentSearchTerm.toLowerCase();
    return groupedDesignComponents
      .map(group => {
        const filteredComponents = group.components.filter(component =>
          component.name.toLowerCase().includes(lowerSearchTerm) ||
          component.description.toLowerCase().includes(lowerSearchTerm)
        );
        return { ...group, components: filteredComponents };
      })
      .filter(group => group.components.length > 0);
  }, [groupedDesignComponents, componentSearchTerm]);

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="p-0">
      </SidebarHeader>
      <ShadSidebarContent className="p-0">
        <ScrollArea className="h-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
              
              <SidebarGroup className="p-2 space-y-2 sticky top-0 bg-sidebar z-10 border-b border-sidebar-border">
                  <h3 className="text-lg font-semibold px-2 flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                    <BookCopy className="h-5 w-5"/>
                    Node Library
                  </h3>
                   <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search nodes..."
                            value={componentSearchTerm}
                            onChange={(e) => setComponentSearchTerm(e.target.value)}
                            className="pl-8 h-9 text-sm group-data-[collapsible=icon]:hidden"
                        />
                         <Search className="h-6 w-6 hidden group-data-[collapsible=icon]:block mx-auto" />
                    </div>
              </SidebarGroup>

              <div className="p-2 space-y-4">
                {filteredComponentGroups.map((group) => (
                    <div key={group.groupName}>
                        <SidebarGroupLabel className="px-2 text-xs uppercase tracking-wider group-data-[collapsible=icon]:hidden">
                            {group.groupName}
                        </SidebarGroupLabel>
                         <div className="mt-2 space-y-1 group-data-[collapsible=icon]:mt-0">
                            {group.components.map((component) => (
                            <div
                                key={component.name}
                                draggable={true}
                                onDragStart={(event) => onDragStart(event, component, group.color, group.borderColor)}
                                className="flex items-center gap-3 p-2 rounded-lg border bg-card hover:bg-accent hover:text-accent-foreground cursor-grab group-data-[collapsible=icon]:justify-center"
                                title={component.name}
                            >
                                <component.icon className={cn("h-6 w-6 shrink-0", group.color)} />
                                <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                                    <span className="font-semibold text-sm leading-tight text-card-foreground">{component.name}</span>
                                    <span className="text-xs text-muted-foreground">{component.description}</span>
                                </div>
                            </div>
                            ))}
                        </div>
                    </div>
                ))}
                 <div>
                    <SidebarGroupLabel className="px-2 text-xs uppercase tracking-wider group-data-[collapsible=icon]:hidden">
                        Templates
                    </SidebarGroupLabel>
                    <div className="mt-2 space-y-1 group-data-[collapsible=icon]:mt-0">
                        {initialTemplates.map((template) => (
                           <div
                            key={template.name}
                            onClick={() => onLoadTemplate(template.nodes, template.edges, template.name)}
                            className="flex items-center gap-3 p-2 rounded-lg border bg-card hover:bg-accent hover:text-accent-foreground cursor-pointer group-data-[collapsible=icon]:justify-center"
                            title={template.name}
                          >
                            <Layers className="h-6 w-6 shrink-0 text-primary" />
                            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                                <span className="font-semibold text-sm leading-tight text-card-foreground">{template.name}</span>
                                <span className="text-xs text-muted-foreground">Load a pre-built design</span>
                            </div>
                          </div>
                        ))}
                      </div>
                  </div>
              </div>


              <Separator className="my-2" />
              <SidebarGroup className="p-2 space-y-2">
                 <div className="grid grid-cols-2 gap-2 group-data-[collapsible=icon]:grid-cols-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onGenerateDesign}
                      disabled={isGeneratingDesign || isLoadingEvaluation}
                      className="w-full"
                    >
                      {isGeneratingDesign ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                      )}
                      <span className="group-data-[collapsible=icon]:hidden">Generate</span>
                    </Button>
                    <Button
                      type="submit"
                      className={cn(
                        "w-full rounded-full text-primary-foreground", 
                        !isLoadingEvaluation && "animate-ai-border-pulse bg-gradient-to-r from-primary via-accent to-primary bg-[size:200%_auto] animate-animated-gradient hover:opacity-90",
                        isLoadingEvaluation && "bg-primary" // Keep solid primary bg when loading
                      )}
                      disabled={isLoadingEvaluation || isGeneratingDesign}
                    >
                      {isLoadingEvaluation ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles
                          className={cn(
                            "mr-2 h-4 w-4 text-primary-foreground", 
                            !isLoadingEvaluation && "animate-ai-sparkle-pulse"
                          )}
                        />
                      )}
                      <span className="group-data-[collapsible=icon]:hidden">Evaluate</span>
                    </Button>
                  </div>
              </SidebarGroup>
            </form>
          </Form>

          {(isLoadingEvaluation || isGeneratingDesign) && (
            <Card className="m-4 shadow-none border-dashed">
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">
                  {isGeneratingDesign ? "AI is generating your design..." : "AI is analyzing your design..."}
                </p>
              </CardContent>
            </Card>
          )}

          {aiFeedback && !isLoadingEvaluation && !isGeneratingDesign && (
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
                  <Accordion type="multiple" className="w-full" defaultValue={["strengths"]}>
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
                      criterion.data &&
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
                    {aiFeedback.calculationReview && (
                      <AccordionItem value="calculationReview">
                        <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">Calculation Review</AccordionTrigger>
                        <AccordionContent className="px-4 pb-3 text-sm text-muted-foreground">
                          <p>{aiFeedback.calculationReview}</p>
                        </AccordionContent>
                      </AccordionItem>
                    )}
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
      <SidebarFooter className="p-2 border-t border-sidebar-border flex items-center group-data-[collapsible=icon]:justify-center">
      </SidebarFooter>
    </Sidebar>
  );
}
