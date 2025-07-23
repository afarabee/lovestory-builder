import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles,
  TestTube,
  Code,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Check,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  context?: 'story' | 'criteria' | 'testing' | 'dev-notes';
}

interface TestDataUpdate {
  type: 'user-input' | 'edge-case' | 'api-response';
  content: string;
}

export function ChatPanel() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: "How can I help refine your story? I can strengthen acceptance criteria, explore edge cases, adjust story points, or provide technical insights.",
      timestamp: new Date(),
      context: 'story'
    }
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [testDataUpdates, setTestDataUpdates] = useState<TestDataUpdate[]>([]);
  const { toast } = useToast();

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response with test data updates
    await new Promise(resolve => setTimeout(resolve, 1500));

    const aiResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: generateContextualResponse(inputValue),
      timestamp: new Date(),
      context: detectContext(inputValue)
    };

    // Generate test data updates based on context
    if (inputValue.toLowerCase().includes('edge case') || inputValue.toLowerCase().includes('error')) {
      setTestDataUpdates(prev => [...prev, {
        type: 'edge-case',
        content: 'User submits form with special characters in email'
      }]);
    }

    setMessages(prev => [...prev, aiResponse]);
    setIsTyping(false);
  };

  const generateContextualResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('edge case') || lowerInput.includes('error')) {
      return "I've identified a new edge case and added it to your test data. For the email validation, we should also consider users entering special characters like '+' or international characters. Would you like me to add acceptance criteria for internationalization?";
    }
    
    if (lowerInput.includes('points') || lowerInput.includes('estimate')) {
      return "Based on the complexity of email verification and the need for robust validation, I'd recommend keeping this at 5 story points. This accounts for frontend validation, backend API integration, and email service setup. Should we break this into smaller stories?";
    }
    
    if (lowerInput.includes('criteria') || lowerInput.includes('acceptance')) {
      return "I can strengthen the acceptance criteria. Would you like me to add specific validation rules for password complexity, or focus on the email verification flow? I can also add criteria for accessibility and error handling.";
    }

    return "I understand you want to refine the story. Can you be more specific about which aspect you'd like to improve? I can help with acceptance criteria, edge cases, technical implementation details, or story sizing.";
  };

  const detectContext = (input: string): ChatMessage['context'] => {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('test') || lowerInput.includes('edge')) return 'testing';
    if (lowerInput.includes('code') || lowerInput.includes('technical')) return 'dev-notes';
    if (lowerInput.includes('criteria') || lowerInput.includes('acceptance')) return 'criteria';
    return 'story';
  };

  const ContextIcon = ({ context }: { context?: ChatMessage['context'] }) => {
    switch (context) {
      case 'testing':
        return <TestTube className="h-3 w-3" />;
      case 'dev-notes':
        return <Code className="h-3 w-3" />;
      case 'criteria':
        return <Sparkles className="h-3 w-3" />;
      default:
        return <Bot className="h-3 w-3" />;
    }
  };

  const applySuggestion = (message: ChatMessage) => {
    const suggestionType = message.context || 'story';
    toast({
      title: "Suggestion Applied",
      description: `${suggestionType.replace('-', ' ')} has been updated with AI suggestions.`,
    });
  };

  const quickActions = [
    { label: "Add edge cases", action: () => setInputValue("What edge cases should we consider for email validation?") },
    { label: "Strengthen criteria", action: () => setInputValue("Can you make the acceptance criteria more specific?") },
    { label: "Adjust story points", action: () => setInputValue("Is 5 story points appropriate for this complexity?") },
    { label: "Technical details", action: () => setInputValue("What technical considerations should developers know?") }
  ];

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Story Refinement Chat
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-6 w-6"
            title={isCollapsed ? "Expand chat panel" : "Collapse chat panel"}
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      <Collapsible open={!isCollapsed} onOpenChange={(open) => setIsCollapsed(!open)}>

        <CollapsibleContent>
          <div className="flex-1 p-0 flex flex-col min-h-96">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2",
                  message.type === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] p-3 rounded-lg text-sm",
                    message.type === 'user'
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {message.type === 'ai' && (
                      <div className="flex items-center gap-1 mb-1">
                        <ContextIcon context={message.context} />
                        {message.context && (
                          <Badge variant="outline" className="text-xs h-5">
                            {message.context.replace('-', ' ')}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <p>{message.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    {message.type === 'ai' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => applySuggestion(message)}
                        className="gap-1 text-xs h-6"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Apply Suggestion
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 justify-start">
                <div className="bg-muted p-3 rounded-lg text-sm flex items-center gap-2">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  AI is thinking...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Test Data Updates */}
        {testDataUpdates.length > 0 && (
          <div className="p-4 border-t bg-accent/10">
            <div className="text-xs font-medium mb-2 flex items-center gap-1">
              <TestTube className="h-3 w-3" />
              Test Data Updated
            </div>
            <div className="space-y-1">
              {testDataUpdates.slice(-3).map((update, index) => (
                <div key={index} className="text-xs bg-accent/20 p-2 rounded">
                  <Badge variant="outline" className="text-xs mb-1">
                    {update.type.replace('-', ' ')}
                  </Badge>
                  <p>{update.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}


            {/* Enhanced Input */}
            <div className="p-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="refinement-prompt" className="text-sm font-medium">
                  Refinement Prompt
                </Label>
                <Textarea
                  id="refinement-prompt"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me to refine criteria, explore edge cases, or adjust story points…"
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  rows={4}
                  className="resize-none min-h-[4rem] max-h-[6rem]"
                  style={{
                    height: `${Math.min(Math.max(inputValue.split('\n').length, 4), 6) * 1.5}rem`
                  }}
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={sendMessage} 
                    disabled={!inputValue.trim() || isTyping}
                    size="sm"
                    className="gap-2"
                  >
                    <Send className="h-3 w-3" />
                    Send
                  </Button>
                </div>
                
                {/* Quick Actions */}
                <Collapsible defaultOpen={true}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between text-xs font-medium h-8 px-0 hover:bg-accent/50 focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      Quick Actions
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="space-y-1 mt-2">
                      {quickActions.map((action, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="w-full text-xs h-8 justify-start focus-visible:ring-1 focus-visible:ring-ring"
                          onClick={action.action}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}