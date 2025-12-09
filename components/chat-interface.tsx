'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ModelSelector } from '@/components/model-selector';
import { AVAILABLE_MODELS, getModelName } from '@/lib/models';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Loader2, 
  Send, 
  Columns, 
  MessageSquare, 
  Maximize2, 
  Minimize2, 
  Download,
  User,
  Smile,
  Briefcase,
  HelpCircle,
  Brain,
  Laugh,
  Search,
  Lightbulb,
  AlignLeft,
  Zap,
  Angry,
  Swords,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  side?: 1 | 2;
}

const PERSONALITIES = [
  { id: 'default', name: 'Default Personality', instruction: '', icon: User },
  { id: 'friendly', name: 'Friendly', instruction: ' Be warm, approachable, and use a casual, friendly tone.', icon: Smile },
  { id: 'professional', name: 'Professional', instruction: ' Maintain a formal, professional tone with precise language.', icon: Briefcase },
  { id: 'curious', name: 'Curious', instruction: ' Be inquisitive, ask many questions, and show genuine interest in exploring ideas.', icon: HelpCircle },
  { id: 'philosophical', name: 'Philosophical', instruction: ' Take a deep, philosophical approach. Ponder existential questions and explore abstract concepts.', icon: Brain },
  { id: 'humorous', name: 'Humorous', instruction: ' Be witty and playful. Use humor and jokes where appropriate.', icon: Laugh },
  { id: 'skeptical', name: 'Skeptical', instruction: ' Be analytical and questioning. Challenge assumptions and ask for evidence.', icon: Search },
  { id: 'creative', name: 'Creative', instruction: ' Be imaginative and think outside the box. Use metaphors and creative examples.', icon: Lightbulb },
  { id: 'concise', name: 'Concise', instruction: ' Be extremely brief and to the point. Use short sentences and avoid unnecessary details.', icon: AlignLeft },
  { id: 'enthusiastic', name: 'Enthusiastic', instruction: ' Be highly energetic and excited! Show passion and enthusiasm for every topic.', icon: Zap },
  { id: 'angry', name: 'Angry', instruction: ' Be irritable and frustrated. Express annoyance and impatience in your responses.', icon: Angry },
  { id: 'offensive', name: 'Offensive', instruction: ' Be aggressive and confrontational. Challenge the other AI aggressively and be deliberately contrarian. Use profanity.', icon: Swords },
];

function getPersonalityInstruction(personalityId: string): string {
  return PERSONALITIES.find(p => p.id === personalityId)?.instruction || '';
}

interface PersonalitySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

function PersonalitySelector({ value, onValueChange }: PersonalitySelectorProps) {
  const selectedPersonality = PERSONALITIES.find(p => p.id === value);
  const SelectedIcon = selectedPersonality?.icon || User;
  
  return (
    <div className="flex flex-col gap-2 -mt-4">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full h-8 text-xs">
          <div className="flex items-center gap-2">
            <SelectedIcon className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{selectedPersonality?.name || 'Select personality'}</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          {PERSONALITIES.map((personality) => {
            const Icon = personality.icon;
            return (
              <SelectItem key={personality.id} value={personality.id}>
                <div className="flex items-center gap-2">
                  <Icon className="h-3 w-3" />
                  <span>{personality.name}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

async function sendMessageStreaming(
  model: string, 
  messages: Message[], 
  onChunk: (chunk: string) => void
): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send message');
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      while (true) {
        const lineEnd = buffer.indexOf('\n');
        if (lineEnd === -1) break;

        const line = buffer.slice(0, lineEnd).trim();
        buffer = buffer.slice(lineEnd + 1);

        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              fullContent += content;
              onChunk(fullContent);
            }
          } catch {
            // Ignore invalid JSON
          }
        }
      }
    }
  } finally {
    reader.cancel();
  }

  return fullContent || 'No response';
}

