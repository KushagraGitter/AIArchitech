
"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import type { EvaluateSystemDesignOutput } from '@/ai/flows/evaluate-system-design';
import { cn } from '@/lib/utils';

interface EvaluationResultDialogProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: EvaluateSystemDesignOutput | null;
}

const ratingColors: Record<string, string> = {
  'Excellent': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-800',
  'Good': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  'Fair': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  'Poor': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-800',
  'Needs Improvement': 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  'Not Applicable': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',
};

const EvaluationCriterion = ({ criterion }: { criterion: { id: string, label: string, data: any } }) => {
    if (!criterion.data) return null;
    return (
        <AccordionItem value={criterion.id}>
            <AccordionTrigger className="text-base hover:no-underline">
                <div className="flex items-center gap-4">
                    <span>{criterion.label}</span>
                    <Badge variant="outline" className={cn("text-xs font-bold", ratingColors[criterion.data.rating] || ratingColors['Not Applicable'])}>
                        {criterion.data.rating}
                    </Badge>
                </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
                <p className="text-muted-foreground">{criterion.data.explanation}</p>
                {criterion.data.specificRecommendations && criterion.data.specificRecommendations.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-card-foreground mb-2">Recommendations:</h4>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                            {criterion.data.specificRecommendations.map((rec: string, idx: number) => (
                                <li key={`${criterion.id}-rec-${idx}`}>{rec}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </AccordionContent>
        </AccordionItem>
    );
};


export function EvaluationResultDialog({ isOpen, onClose, feedback }: EvaluationResultDialogProps) {
  if (!feedback) return null;

  const criteria = [
      {id: 'complexity', label: 'Complexity', data: feedback.complexity},
      {id: 'scalability', label: 'Scalability', data: feedback.scalability},
      {id: 'availability', label: 'Availability', data: feedback.availability},
      {id: 'faultTolerance', label: 'Fault Tolerance', data: feedback.faultTolerance},
      {id: 'costEfficiency', label: 'Cost Efficiency', data: feedback.costEfficiency},
      {id: 'security', label: 'Security', data: feedback.security},
      {id: 'maintainability', label: 'Maintainability', data: feedback.maintainability},
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Design Evaluation
          </DialogTitle>
          <DialogDescription>
            Here's the AI-powered analysis of your system design.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Overall Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feedback.overallAssessment}</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border-green-500/50 bg-green-50 dark:bg-green-900/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Identified Strengths</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </CardHeader>
                    <CardContent>
                        {feedback.identifiedStrengths && feedback.identifiedStrengths.length > 0 ? (
                            <ul className="list-disc pl-5 space-y-1 text-sm text-green-800 dark:text-green-200">
                                {feedback.identifiedStrengths.map((item, idx) => <li key={`strength-${idx}`}>{item}</li>)}
                            </ul>
                        ) : <p className="text-sm text-muted-foreground">None identified.</p>}
                    </CardContent>
                </Card>
                <Card className="border-orange-500/50 bg-orange-50 dark:bg-orange-900/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">General Suggestions</CardTitle>
                        <Info className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </CardHeader>
                    <CardContent>
                        {feedback.suggestionsForImprovement && feedback.suggestionsForImprovement.length > 0 ? (
                            <ul className="list-disc pl-5 space-y-1 text-sm text-orange-800 dark:text-orange-200">
                                {feedback.suggestionsForImprovement.map((item, idx) => <li key={`suggestion-${idx}`}>{item}</li>)}
                            </ul>
                        ) : <p className="text-sm text-muted-foreground">No general suggestions.</p>}
                    </CardContent>
                </Card>
                 <Card className="border-red-500/50 bg-red-50 dark:bg-red-900/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">Potential Risks</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </CardHeader>
                    <CardContent>
                        {feedback.potentialRisks && feedback.potentialRisks.length > 0 ? (
                            <ul className="list-disc pl-5 space-y-1 text-sm text-red-800 dark:text-red-200">
                                {feedback.potentialRisks.map((item, idx) => <li key={`risk-${idx}`}>{item}</li>)}
                            </ul>
                        ) : <p className="text-sm text-muted-foreground">No critical risks identified.</p>}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Detailed Criteria Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="multiple" className="w-full" defaultValue={['complexity', 'scalability']}>
                        {criteria.map(c => <EvaluationCriterion key={c.id} criterion={c} />)}
                        {feedback.calculationReview && (
                            <AccordionItem value="calculationReview">
                                <AccordionTrigger className="text-base hover:no-underline">Calculation Review</AccordionTrigger>
                                <AccordionContent>
                                    <p className="text-muted-foreground">{feedback.calculationReview}</p>
                                </AccordionContent>
                            </AccordionItem>
                        )}
                    </Accordion>
                </CardContent>
            </Card>

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
