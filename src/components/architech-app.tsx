
"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { Node, Edge } from 'reactflow';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTheme } from 'next-themes';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageSquarePlus, Copy, AlertTriangle, Sparkles } from 'lucide-react';
import { ReactFlowProvider } from 'reactflow';

// UI and Local Component Imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { DesignCanvas, type DesignCanvasHandles, type NodeData } from '@/components/design-canvas';
import { PropertiesPanel } from '@/components/properties-panel';
import { ChatBotWindow, type ChatMessage } from '@/components/chat-bot-window';
import { WelcomeBackDialog } from './welcome-back-dialog';
import { AuthSection } from './auth-section';
import { AppSidebar } from './app-sidebar';
import { TopNavigationBar } from './top-navigation-bar';
import { TemplateBrowserDialog } from './template-browser-dialog';
import { EvaluationResultDialog } from './evaluation-result-dialog';

// Data and Template Imports
import type { ComponentConfig } from '@/components/designComponents';
import { designComponents, groupedDesignComponents } from './designComponents';
import { initialTemplates } from './initialTemplates';
import { type ThemeOption, themes as themeOptions } from '@/components/theme-toggle-button';

// AI Flow Imports
import { evaluateSystemDesign, type EvaluateSystemDesignInput, type EvaluateSystemDesignOutput } from '@/ai/flows/evaluate-system-design';
import { generateDiagram } from '@/ai/flows/generate-diagram-flow';
import { generateTerraform, type GenerateTerraformInput, type GenerateTerraformOutput } from '@/ai/flows/generate-terraform-flow';
import { interviewBot, type InterviewBotInput } from '@/ai/flows/interview-bot-flow';

