import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Header from './components/Header';
import Home from './pages/Home';
import Projects from './pages/Projects';
import AIInteractions from './pages/AIInteractions';

const theme = createTheme();

const App: React.FC = () => {
  return (
     <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/ai-interactions" element={<AIInteractions />} />
        </Routes>
      </Router>
    </ThemeProvider>
   );
}

export default App;