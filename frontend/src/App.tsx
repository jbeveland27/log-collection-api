import React from 'react';
import { LogViewer } from './components/logViewer';
import './App.css';
import { Container } from '@mui/material';

function App() {
  return (
    <div className="App">
      <Container sx={{ p: 5 }} maxWidth="lg">
        <LogViewer />
      </Container>
    </div>
  );
}

export default App;
