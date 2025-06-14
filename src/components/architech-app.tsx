
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Node, Edge } from 'reactflow';
import { ReactFlowProvider } from 'reactflow';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase'; 

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageSquarePlus, Copy, AlertTriangle } from 'lucide-react';

import { DesignCanvas, type DesignCanvasHandles, type NodeData } from '@/components/design-canvas';
import { PropertiesPanel } from '@/components/properties-panel';
import type { EvaluateSystemDesignInput, EvaluateSystemDesignOutput } from '@/ai/flows/evaluate-system-design';
import { evaluateSystemDesign } from '@/ai/flows/evaluate-system-design';
import type { GenerateTerraformInput, GenerateTerraformOutput } from '@/ai/flows/generate-terraform-flow';
import { generateTerraform } from '@/ai/flows/generate-terraform-flow';
import { themes as themeOptions, type ThemeOption } from '@/components/theme-toggle-button'; 
import { ChatBotWindow, type ChatMessage } from '@/components/chat-bot-window';
import type { InterviewBotInput } from '@/ai/flows/interview-bot-flow';
import { interviewBot } from '@/ai/flows/interview-bot-flow';
import { useAuth } from '@/contexts/AuthContext';
import { WelcomeBackDialog } from '@/components/welcome-back-dialog';
import { useTheme } from "next-themes";

import { AuthSection } from './auth-section';
import { AppSidebar } from './app-sidebar';
import { TopNavigationBar } from './top-navigation-bar';
import { designComponents as allDesignComponents, groupedDesignComponents } from './designComponents';
import { initialTemplates } from './initialTemplates';

const formSchema = z.object({
  // Minimal schema, actual fields are dynamic
});
type FormValues = z.infer<typeof formSchema>;


export interface UserDesign {
  id: string;
  name: string;
  updatedAt: Timestamp;
}

const LOCAL_STORAGE_ACTIVE_DESIGN_ID = 'architechAiActiveDesignId';
const LOCAL_STORAGE_ACTIVE_DESIGN_NAME = 'architechAiActiveDesignName';
const AUTOSAVE_DELAY_MS = 2000;