export interface UserDesign {
  id: string;
  name: string;
  nodes: Node<NodeData>[];
  edges: Edge[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
}

const formSchema = z.object({});
type FormValues = z.infer<typeof formSchema>;

const LOCAL_STORAGE_ACTIVE_DESIGN_ID = 'architechAiActiveDesignId';
const LOCAL_STORAGE_ACTIVE_DESIGN_NAME = 'architechAiActiveDesignName';
const AUTOSAVE_DELAY_MS = 3000;

const createDefaultNotes = (): Node<NodeData>[] => {
  const infoNoteConfig = designComponents.find(c => c.name === "Info Note");
  if (!infoNoteConfig) return [];

  return [
    {
      id: 'default_req_note_0',
      type: 'custom',
      position: { x: 50, y: 50 },
      data: {
        label: 'Info Note',
        iconName: infoNoteConfig.iconName,
        properties: {
          ...(infoNoteConfig.initialProperties || {}),
          title: 'Feature Requirements',
          content: '- Define functional requirements (e.g., user actions, core features).\n- Define non-functional requirements (e.g., scalability targets like 1M DAU, availability like 99.99%, latency constraints like p99 < 200ms, security considerations).',
        },
      },
    },
    {
      id: 'default_bote_note_0',
      type: 'custom',
      position: { x: 50, y: 250 },
      data: {
        label: 'Info Note',
        iconName: infoNoteConfig.iconName,
        properties: {
          ...(infoNoteConfig.initialProperties || {}),
          title: 'BOTE Calculations',
          content: '- Estimate QPS (Queries Per Second - read/write breakdown).\n- Calculate storage needs (e.g., per user, total data size).\n- Project data growth rate.\n- Assess bandwidth requirements (ingress/egress).\n- Estimate number of servers needed for key components.',
        },
      },
    },
  ];
};

export function ArchitechApp() {
  // === STATE MANAGEMENT ===
  const [isClient, setIsClient] = useState(false);
  const [isLoadingEvaluation, setIsLoadingEvaluation] = useState(false);
  const [isGeneratingDesign, setIsGeneratingDesign] = useState(false);
  const [isSavingDesign, setIsSavingDesign] = useState(false);
  const [isLoadingDesigns, setIsLoadingDesigns] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<EvaluateSystemDesignOutput | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const [userDesigns, setUserDesigns] = useState<UserDesign[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isBotLoadingResponse, setIsBotLoadingResponse] = useState(false);
  
  // Design state
  const [currentDesignId, setCurrentDesignId] = useState<string | null>(null);
  const [currentDesignName, setCurrentDesignName] = useState<string | null>(null);
  const [diagramChangedSinceLastSave, setDiagramChangedSinceLastSave] = useState(false);
  
  // Dialog states
  const [isWelcomeBackDialogOpen, setIsWelcomeBackDialogOpen] = useState(false);
  const [isMyDesignsDialogOpen, setIsMyDesignsDialogOpen] = useState(false);
  const [newDesignNameInput, setNewDesignNameInput] = useState('');
  const [isNewDesignDialogOpen, setIsNewDesignDialogOpen] = useState(false);
  const [isTemplateBrowserOpen, setIsTemplateBrowserOpen] = useState(false);
  const [isEvaluationDialogOpen, setIsEvaluationDialogOpen] = useState(false);
  
  // Terraform Export states
  const [isTerraformExportDialogOpen, setIsTerraformExportDialogOpen] = useState(false);
  const [selectedTerraformProvider, setSelectedTerraformProvider] = useState<'AWS' | 'GCP' | 'Azure' | ''>('');
  const [isTerraformResultModalOpen, setIsTerraformResultModalOpen] = useState(false);
  const [terraformExportResult, setTerraformExportResult] = useState<GenerateTerraformOutput | null>(null);
  const [isGeneratingTerraform, setIsGeneratingTerraform] = useState(false);
  
  // Internal sync states
  const [canvasLoadedDesignId, setCanvasLoadedDesignId] = useState<string | null>(null);
  const [isCanvasSyncing, setIsCanvasSyncing] = useState(false);
  const [initialDialogFlowPending, setInitialDialogFlowPending] = useState(false);
  
  // === REFS & HOOKS ===
  const canvasRef = useRef<DesignCanvasHandles>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const autosaveTimer = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const { currentUser, logout, loading: authLoading } = useAuth();
  const { setTheme } = useTheme();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSetDiagramChanged = useCallback((changed: boolean) => {
    setDiagramChangedSinceLastSave(changed);
  }, []);

  // === DATA FETCHING & SYNC ===
  const fetchUserDesigns = useCallback(async () => {
    if (!currentUser) {
      setUserDesigns([]);
      return;
    }
    setIsLoadingDesigns(true);
    try {
      const q = query(
        collection(db, 'designs'),
        where('userId', '==', currentUser.uid),
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const designs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserDesign));
      setUserDesigns(designs);
    } catch (error) {
      console.error("Error fetching user designs:", error);
      toast({ title: "Fetch Error", description: "Could not retrieve your designs.", variant: "destructive" });
    } finally {
      setIsLoadingDesigns(false);
    }
  }, [currentUser, toast]);
  
  // === CORE DESIGN ACTIONS ===

