import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { StoryVersion, StoryContent } from "@/hooks/useVersionHistory";

interface DiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  version: StoryVersion;
  currentContent: StoryContent;
  onRestore: (version: StoryVersion) => void;
}

export function DiffModal({ isOpen, onClose, version, currentContent, onRestore }: DiffModalProps) {
  const [expandedSections, setExpandedSections] = useState({
    title: true,
    description: true,
    criteria: true,
    testData: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const renderTextDiff = (oldText: string, newText: string) => {
    if (oldText === newText) {
      return <span className="text-muted-foreground">{newText || "(Empty)"}</span>;
    }
    
    return (
      <div className="space-y-2">
        {oldText && (
          <div className="p-2 bg-red-50 border border-red-200 rounded text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200">
            <span className="text-xs font-medium text-red-600 dark:text-red-400">- REMOVED:</span>
            <div className="mt-1">{oldText}</div>
          </div>
        )}
        {newText && (
          <div className="p-2 bg-green-50 border border-green-200 rounded text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200">
            <span className="text-xs font-medium text-green-600 dark:text-green-400">+ ADDED:</span>
            <div className="mt-1">{newText}</div>
          </div>
        )}
      </div>
    );
  };

  const renderArrayDiff = (oldArray: string[], newArray: string[]) => {
    const removed = oldArray.filter(item => !newArray.includes(item));
    const added = newArray.filter(item => !oldArray.includes(item));
    const unchanged = oldArray.filter(item => newArray.includes(item));

    return (
      <div className="space-y-2">
        {unchanged.map((item, index) => (
          <div key={`unchanged-${index}`} className="p-2 text-muted-foreground">
            {item}
          </div>
        ))}
        {removed.map((item, index) => (
          <div key={`removed-${index}`} className="p-2 bg-red-50 border border-red-200 rounded text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200">
            <span className="text-xs font-medium text-red-600 dark:text-red-400">- REMOVED:</span>
            <div className="mt-1">{item}</div>
          </div>
        ))}
        {added.map((item, index) => (
          <div key={`added-${index}`} className="p-2 bg-green-50 border border-green-200 rounded text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200">
            <span className="text-xs font-medium text-green-600 dark:text-green-400">+ ADDED:</span>
            <div className="mt-1">{item}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Version Comparison</span>
            <Button 
              onClick={() => onRestore(version)}
              variant="default"
              size="sm"
            >
              Restore This Version
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <h4 className="font-medium">Selected Version</h4>
              <p className="text-sm text-muted-foreground">{version.label}</p>
              <p className="text-xs text-muted-foreground">{formatTimestamp(version.timestamp)}</p>
            </div>
            <div>
              <h4 className="font-medium">Current Draft</h4>
              <p className="text-sm text-muted-foreground">Working version</p>
              <p className="text-xs text-muted-foreground">Now</p>
            </div>
          </div>

          {/* Title Comparison */}
          <Collapsible open={expandedSections.title} onOpenChange={() => toggleSection('title')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Title</h3>
                {version.title !== currentContent.title && (
                  <Badge variant="outline" className="text-xs">Changed</Badge>
                )}
              </div>
              {expandedSections.title ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3">
              {renderTextDiff(version.title, currentContent.title)}
            </CollapsibleContent>
          </Collapsible>

          {/* Description Comparison */}
          <Collapsible open={expandedSections.description} onOpenChange={() => toggleSection('description')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Description</h3>
                {version.description !== currentContent.description && (
                  <Badge variant="outline" className="text-xs">Changed</Badge>
                )}
              </div>
              {expandedSections.description ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3">
              {renderTextDiff(version.description, currentContent.description)}
            </CollapsibleContent>
          </Collapsible>

          {/* Acceptance Criteria Comparison */}
          <Collapsible open={expandedSections.criteria} onOpenChange={() => toggleSection('criteria')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Acceptance Criteria</h3>
                {JSON.stringify(version.acceptanceCriteria) !== JSON.stringify(currentContent.acceptanceCriteria) && (
                  <Badge variant="outline" className="text-xs">Changed</Badge>
                )}
              </div>
              {expandedSections.criteria ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pb-3">
              {renderArrayDiff(version.acceptanceCriteria, currentContent.acceptanceCriteria)}
            </CollapsibleContent>
          </Collapsible>

          {/* Story Points */}
          <div className="p-3 border rounded-lg">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              Story Points
              {version.storyPoints !== currentContent.storyPoints && (
                <Badge variant="outline" className="text-xs">Changed</Badge>
              )}
            </h3>
            {version.storyPoints !== currentContent.storyPoints ? (
              <div className="flex items-center gap-4">
                <span className="text-red-600 dark:text-red-400">
                  {version.storyPoints} → 
                </span>
                <span className="text-green-600 dark:text-green-400">
                  {currentContent.storyPoints}
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground">{currentContent.storyPoints}</span>
            )}
          </div>

          {/* Test Data Comparison (if available) */}
          {(version.testData || currentContent.testData) && (
            <Collapsible open={expandedSections.testData} onOpenChange={() => toggleSection('testData')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">Test Data</h3>
                  <Badge variant="outline" className="text-xs">Optional</Badge>
                </div>
                {expandedSections.testData ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 pb-3">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Edge Cases</h4>
                    {renderArrayDiff(
                      version.testData?.edgeCases || [],
                      currentContent.testData?.edgeCases || []
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}