import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  CheckCircle, 
  Clock, 
  Zap, 
  User, 
  FileText, 
  GitBranch, 
  Upload, 
  Download, 
  RotateCcw, 
  Sparkles, 
  Code, 
  Database,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  X,
  Eye,
  Trash2,
  Send,
  AlertCircle,
  Plus,
  Minus,
  History,
  MessageSquare,
  Settings as SettingsIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { NewStoryConfirmDialog } from "@/components/ui/new-story-confirm-dialog";
import { useVersionHistory, StoryVersion } from "@/hooks/useVersionHistory";
import { useToast } from "@/hooks/use-toast";

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

interface UploadedFile {
  id: string;
  name: string;
  description: string;
  type: string;
  size: number;
  uploadDate: Date;
}

interface StoryBuilderProps {
  showChat?: boolean;
  onToggleChat?: () => void;
  onSetApplySuggestionHandler?: (handler: (type: string, content: string) => void, restoreHandler?: (version: StoryVersion) => void) => void;
  showTestData?: boolean;
  onToggleTestData?: () => void;
  onNewStory?: () => void;
  storyGenerated?: boolean;
  onStoryGenerated?: () => void;
  onVersionsChange?: (versions: StoryVersion[], currentContent: any) => void;
  onSetNewStoryHandler?: (handler: () => void) => void;
}

