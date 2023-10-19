export const VIEWS = {
  DIRECTORIES: 'DIRECTORIES',
  FILE: 'FILE',
};

export interface RenderTree {
  id: string;
  name: string;
  children?: readonly RenderTree[];
}

export interface LogsDirectoryViewerProps {
  onFileSelection(nodeId: string): void;
}
