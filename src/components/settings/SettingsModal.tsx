import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  ChevronDown, 
  ChevronRight, 
  FileText, 
  GitBranch, 
  Upload,
  Eye,
  Trash2
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProjectSettings {
  name: string;
  description: string;
  domain: string;
  customInstructions: string;
}

interface AISettings {
  tone: 'professional' | 'casual' | 'technical';
  style: string;
  pointsMethod: 'fibonacci' | 'linear' | 't-shirt';
}

interface IntegrationSettings {
  githubRepo: string;
  adoWorkspace: string;
  githubToken: string;
  adoToken: string;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState({
    project: false,
    ai: false,
    integrations: false,
    fileLibrary: false
  });

  const [projectSettings, setProjectSettings] = useState<ProjectSettings>({
    name: "E-commerce Platform",
    description: "Next-generation shopping experience with personalized recommendations",
    domain: "E-commerce, Retail, User Experience",
    customInstructions: "Focus on accessibility, mobile-first design, and performance optimization."
  });

  const [aiSettings, setAiSettings] = useState<AISettings>({
    tone: 'professional',
    style: "Clear, concise acceptance criteria with focus on user value",
    pointsMethod: 'fibonacci'
  });

  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>({
    githubRepo: "https://github.com/company/ecommerce-platform",
    adoWorkspace: "company.visualstudio.com/EcommercePlatform",
    githubToken: "ghp_****",
    adoToken: "****"
  });

  const [uploadedDocs] = useState([
    { id: '1', name: 'API_Documentation.pdf', size: '2.4 MB', uploaded: '2 days ago' },
    { id: '2', name: 'Design_System.pdf', size: '1.8 MB', uploaded: '1 week ago' },
    { id: '3', name: 'User_Research.docx', size: '3.2 MB', uploaded: '2 weeks ago' }
  ]);

  const toggleSection = (section: keyof typeof activeSection) => {
    setActiveSection(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSave = () => {
    try {
      // Simulate saving settings
      toast({
        title: "Settings saved",
        description: "Your project settings have been updated successfully.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Project Settings
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Project Context */}
          <Collapsible open={activeSection.project} onOpenChange={(open) => setActiveSection(prev => ({ ...prev, project: open }))}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left font-medium border rounded-lg hover:bg-muted/50" aria-label="Toggle Project Context">
              <span>Project Context</span>
              {activeSection.project ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 p-4 border border-t-0 rounded-b-lg space-y-4">
              <div>
                <Label htmlFor="project-name">Project Name</Label>
                <Input 
                  id="project-name"
                  value={projectSettings.name}
                  onChange={(e) => setProjectSettings(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="project-description">Description</Label>
                <Textarea 
                  id="project-description"
                  value={projectSettings.description}
                  onChange={(e) => setProjectSettings(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* AI Preferences */}
          <Collapsible open={activeSection.ai} onOpenChange={(open) => setActiveSection(prev => ({ ...prev, ai: open }))}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left font-medium border rounded-lg hover:bg-muted/50" aria-label="Toggle AI Preferences">
              <span>AI Preferences</span>
              {activeSection.ai ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 p-4 border border-t-0 rounded-b-lg space-y-4">
              <div>
                <Label htmlFor="ai-tone">Tone</Label>
                <Select value={aiSettings.tone} onValueChange={(value: any) => setAiSettings(prev => ({ ...prev, tone: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="concise">Concise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ai-style">Style Guidelines</Label>
                <Textarea 
                  id="ai-style"
                  value={aiSettings.style}
                  onChange={(e) => setAiSettings(prev => ({ ...prev, style: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="interaction-rules">Interaction Rules</Label>
                <Textarea 
                  id="interaction-rules"
                  placeholder="Define how AI should interact with users..."
                  rows={3}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Integrations */}
          <Collapsible open={activeSection.integrations} onOpenChange={(open) => setActiveSection(prev => ({ ...prev, integrations: open }))}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left font-medium border rounded-lg hover:bg-muted/50" aria-label="Toggle Integrations">
              <span>Integrations</span>
              {activeSection.integrations ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 p-4 border border-t-0 rounded-b-lg space-y-6">
              {/* GitHub Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  <h4 className="font-medium">GitHub</h4>
                  <Badge variant="default" className="text-xs">Connected</Badge>
                </div>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="github-repo">GitHub Repo URL</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="github-repo"
                        value={integrationSettings.githubRepo}
                        onChange={(e) => setIntegrationSettings(prev => ({ ...prev, githubRepo: e.target.value }))}
                        className="flex-1"
                      />
                      <Button variant="outline" size="sm">Test Connection</Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Azure DevOps Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <h4 className="font-medium">Azure DevOps</h4>
                  <Badge variant="secondary" className="text-xs">Not Connected</Badge>
                </div>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="ado-org">ADO Organization & Token</Label>
                    <Input 
                      id="ado-org"
                      placeholder="organization.visualstudio.com"
                      value={integrationSettings.adoWorkspace}
                      onChange={(e) => setIntegrationSettings(prev => ({ ...prev, adoWorkspace: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Input 
                      type="password"
                      placeholder="Personal Access Token"
                      value={integrationSettings.adoToken}
                      onChange={(e) => setIntegrationSettings(prev => ({ ...prev, adoToken: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* File Library */}
          <Collapsible open={activeSection.fileLibrary} onOpenChange={(open) => setActiveSection(prev => ({ ...prev, fileLibrary: open }))}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left font-medium border rounded-lg hover:bg-muted/50" aria-label="Toggle File Library">
              <span>File Library</span>
              {activeSection.fileLibrary ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 p-4 border border-t-0 rounded-b-lg space-y-4">
              <Button variant="outline" className="w-full" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
              
              {/* File List */}
              <div className="space-y-2">
                {uploadedDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <input 
                        type="text" 
                        placeholder="User Description" 
                        className="text-xs text-muted-foreground bg-transparent border-none outline-none w-full mt-1"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" title="Preview">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Delete">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}