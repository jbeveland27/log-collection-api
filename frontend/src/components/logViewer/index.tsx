import { useState } from 'react';

import { Alert, Button, Divider, Stack } from '@mui/material';

import { VIEWS } from '../../types';
import { FileViewer } from '../fileViewer';
import { Item } from '../item';
import { LogsDirectoryViewer } from '../logsDirectoryViewer';

export const LogViewer = () => {
  const [view, setView] = useState(VIEWS.DIRECTORIES);
  const [file, setFile] = useState('');

  const viewFile = (name: string) => {
    setView(VIEWS.FILE);
    setFile(name);
  };

  const viewDirectories = () => {
    setView(VIEWS.DIRECTORIES);
    setFile('');
  };

  const renderDirectoryView = () => {
    return (
      <Stack divider={<Divider orientation="horizontal" flexItem />} spacing={2}>
        <Item>Select an entry below</Item>
        <Item>
          <LogsDirectoryViewer onFileSelection={viewFile} />
        </Item>
      </Stack>
    );
  };

  const renderFileView = () => {
    return <FileViewer file={file} onBack={viewDirectories} />;
  };

  if (view === VIEWS.DIRECTORIES) {
    return renderDirectoryView();
  }

  if (view === VIEWS.FILE) {
    return renderFileView();
  }

  return (
    <Stack divider={<Divider orientation="horizontal" flexItem />} spacing={2}>
      <Item>
        <Alert severity="error" sx={{ marginBottom: '10px' }}>
          Something went wrong 🫤 Please try again
        </Alert>
        <Button variant="contained" onClick={() => viewDirectories()}>
          Go Back
        </Button>
      </Item>
    </Stack>
  );
};
