import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Sparkles, 
  Code, 
  Send, 
  RefreshCw, 
  GitBranch,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserStory {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  storyPoints: number;
  status: 'draft' | 'ready' | 'in-progress' | 'done';
  iteration?: string;
  tags: string[];
}

interface TestData {
  userInputs: string[];
  edgeCases: string[];
  apiResponses: any[];
  codeSnippets: string[];
}

export function StoryBuilder() {
  const [story, setStory] = useState<UserStory>({
    id: "US-001",
    title: "",
    description: "",
    acceptanceCriteria: [],
    storyPoints: 0,
    status: 'draft',
    tags: []
  });

  const [testData, setTestData] = useState<TestData>({
    userInputs: [],
    edgeCases: [],
    apiResponses: [],
    codeSnippets: []
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [hasDevNotes, setHasDevNotes] = useState(false);
  const [currentStep, setCurrentStep] = useState<'input' | 'story' | 'refine' | 'dev-notes' | 'review'>('input');

  const generateStory = async () => {
    setIsGenerating(true);
    setCurrentStep('story');
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const generatedStory = {
      ...story,
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
      status: 'ready' as const
    };

    // Generate test data
    const generatedTestData = {
      userInputs: [
        "test@example.com / SecurePass123!",
        "invalid-email / weak",
        "existing@user.com / AnotherPass456!"
      ],
      edgeCases: [
        "Email already exists in system",
        "Network timeout during verification",
        "Malformed email verification link"
      ],
      apiResponses: [
        { status: 201, data: { userId: "usr_123", verified: false } },
        { status: 400, error: "Email already registered" },
        { status: 422, error: "Invalid password format" }
      ],
      codeSnippets: []
    };

    setStory(generatedStory);
    setTestData(generatedTestData);
    setIsGenerating(false);
    setCurrentStep('refine');
  };

  const generateDevNotes = async () => {
    setIsGenerating(true);
    
    // Simulate GitHub scanning
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const devCodeSnippets = [
      "// Authentication service\nclass AuthService {\n  async register(email, password) {\n    // Implementation\n  }\n}",
      "// Email validation\nconst isValidEmail = (email) => {\n  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);\n};"
    ];

    setTestData(prev => ({
      ...prev,
      codeSnippets: devCodeSnippets
    }));

    setHasDevNotes(true);
    setIsGenerating(false);
    setCurrentStep('review');
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-status-ready" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-status-in-progress" />;
      case 'done':
        return <CheckCircle className="h-4 w-4 text-status-done" />;
      default:
        return <AlertCircle className="h-4 w-4 text-status-draft" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold">Story Builder</h2>
          <Badge variant="outline" className="gap-1">
            <StatusIcon status={story.status} />
            {story.status.replace('-', ' ')}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={generateStory} 
            variant={isGenerating ? "ai" : "default"}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isGenerating ? "Generating..." : "Generate User Story"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Story Content */}
        <div className="col-span-2 space-y-6">
          {/* Story Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Story Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input 
                  value={story.title}
                  onChange={(e) => setStory(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter story title..."
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea 
                  value={story.description}
                  onChange={(e) => setStory(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="As a [user], I want [goal] so that [benefit]..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Acceptance Criteria</label>
                <div className="space-y-2">
                  {story.acceptanceCriteria.map((criterion, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-status-ready flex-shrink-0" />
                      <span className="text-sm">{criterion}</span>
                    </div>
                  ))}
                  {story.acceptanceCriteria.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">
                      Generate a story to see acceptance criteria
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Story Points</label>
                  <Select value={story.storyPoints.toString()} onValueChange={(value) => setStory(prev => ({ ...prev, storyPoints: parseInt(value) }))}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 5, 8, 13].map(points => (
                        <SelectItem key={points} value={points.toString()}>{points}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Developer Notes */}
          {(hasDevNotes || currentStep === 'review') && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Developer Notes
                </CardTitle>
                <Badge variant="outline" className="gap-1">
                  <GitBranch className="h-3 w-3" />
                  From GitHub
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Relevant Code Snippets</h4>
                  <div className="space-y-2">
                    {testData.codeSnippets.map((snippet, index) => (
                      <div key={index} className="bg-muted p-3 rounded-md">
                        <pre className="text-xs overflow-x-auto">{snippet}</pre>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ADO Integration */}
          {currentStep === 'review' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Push to Azure DevOps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Iteration</label>
                    <Select defaultValue="sprint-24.1">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sprint-24.1">Sprint 24.1</SelectItem>
                        <SelectItem value="sprint-24.2">Sprint 24.2</SelectItem>
                        <SelectItem value="backlog">Backlog</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tags</label>
                    <Input placeholder="frontend, auth, registration" />
                  </div>
                </div>
                
                <Button variant="accent" className="w-full gap-2">
                  <Send className="h-4 w-4" />
                  Push to Azure DevOps
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Test Data Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Interactive Test Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {testData.userInputs.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Sample User Inputs</h4>
                  <div className="space-y-1">
                    {testData.userInputs.map((input, index) => (
                      <div key={index} className="text-xs bg-muted p-2 rounded">
                        {input}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {testData.edgeCases.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Edge Cases</h4>
                  <div className="space-y-1">
                    {testData.edgeCases.map((edge, index) => (
                      <div key={index} className="text-xs bg-warning/10 p-2 rounded border border-warning/20">
                        {edge}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {testData.apiResponses.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">API Responses</h4>
                  <div className="space-y-1">
                    {testData.apiResponses.map((response, index) => (
                      <div key={index} className="text-xs bg-muted p-2 rounded">
                        <pre>{JSON.stringify(response, null, 2)}</pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={generateDevNotes}
                disabled={!story.title || isGenerating}
              >
                <Code className="h-4 w-4" />
                Generate Developer Notes
              </Button>
              
              <Button variant="ghost" className="w-full gap-2">
                <RefreshCw className="h-4 w-4" />
                Restart Story
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}