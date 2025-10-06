import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { IssuancePage } from './pages/IssuancePage';
import { VerificationPage } from './pages/VerificationPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/issue" replace />} />
          <Route path="/issue" element={<IssuancePage />} />
          <Route path="/verify" element={<VerificationPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
