import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Events from './pages/Events';
import Tournaments from './pages/Tournaments';
import Players from './pages/Players';
import Comparison from './pages/Comparison';
import News from './pages/News';
import NewsArticle from './pages/NewsArticle';
import Contact from './pages/Contact';
import Register from './pages/Register';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import TournamentRules from './pages/TournamentRules';
import AdminRegistrations from './pages/AdminRegistrations';
import AdminPaymentSettings from './pages/AdminPaymentSettings';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/players" element={<Players />} />
            <Route path="/comparison" element={<Comparison />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:id" element={<NewsArticle />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/register" element={<Register />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/tournament-rules" element={<TournamentRules />} />
            <Route path="/admin/registrations" element={<AdminRegistrations />} />
            <Route path="/admin/payment-settings" element={<AdminPaymentSettings />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;