const createDefaultNotes = (): Node<NodeData>[] => {
  const infoNoteConfig = allDesignComponents.find(c => c.name === "Info Note");
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


function AppContent() {
  const [isLoadingEvaluation, setIsLoadingEvaluation] = useState(false);
  const [isSavingDesign, setIsSavingDesign] = useState(false);
  const [isLoadingDesigns, setIsLoadingDesigns] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<EvaluateSystemDesignOutput | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const { toast } = useToast();
  const canvasRef = useRef<DesignCanvasHandles>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isBotLoadingResponse, setIsBotLoadingResponse] = useState(false);

  const [isNewDesignDialogOpen, setIsNewDesignDialogOpen] = useState(false);
  const [newDesignNameInput, setNewDesignNameInput] = useState('');
  const [currentDesignName, setCurrentDesignName] = useState<string | null>(null);
  const [currentDesignId, setCurrentDesignId] = useState<string | null>(null);
  const [userDesigns, setUserDesigns] = useState<UserDesign[]>([]);

  const [isWelcomeBackDialogOpen, setIsWelcomeBackDialogOpen] = useState(false);
  const [isMyDesignsDialogOpen, setIsMyDesignsDialogOpen] = useState(false); 
  const [initialDialogFlowPending, setInitialDialogFlowPending] = useState(false);

  const [diagramChangedSinceLastSave, setDiagramChangedSinceLastSave] = useState(false);
  const autosaveTimer = useRef<NodeJS.Timeout | null>(null);

  const [canvasLoadedDesignId, setCanvasLoadedDesignId] = useState<string | null>(null);
  const [isCanvasSyncing, setIsCanvasSyncing] = useState(false);

  const [isTerraformExportDialogOpen, setIsTerraformExportDialogOpen] = useState(false);
  const [selectedTerraformProvider, setSelectedTerraformProvider] = useState<'AWS' | 'GCP' | 'Azure' | ''>('');
  const [isTerraformResultModalOpen, setIsTerraformResultModalOpen] = useState(false);
  const [terraformExportResult, setTerraformExportResult] = useState<GenerateTerraformOutput | null>(null);
  const [isGeneratingTerraform, setIsGeneratingTerraform] = useState(false);


  const { currentUser, logout, loading: authLoading } = useAuth();
  const { setTheme } = useTheme();


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const handleSetDiagramChanged = useCallback((changed: boolean) => {
    console.log("Setting diagramChangedSinceLastSave to:", changed);
    setDiagramChangedSinceLastSave(changed);
  }, []);

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
      const designs: UserDesign[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.designName && data.updatedAt) {
            designs.push({
            id: doc.id,
            name: data.designName,
            updatedAt: data.updatedAt as Timestamp,
            });
        }
      });
      setUserDesigns(designs);
    } catch (error) {
      console.error("Error fetching user designs:", error);
      toast({
        title: "Error Fetching Designs",
        description: `Could not load your saved designs. ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingDesigns(false);
    }
  }, [currentUser, toast]);


 const handleLoadDesign = useCallback(async (designId: string, designName: string): Promise<boolean> => {
    if (!currentUser) {
      toast({ title: "Login Required", description: "Please log in to load designs.", variant: "destructive" });
      return false;
    }

    setIsLoadingDesigns(true);
    try {
      const designRef = doc(db, 'designs', designId);
      const docSnap = await getDoc(designRef);

      if (docSnap.exists()) {
        const designData = docSnap.data();
        const diagram = JSON.parse(designData.diagramJson) as { nodes: Node<NodeData>[], edges: Edge[] };

        setCurrentDesignId(designId);
        setCurrentDesignName(designName);
        localStorage.setItem(LOCAL_STORAGE_ACTIVE_DESIGN_ID, designId);
        localStorage.setItem(LOCAL_STORAGE_ACTIVE_DESIGN_NAME, designName);

        if (canvasRef.current) {
            canvasRef.current.loadTemplate(diagram.nodes, diagram.edges);
            setCanvasLoadedDesignId(designId);
            console.log(`handleLoadDesign: Successfully loaded ${designId} to canvas.`);
        } else {
            console.warn(`handleLoadDesign: Canvas not ready for ${designId}. It should load via sync effect.`);
        }

        setSelectedNode(null);
        setAiFeedback(null);
        setChatMessages([]);
        handleSetDiagramChanged(false);
        toast({ title: "Design Loaded", description: `"${designName}" is now active.` });
        return true;
      } else {
        toast({ title: "Load Failed", description: `Design "${designName}" (ID: ${designId}) not found.`, variant: "destructive" });
        if (localStorage.getItem(LOCAL_STORAGE_ACTIVE_DESIGN_ID) === designId) {
          localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_ID);
          localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_NAME);
        }
        if (currentDesignId === designId) {
            setCurrentDesignId(null);
            setCurrentDesignName(null);
            setCanvasLoadedDesignId(null);
        }
        return false;
      }
    } catch (error) {
      console.error("Error loading design:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({ title: "Load Error", description: `Could not load design "${designName}". ${errorMessage}`, variant: "destructive" });

      if (localStorage.getItem(LOCAL_STORAGE_ACTIVE_DESIGN_ID) === designId) {
        localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_ID);
        localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_NAME);
      }
       if (currentDesignId === designId) {
            setCurrentDesignId(null);
            setCurrentDesignName(null);
            setCanvasLoadedDesignId(null);
        }
      return false;
    } finally {
        setIsLoadingDesigns(false);
    }
  }, [currentUser, toast, currentDesignId, handleSetDiagramChanged]);


  const handleOpenNewDesignDialog = useCallback((promptForName = false) => {
    setNewDesignNameInput('');
    if (!currentUser) {
        toast({
            title: "Login Required",
            description: "Please log in to create and save new designs.",
            variant: "destructive"
        });
        return;
    }
    if (promptForName) {
        setIsNewDesignDialogOpen(true);
    } else {
        const newId = crypto.randomUUID();
        setCurrentDesignId(newId);
        setCurrentDesignName("Untitled Design");
        setCanvasLoadedDesignId(newId);
        localStorage.setItem(LOCAL_STORAGE_ACTIVE_DESIGN_ID, newId);
        localStorage.setItem(LOCAL_STORAGE_ACTIVE_DESIGN_NAME, "Untitled Design");
        if (canvasRef.current) canvasRef.current.loadTemplate(createDefaultNotes(), []);
        setSelectedNode(null);
        setAiFeedback(null);
        setChatMessages([]);
        handleSetDiagramChanged(false);
    }
  },[currentUser, toast, handleSetDiagramChanged]);


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
        console.log("Found active design in localStorage:", storedActiveDesignId, storedActiveDesignName);
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
        } else {
            console.log("initializeAppForUser: Canvas not ready, sync effect will handle loading", storedActiveDesignId);
        }

      } else {
        console.log("No active design in localStorage.");
         if (!currentDesignId && canvasRef.current) { 
             console.log("No currentDesignId and no localStorage design, loading default notes.");
             canvasRef.current.loadTemplate(createDefaultNotes(), []);
             setCanvasLoadedDesignId(null); 
             handleSetDiagramChanged(false);
        }
        setInitialDialogFlowPending(true); 
      }
    };

    initializeAppForUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]); 


  useEffect(() => {
    const syncCanvas = async () => {
      if (currentDesignId && currentDesignName && canvasRef.current && canvasLoadedDesignId !== currentDesignId && !isCanvasSyncing) {
        console.log(`Canvas Sync: Attempting to load ${currentDesignId} ('${currentDesignName}') to canvas. Current canvas loaded: ${canvasLoadedDesignId}`);
        setIsCanvasSyncing(true);
        const loadedSuccessfully = await handleLoadDesign(currentDesignId, currentDesignName);
        if (!loadedSuccessfully) {
          console.error(`Canvas Sync: Failed to load ${currentDesignId}. Clearing from localStorage and active context.`);
          localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_ID);
          localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_NAME);
          setCurrentDesignId(null);
          setCurrentDesignName(null);
          setCanvasLoadedDesignId(null);
          setInitialDialogFlowPending(true); 
          if (canvasRef.current) canvasRef.current.loadTemplate(createDefaultNotes(), []);
        } else {
             console.log(`Canvas Sync: handleLoadDesign for ${currentDesignId} completed.`);
        }
        setIsCanvasSyncing(false);
      }
    };
    const timer = setTimeout(syncCanvas, 100); 
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDesignId, currentDesignName, canvasLoadedDesignId]); 


  useEffect(() => {
    if (currentUser && initialDialogFlowPending && !isLoadingDesigns && currentDesignId === null) {
      if (userDesigns.length > 0) {
        console.log("Dialog Effect: Showing Welcome Back Dialog");
        setIsWelcomeBackDialogOpen(true);
      } else {
        console.log("Dialog Effect: No designs, showing New Design Dialog to name first design");
        handleOpenNewDesignDialog(true);
      }
      setInitialDialogFlowPending(false); 
    }
  }, [currentUser, initialDialogFlowPending, isLoadingDesigns, userDesigns, currentDesignId, handleOpenNewDesignDialog]);


  const onDragStart = (event: React.DragEvent, componentName: string, iconName: string, initialProperties: Record<string, any>) => {
    const nodeData = { name: componentName, iconName: iconName, properties: initialProperties || {} };
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const loadTemplate = (nodes: Node<NodeData>[], edges: Edge[], templateName: string = "Loaded Template") => {
    if (canvasRef.current) {
      canvasRef.current.loadTemplate(nodes, edges);
      setSelectedNode(null);
      setAiFeedback(null);
      setChatMessages([]);

      setCurrentDesignId(null); 
      setCurrentDesignName(`${templateName} (Unsaved)`);
      setCanvasLoadedDesignId(null); 
      localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_ID);
      localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_NAME);
      handleSetDiagramChanged(false); 


       toast({
        title: "Template Loaded",
        description: `"${templateName}" loaded. Save it to keep changes.`,
        duration: 3000,
      });
    }
  };

  const handleNewDesignButtonClick = () => {
    if (!currentUser) {
      toast({ title: "Login Required", description: "Please log in to create a new design.", variant: "destructive" });
      return;
    }
    setIsWelcomeBackDialogOpen(false);
    setIsMyDesignsDialogOpen(false);
    handleOpenNewDesignDialog(true);
  };


  const confirmNewDesign = () => {
    const name = newDesignNameInput.trim() || 'Untitled Design';
    const newId = crypto.randomUUID();

    setCurrentDesignId(newId);
    setCurrentDesignName(name);
    setCanvasLoadedDesignId(newId); 

    localStorage.setItem(LOCAL_STORAGE_ACTIVE_DESIGN_ID, newId);
    localStorage.setItem(LOCAL_STORAGE_ACTIVE_DESIGN_NAME, name);

    if (canvasRef.current) {
      const defaultNodes = createDefaultNotes();
      canvasRef.current.loadTemplate(defaultNodes, []);
    }
    setSelectedNode(null);
    setAiFeedback(null);
    setChatMessages([]);
    setIsNewDesignDialogOpen(false);
    setIsWelcomeBackDialogOpen(false);
    setIsMyDesignsDialogOpen(false);
    setNewDesignNameInput('');
    handleSetDiagramChanged(false); 
    toast({
      title: "New Design Ready",
      description: `Design "${name}" has been created. Save it to keep your work.`,
      duration: 3000,
    });
  };

  const handleSaveDesign = async () => {
    if (!currentUser) {
      toast({ title: "Login Required", description: "Please log in to save your design.", variant: "destructive" });
      return;
    }
    if (!currentDesignId || !currentDesignName || currentDesignName.endsWith("(Unsaved)")) {
       toast({ title: "Cannot Save", description: "Please name your design first or ensure it's not an unsaved template.", variant: "destructive" });
       handleOpenNewDesignDialog(true);
      return;
    }
    if (!canvasRef.current) {
      toast({ title: "Error", description: "Canvas not available.", variant: "destructive" });
      return;
    }

    setIsSavingDesign(true);
    console.log("Manual Save: Initiated for", currentDesignId);
    const diagramJson = canvasRef.current.getDiagramJson();
    const designData = {
      userId: currentUser.uid,
      designName: currentDesignName,
      diagramJson: diagramJson,
      updatedAt: serverTimestamp(),
    };

    try {
      const designRef = doc(db, 'designs', currentDesignId);
      await setDoc(designRef, designData, { merge: true });

      toast({ title: "Design Saved!", description: `"${currentDesignName}" has been saved successfully.` });
      handleSetDiagramChanged(false);
      setCanvasLoadedDesignId(currentDesignId); 
      fetchUserDesigns();
    } catch (error) {
      console.error("Error saving design:", error);
      toast({ title: "Save Failed", description: `Could not save design. ${error instanceof Error ? error.message : String(error)}`, variant: "destructive" });
    } finally {
      setIsSavingDesign(false);
      console.log("Manual Save: Completed for", currentDesignId);
    }
  };


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
  
  const selectedComponentConfig = selectedNode 
    ? allDesignComponents.find(c => c.name === selectedNode.data.label || c.iconName === selectedNode.data.iconName || c.name === selectedNode.data.label.replace(/ \(.+\)$/, '')) 
    : undefined;


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
      extractedRequirements = requirementsNotes.join("\n\n---\n\n");
      extractedBoteCalculations = boteNotes.join("\n\n---\n\n");

      if (!extractedRequirements && diagram.nodes.some(n => n.data.label === "Info Note")) {
        const allNotesContent = diagram.nodes
          .filter(node => {
            const title = (node.data.properties?.title || "").toLowerCase();
            return node.data.label === "Info Note" &&
                   node.data.properties?.content &&
                   !title.includes("bote") &&
                   !title.includes("calculation");
          })
          .map(node => node.data.properties.content as string)
          .join("\n\n---\n\n");
        if(allNotesContent) extractedRequirements = allNotesContent;
      }
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
      toast({
        title: "Evaluation Complete",
        description: "AI feedback has been generated successfully.",
        duration: 5000,
      });
    } catch (error) {
      console.error("Error evaluating system design:", error);
      toast({
        title: "Evaluation Error",
        description: `Failed to generate AI feedback. ${error instanceof Error ? error.message : "Check console for details."}`,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoadingEvaluation(false);
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

  const handleLogout = async () => {
    await logout();
  };

  useEffect(() => {
    console.log("Autosave Effect: diagramChanged:", diagramChangedSinceLastSave, "currentUser:", !!currentUser, "currentDesignId:", currentDesignId, "name:", currentDesignName, "isSaving:", isSavingDesign);

    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current);
      console.log("Autosave Effect: Cleared previous timer");
    }

    if (
      diagramChangedSinceLastSave &&
      currentUser &&
      currentDesignId &&
      currentDesignName &&
      !currentDesignName.endsWith("(Unsaved)") &&
      canvasRef.current &&
      !isSavingDesign
    ) {
      console.log("Autosave Effect: Conditions met, setting timer for", AUTOSAVE_DELAY_MS, "ms for design", currentDesignId);
      autosaveTimer.current = setTimeout(async () => {
        console.log("Autosave Timer: Fired for design", currentDesignId);
        if (!canvasRef.current) {
            console.warn("Autosave Timer: Canvas ref not available at time of save.");
            return;
        }
        const diagramJson = canvasRef.current.getDiagramJson();
        const designData = {
          userId: currentUser.uid,
          designName: currentDesignName,
          diagramJson: diagramJson,
          updatedAt: serverTimestamp(),
        };

        try {
          const designRef = doc(db, 'designs', currentDesignId);
          await setDoc(designRef, designData, { merge: true });
          console.log(`Autosave: Successfully saved ${currentDesignId}`);
          handleSetDiagramChanged(false);
          setCanvasLoadedDesignId(currentDesignId); 
        } catch (error) {
          console.error("Autosave: Error saving design:", currentDesignId, error);
          toast({
            title: "Autosave Failed",
            description: `Could not automatically save your design "${currentDesignName}". Please try saving manually. ${error instanceof Error ? error.message : String(error)}`,
            variant: "destructive",
          });
        }
      }, AUTOSAVE_DELAY_MS);
    } else if (diagramChangedSinceLastSave) {
        console.log("Autosave Effect: Conditions NOT met, but diagramChanged is true. State:", {
            currentUser: !!currentUser,
            currentDesignId,
            currentDesignName,
            isUnsavedTemplate: currentDesignName?.endsWith("(Unsaved)"),
            canvasRefCurrent: !!canvasRef.current,
            isSavingDesign
        });
    }

    return () => {
      if (autosaveTimer.current) {
        clearTimeout(autosaveTimer.current);
        console.log("Autosave Effect: Cleanup - Cleared timer for design", currentDesignId);
      }
    };
  }, [diagramChangedSinceLastSave, currentUser, currentDesignId, currentDesignName, toast, isSavingDesign, handleSetDiagramChanged]);

  const handleExportDesign = () => {
    if (!canvasRef.current) {
      toast({ title: "Error", description: "Canvas not available for export.", variant: "destructive" });
      return;
    }
    const diagramJson = canvasRef.current.getDiagramJson();
    const blob = new Blob([diagramJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = currentDesignName ? `${currentDesignName.replace(/\s+/g, '_').replace(/\(Unsaved\)/i, '').replace(/[^a-z0-9_.-]/gi, '') || 'design'}.json` : 'architech-design.json';
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `Design exported as ${fileName}` });
  };

  const handleImportFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        if (typeof content !== 'string') {
          throw new Error("Failed to read file content.");
        }
        const parsedData = JSON.parse(content);

        if (!parsedData || typeof parsedData !== 'object' || !Array.isArray(parsedData.nodes) || !Array.isArray(parsedData.edges)) {
          throw new Error("Invalid JSON format. 'nodes' and 'edges' arrays are required.");
        }
        

        if (canvasRef.current) {
          canvasRef.current.loadTemplate(parsedData.nodes, parsedData.edges);
          
          const newName = `Imported - ${file.name.replace(/\.json$/i, '')} (Unsaved)`;
          setCurrentDesignName(newName);
          setCurrentDesignId(null); 
          setCanvasLoadedDesignId(null); 
          localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_ID);
          localStorage.removeItem(LOCAL_STORAGE_ACTIVE_DESIGN_NAME);
          handleSetDiagramChanged(false); 
          setSelectedNode(null);
          setAiFeedback(null);
          setChatMessages([]);

          toast({ title: "Import Successful", description: `"${file.name}" loaded. Save to keep changes.` });
        }
      } catch (error) {
        console.error("Error importing design:", error);
        toast({
          title: "Import Failed",
          description: `Could not import design. ${error instanceof Error ? error.message : "Invalid file format."}`,
          variant: "destructive",
        });
      } finally {
        
        if (importFileRef.current) {
          importFileRef.current.value = "";
        }
      }
    };
    reader.onerror = () => {
      toast({ title: "File Read Error", description: "Could not read the selected file.", variant: "destructive" });
       if (importFileRef.current) {
          importFileRef.current.value = "";
        }
    };
    reader.readAsText(file);
  };

  const handleExportToTerraformClick = () => {
    if (!currentUser) {
      toast({ title: "Login Required", description: "Please log in to export to Terraform.", variant: "destructive" });
      return;
    }
    if (!canvasRef.current) {
      toast({ title: "Error", description: "Design canvas is not available.", variant: "destructive" });
      return;
    }
    setIsTerraformExportDialogOpen(true);
  };

  const handleGenerateTerraformSubmit = async () => {
    if (!selectedTerraformProvider) {
      toast({ title: "Provider Required", description: "Please select a cloud provider.", variant: "destructive" });
      return;
    }
    if (!canvasRef.current) {
      toast({ title: "Error", description: "Design canvas is not available.", variant: "destructive" });
      return;
    }

    setIsTerraformExportDialogOpen(false);
    setIsGeneratingTerraform(true);
    setTerraformExportResult(null);

    try {
      const diagramJson = canvasRef.current.getDiagramJson();
      const input: GenerateTerraformInput = {
        diagramJson,
        targetProvider: selectedTerraformProvider,
        // additionalRequirements: "Optional: user can add hints here in future version"
      };

      const result = await generateTerraform(input);
      setTerraformExportResult(result);
      setIsTerraformResultModalOpen(true);
      toast({ title: "Terraform HCL Generated", description: "Review the generated code. It's a starting point." });
    } catch (error) {
      console.error("Error generating Terraform:", error);
      toast({
        title: "Terraform Generation Error",
        description: `Failed to generate Terraform HCL. ${error instanceof Error ? error.message : "An unknown error occurred."}`,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingTerraform(false);
      setSelectedTerraformProvider(''); // Reset for next time
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Copied!", description: "Terraform HCL copied to clipboard." });
    }).catch(err => {
      toast({ title: "Copy Failed", description: "Could not copy to clipboard.", variant: "destructive" });
      console.error('Failed to copy text: ', err);
    });
  };


  if (authLoading && !currentUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) {
    return <AuthSection />;
  }


  return (
    <>
      <AppSidebar
        form={form}
        onSubmit={onSubmitEvaluation}
        isLoadingEvaluation={isLoadingEvaluation}
        aiFeedback={aiFeedback}
        groupedDesignComponents={groupedDesignComponents}
        initialTemplates={initialTemplates}
        onDragStart={onDragStart}
        onLoadTemplate={loadTemplate}
        // onNewDesignButtonClick={handleNewDesignButtonClick} // Removed prop
      />
      
      <SidebarInset className="p-0 md:p-0 md:m-0 md:rounded-none flex flex-col">
        <TopNavigationBar
          currentDesignName={currentDesignName}
          currentUser={currentUser}
          isSavingDesign={isSavingDesign}
          onMyDesignsClick={() => {
            fetchUserDesigns();
            setIsMyDesignsDialogOpen(true);
            setIsWelcomeBackDialogOpen(false);
          }}
          onSaveDesign={handleSaveDesign}
          canSave={!!currentDesignId && !(currentDesignName || "").endsWith("(Unsaved)")}
          onExportDesign={handleExportDesign}
          onImportDesignClick={() => importFileRef.current?.click()}
          onExportToTerraformClick={handleExportToTerraformClick}
          onNewDesignClick={handleNewDesignButtonClick} 
          onLogout={handleLogout}
          themes={themeOptions as ThemeOption[]} 
          setTheme={setTheme}
        />
         <input 
            type="file" 
            ref={importFileRef} 
            onChange={handleImportFileChange} 
            accept=".json" 
            className="hidden"
        />


        <ReactFlowProvider>
          <div className="flex flex-1 min-h-0"> 
            <main className="flex-1 overflow-auto p-0 flex flex-col"> 
                <DesignCanvas
                    ref={canvasRef}
                    className="flex-1"
                    onNodeSelect={handleNodeSelect}
                    onStructuralChange={() => {
                        console.log("ArchitechApp: onStructuralChange called from DesignCanvas");
                        handleSetDiagramChanged(true);
                    }}
                />
            </main>
            {selectedNode && selectedComponentConfig && (
              <aside className="w-80 border-l border-border bg-card hidden md:block">
                <ScrollArea className="h-full">
                  <PropertiesPanel
                    key={selectedNode.id}
                    selectedNode={selectedNode}
                    componentConfig={selectedComponentConfig}
                    onUpdateNode={handleUpdateNodeProperties}
                    onClose={() => setSelectedNode(null)}
                  />
                </ScrollArea>
              </aside>
            )}
             {selectedNode && !selectedComponentConfig && (
                <aside className="w-80 border-l border-border bg-card hidden md:block p-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Component Error</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-destructive">Could not find configuration for the selected component: "{selectedNode.data.label}".</p>
                            <p className="text-xs text-muted-foreground mt-2">This might happen if the component's label was manually changed or if its configuration is missing.</p>
                        </CardContent>
                    </Card>
                </aside>
            )}
          </div>
        </ReactFlowProvider>
      </SidebarInset>

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
                 canvasRef.current.loadTemplate(createDefaultNotes(), []);
                 setCanvasLoadedDesignId(null);
                 setCurrentDesignId(null);
                 setCurrentDesignName(null);
                 handleSetDiagramChanged(false);
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
      />

      {isNewDesignDialogOpen && (
        <Dialog open={isNewDesignDialogOpen} onOpenChange={(isOpen) => {
            if (!isOpen && !currentDesignId && currentUser && canvasRef.current) {
                 if(!isWelcomeBackDialogOpen && !isMyDesignsDialogOpen) {
                    canvasRef.current.loadTemplate(createDefaultNotes(), []);
                    setCanvasLoadedDesignId(null);
                    setCurrentDesignId(null);
                    setCurrentDesignName(null);
                    handleSetDiagramChanged(false);
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
              <Label htmlFor="newDesignName" className="text-sm font-medium">
                Design Name
              </Label>
              <Input
                id="newDesignName"
                value={newDesignNameInput}
                onChange={(e) => setNewDesignNameInput(e.target.value)}
                placeholder="Enter a name for your system design"
                onKeyDown={(e) => e.key === 'Enter' && newDesignNameInput.trim() && confirmNewDesign()}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="button" onClick={confirmNewDesign} disabled={!newDesignNameInput.trim()}>
                Create Design
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Terraform Export Provider Selection Dialog */}
      <Dialog open={isTerraformExportDialogOpen} onOpenChange={setIsTerraformExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export to Terraform (Experimental)</DialogTitle>
            <DialogDescription>
              Select a target cloud provider. The generated HCL will be a starting point and requires review.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="terraformProvider" className="text-sm font-medium">
                Cloud Provider
              </Label>
              <Select
                value={selectedTerraformProvider}
                onValueChange={(value) => setSelectedTerraformProvider(value as 'AWS' | 'GCP' | 'Azure' | '')}
              >
                <SelectTrigger id="terraformProvider" className="mt-1">
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AWS">Amazon Web Services (AWS)</SelectItem>
                  <SelectItem value="GCP">Google Cloud Platform (GCP)</SelectItem>
                  <SelectItem value="Azure">Microsoft Azure</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleGenerateTerraformSubmit}
              disabled={!selectedTerraformProvider || isGeneratingTerraform}
            >
              {isGeneratingTerraform ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Generate HCL
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Terraform Result Modal */}
      <Dialog open={isTerraformResultModalOpen} onOpenChange={setIsTerraformResultModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Generated Terraform HCL</DialogTitle>
            <DialogDescription>
              This is a skeleton HCL. Review and modify it carefully before use.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 max-h-[70vh] flex flex-col">
            {isGeneratingTerraform && (
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            )}
            {terraformExportResult && (
              <>
                {(terraformExportResult.warnings && terraformExportResult.warnings.length > 0) && (
                  <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-900/10">
                    <CardHeader className="pb-2 pt-3 px-4">
                      <CardTitle className="text-base text-yellow-700 dark:text-yellow-300 flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2" /> Warnings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-3 text-sm text-yellow-600 dark:text-yellow-400">
                      <ul className="list-disc pl-5 space-y-1">
                        {terraformExportResult.warnings.map((warning, index) => (
                          <li key={`warning-${index}`}>{warning}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <div className="flex-1 overflow-hidden flex flex-col">
                  <Label htmlFor="terraformHclOutput" className="text-sm font-medium mb-1">
                    Terraform Code:
                  </Label>
                  <ScrollArea className="flex-1 border rounded-md bg-muted/30">
                    <Textarea
                      id="terraformHclOutput"
                      value={terraformExportResult.terraformHcl}
                      readOnly
                      className="h-full min-h-[200px] font-mono text-xs p-3 bg-transparent border-0 focus-visible:ring-0"
                      rows={15}
                    />
                  </ScrollArea>
                </div>
                <Button
                    onClick={() => copyToClipboard(terraformExportResult.terraformHcl)}
                    variant="outline"
                    className="mt-2 self-start"
                >
                    <Copy className="mr-2 h-4 w-4" /> Copy HCL
                </Button>

                {(terraformExportResult.suggestions && terraformExportResult.suggestions.length > 0) && (
                  <Card className="border-blue-500/50 bg-blue-50 dark:bg-blue-900/10 mt-4">
                    <CardHeader className="pb-2 pt-3 px-4">
                      <CardTitle className="text-base text-blue-700 dark:text-blue-300">Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-3 text-sm text-blue-600 dark:text-blue-400">
                      <ul className="list-disc pl-5 space-y-1">
                        {terraformExportResult.suggestions.map((suggestion, index) => (
                          <li key={`suggestion-${index}`}>{suggestion}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsTerraformResultModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


export function ArchitechApp() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppContent />
    </SidebarProvider>
  );
}

