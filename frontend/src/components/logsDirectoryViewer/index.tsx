import { useAxios } from '../../hooks/useAxios';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { TreeView } from '@mui/x-tree-view/TreeView';
import { LogsDirectoryViewerProps, RenderTree } from '../../types';
import { LOGS_API_ENDPOINT } from '../../utils/constants';

export const LogsDirectoryViewer = (props: LogsDirectoryViewerProps) => {
  const { onFileSelection } = props;

  const selectEntry = (e: React.SyntheticEvent, nodeId: string) => {
    onFileSelection(nodeId);
  };

  const { data, error, loaded } = useAxios(LOGS_API_ENDPOINT, 'GET');

  if (loaded) {
    return error ? <span>Error: {error}</span> : <>{data ? RichObjectTreeView(data, selectEntry) : ''}</>;
  }

  return <span>Loading...</span>;
};

const RichObjectTreeView = (data: RenderTree, selectEntry: any) => {
  const renderTree = (nodes: RenderTree) => {
    return (
      <TreeItem key={nodes.id} nodeId={nodes.name} label={nodes.name}>
        {Array.isArray(nodes.children) ? nodes.children.map(node => renderTree(node)) : null}
      </TreeItem>
    );
  };

  return (
    <Box sx={{ minHeight: 110, flexGrow: 1, maxWidth: 1200 }} mt={2}>
      <TreeView
        aria-label="rich object"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpanded={['/var/log']}
        defaultExpandIcon={<ChevronRightIcon />}
        onNodeSelect={selectEntry}
      >
        {renderTree(data)}
      </TreeView>
    </Box>
  );
};
