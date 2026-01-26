import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/sections/Landing/Navigation';
import { Hero } from '@/sections/Landing/Hero';
import { TopicsGrid } from '@/sections/Landing/TopicsGrid';
import { Features } from '@/sections/Landing/Features';
import { HowItWorks } from '@/sections/Landing/HowItWorks';
import { Testimonials } from '@/sections/Landing/Testimonials';
import { CTA } from '@/sections/Landing/CTA';
import { Footer } from '@/sections/Landing/Footer';
import { LoginModal } from '@/sections/Auth/LoginModal';
import { Dashboard } from '@/sections/Dashboard/Dashboard';
import { VideoPlayer } from '@/sections/VideoPlayer/VideoPlayer';
import { TopicPage } from '@/sections/Topic/TopicPage';
import { AdminPanel } from '@/sections/Admin/AdminPanel';
import { Loader2 } from 'lucide-react';

// Main App Content
function AppContent() {
  const { loading, user, isAdmin } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [currentPage, setCurrentPage] = useState<'landing' | 'dashboard' | 'video' | 'topic' | 'admin'>('landing');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');

  // Handle routing based on URL
  useEffect(() => {
    const path = window.location.pathname;

    if (path === '/dashboard') {
      setCurrentPage('dashboard');
    } else if (path.startsWith('/watch/')) {
      const videoId = path.split('/watch/')[1];
      if (videoId) {
        setSelectedVideoId(videoId);
        setCurrentPage('video');
      }
    } else if (path.startsWith('/topics/')) {
      const topicId = path.split('/topics/')[1];
      if (topicId) {
        setSelectedTopicId(topicId);
        setCurrentPage('topic');
      }
    } else if (path === '/admin') {
      setCurrentPage('admin');
    } else {
      setCurrentPage('landing');
    }
  }, []);

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopicId(topicId);
    setCurrentPage('topic');
    window.history.pushState({}, '', `/topics/${topicId}`);
  };

  const handleVideoSelect = (videoId: string) => {
    setSelectedVideoId(videoId);
    setCurrentPage('video');
    window.history.pushState({}, '', `/watch/${videoId}`);
  };

  const navigateTo = (page: typeof currentPage) => {
    setCurrentPage(page);
    const paths: Record<typeof currentPage, string> = {
      landing: '/',
      dashboard: '/dashboard',
      video: selectedVideoId ? `/watch/${selectedVideoId}` : '/',
      topic: selectedTopicId ? `/topics/${selectedTopicId}` : '/',
      admin: '/admin',
    };
    window.history.pushState({}, '', paths[page]);
  };

  // Handle post-login redirection
  useEffect(() => {
    if (!loading && user && showLogin) {
      setShowLogin(false);
      if (isAdmin) {
        navigateTo('admin');
      } else {
        navigateTo('dashboard');
      }
    }
  }, [loading, user, showLogin, isAdmin]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      {currentPage === 'landing' && (
        <Navigation
          onLoginClick={() => setShowLogin(true)}
          onNavigate={navigateTo}
        />
      )}

      {/* Page Content */}
      <AnimatePresence mode="wait">
        {currentPage === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Hero onGetStarted={() => setShowLogin(true)} />
            <TopicsGrid onTopicSelect={handleTopicSelect} />
            <Features />
            <HowItWorks />
            <Testimonials />
            <CTA onGetStarted={() => setShowLogin(true)} />
            <Footer />
          </motion.div>
        )}

        {currentPage === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Dashboard
              onNavigate={navigateTo}
              onVideoSelect={handleVideoSelect}
              onTopicSelect={handleTopicSelect}
            />
          </motion.div>
        )}

        {currentPage === 'video' && (
          <motion.div
            key="video"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <VideoPlayer
              videoId={selectedVideoId}
              onNavigate={navigateTo}
              onTopicSelect={handleTopicSelect}
            />
          </motion.div>
        )}

        {currentPage === 'topic' && (
          <motion.div
            key="topic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TopicPage
              topicId={selectedTopicId}
              onNavigate={navigateTo}
              onVideoSelect={handleVideoSelect}
              onTopicSelect={handleTopicSelect}
            />
          </motion.div>
        )}

        {currentPage === 'admin' && (
          <motion.div
            key="admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AdminPanel onNavigate={navigateTo} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}

// Main App
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
