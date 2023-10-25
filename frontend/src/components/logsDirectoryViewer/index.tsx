import { useAxios } from "../../hooks/useAxios";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { TreeView } from "@mui/x-tree-view/TreeView";
import { LogsDirectoryViewerProps, RenderTree } from "../../types";
import { LOGS_API_ENDPOINT } from "../../utils/constants";
import { Box } from "@mui/material";

export const LogsDirectoryViewer = (props: LogsDirectoryViewerProps) => {
  const { onFileSelection } = props;

  const selectEntry = (e: React.SyntheticEvent, nodeId: string) => {
    if (!isDirectory(data as unknown as RenderTree, nodeId)) {
      onFileSelection(nodeId);
    }
  };

  const { data, error, loaded } = useAxios(LOGS_API_ENDPOINT, "GET");

  if (loaded) {
    return error ? (
      <span>Error: {error}</span>
    ) : (
      <>{data ? renderDirectoryTree(data, selectEntry) : ""}</>
    );
  }

  return <span>Loading...</span>;
};

const renderDirectoryTree = (data: RenderTree, selectEntry: any) => {
  const renderTree = (nodes: RenderTree) => {
    return (
      <TreeItem
        key={nodes.id}
        nodeId={nodes.path}
        label={nodes.name}
        disabled={nodes.children && nodes.children.length <= 0}
      >
        {Array.isArray(nodes.children)
          ? nodes.children.map((node) => renderTree(node))
          : null}
      </TreeItem>
    );
  };

  return (
    <Box
      sx={{ minHeight: 110, flexGrow: 1, maxWidth: 1200, textAlign: "left" }}
      mt={2}
    >
      <TreeView
        aria-label="directory tree"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpanded={["/var/log"]}
        defaultExpandIcon={<ChevronRightIcon />}
        onNodeSelect={selectEntry}
      >
        <TreeItem key={data.id} nodeId={data.path} label={data.path}>
          {Array.isArray(data.children)
            ? data.children.map((node) => renderTree(node))
            : null}
        </TreeItem>
      </TreeView>
    </Box>
  );
};

function isDirectory(directoryTree: RenderTree, nodeId: string): boolean {
  const stack = [directoryTree];
  while (stack.length > 0) {
    const node = stack.pop();

    if (node?.path === nodeId) {
      return Array.isArray(node.children);
    } else if (node?.children && node.children.length) {
      for (let i = 0; i < node.children.length; i++) {
        stack.push(node.children[i]);
      }
    }
  }

  return false;
}