export function ChatInterface() {
  const [model1, setModel1] = useState(AVAILABLE_MODELS[0].id);
  const [model2, setModel2] = useState(AVAILABLE_MODELS[2].id);
  const [color1, setColor1] = useState('#3b82f6');
  const [color2, setColor2] = useState('#22c55e');
  const [personality1, setPersonality1] = useState('default');
  const [personality2, setPersonality2] = useState('default');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTurn, setCurrentTurn] = useState<1 | 2>(1);
  const [topic, setTopic] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [manualMessage, setManualMessage] = useState('');
  const [viewMode, setViewMode] = useState<'split' | 'timeline'>('split');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const scrollRef1 = useRef<HTMLDivElement>(null);
  const scrollRef2 = useRef<HTMLDivElement>(null);
  const scrollRefTimeline = useRef<HTMLDivElement>(null);
  const isRunningRef = useRef(false);

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      [scrollRef1, scrollRef2, scrollRefTimeline].forEach(ref => {
        if (ref.current) {
          ref.current.scrollTop = ref.current.scrollHeight;
        }
      });
    }, 0);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Keep ref in sync with state
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  const getNextResponse = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const currentModel = currentTurn === 1 ? model1 : model2;
      const otherModel = currentTurn === 1 ? model2 : model1;
      const currentPersonality = currentTurn === 1 ? personality1 : personality2;
      
      // Build personality instruction
      const personalityInstruction = getPersonalityInstruction(currentPersonality);
      
      // Build conversation context
      const systemMessage: Message = {
        role: 'system',
        content: `You are having a conversation with another AI (${otherModel}).${personalityInstruction}`,
      };

      const conversationMessages = messages.length === 0 
        ? [systemMessage, ...(topic.trim() ? [{ role: 'user' as const, content: `Let's discuss: ${topic}. Please share your thoughts.` }] : [{ role: 'user' as const, content: 'Start the conversation.' }])]
        : [systemMessage, ...messages.map(m => ({ 
            role: m.model === currentModel ? 'assistant' as const : 'user' as const, 
            content: m.content 
          }))];

      // Add placeholder message for streaming
      const placeholderMessage: Message = {
        role: 'assistant',
        content: '',
        model: currentModel,
        side: currentTurn,
      };
      setMessages(prev => [...prev, placeholderMessage]);

      const response = await sendMessageStreaming(currentModel, conversationMessages, (chunk) => {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], content: chunk, side: currentTurn };
          return updated;
        });
        scrollToBottom();
      });

      // Final update with complete response
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], content: response, side: currentTurn };
        return updated;
      });
      setCurrentTurn(currentTurn === 1 ? 2 : 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsRunning(false);
      // Remove the placeholder message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [currentTurn, model1, model2, messages, topic, isLoading]);

  // Auto mode loop
  useEffect(() => {
    if (isAutoMode && isRunning && !isLoading && messages.length > 0) {
      const timer = setTimeout(() => {
        if (isRunningRef.current) {
          getNextResponse();
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAutoMode, isRunning, isLoading, messages.length, getNextResponse]);

  // Manual mode - Space key handler
  useEffect(() => {
    if (isAutoMode || !isRunning) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      
      if (e.code === 'Space' && !isLoading && messages.length > 0) {
        e.preventDefault();
        getNextResponse();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAutoMode, isRunning, isLoading, messages.length, getNextResponse]);

  const startConversation = async () => {
    setCurrentTurn(1);
    setIsRunning(true);
    setError(null);
    setIsLoading(true);

    // Add placeholder message for streaming
    const placeholderMessage: Message = {
      role: 'assistant',
      content: '',
      model: model1,
      side: 1,
    };
    setMessages([placeholderMessage]);

    try {
      const personalityInstruction = getPersonalityInstruction(personality1);
      const systemMessage: Message = {
        role: 'system',
        content: `You are having a conversation with another AI (${model2}). Be concise but engaging. Share your perspective and ask follow-up questions when appropriate. Keep responses to 2-3 paragraphs max.${personalityInstruction}`,
      };

      const initialMessages = topic.trim()
        ? [systemMessage, { role: 'user' as const, content: `Let's discuss: ${topic}. Please share your thoughts.` }]
        : [systemMessage, { role: 'user' as const, content: 'Start the conversation.' }];

      const response = await sendMessageStreaming(model1, initialMessages, (chunk) => {
        setMessages([{ role: 'assistant', content: chunk, model: model1, side: 1 }]);
        scrollToBottom();
      });

      setMessages([{ role: 'assistant', content: response, model: model1, side: 1 }]);
      setCurrentTurn(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsRunning(false);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRunning = () => {
    setIsRunning(prev => !prev);
  };

  const reset = () => {
    setMessages([]);
    setIsRunning(false);
    setIsLoading(false);
    setCurrentTurn(1);
    setError(null);
    setManualMessage('');
  };

  const sendManualMessage = () => {
    if (!manualMessage.trim() || isLoading) return;
    
    const currentModel = currentTurn === 1 ? model1 : model2;
    const newMessage: Message = {
      role: 'assistant',
      content: manualMessage.trim(),
      model: currentModel,
      side: currentTurn,
    };
    
    setMessages(prev => [...prev, newMessage]);
    setCurrentTurn(currentTurn === 1 ? 2 : 1);
    setManualMessage('');
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-0 pointer-events-none bg-cover bg-center bg-no-repeat opacity-25"
      />
      <div className="h-screen flex relative z-10">
        {/* Left Sidebar - Controls (20%) */}
        <div className={`w-[20%] min-w-[280px] p-4 pr-0 overflow-y-auto flex flex-col h-full transition-all duration-300 ${isFullscreen ? 'hidden' : ''}`}>
          <h1 className="text-2xl mb-4 ml-1 font-[Inter_Tight]">ai-to-ai-chat</h1>
          
          <Card className="bg-card flex-1 flex flex-col">
            <CardContent className="space-y-6 flex-1 overflow-y-auto">
              {/* Model Selectors */}
              <ModelSelector
                value={model1}
                onValueChange={setModel1}
                label="Model 1"
                color={color1}
                onColorChange={setColor1}
              />
              <PersonalitySelector
                value={personality1}
                onValueChange={setPersonality1}
              />
              <ModelSelector
                value={model2}
                onValueChange={setModel2}
                label="Model 2"
                color={color2}
                onColorChange={setColor2}
              />
              <PersonalitySelector
                value={personality2}
                onValueChange={setPersonality2}
              />
              
              {/* Topic */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="topic" className="text-sm font-medium text-muted-foreground">
                  Topic
                </Label>
                <input
                  id="topic"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="(Optional)"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  disabled={isRunning}
                />
              </div>
              
              {/* Auto/Manual Mode */}
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-muted-foreground">Mode</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={isAutoMode}
                    onCheckedChange={setIsAutoMode}
                    id="auto-mode"
                  />
                  <Label htmlFor="auto-mode" className="text-sm">
                    {isAutoMode ? 'Auto' : 'Manual (Space)'}
                  </Label>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                {messages.length === 0 ? (
                  <Button onClick={startConversation} disabled={isLoading} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                    Start Conversation
                  </Button>
                ) : (
                  <>
                    <Button onClick={toggleRunning} variant={isRunning ? "destructive" : "default"} className="w-full">
                      {isRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                      {isRunning ? 'Pause' : 'Resume'}
                    </Button>
                    <Button onClick={reset} variant="outline" className="w-full">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                  </>
                )}
              </div>
              
              {error && (
                <p className="text-destructive text-sm">{error}</p>
              )}
              
              {!isAutoMode && isRunning && messages.length > 0 && !isLoading && (
                <p className="text-muted-foreground text-sm">
                  Press <kbd className="px-2 py-1 bg-muted rounded text-xs">Space</kbd> to continue
                </p>
              )}

              {/* Manual message input */}
              {!isAutoMode && isRunning && messages.length > 0 && !isLoading && (
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Write as {getModelName(currentTurn === 1 ? model1 : model2)}
                  </Label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualMessage}
                      onChange={(e) => setManualMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendManualMessage();
                        }
                        e.stopPropagation();
                      }}
                      placeholder="Type a message..."
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                    <Button 
                      onClick={sendManualMessage} 
                      disabled={!manualMessage.trim()}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Chat (80%) */}
        <div className="flex-1 p-4 overflow-hidden flex flex-col">
          {/* View Mode Toggle */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'split' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('split')}
              >
                <Columns className="mr-2 h-4 w-4" />
                Split View
              </Button>
              <Button
                variant={viewMode === 'timeline' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('timeline')}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Timeline
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const chatContent = messages
                    .filter(m => m.content)
                    .map((m, i) => `#${i + 1} [${getModelName(m.model || '')}]\n${m.content}`)
                    .join('\n\n---\n\n');
                  const blob = new Blob([chatContent], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `chat-${new Date().toISOString().slice(0, 10)}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                disabled={messages.length === 0}
                title="Download chat"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {viewMode === 'split' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
              {/* Model 1 Column */}
              <Card className="bg-card flex flex-col overflow-hidden py-0 gap-0">
                <CardHeader className="flex-shrink-0 pt-4 pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color1 }} />
                    {getModelName(model1)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                  <div className="h-full overflow-y-auto px-6 pb-6" ref={scrollRef1}>
                    <div className="space-y-4">
                      {messages
                        .filter(m => m.side === 1 && m.content)
                        .map((message, index) => (
                          <div
                            key={index}
                            className="p-3 rounded-lg border"
                            style={{ 
                              backgroundColor: `${color1}15`,
                              borderColor: `${color1}40`
                            }}
                          >
                            <p className="text-xs font-medium text-muted-foreground mb-1">#{index + 1}</p>
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                            </div>
                          </div>
                        ))}
                      {isLoading && currentTurn === 1 && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Model 2 Column */}
              <Card className="bg-card flex flex-col overflow-hidden py-0 gap-0">
                <CardHeader className="flex-shrink-0 pt-4 pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color2 }} />
                    {getModelName(model2)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                  <div className="h-full overflow-y-auto px-6 pb-6" ref={scrollRef2}>
                    <div className="space-y-4">
                      {messages
                        .filter(m => m.side === 2 && m.content)
                        .map((message, index) => (
                          <div
                            key={index}
                            className="p-3 rounded-lg border"
                            style={{ 
                              backgroundColor: `${color2}15`,
                              borderColor: `${color2}40`
                            }}
                          >
                            <p className="text-xs font-medium text-muted-foreground mb-1">#{index + 1}</p>
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                            </div>
                          </div>
                        ))}
                      {isLoading && currentTurn === 2 && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Chat Display - Timeline View */}
          {viewMode === 'timeline' && (
            <Card className="bg-card/80 backdrop-blur-sm flex-1 flex flex-col overflow-hidden py-0 gap-0">
              <CardHeader className="flex-shrink-0 pt-4 pb-2">
                <CardTitle className="text-lg">Conversation</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                <div className="h-full overflow-y-auto px-6 pb-6" ref={scrollRefTimeline}>
                  <div className="space-y-4">
                    {messages.filter(m => m.content).map((message, index) => {
                      const messageColor = message.side === 1 ? color1 : color2;
                      return (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          message.side === 1
                            ? 'ml-0 mr-12'
                            : 'ml-12 mr-0'
                        }`}
                        style={{ 
                          backgroundColor: `${messageColor}15`,
                          borderColor: `${messageColor}40`
                        }}
                      >
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          #{index + 1} · {getModelName(message.model || '')}
                        </p>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                        </div>
                      </div>
                    );})}
                    {isLoading && (
                      <div className={`flex items-center gap-2 text-muted-foreground ${currentTurn === 1 ? 'ml-0' : 'ml-12'}`}>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">{getModelName(currentTurn === 1 ? model1 : model2)} is thinking...</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
