import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FolderOpen,
  GitBranch,
  FileText,
  History,
  Settings,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

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

export function ProjectSidebar() {
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

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      {/* Project Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Project Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h3 className="font-medium">{projectInfo.name}</h3>
            <p className="text-sm text-muted-foreground">{projectInfo.description}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{projectInfo.completedStories}/{projectInfo.storiesCount} stories</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>

          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              {Math.round(completionPercentage)}% Complete
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="default" size="sm" className="w-full justify-start gap-2">
            <Plus className="h-4 w-4" />
            New User Story
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start gap-2">
            <GitBranch className="h-4 w-4" />
            Sync with GitHub
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start gap-2">
            <FileText className="h-4 w-4" />
            Export to ADO
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
            <Settings className="h-4 w-4" />
            Project Settings
          </Button>
        </CardContent>
      </Card>

      {/* Recent Stories */}
      <Card className="flex-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" />
            Recent Stories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentStories.map((story) => (
            <div
              key={story.id}
              className="p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <StatusIcon status={story.status} />
                  <span className="text-xs font-mono text-muted-foreground">
                    {story.id}
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {story.points}pt
                </Badge>
              </div>
              
              <h4 className="text-sm font-medium leading-tight mb-2 line-clamp-2">
                {story.title}
              </h4>
              
              <div className="flex items-center justify-between">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(story.status)}`} />
                <span className="text-xs text-muted-foreground">
                  {story.lastModified.toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Version History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Version History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span>Current Draft</span>
              <span className="text-xs text-muted-foreground">2 min ago</span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Initial Generation</span>
              <span className="text-xs">5 min ago</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full mt-3 text-xs">
            View All Versions
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}