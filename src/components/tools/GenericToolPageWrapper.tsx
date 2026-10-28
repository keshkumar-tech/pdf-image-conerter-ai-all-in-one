import React from 'react';
import { useParams } from 'react-router-dom';
import { GenericToolPage } from './GenericToolPage';

export function GenericToolPageWrapper() {
  const { toolId } = useParams<{ toolId: string }>();
  if (!toolId) return null;
  return <GenericToolPage toolId={toolId} />;
}
