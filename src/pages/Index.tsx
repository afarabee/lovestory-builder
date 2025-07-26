import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StoryBuilder } from "@/components/story/StoryBuilder";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { ProjectSidebar } from "@/components/sidebar/ProjectSidebar";

const Index = () => {
  const [showChat, setShowChat] = useState(false); // Hidden by default
  const [chatHorizontallyCollapsed, setChatHorizontallyCollapsed] = useState(false);
  const [applySuggestionHandler, setApplySuggestionHandler] = useState<((type: string, content: string) => void) | null>(null);
  const [showTestData, setShowTestData] = useState(false);
  const [storyGenerated, setStoryGenerated] = useState(false); // Track if story has been generated

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
    // Reset everything to initial state
    setStoryGenerated(false);
    setShowChat(false);
    setShowTestData(false);
    setChatHorizontallyCollapsed(false);
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
        storyGenerated={storyGenerated}
        onStoryGenerated={handleStoryGenerated}
      />
    </AppLayout>
  );
};

export default Index;
