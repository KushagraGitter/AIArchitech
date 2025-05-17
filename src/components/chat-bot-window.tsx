
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send, Bot, User, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ChatMessage {
  role: 'user' | 'model' | 'system'; // 'model' for AI, 'system' for errors/info
  content: string;
}

interface ChatBotWindowProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  isLoadingAiResponse: boolean;
}

export function ChatBotWindow({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isLoadingAiResponse,
}: ChatBotWindowProps) {
  const [inputMessage, setInputMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!inputMessage.trim() || isLoadingAiResponse) return;
    await onSendMessage(inputMessage);
    setInputMessage('');
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Card className="fixed bottom-20 right-6 w-96 max-w-[calc(100vw-3rem)] h-[60vh] max-h-[700px] shadow-xl z-50 flex flex-col border border-border bg-card text-card-foreground rounded-lg overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          <CardTitle className="text-lg">Interview Bot</CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg max-w-[85%]",
                  msg.role === 'user' ? "ml-auto bg-primary text-primary-foreground" :
                  msg.role === 'model' ? "mr-auto bg-secondary text-secondary-foreground" :
                  "mr-auto bg-destructive/10 text-destructive border border-destructive/30" 
                )}
              >
                {msg.role === 'model' && <Bot className="h-5 w-5 shrink-0 mt-0.5 text-primary" />}
                {msg.role === 'user' && <User className="h-5 w-5 shrink-0 mt-0.5 text-primary-foreground" />}
                {msg.role === 'system' && <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-destructive" />}
                
                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
              </div>
            ))}
            {isLoadingAiResponse && (
              <div className="flex items-start gap-3 p-3 rounded-lg max-w-[85%] mr-auto bg-secondary text-secondary-foreground">
                <Bot className="h-5 w-5 shrink-0 mt-0.5 text-primary" />
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask the bot a question..."
            className="flex-1 resize-none min-h-[40px] max-h-[120px] text-sm bg-input"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={isLoadingAiResponse}
          />
          <Button type="submit" size="icon" disabled={isLoadingAiResponse || !inputMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
