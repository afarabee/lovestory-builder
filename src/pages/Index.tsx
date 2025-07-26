import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StoryBuilder } from "@/components/story/StoryBuilder";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { ProjectSidebar } from "@/components/sidebar/ProjectSidebar";

const Index = () => {
  const [showChat, setShowChat] = useState(true);
  const [chatHorizontallyCollapsed, setChatHorizontallyCollapsed] = useState(false);
  const [applySuggestionHandler, setApplySuggestionHandler] = useState<((type: string, content: string) => void) | null>(null);
  const [showTestData, setShowTestData] = useState(false);

  const handleApplySuggestion = (type: string, content: string) => {
    applySuggestionHandler?.(type, content);
  };

  const handleNewStory = () => {
    // Reset test data panel state when creating new story
    setShowTestData(false);
    // Reset chat horizontal collapse state
    setChatHorizontallyCollapsed(false);
    // Keep chat expanded by default
    setShowChat(true);
  };

  return (
    <AppLayout
      sidebarContent={
        <ProjectSidebar 
          showTestData={showTestData}
          onToggleTestData={() => setShowTestData(!showTestData)}
          onNewStory={handleNewStory}
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
        onSetApplySuggestionHandler={setApplySuggestionHandler}
        showTestData={showTestData}
        onToggleTestData={() => setShowTestData(!showTestData)}
        onNewStory={handleNewStory}
      />
    </AppLayout>
  );
};

export default Index;
