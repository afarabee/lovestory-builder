import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  History, 
  X, 
  RotateCcw, 
  GitBranch, 
  Clock,
  User,
  Bot
} from "lucide-react";

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StoryVersion {
  id: string;
  timestamp: Date;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  storyPoints: number;
  source: 'ai-generation' | 'manual-edit' | 'chat-refinement';
  changes: string[];
}

export function VersionHistoryModal({ isOpen, onClose }: VersionHistoryModalProps) {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [diffMode, setDiffMode] = useState<'current' | 'previous'>('current');

  const versions: StoryVersion[] = [
    {
      id: 'v4',
      timestamp: new Date(),
      title: "User Registration with Email Verification",
      description: "As a new user, I want to register for an account using my email address so that I can access the platform features.",
      acceptanceCriteria: [
        "User can enter email and password on registration form",
        "System validates email format and password strength", 
        "Verification email is sent upon successful registration",
        "User can complete registration by clicking verification link",
        "Error messages are displayed for invalid inputs"
      ],
      storyPoints: 5,
      source: 'chat-refinement',
      changes: ['Added password strength validation', 'Enhanced error messaging']
    },
    {
      id: 'v3',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      title: "User Registration with Email Verification",
      description: "As a new user, I want to register for an account using my email address so that I can access the platform.",
      acceptanceCriteria: [
        "User can enter email and password on registration form",
        "System validates email format", 
        "Verification email is sent upon successful registration",
        "User can complete registration by clicking verification link"
      ],
      storyPoints: 3,
      source: 'manual-edit',
      changes: ['Updated story points', 'Simplified acceptance criteria']
    },
    {
      id: 'v2',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      title: "User Registration",
      description: "As a new user, I want to register for an account so that I can use the application.",
      acceptanceCriteria: [
        "User can enter email and password",
        "Account is created successfully"
      ],
      storyPoints: 2,
      source: 'ai-generation',
      changes: ['Initial AI generation']
    }
  ];

  if (!isOpen) return null;

  const getSourceIcon = (source: StoryVersion['source']) => {
    switch (source) {
      case 'ai-generation':
        return <Bot className="h-3 w-3" />;
      case 'manual-edit':
        return <User className="h-3 w-3" />;
      case 'chat-refinement':
        return <GitBranch className="h-3 w-3" />;
    }
  };

  const getSourceColor = (source: StoryVersion['source']) => {
    switch (source) {
      case 'ai-generation':
        return 'bg-ai-thinking/20 text-ai-thinking';
      case 'manual-edit':
        return 'bg-primary/20 text-primary';
      case 'chat-refinement':
        return 'bg-accent/20 text-accent';
    }
  };

  const currentVersion = versions[0];
  const previousVersion = versions[1];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <History className="h-5 w-5" />
              Version History
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <div className="grid grid-cols-4 h-[70vh]">
          {/* Version List */}
          <div className="border-r">
            <div className="p-4 border-b">
              <h3 className="font-medium">All Versions</h3>
            </div>
            <ScrollArea className="h-full">
              <div className="p-2 space-y-2">
                {versions.map((version, index) => (
                  <Card
                    key={version.id}
                    className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                      selectedVersion === version.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedVersion(version.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            v{versions.length - index}
                          </Badge>
                          {index === 0 && (
                            <Badge variant="default" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {getSourceIcon(version.source)}
                          <span className="text-xs text-muted-foreground">
                            {version.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm font-medium line-clamp-2 mb-1">
                        {version.title}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded ${getSourceColor(version.source)}`}>
                          {version.source.replace('-', ' ')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {version.storyPoints}pt
                        </span>
                      </div>

                      {version.changes.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground">
                            {version.changes[0]}
                            {version.changes.length > 1 && ` +${version.changes.length - 1} more`}
                          </p>
                        </div>
                      )}

                      {index === 0 && (
                        <div className="mt-2 pt-2 border-t">
                          <Button variant="ghost" size="sm" className="w-full text-xs">
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Current Version
                          </Button>
                        </div>
                      )}

                      {index > 0 && (
                        <div className="mt-2 pt-2 border-t">
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Restore This Version
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Diff Viewer */}
          <div className="col-span-3">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Side-by-Side Comparison</h3>
                <div className="flex gap-2">
                  <Button 
                    variant={diffMode === 'current' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDiffMode('current')}
                  >
                    Current vs Previous
                  </Button>
                  <Button 
                    variant={diffMode === 'previous' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDiffMode('previous')}
                  >
                    Selected vs Current
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 h-full">
              {/* Left Side - Current/Selected Version */}
              <div className="border-r">
                <div className="p-3 border-b bg-accent/10">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">
                      {diffMode === 'current' ? 'Current Version' : 'Selected Version'}
                    </h4>
                    <Badge variant="default" className="text-xs">
                      {diffMode === 'current' ? 'v4' : 'v3'}
                    </Badge>
                  </div>
                </div>
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-sm mb-1">Title</h5>
                      <p className="text-sm bg-accent/10 p-2 rounded">
                        {currentVersion.title}
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-sm mb-1">Description</h5>
                      <p className="text-sm bg-accent/10 p-2 rounded">
                        {currentVersion.description}
                      </p>
                    </div>

                    <div>
                      <h5 className="font-medium text-sm mb-1">Acceptance Criteria</h5>
                      <div className="bg-accent/10 p-2 rounded space-y-1">
                        {currentVersion.acceptanceCriteria.map((criterion, index) => (
                          <div key={index} className="text-sm flex items-start gap-2">
                            <span className="text-muted-foreground">•</span>
                            <span>{criterion}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-sm mb-1">Story Points</h5>
                      <p className="text-sm bg-accent/10 p-2 rounded">
                        {currentVersion.storyPoints} points
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              </div>

              {/* Right Side - Previous Version */}
              <div>
                <div className="p-3 border-b bg-muted/10">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">Previous Version</h4>
                    <Badge variant="outline" className="text-xs">v3</Badge>
                  </div>
                </div>
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-sm mb-1">Title</h5>
                      <p className="text-sm bg-muted/10 p-2 rounded">
                        {previousVersion.title}
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-sm mb-1">Description</h5>
                      <p className="text-sm bg-muted/10 p-2 rounded">
                        {previousVersion.description}
                      </p>
                    </div>

                    <div>
                      <h5 className="font-medium text-sm mb-1">Acceptance Criteria</h5>
                      <div className="bg-muted/10 p-2 rounded space-y-1">
                        {previousVersion.acceptanceCriteria.map((criterion, index) => (
                          <div key={index} className="text-sm flex items-start gap-2">
                            <span className="text-muted-foreground">•</span>
                            <span>{criterion}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-sm mb-1">Story Points</h5>
                      <p className="text-sm bg-muted/10 p-2 rounded">
                        {previousVersion.storyPoints} points
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}