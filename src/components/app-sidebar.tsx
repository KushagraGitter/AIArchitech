"use client";

import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import type { Node, Edge } from 'reactflow';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent as ShadSidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Form } from '@/components/ui/form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Box, Layers, FileText } from 'lucide-react';
import type { NodeData } from '@/components/design-canvas';
import type { EvaluateSystemDesignOutput } from '@/ai/flows/evaluate-system-design';
import type { ComponentConfig } from '@/components/properties-panel';

const formSchema = z.object({}); // Minimal schema as form fields are dynamic now
type FormValues = z.infer<typeof formSchema>;

interface AppSidebarProps {
  form: UseFormReturn<FormValues>;
  onSubmit: (data: FormValues) => Promise<void>;
  isLoadingEvaluation: boolean;
  aiFeedback: EvaluateSystemDesignOutput | null;
  designComponents: ComponentConfig[];
  initialTemplates: { name: string; nodes: Node<NodeData>[]; edges: Edge[] }[];
  onDragStart: (event: React.DragEvent, componentName: string, iconName: string, initialProperties: Record<string, any>) => void;
  onLoadTemplate: (nodes: Node<NodeData>[], edges: Edge[], templateName: string) => void;
  onNewDesignButtonClick: () => void;
}

export function AppSidebar({
  form,
  onSubmit,
  isLoadingEvaluation,
  aiFeedback,
  designComponents,
  initialTemplates,
  onDragStart,
  onLoadTemplate,
  onNewDesignButtonClick,
}: AppSidebarProps) {
  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="p-0">
      </SidebarHeader>
      <ShadSidebarContent className="p-0">
        <ScrollArea className="h-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
              <Accordion type="multiple" defaultValue={["components-accordion", "templates-accordion"]} className="w-full">
                <AccordionItem value="components-accordion" className="border-none">
                  <AccordionTrigger className="px-2 py-1.5 hover:no-underline hover:bg-sidebar-accent rounded-md group">
                    <SidebarGroupLabel className="flex items-center gap-2 text-sm group-hover:text-sidebar-accent-foreground">
                      <Box className="h-4 w-4" /> Components
                    </SidebarGroupLabel>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-0">
                    <SidebarGroup className="p-2 pt-0">
                      <SidebarMenu>
                        {designComponents.map((component) => (
                          <SidebarMenuItem key={component.name}>
                            <SidebarMenuButton
                              draggable={true}
                              onDragStart={(event) => onDragStart(event, component.name, component.iconName, component.initialProperties)}
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
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="templates-accordion" className="border-none">
                  <AccordionTrigger className="px-2 py-1.5 hover:no-underline hover:bg-sidebar-accent rounded-md group">
                    <SidebarGroupLabel className="flex items-center gap-2 text-sm group-hover:text-sidebar-accent-foreground">
                      <Layers className="h-4 w-4" /> Templates
                    </SidebarGroupLabel>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-0">
                    <SidebarGroup className="p-2 pt-0">
                      <SidebarMenu>
                        {initialTemplates.map((template) => (
                          <SidebarMenuItem key={template.name}>
                            <SidebarMenuButton
                              onClick={() => onLoadTemplate(template.nodes, template.edges, template.name)}
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
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Separator className="my-2" />
              <SidebarGroup className="p-2 space-y-2">
                 <Button type="button" variant="secondary" className="w-full" onClick={onNewDesignButtonClick}>
                    <FileText className="mr-2 h-4 w-4" />
                    New Design
                  </Button>
                <Button type="submit" className="w-full" disabled={isLoadingEvaluation}>
                  {isLoadingEvaluation ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Evaluate Design
                </Button>
              </SidebarGroup>
            </form>
          </Form>

          {isLoadingEvaluation && (
            <Card className="m-4 shadow-none border-dashed">
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">AI is analyzing your design...</p>
              </CardContent>
            </Card>
          )}

          {aiFeedback && !isLoadingEvaluation && (
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
