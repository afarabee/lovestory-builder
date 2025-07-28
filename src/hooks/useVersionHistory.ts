import { useState, useCallback } from 'react';

export interface StoryVersion {
  id: string;
  timestamp: Date;
  label: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  storyPoints: number;
  testData?: {
    userInputs: string[];
    edgeCases: string[];
    apiResponses: any[];
    codeSnippets: string[];
  };
}

export interface StoryContent {
  title: string;
  description: string;
  acceptanceCriteria: string[];
  storyPoints: number;
  testData?: {
    userInputs: string[];
    edgeCases: string[];
    apiResponses: any[];
    codeSnippets: string[];
  };
}

export function useVersionHistory() {
  const [versions, setVersions] = useState<StoryVersion[]>([]);

  const saveVersion = useCallback((content: StoryContent, label: string) => {
    const newVersion: StoryVersion = {
      id: `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      label,
      title: content.title,
      description: content.description,
      acceptanceCriteria: [...content.acceptanceCriteria],
      storyPoints: content.storyPoints,
      testData: content.testData ? {
        userInputs: [...content.testData.userInputs],
        edgeCases: [...content.testData.edgeCases],
        apiResponses: [...content.testData.apiResponses],
        codeSnippets: [...content.testData.codeSnippets]
      } : undefined
    };

    setVersions(prev => [newVersion, ...prev]);
    return newVersion;
  }, []);

  const getVersion = useCallback((versionId: string) => {
    return versions.find(v => v.id === versionId);
  }, [versions]);

  const clearVersions = useCallback(() => {
    setVersions([]);
  }, []);

  return {
    versions,
    saveVersion,
    getVersion,
    clearVersions
  };
}