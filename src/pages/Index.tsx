import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StoryBuilder } from "@/components/story/StoryBuilder";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { ProjectSidebar } from "@/components/sidebar/ProjectSidebar";
import { StoryVersion } from "@/hooks/useVersionHistory";

const Index = () => {
  const [showChat, setShowChat] = useState(false); // Hidden by default
  const [chatHorizontallyCollapsed, setChatHorizontallyCollapsed] = useState(false);
  const [applySuggestionHandler, setApplySuggestionHandler] = useState<((type: string, content: string) => void) | null>(null);
  const [newStoryHandler, setNewStoryHandler] = useState<(() => void) | null>(null);
  const [showTestData, setShowTestData] = useState(false);
  const [storyGenerated, setStoryGenerated] = useState(false); // Track if story has been generated
  const [versions, setVersions] = useState<StoryVersion[]>([]);
  const [currentStoryContent, setCurrentStoryContent] = useState<any>(null);
  const [restoreVersionHandler, setRestoreVersionHandler] = useState<((version: StoryVersion) => void) | null>(null);

  const handleApplySuggestion = (type: string, content: string) => {
    applySuggestionHandler?.(type, content);
  };

  const handleStoryGenerated = () => {
    // Show all sections including chat when story is generated
    setStoryGenerated(true);
    setShowChat(true);
    setChatHorizontallyCollapsed(false);
  };

  const handleNewStory = () => {
    // Use the StoryBuilder's confirmation handler if available, otherwise reset directly
    if (newStoryHandler) {
      newStoryHandler();
    } else {
      // Fallback: Reset everything to initial state - hide chat and show only Raw Input
      setStoryGenerated(false);
      setShowChat(false);
      setShowTestData(false);
      setChatHorizontallyCollapsed(false);
      setVersions([]);
      setCurrentStoryContent(null);
    }
  };

  const handleVersionsChange = (newVersions: StoryVersion[], newCurrentContent: any) => {
    setVersions(newVersions);
    setCurrentStoryContent(newCurrentContent);
  };

  const handleRestoreVersion = (version: StoryVersion) => {
    if (restoreVersionHandler) {
      restoreVersionHandler(version);
    }
  };

  return (
    <AppLayout
      sidebarContent={
        <ProjectSidebar 
          showTestData={showTestData}
          onToggleTestData={() => setShowTestData(!showTestData)}
          onNewStory={handleNewStory}
          versions={versions}
          currentStoryContent={currentStoryContent}
          onRestoreVersion={handleRestoreVersion}
        />
      }
      chatContent={
        <ChatPanel 
          onApplySuggestion={handleApplySuggestion}
          isHorizontallyCollapsed={chatHorizontallyCollapsed}
          onHorizontalToggle={() => setChatHorizontallyCollapsed(!chatHorizontallyCollapsed)}
        />
      }
      showChat={showChat}
    >
        <StoryBuilder 
          showChat={showChat}
          onToggleChat={() => setShowChat(!showChat)}
          onSetApplySuggestionHandler={(handler, restoreHandler) => {
            setApplySuggestionHandler(() => handler);
            if (restoreHandler) {
              setRestoreVersionHandler(() => restoreHandler);
            }
          }}
          onSetNewStoryHandler={(handler) => {
            setNewStoryHandler(() => handler);
          }}
          showTestData={showTestData}
          onToggleTestData={() => setShowTestData(!showTestData)}
          onNewStory={handleNewStory}
          storyGenerated={storyGenerated}
          onStoryGenerated={handleStoryGenerated}
          onVersionsChange={handleVersionsChange}
        />
    </AppLayout>
  );
};

export default Index;
