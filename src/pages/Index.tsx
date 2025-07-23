import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StoryBuilder } from "@/components/story/StoryBuilder";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { ProjectSidebar } from "@/components/sidebar/ProjectSidebar";

const Index = () => {
  const [showChat, setShowChat] = useState(false);
  const [chatHorizontallyCollapsed, setChatHorizontallyCollapsed] = useState(false);
  const [applySuggestionHandler, setApplySuggestionHandler] = useState<((type: string, content: string) => void) | null>(null);

  const handleApplySuggestion = (type: string, content: string) => {
    applySuggestionHandler?.(type, content);
  };

  return (
    <AppLayout
      sidebarContent={<ProjectSidebar />}
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
      />
    </AppLayout>
  );
};

export default Index;
