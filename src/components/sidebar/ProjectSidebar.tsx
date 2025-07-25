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
  AlertCircle,
  Eye
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

interface ProjectSidebarProps {
  showTestData?: boolean;
  onToggleTestData?: () => void;
}

export function ProjectSidebar({ showTestData = false, onToggleTestData }: ProjectSidebarProps = {}) {
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
      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Story Actions */}
          <div>
            <div className="space-y-1">
              <Button variant="default" size="sm" className="w-full justify-start gap-2">
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