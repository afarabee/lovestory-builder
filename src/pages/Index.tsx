import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StoryBuilder } from "@/components/story/StoryBuilder";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { ProjectSidebar } from "@/components/sidebar/ProjectSidebar";

const Index = () => {
  const [showChat, setShowChat] = useState(false);

  return (
    <AppLayout
      sidebarContent={<ProjectSidebar />}
      chatContent={<ChatPanel />}
      showChat={showChat}
      onToggleChat={() => setShowChat(!showChat)}
    >
      <StoryBuilder />
    </AppLayout>
  );
};

export default Index;
