import { useState, useEffect, useRef } from "react";
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
  CheckCircle,
  Undo2,
  ArrowDown
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  context?: 'story' | 'criteria' | 'testing' | 'dev-notes';
  suggestion?: string;
  hasUserFacingSuggestion?: boolean;
}


interface ChatPanelProps {
  onApplySuggestion?: (type: string, content: string) => void;
  onUndoSuggestion?: () => void;
  isHorizontallyCollapsed?: boolean;
  onHorizontalToggle?: () => void;
}

export function ChatPanel({ onApplySuggestion, onUndoSuggestion, isHorizontallyCollapsed = false, onHorizontalToggle }: ChatPanelProps = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: "How can I help refine your story? I can strengthen acceptance criteria, explore edge cases, adjust story points, or provide technical insights.",
      timestamp: new Date(),
      context: 'story',
      suggestion: "",
      hasUserFacingSuggestion: false
    }
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const [lastAppliedSuggestion, setLastAppliedSuggestion] = useState<ChatMessage | null>(null);
  
  // Scroll management
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end'
      });
    }
  };

  // Check if user is near bottom of scroll area
  const checkScrollPosition = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollToBottom(!isNearBottom);
      }
    }
  };

  // Handle scroll events
  const handleScroll = () => {
    setIsUserScrolling(true);
    checkScrollPosition();
    
    // Reset user scrolling flag after a delay
    setTimeout(() => setIsUserScrolling(false), 1000);
  };

  // Auto-scroll when new messages are added (unless user is actively scrolling)
  useEffect(() => {
    if (!isUserScrolling) {
      scrollToBottom();
    }
    checkScrollPosition();
  }, [messages, isTyping]);

  // Set up scroll listener
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.addEventListener('scroll', handleScroll);
        return () => scrollContainer.removeEventListener('scroll', handleScroll);
      }
    }
  }, [scrollAreaRef.current]);

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

    // Generate response with structured JSON format
    const responseData = generateContextualResponse(inputValue);
    
    const aiResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: responseData.reply,
      timestamp: new Date(),
      context: detectContext(inputValue),
      suggestion: responseData.suggestion || undefined,
      hasUserFacingSuggestion: responseData.hasUserFacingSuggestion || false
    };


    setMessages(prev => [...prev, aiResponse]);
    setIsTyping(false);
  };

  const generateContextualResponse = (input: string): { reply: string; suggestion: string; hasUserFacingSuggestion?: boolean } => {
    const lowerInput = input.toLowerCase().trim();
    
    // Detect vague, incomplete, or nonsense input
    const isVagueInput = (
      lowerInput.length < 3 ||
      /^[dfg]+$|^[hjk]+$|^[abc]+$|^test+$|^help+$|^fix+$|^more+$/.test(lowerInput) ||
      lowerInput === "ac" || lowerInput === "more details" || lowerInput === "help help help" ||
      /^(.)\1{3,}$/.test(lowerInput) || // repetitive characters
      /^[!@#$%^&*()]+$/.test(lowerInput) // only special characters
    );

    if (isVagueInput) {
      return generateMockResponse();
    }
    
    if (lowerInput.includes('edge case') || lowerInput.includes('error')) {
      return {
        reply: "I've identified a new edge case and added it to your test data. For the email validation, we should also consider users entering special characters like '+' or international characters. Would you like me to add acceptance criteria for internationalization?",
        suggestion: "User submits email with special characters like + or international domains",
        hasUserFacingSuggestion: false // This only updates backend test data
      };
    }
    
    if (lowerInput.includes('points') || lowerInput.includes('estimate')) {
      return {
        reply: "Based on the complexity of email verification and the need for robust validation, I'd recommend keeping this at 5 story points. This accounts for frontend validation, backend API integration, and email service setup. Should we break this into smaller stories?",
        suggestion: "Adjust story points to 8 considering email service integration complexity",
        hasUserFacingSuggestion: true // This updates visible story points
      };
    }
    
    if (lowerInput.includes('criteria') || lowerInput.includes('acceptance')) {
      return {
        reply: "I can strengthen the acceptance criteria. Would you like me to add specific validation rules for password complexity, or focus on the email verification flow? I can also add criteria for accessibility and error handling.",
        suggestion: "System displays real-time password strength indicator with specific requirements",
        hasUserFacingSuggestion: true // This updates visible acceptance criteria
      };
    }

    if (lowerInput.includes('dev') || lowerInput.includes('technical') || lowerInput.includes('implementation')) {
      return {
        reply: "I can provide technical implementation guidance. Based on your current story, I recommend considering OAuth integration for social login options and implementing rate limiting for failed attempts. Should I add these technical considerations to your developer notes?",
        suggestion: "Add rate limiting (5 attempts per minute) and OAuth integration for Google/GitHub login",
        hasUserFacingSuggestion: true // This updates visible dev notes
      };
    }

    return generateMockResponse();
  };

  const generateMockResponse = (): { reply: string; suggestion: string; hasUserFacingSuggestion: boolean } => {
    const mockResponses = [
      // Title suggestions
      {
        reply: "The story title could be more specific. Want me to make it clearer what the user actually does?",
        suggestion: "User Registration with Email Verification",
        hasUserFacingSuggestion: true
      },
      {
        reply: "Let's make the title more action-oriented. How about emphasizing the verification step?",
        suggestion: "Complete Account Registration and Email Verification",
        hasUserFacingSuggestion: true
      },
      // Description improvements
      {
        reply: "Do you think we should tighten up the description? I can help make it clearer for the dev team. Anything specific you want to change about the current wording?",
        suggestion: "User can create an account by providing email and password, receives automated verification email within 30 seconds, and must verify email address to complete registration process",
        hasUserFacingSuggestion: true
      },
      {
        reply: "The description could be more detailed. Want me to add specifics about the verification flow?",
        suggestion: "User enters email and secure password, system validates inputs in real-time, sends verification email with expiring link, and activates account upon successful verification",
        hasUserFacingSuggestion: true
      },
      // Acceptance criteria suggestions
      {
        reply: "Want to beef up the acceptance criteria? I'm thinking we could add specific validation rules to make this more testable. Should I throw in some edge cases for email validation while we're at it?",
        suggestion: "System validates email format using RFC 5322 standard and displays specific error messages for invalid formats",
        hasUserFacingSuggestion: true
      },
      {
        reply: "Sure! Want to adjust the criteria to be more specific? Clear success metrics help everyone know when we're done. Should I look at security considerations next?",
        suggestion: "User receives confirmation email within 30 seconds and verification link expires after 24 hours",
        hasUserFacingSuggestion: true
      },
      {
        reply: "The acceptance criteria could use some password requirements. Mind if I add those?",
        suggestion: "Password must contain at least 8 characters, one uppercase letter, one number, and one special character",
        hasUserFacingSuggestion: true
      },
      // Story points adjustments
      {
        reply: "Happy to help with the story points! This looks more complex than it first appeared — email verification plus validation adds up. Think we should bump it to 8 points?",
        suggestion: "8",
        hasUserFacingSuggestion: true
      },
      {
        reply: "Story points seem about right, but considering the email service integration, maybe we need to adjust slightly?",
        suggestion: "5",
        hasUserFacingSuggestion: true
      },
      {
        reply: "This registration flow has quite a bit of complexity. Email validation, password hashing, verification emails... thinking this might be closer to 13 points?",
        suggestion: "13",
        hasUserFacingSuggestion: true
      },
      // Dev notes
      {
        reply: "Want to add some technical notes? I'm thinking we should mention API rate limiting and maybe OAuth options. Let me know if you want me to dive deeper into the implementation details.",
        suggestion: "Add rate limiting (5 attempts per minute) and OAuth integration for Google/GitHub login",
        hasUserFacingSuggestion: true
      },
      {
        reply: "Got it — let's look at the technical side. This registration flow could use better error handling and user feedback. Want me to add some specs for password hashing and session management?",
        suggestion: "Implement bcrypt password hashing with salt rounds of 12 and JWT session tokens with 24-hour expiration",
        hasUserFacingSuggestion: true
      },
      // Non-user-facing suggestions (test data only)
      {
        reply: "Let me add a couple edge cases for this registration flow. Users love trying weird email formats and international domains. Need help adding accessibility and internationalization tests too?",
        suggestion: "User attempts registration with disposable email addresses or international domain extensions",
        hasUserFacingSuggestion: false
      },
      {
        reply: "Need help adding edge cases? I can think of a few scenarios that might trip up users — like what happens when their email provider blocks our verification emails. Should I add those?",
        suggestion: "Handle email delivery failures and provide alternative verification methods",
        hasUserFacingSuggestion: false
      }
    ];

    // Randomize response to show variety
    const randomIndex = Math.floor(Math.random() * mockResponses.length);
    return mockResponses[randomIndex];
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
    
    // Apply the suggestion to the appropriate panel
    if (onApplySuggestion && message.suggestion) {
      onApplySuggestion(suggestionType, message.suggestion);
      setLastAppliedSuggestion(message);
    }
    
    toast({
      title: "Suggestion Applied",
      description: `${suggestionType.replace('-', ' ')} has been updated with AI suggestions.`,
    });
  };

  const undoLastSuggestion = () => {
    if (onUndoSuggestion && lastAppliedSuggestion) {
      onUndoSuggestion();
      setLastAppliedSuggestion(null);
      
      toast({
        title: "Suggestion Undone",
        description: "Last AI suggestion has been reverted.",
      });
    }
  };

  const quickActions = [
    { label: "Add edge cases", action: () => setInputValue("What edge cases should we consider for email validation?") },
    { label: "Strengthen criteria", action: () => setInputValue("Can you make the acceptance criteria more specific?") },
    { label: "Adjust story points", action: () => setInputValue("Is 5 story points appropriate for this complexity?") },
    { label: "Technical details", action: () => setInputValue("What technical considerations should developers know?") }
  ];

  if (isHorizontallyCollapsed) {
    return (
      <div className="w-12 h-full bg-card border-l flex flex-col items-center shadow-lg">
        <Button
          variant="default"
          size="lg"
          onClick={onHorizontalToggle}
          className="w-10 h-16 flex flex-col items-center justify-center text-sm font-medium rounded-l-lg rounded-r-none shadow-md hover:shadow-lg transition-all duration-200"
          title="Open Story Refinement Chat"
        >
          <MessageSquare className="h-5 w-5 mb-1" />
          <span className="text-xs leading-none">Chat</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onHorizontalToggle}
              className="h-8 w-8 hover:bg-muted/80 transition-colors"
              title="Collapse chat panel"
            >
              <span className="text-lg font-bold">⟨</span>
            </Button>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Story Refinement Chat
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      
      <div className="flex-1 p-0 flex flex-col min-h-96 relative">
        {/* Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
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
                    <div className="flex gap-1">
                      {message.type === 'ai' && message.suggestion && message.suggestion.trim() && message.hasUserFacingSuggestion && (
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
                      {lastAppliedSuggestion && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={undoLastSuggestion}
                          className="gap-1 text-xs h-6 text-muted-foreground hover:text-foreground"
                        >
                          <Undo2 className="h-3 w-3" />
                          Undo
                        </Button>
                      )}
                    </div>
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
            
            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Scroll to Bottom Button */}
        {showScrollToBottom && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => scrollToBottom()}
            className="absolute bottom-20 right-4 z-10 gap-1 shadow-lg hover:shadow-xl transition-all duration-200 rounded-full h-10 px-3"
            title="Scroll to bottom"
          >
            <ArrowDown className="h-4 w-4" />
            <span className="text-xs">Scroll to Bottom</span>
          </Button>
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
    </div>
  );
}