  const handleNewDesign = (name: string) => {
    if (canvasRef.current) {
      canvasRef.current.loadTemplate(createDefaultNotes(), []);
    }
    setCurrentDesignName(name);
    setCurrentDesignId(null); 
    setAiFeedback(null);
    setChatMessages([]);
    setSelectedNode(null);
    handleSetDiagramChanged(true); 
    localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_ID);
    localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_NAME);
    setCanvasLoadedDesignId(`new_${Date.now()}`); 
  };
  
  const handleLoadDesign = useCallback(async (designId: string, designName: string) => {
    try {
      const designRef = doc(db, 'designs', designId);
      const designSnap = await getDoc(designRef);
      if (designSnap.exists() && canvasRef.current) {
        const designData = designSnap.data();
        const nodes = designData.nodes || [];
        const edges = designData.edges || [];
        
        canvasRef.current.loadTemplate(nodes, edges);
        setCurrentDesignId(designId);
        setCurrentDesignName(designName);
        setCanvasLoadedDesignId(designId);
        handleSetDiagramChanged(false);
        setAiFeedback(null);
        setSelectedNode(null);

        localStorage.setItem(LOCAL_STORAGE_ACTIVE_DESIGN_ID, designId);
        localStorage.setItem(LOCAL_STORAGE_ACTIVE_DESIGN_NAME, designName);
        return true;
      } else {
        toast({ title: "Load Failed", description: "Design not found.", variant: "destructive" });
        return false;
      }
    } catch (error) {
      console.error("Error loading design:", error);
      toast({ title: "Load Error", description: "Could not load the design.", variant: "destructive" });
      return false;
    }
  }, [toast, handleSetDiagramChanged]);

  const handleSaveDesign = useCallback(async (isAutoSave = false) => {
    if (!currentUser || !canvasRef.current || !currentDesignName) return;

    if (!isAutoSave) setIsSavingDesign(true);

    try {
      const diagramJson = canvasRef.current.getDiagramJson();
      const { nodes, edges } = JSON.parse(diagramJson);

      const designData = {
        name: currentDesignName,
        nodes,
        edges,
        userId: currentUser.uid,
        updatedAt: serverTimestamp(),
      };

      let designIdToSave = currentDesignId;

      if (designIdToSave) {
        const designRef = doc(db, 'designs', designIdToSave);
        await setDoc(designRef, designData, { merge: true });
      } else {
        const docRef = await addDoc(collection(db, 'designs'), { ...designData, createdAt: serverTimestamp() });
        designIdToSave = docRef.id;
        setCurrentDesignId(docRef.id);
        localStorage.setItem(LOCAL_STORAGE_ACTIVE_DESIGN_ID, docRef.id);
        localStorage.setItem(LOCAL_STORAGE_ACTIVE_DESIGN_NAME, currentDesignName);
      }
      
      setCanvasLoadedDesignId(designIdToSave);
      handleSetDiagramChanged(false);
      
      if (!isAutoSave) {
        toast({ title: "Design Saved!", description: `"${currentDesignName}" has been saved.` });
        fetchUserDesigns();
      } else {
        console.log(`Autosave: Successfully saved ${designIdToSave}`);
      }
    } catch (error) {
      console.error("Error saving design:", error);
      const message = error instanceof Error ? error.message : String(error);
      toast({ title: "Save Failed", description: `Could not save design. ${message}`, variant: "destructive" });
    } finally {
      if (!isAutoSave) setIsSavingDesign(false);
    }
  }, [currentUser, currentDesignName, currentDesignId, canvasRef, toast, fetchUserDesigns, handleSetDiagramChanged]);

  const handleDeleteDesign = async (designId: string) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, 'designs', designId));
      toast({ title: "Design Deleted", description: "The design was successfully deleted." });

      if (designId === currentDesignId) {
        handleNewDesign("Untitled Design");
      }
      fetchUserDesigns();
    } catch (error) {
       toast({ title: "Delete Failed", description: "Could not delete the design.", variant: "destructive" });
    }
  };
  
  const loadTemplate = (nodes: Node<NodeData>[], edges: Edge[], name: string) => {
    if (canvasRef.current) {
        canvasRef.current.loadTemplate(nodes, edges);
        setSelectedNode(null);
        setChatMessages([]);
        const newName = `${name} (Unsaved)`;
        setCurrentDesignName(newName);
        setCurrentDesignId(null); 
        setCanvasLoadedDesignId(null);
        localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_ID);
        localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_NAME);
        handleSetDiagramChanged(false);
        toast({
          title: "Template Loaded!",
          description: `You are now working on a copy of the "${name}" template.`,
        });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Copied to clipboard!" });
    }, (err) => {
      toast({ title: "Failed to copy", description: err.message, variant: "destructive" });
    });
  };

  // === DIALOG HANDLERS ===
  const handleNewDesignButtonClick = () => {
    if (diagramChangedSinceLastSave) {
        // Here you might want a confirmation dialog
        handleOpenNewDesignDialog(true);
    } else {
        handleOpenNewDesignDialog(true);
    }
  };

  const handleOpenNewDesignDialog = (isOpen: boolean) => {
    setNewDesignNameInput('');
    setIsNewDesignDialogOpen(isOpen);
  };
  
  const confirmNewDesign = () => {
    if (newDesignNameInput.trim()) {
      handleNewDesign(newDesignNameInput.trim());
      setIsNewDesignDialogOpen(false);
    }
  };

  // === COMPONENT & CANVAS HANDLERS ===
  const handleNodeSelect = useCallback((node: Node<NodeData> | null) => {
    setSelectedNode(node);
  }, []);

  const handleUpdateNodeProperties = (nodeId: string, updatedProperties: Record<string, any>) => {
    if (canvasRef.current) {
      canvasRef.current.updateNodeProperties(nodeId, updatedProperties);
      handleSetDiagramChanged(true);
    }
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode(prevNode => prevNode ? ({
        ...prevNode,
        data: {
          ...prevNode.data,
          properties: { ...prevNode.data.properties, ...updatedProperties }
        }
      }) : null);
    }
  };

  const onDragStart = (event: React.DragEvent, component: ComponentConfig, color: string, borderColor: string) => {
    const nodeData = { 
        name: component.name, 
        iconName: component.iconName, 
        properties: component.initialProperties || {},
        color: color,
        borderColor: borderColor,
    };
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };
  
  const selectedComponentConfig = selectedNode 
    ? designComponents.find(c => c.name === selectedNode.data.label || c.iconName === selectedNode.data.iconName)
    : undefined;

  // === AI & EXTERNAL TOOL HANDLERS ===

  const extractContextFromDiagram = () => {
    let designDiagramJson = JSON.stringify({ nodes: [], edges: [] });
    let extractedRequirements = "";
    let extractedBoteCalculations = "";

    if (canvasRef.current) {
      const diagramString = canvasRef.current.getDiagramJson();
      designDiagramJson = diagramString;
      const diagram = JSON.parse(diagramString) as { nodes: Node<NodeData>[], edges: Edge[] };

      const requirementsNotes: string[] = [];
      const boteNotes: string[] = [];

      diagram.nodes.forEach(node => {
        if (node.data.label === "Info Note" && node.data.properties) {
          const title = (node.data.properties.title || "").toLowerCase();
          const content = node.data.properties.content || "";
          if (title.includes("requirement")) {
            requirementsNotes.push(content);
          } else if (title.includes("bote") || title.includes("calculation")) {
            boteNotes.push(content);
          }
        }
      });
      extractedRequirements = requirementsNotes.join("\n\n");
      extractedBoteCalculations = boteNotes.join("\n\n");
       if (!extractedRequirements) {
         extractedRequirements = "No feature requirements provided via Info Notes on the canvas.";
       }
    }
    return { designDiagramJson, extractedRequirements, extractedBoteCalculations };
  };

  const onSubmitEvaluation: SubmitHandler<FormValues> = async (_formData) => {
    if (!currentUser) {
        toast({
            title: "Login Required",
            description: "Please log in to evaluate designs.",
            variant: "destructive"
        });
        return;
    }
    setIsLoadingEvaluation(true);
    setAiFeedback(null);

    try {
      const { designDiagramJson, extractedRequirements, extractedBoteCalculations } = extractContextFromDiagram();

      const evaluationInput: EvaluateSystemDesignInput = {
        requirements: extractedRequirements,
        designDiagram: designDiagramJson,
        backOfTheEnvelopeCalculations: extractedBoteCalculations || undefined,
      };

      const feedback = await evaluateSystemDesign(evaluationInput);
      setAiFeedback(feedback);
      setIsEvaluationDialogOpen(true);
      toast({
        title: "Evaluation Complete",
        description: "AI feedback has been generated successfully.",
        duration: 5000,
      });
    } catch (error) {
      console.error("Error evaluating design:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        title: "Evaluation Failed",
        description: `The AI could not evaluate your design. ${message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingEvaluation(false);
    }
  };

  const handleNewEvaluation = () => {
    if (!isLoadingEvaluation) {
      onSubmitEvaluation({});
    }
  };

  const handleOpenEvaluationDialog = () => {
    if (aiFeedback) {
        setIsEvaluationDialogOpen(true);
    }
  };

  const handleGenerateDesign = async () => {
    setIsGeneratingDesign(true);
    setAiFeedback(null);

    try {
      const { extractedRequirements } = extractContextFromDiagram();
      if (!extractedRequirements || extractedRequirements.trim().length < 10 || extractedRequirements.includes("No feature requirements")) {
        toast({
          title: "Requirements Needed",
          description: "Please provide detailed feature requirements in an 'Info Note' on the canvas before generating a design.",
          variant: "destructive",
        });
        setIsGeneratingDesign(false);
        return;
      }

      const result = await generateDiagram({ requirements: extractedRequirements });

      if (canvasRef.current) {
        canvasRef.current.loadTemplate(result.nodes, result.edges);
        setSelectedNode(null);
        setChatMessages([]);

        const newName = "Generated Design (Unsaved)";
        setCurrentDesignName(newName);
        setCurrentDesignId(null);
        setCanvasLoadedDesignId(null);
        localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_ID);
        localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_NAME);
        handleSetDiagramChanged(false);

        toast({
          title: "Diagram Generated!",
          description: "A new design has been generated from your requirements. Save it to keep your changes.",
        });
      }
    } catch (error) {
      console.error("Error generating design:", error);
      toast({
        title: "Generation Failed",
        description: `The AI could not generate a diagram. ${error instanceof Error ? error.message : "Please check the console."}`,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingDesign(false);
    }
  };

  const handleSendMessageToBot = async (message: string) => {
    if (!message.trim()) return;
     if (!currentUser) {
        toast({
            title: "Login Required",
            description: "Please log in to use the Interview Bot.",
            variant: "destructive"
        });
        const systemMessage: ChatMessage = { role: 'system', content: "Please log in to interact with the Interview Bot."};
        setChatMessages(prev => [...prev, systemMessage]);
        return;
    }

    const newUserMessage: ChatMessage = { role: 'user', content: message };
    setChatMessages(prevMessages => [...prevMessages, newUserMessage]);
    setIsBotLoadingResponse(true);

    try {
      const { designDiagramJson, extractedRequirements, extractedBoteCalculations } = extractContextFromDiagram();

      const validChatHistory = chatMessages
        .filter(msg => msg.role === 'user' || msg.role === 'model')
        .map(msg => ({role: msg.role as 'user' | 'model', content: msg.content}));

      const botInput: InterviewBotInput = {
        diagramJson: designDiagramJson,
        featureRequirements: extractedRequirements,
        boteCalculations: extractedBoteCalculations || undefined,
        chatHistory: validChatHistory,
        currentUserMessage: message,
      };

      const response = await interviewBot(botInput);
      const newAiMessage: ChatMessage = { role: 'model', content: response.aiResponseMessage };
      setChatMessages(prevMessages => [...prevMessages, newAiMessage]);

    } catch (error) {
      console.error("Error with Interview Bot:", error);
      const errorResponseMessage: ChatMessage = { role: 'system', content: `Error: ${error instanceof Error ? error.message : "Could not get response from bot."}` };
      setChatMessages(prevMessages => [...prevMessages, errorResponseMessage]);
      toast({
        title: "Interview Bot Error",
        description: `Failed to get response from bot. ${error instanceof Error ? error.message : "Check console for details."}`,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsBotLoadingResponse(false);
    }
  };
  
  const handleExportToTerraformClick = () => {
    setIsTerraformExportDialogOpen(true);
  };

  const handleGenerateTerraformSubmit = async () => {
    if (!selectedTerraformProvider || !canvasRef.current) return;
    setIsGeneratingTerraform(true);
    setTerraformExportResult(null);
    setIsTerraformResultModalOpen(true);

    try {
        const diagramJson = canvasRef.current.getDiagramJson();
        const input: GenerateTerraformInput = {
            diagramJson,
            targetProvider: selectedTerraformProvider,
        };
        const result = await generateTerraform(input);
        setTerraformExportResult(result);
    } catch (error) {
        console.error("Error generating Terraform:", error);
        toast({ title: "Terraform Generation Failed", variant: "destructive" });
        setIsTerraformResultModalOpen(false);
    } finally {
        setIsGeneratingTerraform(false);
        setIsTerraformExportDialogOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  // === LIFECYCLE & SYNC EFFECTS ===

  useEffect(() => {
    const initializeAppForUser = async () => {
      if (!currentUser) { 
        setCurrentDesignId(null);
        setCurrentDesignName(null);
        setCanvasLoadedDesignId(null);
        setUserDesigns([]);
        if (canvasRef.current) canvasRef.current.loadTemplate(createDefaultNotes(), []);
        setAiFeedback(null);
        setChatMessages([]);
        setSelectedNode(null);
        setIsWelcomeBackDialogOpen(false);
        setIsMyDesignsDialogOpen(false);
        setInitialDialogFlowPending(false);
        handleSetDiagramChanged(false);
        localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_ID);
        localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_NAME);
        return;
      }

      await fetchUserDesigns(); 

      const storedActiveDesignId = localStorage.getItem(LOCAL_STORAGE_ACTIVE_DESIGN_ID);
      const storedActiveDesignName = localStorage.getItem(LOCAL_STORAGE_ACTIVE_DESIGN_NAME);
      
      if (storedActiveDesignId && storedActiveDesignName) {
        setCurrentDesignId(storedActiveDesignId); 
        setCurrentDesignName(storedActiveDesignName);
        setInitialDialogFlowPending(false); 
        
        if (canvasRef.current) {
          const loaded = await handleLoadDesign(storedActiveDesignId, storedActiveDesignName);
          if(!loaded) { 
             localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_ID);
             localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_NAME);
             setCurrentDesignId(null);
             setCurrentDesignName(null);
             setCanvasLoadedDesignId(null);
             setInitialDialogFlowPending(true); 
          }
        }
      } else {
         if (!currentDesignId && canvasRef.current) { 
             canvasRef.current.loadTemplate(createDefaultNotes(), []);
             setCanvasLoadedDesignId(null); 
             handleSetDiagramChanged(false);
        }
        setInitialDialogFlowPending(true); 
      }
    };

    if (isClient) {
      initializeAppForUser();
    }
  }, [currentUser, isClient, fetchUserDesigns, handleLoadDesign, handleSetDiagramChanged]);

  useEffect(() => {
    const syncCanvas = async () => {
      if (currentDesignId && currentDesignName && canvasRef.current && canvasLoadedDesignId !== currentDesignId && !isCanvasSyncing) {
        setIsCanvasSyncing(true);
        const loadedSuccessfully = await handleLoadDesign(currentDesignId, currentDesignName);
        if (!loadedSuccessfully) {
          localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_ID);
          localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_NAME);
          setCurrentDesignId(null);
          setCurrentDesignName(null);
          setCanvasLoadedDesignId(null);
          setInitialDialogFlowPending(true); 
          if (canvasRef.current) canvasRef.current.loadTemplate(createDefaultNotes(), []);
        }
        setIsCanvasSyncing(false);
      }
    };
    const timer = setTimeout(syncCanvas, 100); 
    return () => clearTimeout(timer);
  }, [currentDesignId, currentDesignName, canvasLoadedDesignId, isCanvasSyncing, handleLoadDesign]);

  useEffect(() => {
    if (currentUser && initialDialogFlowPending && !isLoadingDesigns && currentDesignId === null) {
      if (userDesigns.length > 0) {
        setIsWelcomeBackDialogOpen(true);
      } else {
        handleOpenNewDesignDialog(true);
      }
      setInitialDialogFlowPending(false); 
    }
  }, [currentUser, initialDialogFlowPending, isLoadingDesigns, userDesigns, currentDesignId]);

  useEffect(() => {
    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current);
    }
    if (diagramChangedSinceLastSave && currentUser && currentDesignId && !isSavingDesign) {
      autosaveTimer.current = setTimeout(() => {
        handleSaveDesign(true);
      }, AUTOSAVE_DELAY_MS);
    }
    return () => {
      if (autosaveTimer.current) {
        clearTimeout(autosaveTimer.current);
      }
    };
  }, [diagramChangedSinceLastSave, currentUser, currentDesignId, isSavingDesign, handleSaveDesign]);

  // === RENDER LOGIC ===
  if (!isClient || (authLoading && !currentUser)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) {
    return <AuthSection />;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex flex-col h-screen">
        <TopNavigationBar
            currentDesignName={currentDesignName}
            currentUser={currentUser}
            isSavingDesign={isSavingDesign}
            onMyDesignsClick={() => {
              fetchUserDesigns();
              setIsMyDesignsDialogOpen(true);
              setIsWelcomeBackDialogOpen(false);
            }}
            onSaveDesign={() => handleSaveDesign(false)}
            canSave={!!currentDesignId && !!currentDesignName}
            onExportDesign={() => {}} // Placeholder
            onImportDesignClick={() => importFileRef.current?.click()}
            onExportToTerraformClick={handleExportToTerraformClick}
            onNewDesignClick={handleNewDesignButtonClick}
            onBrowseTemplatesClick={() => setIsTemplateBrowserOpen(true)}
            onLogout={handleLogout}
            themes={themeOptions}
            setTheme={setTheme}
        />
        <div className="flex flex-1 min-h-0">
          <AppSidebar
            aiFeedback={aiFeedback}
            groupedDesignComponents={groupedDesignComponents}
            onDragStart={onDragStart}
          />
          <SidebarInset className="p-0 m-0 rounded-none flex flex-col">
            <ReactFlowProvider>
              <div className="flex flex-1 min-h-0">
                <main className="flex-1 overflow-auto p-0 flex flex-col">
                  <DesignCanvas
                    ref={canvasRef}
                    className="flex-1"
                    onNodeSelect={handleNodeSelect}
                    onStructuralChange={() => handleSetDiagramChanged(true)}
                    onEvaluateClick={handleNewEvaluation}
                    onSeeEvaluationClick={handleOpenEvaluationDialog}
                    isLoadingEvaluation={isLoadingEvaluation}
                    aiFeedback={aiFeedback}
                  />
                </main>
                {selectedNode && selectedComponentConfig && (
                  <aside className="w-80 border-l border-border bg-card hidden md:block">
                    <PropertiesPanel
                      key={selectedNode.id}
                      selectedNode={selectedNode}
                      componentConfig={selectedComponentConfig}
                      onUpdateNode={handleUpdateNodeProperties}
                      onClose={() => setSelectedNode(null)}
                    />
                  </aside>
                )}
                {selectedNode && !selectedComponentConfig && (
                  <aside className="w-80 border-l border-border bg-card hidden md:block p-4">
                    <Card>
                      <CardHeader><CardTitle>Component Error</CardTitle></CardHeader>
                      <CardContent>
                        <p className="text-sm text-destructive">Could not find configuration for: "{selectedNode.data.label}".</p>
                      </CardContent>
                    </Card>
                  </aside>
                )}
              </div>
            </ReactFlowProvider>
          </SidebarInset>
        </div>

        {/* Action Buttons & Dialogs */}
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setIsChatOpen(prev => !prev)}
          aria-label="Toggle Interview Bot"
        >
          <MessageSquarePlus className="h-7 w-7" />
        </Button>

        <ChatBotWindow
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          messages={chatMessages}
          onSendMessage={handleSendMessageToBot}
          isLoadingAiResponse={isBotLoadingResponse}
        />

        <WelcomeBackDialog
          isOpen={isWelcomeBackDialogOpen || isMyDesignsDialogOpen}
          onClose={() => {
            setIsWelcomeBackDialogOpen(false);
            setIsMyDesignsDialogOpen(false);
            if (!currentDesignId && canvasRef.current && !isMyDesignsDialogOpen) { 
                handleNewDesign("Untitled Design");
            }
          }}
          dialogType={isMyDesignsDialogOpen ? "myDesigns" : "welcomeBack"}
          designs={userDesigns}
          onLoadDesignClick={(designId, designName) => {
            handleLoadDesign(designId, designName);
            setIsWelcomeBackDialogOpen(false);
            setIsMyDesignsDialogOpen(false);
          }}
          onCreateNewClick={() => {
            setIsWelcomeBackDialogOpen(false);
            setIsMyDesignsDialogOpen(false);
            handleOpenNewDesignDialog(true);
          }}
          onDeleteDesign={handleDeleteDesign}
        />
        
        <TemplateBrowserDialog
          isOpen={isTemplateBrowserOpen}
          onClose={() => setIsTemplateBrowserOpen(false)}
          templates={initialTemplates}
          onLoadTemplate={(nodes, edges, name) => {
            loadTemplate(nodes, edges, name);
            setIsTemplateBrowserOpen(false);
          }}
        />

        <EvaluationResultDialog 
          isOpen={isEvaluationDialogOpen}
          onClose={() => setIsEvaluationDialogOpen(false)}
          feedback={aiFeedback}
        />

        {isNewDesignDialogOpen && (
          <Dialog open={isNewDesignDialogOpen} onOpenChange={(isOpen) => {
            if (!isOpen && !currentDesignId && currentUser && canvasRef.current) {
              if(!isWelcomeBackDialogOpen && !isMyDesignsDialogOpen) {
                handleNewDesign("Untitled Design");
              }
            }
            if (!isOpen) setNewDesignNameInput('');
            setIsNewDesignDialogOpen(isOpen);
          }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Design</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-2">
                <Label htmlFor="newDesignName" className="text-sm font-medium">Design Name</Label>
                <Input
                  id="newDesignName"
                  value={newDesignNameInput}
                  onChange={(e) => setNewDesignNameInput(e.target.value)}
                  placeholder="Enter a name for your system design"
                  onKeyDown={(e) => e.key === 'Enter' && newDesignNameInput.trim() && confirmNewDesign()}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <Button type="button" onClick={confirmNewDesign} disabled={!newDesignNameInput.trim()}>Create Design</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <Dialog open={isTerraformExportDialogOpen} onOpenChange={setIsTerraformExportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export to Terraform (Experimental)</DialogTitle>
              <DialogDescription>Select a target cloud provider.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <Label htmlFor="terraformProvider" className="text-sm font-medium">Cloud Provider</Label>
                <Select
                  value={selectedTerraformProvider}
                  onValueChange={(value) => setSelectedTerraformProvider(value as 'AWS' | 'GCP' | 'Azure' | '')}
                >
                  <SelectTrigger id="terraformProvider" className="mt-1"><SelectValue placeholder="Select a provider" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AWS">Amazon Web Services (AWS)</SelectItem>
                    <SelectItem value="GCP">Google Cloud Platform (GCP)</SelectItem>
                    <SelectItem value="Azure">Microsoft Azure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="button" onClick={handleGenerateTerraformSubmit} disabled={!selectedTerraformProvider || isGeneratingTerraform}>
                {isGeneratingTerraform ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Generate HCL
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isTerraformResultModalOpen} onOpenChange={setIsTerraformResultModalOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Generated Terraform HCL</DialogTitle>
              <DialogDescription>This is a skeleton HCL. Review and modify it carefully.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4 max-h-[70vh] flex flex-col">
              {isGeneratingTerraform ? (
                <div className="flex items-center justify-center p-8"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
              ) : terraformExportResult && (
                <>
                  {terraformExportResult.warnings && terraformExportResult.warnings.length > 0 && (
                    <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-900/10">
                      <CardHeader className="pb-2 pt-3 px-4">
                        <CardTitle className="text-base text-yellow-700 dark:text-yellow-300 flex items-center"><AlertTriangle className="h-5 w-5 mr-2" /> Warnings</CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-3 text-sm text-yellow-600 dark:text-yellow-400">
                        <ul className="list-disc pl-5 space-y-1">
                          {terraformExportResult.warnings.map((w, i) => <li key={`w-${i}`}>{w}</li>)}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                  <div className="flex-1 overflow-hidden flex flex-col">
                    <Label htmlFor="terraformHclOutput" className="text-sm font-medium mb-1">Terraform Code:</Label>
                    <Textarea
                      id="terraformHclOutput"
                      value={terraformExportResult.terraformHcl}
                      readOnly
                      className="h-full min-h-[200px] font-mono text-xs p-3 bg-muted/30 border-0 focus-visible:ring-0"
                      rows={15}
                    />
                  </div>
                  <Button onClick={() => copyToClipboard(terraformExportResult.terraformHcl)} variant="outline" className="mt-2 self-start"><Copy className="mr-2 h-4 w-4" /> Copy HCL</Button>
                  {terraformExportResult.suggestions && terraformExportResult.suggestions.length > 0 && (
                    <Card className="border-blue-500/50 bg-blue-50 dark:bg-blue-900/10 mt-4">
                      <CardHeader className="pb-2 pt-3 px-4"><CardTitle className="text-base text-blue-700 dark:text-blue-300">Suggestions</CardTitle></CardHeader>
                      <CardContent className="px-4 pb-3 text-sm text-blue-600 dark:text-blue-400">
                        <ul className="list-disc pl-5 space-y-1">
                          {terraformExportResult.suggestions.map((s, i) => <li key={`s-${i}`}>{s}</li>)}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
            <DialogFooter><Button onClick={() => setIsTerraformResultModalOpen(false)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
}

    