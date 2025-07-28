import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  FolderOpen,
  GitBranch,
  FileText,
  History,
  Settings,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  RotateCcw,
  GitCompare
} from "lucide-react";
import { StoryVersion } from "@/hooks/useVersionHistory";
import { DiffModal } from "@/components/version/DiffModal";
import { RestoreConfirmDialog } from "@/components/version/RestoreConfirmDialog";

interface ProjectInfo {
  name: string;
  description: string;
  storiesCount: number;
  completedStories: number;
}

interface StoryItem {
  id: string;
  title: string;
  status: 'draft' | 'ready' | 'in-progress' | 'done';
  points: number;
  lastModified: Date;
}

interface ProjectSidebarProps {
  showTestData?: boolean;
  onToggleTestData?: () => void;
  onNewStory?: () => void;
  versions?: StoryVersion[];
  currentStoryContent?: {
    title: string;
    description: string;
    acceptanceCriteria: string[];
    storyPoints: number;
    testData?: any;
  };
  onRestoreVersion?: (version: StoryVersion) => void;
}

export function ProjectSidebar({ 
  showTestData = false, 
  onToggleTestData, 
  onNewStory, 
  versions = [], 
  currentStoryContent,
  onRestoreVersion 
}: ProjectSidebarProps = {}) {
  const [selectedVersionForDiff, setSelectedVersionForDiff] = useState<StoryVersion | null>(null);
  const [versionToRestore, setVersionToRestore] = useState<StoryVersion | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [projectInfo] = useState<ProjectInfo>({
    name: "E-commerce Platform",
    description: "Next-generation shopping experience with personalized recommendations",
    storiesCount: 12,
    completedStories: 8
  });

  const [recentStories] = useState<StoryItem[]>([
    {
      id: "US-001",
      title: "User Registration with Email Verification",
      status: "ready",
      points: 5,
      lastModified: new Date()
    },
    {
      id: "US-002", 
      title: "Shopping Cart Management",
      status: "done",
      points: 8,
      lastModified: new Date(Date.now() - 86400000)
    },
    {
      id: "US-003",
      title: "Product Search with Filters",
      status: "in-progress",
      points: 13,
      lastModified: new Date(Date.now() - 172800000)
    },
    {
      id: "US-004",
      title: "Payment Processing Integration",
      status: "draft",
      points: 8,
      lastModified: new Date(Date.now() - 259200000)
    }
  ]);

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="h-3 w-3 text-status-ready" />;
      case 'in-progress':
        return <Clock className="h-3 w-3 text-status-in-progress" />;
      case 'done':
        return <CheckCircle className="h-3 w-3 text-status-done" />;
      default:
        return <AlertCircle className="h-3 w-3 text-status-draft" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-status-ready';
      case 'in-progress': return 'bg-status-in-progress';
      case 'done': return 'bg-status-done';
      default: return 'bg-status-draft';
    }
  };

  const completionPercentage = (projectInfo.completedStories / projectInfo.storiesCount) * 100;

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleVersionClick = (version: StoryVersion) => {
    // Show diff view when clicking on a version
    setSelectedVersionForDiff(version);
  };

  const handleRestoreClick = (version: StoryVersion, e: React.MouseEvent) => {
    e.stopPropagation();
    setVersionToRestore(version);
    setShowRestoreConfirm(true);
  };

  const handleDiffClick = (version: StoryVersion, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedVersionForDiff(version);
  };

  const handleRestoreConfirm = () => {
    if (versionToRestore && onRestoreVersion) {
      onRestoreVersion(versionToRestore);
      setShowRestoreConfirm(false);
      setVersionToRestore(null);
    }
  };

  const handleRestoreFromDiff = (version: StoryVersion) => {
    setSelectedVersionForDiff(null);
    if (onRestoreVersion) {
      onRestoreVersion(version);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Story Actions */}
          <div>
            <div className="space-y-1">
              <Button 
                variant="default" 
                size="sm" 
                className="w-full justify-start gap-2"
                onClick={onNewStory}
              >
                <Plus className="h-4 w-4" />
                New User Story
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <History className="h-4 w-4" />
                Restart Story
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start gap-2"
                onClick={onToggleTestData}
              >
                <Eye className="h-4 w-4" />
                Show Test Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Version History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Version History</CardTitle>
        </CardHeader>
        <CardContent>
          {versions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No versions saved yet.
            </p>
          ) : (
            <div className="space-y-2">
              {versions.slice(0, 5).map((version, index) => (
                <TooltipProvider key={version.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                       <div 
                         className="group flex items-center justify-between p-2 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                         onClick={() => handleVersionClick(version)}
                         title="Click to view changes"
                       >
                         <div className="flex items-center gap-2 min-w-0 flex-1">
                           <History className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                           <div className="min-w-0 flex-1">
                             <p className="text-sm font-medium truncate">{version.label}</p>
                             <p className="text-xs text-muted-foreground">
                               {formatTimestamp(version.timestamp)}
                             </p>
                             <p className="text-xs text-muted-foreground truncate mt-1">
                               {version.preview}
                             </p>
                           </div>
                         </div>
                         <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           {currentStoryContent && (
                             <Button
                               variant="ghost"
                               size="sm"
                               className="h-6 w-6 p-0"
                               onClick={(e) => handleDiffClick(version, e)}
                               title="View Changes"
                             >
                               <GitCompare className="h-3 w-3" />
                             </Button>
                           )}
                           <Button
                             variant="ghost"
                             size="sm"
                             className="h-6 w-6 p-0"
                             onClick={(e) => handleRestoreClick(version, e)}
                             title="Restore This Version"
                           >
                             <RotateCcw className="h-3 w-3" />
                           </Button>
                         </div>
                       </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <div className="max-w-xs">
                        <p className="font-medium">{version.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(version.timestamp)}
                        </p>
                        <p className="text-xs mt-1 truncate">"{version.title}"</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
              
              {versions.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  {versions.length - 5} more versions available
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {selectedVersionForDiff && currentStoryContent && (
        <DiffModal
          isOpen={!!selectedVersionForDiff}
          onClose={() => setSelectedVersionForDiff(null)}
          version={selectedVersionForDiff}
          currentContent={currentStoryContent}
          onRestore={handleRestoreFromDiff}
        />
      )}
      
      <RestoreConfirmDialog
        isOpen={showRestoreConfirm}
        onClose={() => {
          setShowRestoreConfirm(false);
          setVersionToRestore(null);
        }}
        onConfirm={handleRestoreConfirm}
        version={versionToRestore}
      />
    </div>
  );
}