export function StoryBuilder({ 
  showChat = false, 
  onToggleChat, 
  onSetApplySuggestionHandler, 
  showTestData = false, 
  onToggleTestData, 
  onNewStory, 
  storyGenerated = false, 
  onStoryGenerated,
  onVersionsChange,
  onSetNewStoryHandler 
}: StoryBuilderProps = {}) {
  const { toast } = useToast();
  const { versions, saveVersion, getVersion, clearVersions } = useVersionHistory();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dirtyCriteria, setDirtyCriteria] = useState(false);
  const [originalTitle, setOriginalTitle] = useState("");
  const [originalDescription, setOriginalDescription] = useState("");
  const [rawInput, setRawInput] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [savedInput, setSavedInput] = useState(""); // For restart functionality
  const [savedCustomPrompt, setSavedCustomPrompt] = useState(""); // For restart functionality
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showRawInput, setShowRawInput] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [isGeneratingDevNotes, setIsGeneratingDevNotes] = useState(false);
  const [hasDevNotes, setHasDevNotes] = useState(false);
  const [devNotesOpen, setDevNotesOpen] = useState(true);
  const [chatHorizontallyCollapsed, setChatHorizontallyCollapsed] = useState(false);
  const [appliedFieldId, setAppliedFieldId] = useState<string | null>(null);
  const [showNewStoryConfirm, setShowNewStoryConfirm] = useState(false);
  
  // Auto-save state
  const [lastAutoSaveContent, setLastAutoSaveContent] = useState<string>('');
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Register the apply suggestion handler
  useEffect(() => {
    if (onSetApplySuggestionHandler) {
      onSetApplySuggestionHandler(handleApplySuggestion, handleRestoreVersion);
    }
  }, [onSetApplySuggestionHandler]);

  // Register the new story handler for external use (like sidebar)
  useEffect(() => {
    if (onSetNewStoryHandler) {
      onSetNewStoryHandler(handleNewStoryClick);
    }
  }, [onSetNewStoryHandler]);

  // Notify parent component about version changes
  useEffect(() => {
    if (onVersionsChange) {
      const currentContent = {
        title: story.title,
        description: story.description,
        acceptanceCriteria: story.acceptanceCriteria,
        storyPoints: story.storyPoints,
        testData: testData
      };
      onVersionsChange(versions, currentContent);
    }
  }, [versions, story, testData, onVersionsChange]);

  // Auto-save logic - debounced save after 5 seconds of no typing
  const createContentSnapshot = useCallback(() => {
    return JSON.stringify({
      title: story.title,
      description: story.description,
      acceptanceCriteria: story.acceptanceCriteria,
      storyPoints: story.storyPoints,
      testData: testData
    });
  }, [story, testData]);

  const saveAutoVersion = useCallback((label: string) => {
    const storyContent = {
      title: story.title,
      description: story.description,
      acceptanceCriteria: story.acceptanceCriteria,
      storyPoints: story.storyPoints,
      testData: testData
    };
    
    // Check if content has actually changed before saving
    const currentSnapshot = JSON.stringify(storyContent);
    if (currentSnapshot !== lastAutoSaveContent) {
      saveVersion(storyContent, label);
      setLastAutoSaveContent(currentSnapshot);
    }
  }, [story, testData, saveVersion, lastAutoSaveContent]);

  // Debounced auto-save after 5 seconds of no typing
  useEffect(() => {
    const currentSnapshot = createContentSnapshot();
    
    // Only set up auto-save if content has changed and story has meaningful content
    if (currentSnapshot !== lastAutoSaveContent && 
        (story.title.trim() || story.description.trim() || story.acceptanceCriteria.length > 0)) {
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      // Set new timeout for 5 seconds
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveAutoVersion("Edited by User");
      }, 5000);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [story, testData, lastAutoSaveContent, createContentSnapshot, saveAutoVersion]);

  // Auto-save every 2 minutes if content changed
  useEffect(() => {
    // Set up 2-minute interval
    autoSaveIntervalRef.current = setInterval(() => {
      const currentSnapshot = createContentSnapshot();
      if (currentSnapshot !== lastAutoSaveContent && 
          (story.title.trim() || story.description.trim() || story.acceptanceCriteria.length > 0)) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: true 
        });
        saveAutoVersion(`Auto-Save @ ${timeString}`);
      }
    }, 2 * 60 * 1000); // 2 minutes

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [story.title, story.description, story.acceptanceCriteria, createContentSnapshot, lastAutoSaveContent, saveAutoVersion]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, []);

  // Track changes to title/description for dirty criteria indicator
  useEffect(() => {
    const titleChanged = story.title !== originalTitle && originalTitle !== "";
    const descriptionChanged = story.description !== originalDescription && originalDescription !== "";
    setDirtyCriteria(titleChanged || descriptionChanged);
  }, [story.title, story.description, originalTitle, originalDescription]);
  const [testDataPanels, setTestDataPanels] = useState({
    userInputs: true,
    edgeCases: true,
    apiMocks: true,
    codeSnippets: true
  });

  const generateStory = async () => {
    setIsGenerating(true);
    setShowRawInput(false);
    setSavedInput(rawInput); // Save for restart
    setSavedCustomPrompt(customPrompt); // Save for restart
    
    // Trigger the UI state change to show all sections
    onStoryGenerated?.();
    
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

    // Generate comprehensive test data
    const generatedTestData = {
      userInputs: [
        "test@example.com / SecurePass123!",
        "invalid-email / weak",
        "existing@user.com / AnotherPass456!",
        "user+tag@domain.co.uk / ComplexP@ss1"
      ],
      edgeCases: [
        "Email already exists in system",
        "Network timeout during verification",
        "Malformed email verification link",
        "Special characters in email address",
        "International domain names"
      ],
      apiResponses: [
        { status: 201, data: { userId: "usr_123", verified: false } },
        { status: 400, error: "Email already registered" },
        { status: 422, error: "Invalid password format" },
        { status: 503, error: "Email service unavailable" }
      ],
      codeSnippets: []
    };

    setStory(generatedStory);
    setTestData(generatedTestData);
    setOriginalTitle(generatedStory.title);
    setOriginalDescription(generatedStory.description);
    setDirtyCriteria(false);
    setIsGenerating(false);

    // Auto-save version after generation - always save as "Initial Generation"
    const storyContent = {
      title: generatedStory.title,
      description: generatedStory.description,
      acceptanceCriteria: generatedStory.acceptanceCriteria,
      storyPoints: generatedStory.storyPoints,
      testData: generatedTestData
    };
    saveVersion(storyContent, "Initial Generation");
    setLastAutoSaveContent(JSON.stringify(storyContent));
  };

  const generateDevNotes = async () => {
    setIsGeneratingDevNotes(true);
    
    // Simulate GitHub scanning
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const devCodeSnippets = [
      "// Authentication service\nclass AuthService {\n  async register(email, password) {\n    const validation = this.validateInput(email, password);\n    if (!validation.isValid) throw new Error(validation.error);\n    return await this.createUser(email, password);\n  }\n}",
      "// Email validation\nconst isValidEmail = (email) => {\n  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n  return emailRegex.test(email);\n};",
      "// Password strength validation\nconst validatePassword = (password) => {\n  const minLength = 8;\n  const hasUpperCase = /[A-Z]/.test(password);\n  const hasLowerCase = /[a-z]/.test(password);\n  const hasNumbers = /\\d/.test(password);\n  const hasNonalphas = /\\W/.test(password);\n  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasNonalphas;\n};"
    ];

    setTestData(prev => ({
      ...prev,
      codeSnippets: devCodeSnippets
    }));

    setHasDevNotes(true);
    setDevNotesOpen(true);
    setIsGeneratingDevNotes(false);
  };

  const newStory = () => {
    setStory({
      id: `US-${String(Date.now()).slice(-3)}`,
      title: "",
      description: "",
      acceptanceCriteria: [],
      storyPoints: 0,
      status: 'draft',
      tags: []
    });
    setTestData({
      userInputs: [],
      edgeCases: [],
      apiResponses: [],
      codeSnippets: []
    });
    setRawInput("");
    setCustomPrompt("");
    setSavedInput("");
    setSavedCustomPrompt("");
    setUploadedFiles([]);
    setShowRawInput(true);
    setHasDevNotes(false);
    setDevNotesOpen(false);
    setOriginalTitle("");
    setOriginalDescription("");
    setDirtyCriteria(false);
    setIsGenerating(false);
    setIsGeneratingDevNotes(false);
    setAppliedFieldId(null);
    // Reset test data panels
    setTestDataPanels({
      userInputs: true,
      edgeCases: true,
      apiMocks: true,
      codeSnippets: true
    });
    
    // Clear version history and auto-save state
    clearVersions();
    setLastAutoSaveContent('');
    
    // Clear any pending auto-save timers
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }
    
    // Call parent reset handler
    onNewStory?.();
  };

  const handleNewStoryClick = () => {
    // Show confirmation dialog if there's any content in the current story
    const hasContent = story.title.trim() || story.description.trim() || 
                      story.acceptanceCriteria.length > 0 || rawInput.trim();
    
    if (hasContent) {
      setShowNewStoryConfirm(true);
    } else {
      newStory();
    }
  };

  const handleConfirmNewStory = () => {
    setShowNewStoryConfirm(false);
    newStory();
  };

  const handleCancelNewStory = () => {
    setShowNewStoryConfirm(false);
  };

  const restartStory = async () => {
    if (!savedInput) return;
    
    setStory(prev => ({
      ...prev,
      title: "",
      description: "",
      acceptanceCriteria: [],
      storyPoints: 0,
      status: 'draft'
    }));
    setTestData({
      userInputs: [],
      edgeCases: [],
      apiResponses: [],
      codeSnippets: []
    });
    setHasDevNotes(false);
    setDevNotesOpen(false);
    setRawInput(savedInput);
    setCustomPrompt(savedCustomPrompt);
    
    // Auto-generate after restart
    await generateStory();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const newFile: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        description: "",
        type: file.type,
        size: file.size,
        uploadDate: new Date()
      };
      setUploadedFiles(prev => [...prev, newFile]);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const updateFileDescription = (fileId: string, description: string) => {
    setUploadedFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, description } : f
    ));
  };

  const refreshTestData = (section: keyof TestData) => {
    // Simulate refreshing test data for specific section
    console.log(`Refreshing ${section} test data`);
  };

  const handleApplySuggestion = (type: string, content: string) => {
    let updatedStory = story;
    let updatedTestData = testData;
    let appliedField = '';

    // Apply suggestion based on type
    if (type === 'testing') {
      // Add to edge cases
      updatedTestData = {
        ...testData,
        edgeCases: [...testData.edgeCases, content.split('.')[0]]
      };
      setTestData(updatedTestData);
      appliedField = 'edge-cases';
    } else if (type === 'criteria') {
      // Add to acceptance criteria
      updatedStory = {
        ...story,
        acceptanceCriteria: [...story.acceptanceCriteria, content.split('.')[0]]
      };
      setStory(updatedStory);
      appliedField = 'acceptance-criteria';
    } else if (type === 'story') {
      // Update story points if content mentions points
      if (content.toLowerCase().includes('point')) {
        const pointsMatch = content.match(/(\d+)\s*point/);
        if (pointsMatch) {
          updatedStory = {
            ...story,
            storyPoints: parseInt(pointsMatch[1])
          };
          setStory(updatedStory);
          appliedField = 'story-points';
        }
      }
    }

    // Auto-save version after applying suggestion
    if (appliedField) {
      flashField(appliedField);
      const storyContent = {
        title: updatedStory.title,
        description: updatedStory.description,
        acceptanceCriteria: updatedStory.acceptanceCriteria,
        storyPoints: updatedStory.storyPoints,
        testData: updatedTestData
      };
      saveVersion(storyContent, "Refinement Applied");
      setLastAutoSaveContent(JSON.stringify(storyContent));
    }
  };

  const flashField = (fieldId: string) => {
    setAppliedFieldId(fieldId);
    setTimeout(() => setAppliedFieldId(null), 2000);
  };

  const handleRestoreVersion = (version: StoryVersion) => {
    setStory(prev => ({
      ...prev,
      title: version.title,
      description: version.description,
      acceptanceCriteria: [...version.acceptanceCriteria],
      storyPoints: version.storyPoints
    }));

    if (version.testData) {
      setTestData({
        userInputs: [...version.testData.userInputs],
        edgeCases: [...version.testData.edgeCases],
        apiResponses: [...version.testData.apiResponses],
        codeSnippets: [...version.testData.codeSnippets]
      });
    }

    toast({
      title: "Version restored successfully",
      description: `Restored: ${version.label}`,
    });
  };

  const handleSaveManual = () => {
    const storyContent = {
      title: story.title,
      description: story.description,
      acceptanceCriteria: story.acceptanceCriteria,
      storyPoints: story.storyPoints,
      testData: testData
    };
    saveVersion(storyContent, "Manual Save");
    setLastAutoSaveContent(JSON.stringify(storyContent));
    
    toast({
      title: "Version saved",
      description: "Current story state has been saved",
    });
  };

  const regenerateCriteria = async () => {
    setIsGenerating(true);
    // Simulate LLM call to regenerate criteria
    await new Promise(resolve => setTimeout(resolve, 1500));
    const newCriteria = [
      `User can enter email and password on registration form`,
      `System validates email format and password strength`,
      `Verification email is sent upon successful registration`,
      `User can complete registration by clicking verification link`,
      `Error messages are displayed for invalid inputs`
    ];
    setStory(prev => ({ ...prev, acceptanceCriteria: newCriteria }));
    flashField('acceptance-criteria');
    setIsGenerating(false);
    setDirtyCriteria(false);
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
    <>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <NewStoryConfirmDialog
        isOpen={showNewStoryConfirm}
        onConfirm={handleConfirmNewStory}
        onCancel={handleCancelNewStory}
      />
      <div className="p-6 space-y-6">
      {/* Progress Header - Only show when story is generated */}
      {storyGenerated && (
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
              onClick={onToggleChat}
              variant={showChat ? "default" : "outline"}
              className="gap-2"
              title="Open Story Refinement Chat"
            >
              <MessageSquare className="h-4 w-4" />
              Chat
            </Button>
            <Button 
              onClick={handleNewStoryClick}
              variant="outline"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New User Story
            </Button>
            <Button 
              onClick={restartStory}
              variant="outline"
              disabled={!savedInput}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Restart Story
            </Button>
          </div>
        </div>
      )}

      {/* Raw Input Zone */}
      {showRawInput && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Raw Input & File Upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="raw-input">Specifications & Requirements</Label>
              <Textarea 
                id="raw-input"
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder="Paste specs or click to upload reference files"
                rows={4}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="custom-prompt">Custom Prompt</Label>
              <Textarea 
                id="custom-prompt"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Enter any specific instructions or tone for this story…"
                rows={2}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Upload Reference Files</Label>
              <div className="mt-2 border-2 border-dashed border-muted rounded-lg p-4 text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">Drop PDFs, DOCs, or images here</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* File Library */}
            {uploadedFiles.length > 0 && (
              <div>
                <Label>Uploaded Files</Label>
                <div className="mt-2 space-y-2">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <Input
                          placeholder="Add description..."
                          value={file.description}
                          onChange={(e) => updateFileDescription(file.id, e.target.value)}
                          className="text-xs mt-1"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" title="Preview">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeFile(file.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button 
              onClick={generateStory} 
              variant={isGenerating ? "ai" : "default"}
              disabled={isGenerating || !rawInput.trim()}
              className="w-full gap-2"
            >
              {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {isGenerating ? "Generating Story..." : "Generate User Story"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Only show story sections after generation */}
      {storyGenerated && (
        <div className={`grid gap-6 ${showTestData ? 'grid-cols-3' : 'grid-cols-1'}`}>
          {/* Main Story Content */}
          <div className={`space-y-6 ${showTestData ? 'col-span-2' : 'col-span-1'}`}>
            {/* Story Details */}
            <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Story Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="story-title">Title</Label>
                <Input 
                  id="story-title"
                  value={story.title}
                  onChange={(e) => setStory(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter story title..."
                />
              </div>
              
              <div>
                <Label htmlFor="story-description">Description</Label>
                <Textarea 
                  id="story-description"
                  value={story.description}
                  onChange={(e) => setStory(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="As a [user], I want [goal] so that [benefit]..."
                  rows={3}
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label>Acceptance Criteria</Label>
                    {dirtyCriteria && (
                      <Badge variant="outline" title="Criteria may be out of sync" className="text-xs">
                        ⚠️
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={regenerateCriteria}
                      className="gap-1 text-xs"
                      title="Refresh acceptance criteria based on current Title & Description"
                      disabled={isGenerating}
                    >
                      <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} />
                      Regenerate Criteria
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStory(prev => ({ 
                        ...prev, 
                        acceptanceCriteria: [...prev.acceptanceCriteria, ""] 
                      }))}
                      className="gap-1 text-xs"
                    >
                      <Plus className="h-3 w-3" />
                      Add Criterion
                    </Button>
                  </div>
                </div>
                <div className={cn(
                  appliedFieldId === 'acceptance-criteria' && "ring-2 ring-primary animate-pulse",
                  "space-y-2 mt-2"
                )}>
                  {story.acceptanceCriteria.map((criterion, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-status-ready flex-shrink-0" />
                        <Input
                          value={criterion}
                          onChange={(e) => {
                            const newCriteria = [...story.acceptanceCriteria];
                            newCriteria[index] = e.target.value;
                            setStory(prev => ({ ...prev, acceptanceCriteria: newCriteria }));
                          }}
                          placeholder="Enter acceptance criterion..."
                          className={cn(
                            "text-sm flex-1",
                            appliedFieldId === 'acceptance-criteria' && "ring-2 ring-primary animate-pulse"
                          )}
                        />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newCriteria = story.acceptanceCriteria.filter((_, i) => i !== index);
                          setStory(prev => ({ ...prev, acceptanceCriteria: newCriteria }));
                        }}
                        className="p-1 h-8 w-8"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {story.acceptanceCriteria.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">
                      Generate a story or click "Add Criterion" to add acceptance criteria
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="story-points">Story Points</Label>
                  <Select value={story.storyPoints.toString()} onValueChange={(value) => setStory(prev => ({ ...prev, storyPoints: parseInt(value) }))}>
                    <SelectTrigger className={cn(
                      "w-24",
                      appliedFieldId === 'story-points' && "ring-2 ring-primary animate-pulse"
                    )}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 5, 8, 13].map(points => (
                        <SelectItem key={points} value={points.toString()}>{points}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveManual}
                  className="gap-2"
                  disabled={!story.title}
                >
                  <History className="h-3 w-3" />
                  Save Version
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Developer Notes - Always Visible */}
          <Collapsible open={devNotesOpen} onOpenChange={setDevNotesOpen}>
            <Card>
              <CardHeader className="cursor-pointer">
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between w-full">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Developer Notes
                      {hasDevNotes && (
                        <Badge variant="outline" className="gap-1">
                          <GitBranch className="h-3 w-3" />
                          From GitHub
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          generateDevNotes();
                        }}
                        disabled={isGeneratingDevNotes}
                        className="gap-2"
                      >
                        {isGeneratingDevNotes ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Code className="h-3 w-3" />}
                        {isGeneratingDevNotes ? "Scanning GitHub..." : "Generate Dev Notes"}
                      </Button>
                      {devNotesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  {hasDevNotes ? (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Relevant Code Snippets</h4>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => refreshTestData('codeSnippets')}
                          className="gap-1"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Refresh
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {testData.codeSnippets.map((snippet, index) => (
                          <div key={index} className="bg-muted p-3 rounded-md">
                            <pre className="text-xs overflow-x-auto whitespace-pre-wrap">{snippet}</pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Generate developer notes to see relevant code snippets and technical context
                    </p>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Push to ADO - Always Visible */}
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
                  <Label htmlFor="iteration-select">Iteration</Label>
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
                  <Label htmlFor="tags-input">Tags</Label>
                  <Input id="tags-input" placeholder="frontend, auth, registration" />
                </div>
              </div>
              
              <Button 
                variant="accent" 
                className="w-full gap-2"
                disabled={!story.title}
              >
                <Send className="h-4 w-4" />
                {story.title ? "Push to Azure DevOps" : "Generate story first"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Test Data Sidebar */}
        {showTestData && (
          <div className="space-y-6">
            {/* Expanded State - Full Test Data Panel */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Interactive Test Data</CardTitle>
                  <Button 
                    onClick={onToggleTestData}
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                  >
                    Hide Test Data
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sample Inputs */}
                <Collapsible open={testDataPanels.userInputs} onOpenChange={(open) => setTestDataPanels(prev => ({ ...prev, userInputs: open }))}>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between cursor-pointer">
                      <h4 className="font-medium text-sm">Sample Inputs</h4>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            refreshTestData('userInputs');
                          }}
                          className="p-1"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                        {testDataPanels.userInputs ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="space-y-1">
                      {testData.userInputs.map((input, index) => (
                        <div key={index} className="text-xs bg-muted p-2 rounded">
                          {input}
                        </div>
                      ))}
                      {testData.userInputs.length === 0 && (
                        <p className="text-xs text-muted-foreground italic">Generate story to see sample inputs</p>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Separator />

                {/* Edge Cases */}
                <Collapsible open={testDataPanels.edgeCases} onOpenChange={(open) => setTestDataPanels(prev => ({ ...prev, edgeCases: open }))}>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between cursor-pointer">
                      <h4 className="font-medium text-sm">Edge Cases</h4>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            refreshTestData('edgeCases');
                          }}
                          className="p-1"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                        {testDataPanels.edgeCases ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="space-y-1">
                      {testData.edgeCases.map((edge, index) => (
                        <div key={index} className={cn(
                          "text-xs bg-warning/10 p-2 rounded border border-warning/20",
                          appliedFieldId === 'edge-cases' && "ring-2 ring-primary animate-pulse"
                        )}>
                          {edge}
                        </div>
                      ))}
                      {testData.edgeCases.length === 0 && (
                        <p className="text-xs text-muted-foreground italic">Generate story to see edge cases</p>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Separator />

                {/* API Mocks */}
                <Collapsible open={testDataPanels.apiMocks} onOpenChange={(open) => setTestDataPanels(prev => ({ ...prev, apiMocks: open }))}>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between cursor-pointer">
                      <h4 className="font-medium text-sm">API Mocks</h4>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            refreshTestData('apiResponses');
                          }}
                          className="p-1"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                        {testDataPanels.apiMocks ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="space-y-1">
                      {testData.apiResponses.map((response, index) => (
                        <div key={index} className="text-xs bg-muted p-2 rounded">
                          <pre className="whitespace-pre-wrap">{JSON.stringify(response, null, 2)}</pre>
                        </div>
                      ))}
                      {testData.apiResponses.length === 0 && (
                        <p className="text-xs text-muted-foreground italic">Generate story to see API mocks</p>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Separator />

                {/* Code Snippets */}
                <Collapsible open={testDataPanels.codeSnippets} onOpenChange={(open) => setTestDataPanels(prev => ({ ...prev, codeSnippets: open }))}>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between cursor-pointer">
                      <h4 className="font-medium text-sm">Code Snippets</h4>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            refreshTestData('codeSnippets');
                          }}
                          className="p-1"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                        {testDataPanels.codeSnippets ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="space-y-1">
                      {testData.codeSnippets.map((snippet, index) => (
                        <div key={index} className="text-xs bg-muted p-2 rounded">
                          <pre className="whitespace-pre-wrap">{snippet}</pre>
                        </div>
                      ))}
                      {testData.codeSnippets.length === 0 && (
                        <p className="text-xs text-muted-foreground italic">Generate dev notes to see code snippets</p>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          </div>
        )}
        </div>
      )}
      </div>
    </>
  );
}