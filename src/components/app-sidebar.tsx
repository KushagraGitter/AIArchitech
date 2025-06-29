
"use client";

import React, { useMemo, useState } from 'react';
import { z } from 'zod';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent as ShadSidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Search, BookCopy } from 'lucide-react';
import type { EvaluateSystemDesignOutput } from '@/ai/flows/evaluate-system-design';
import type { ComponentGroup, ComponentConfig } from '@/components/designComponents'; 
import { cn } from '@/lib/utils';

const formSchema = z.object({}); 
type FormValues = z.infer<typeof formSchema>;

interface AppSidebarProps {
  aiFeedback: EvaluateSystemDesignOutput | null;
  groupedDesignComponents: ComponentGroup[]; 
  onDragStart: (event: React.DragEvent, component: ComponentConfig, color: string, borderColor: string) => void;
}

export function AppSidebar({
  aiFeedback,
  groupedDesignComponents, 
  onDragStart,
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
            <div className="sticky top-0 bg-sidebar z-10 border-b border-sidebar-border px-4 py-3 space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2 group-data-[collapsible=icon]:hidden">
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
            </div>

            <div className="p-4 space-y-4 flex-1">
              {filteredComponentGroups.map((group) => (
                  <div key={group.groupName}>
                      <SidebarGroupLabel className="px-0 text-xs uppercase tracking-wider group-data-[collapsible=icon]:hidden">
                          {group.groupName}
                      </SidebarGroupLabel>
                       <div className="mt-2 space-y-1 group-data-[collapsible=icon]:mt-0">
                          {group.components.map((component) => (
                          <div
                              key={component.name}
                              draggable={true}
                              onDragStart={(event) => onDragStart(event, component, group.color, group.borderColor)}
                              className="group/item flex items-center gap-3 p-2 rounded-lg border bg-card hover:bg-sidebar-accent cursor-grab group-data-[collapsible=icon]:justify-center"
                              title={component.name}
                          >
                              <component.icon className={cn("h-6 w-6 shrink-0 transition-colors", group.color, "group-hover/item:text-sidebar-accent-foreground")} />
                              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                                  <span className="font-semibold text-sm leading-tight text-card-foreground transition-colors group-hover/item:text-sidebar-accent-foreground">{component.name}</span>
                                  <span className="text-xs text-muted-foreground transition-colors group-hover/item:text-sidebar-accent-foreground">{component.description}</span>
                              </div>
                          </div>
                          ))}
                      </div>
                  </div>
              ))}
            </div>

          {aiFeedback && (
            <>
            <Separator className="my-2" />
            <div className="p-4 space-y-2">
              <h3 className="flex items-center gap-2 text-base font-semibold">
                <Sparkles className="h-4 w-4 text-primary" /> AI Feedback
              </h3>
              <Card className="shadow-none bg-card">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-base">Overall Assessment</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3 text-sm text-muted-foreground">
                   {aiFeedback.overallAssessment || "No overall assessment provided."}
                </CardContent>
              </Card>
              <Card className="shadow-none bg-card">
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
            </div>
            </>
          )}
        </ScrollArea>
      </ShadSidebarContent>
      <SidebarFooter className="p-2 border-t border-sidebar-border flex items-center group-data-[collapsible=icon]:justify-center">
      </SidebarFooter>
    </Sidebar>
  );
}
