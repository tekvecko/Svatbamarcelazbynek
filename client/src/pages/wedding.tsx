import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useWeddingSchedule } from "@/hooks/use-schedule";
import CountdownTimer from "@/components/countdown-timer";
import PhotoGallery from "@/components/photo-gallery";
import PhotoUpload from "@/components/photo-upload";
import AdminPanel from "@/components/admin-panel";
import Playlist from "@/components/playlist";
import HighlightReel from "@/components/highlight-reel";
import AiFeatures from "@/components/ai-features";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Calendar, MapPin, Camera, Music, Phone, Settings, Clock, Users, Bell, Share2, MoreVertical, X, ChevronRight, Info, Upload, Star, Home, ArrowLeft, Wifi, Battery, Signal, Brain, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function WeddingPage() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const { toast } = useToast();

  const { data: weddingDetails } = useQuery({
    queryKey: ["/api/wedding-details"],
    queryFn: api.getWeddingDetails,
  });

  const { data: schedule } = useWeddingSchedule();

  const weddingDate = weddingDetails?.weddingDate ? new Date(weddingDetails.weddingDate) : new Date("2025-10-11T14:00:00");

  const tabs = [
    { id: "info", label: "Info", icon: Info, color: "bg-blue-600" },
    { id: "gallery", label: "Fotky", icon: Camera, color: "bg-green-600" },
    { id: "playlist", label: "Hudba", icon: Music, color: "bg-purple-600" },
    { id: "upload", label: "Nahrát", icon: Upload, color: "bg-orange-600" },
    { id: "ai", label: "AI", icon: Brain, color: "bg-gradient-to-r from-purple-600 to-pink-600" },
    { id: "highlights", label: "Video", icon: Star, color: "bg-yellow-600" },
  ];

  // Smart scroll tracking and active section detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollTop / docHeight;
      setScrollProgress(progress);

      // Find active section based on scroll position
      const sections = tabs.map(tab => tab.id);
      const headerHeight = 80;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i]);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= headerHeight + 100) {
            setActiveTab(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tabs]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80;
      const elementPosition = element.offsetTop - headerHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
    setShowMobileMenu(false); // Close mobile menu after navigation
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    scrollToSection(tabId);
  };

  const shareWedding = async () => {
    const url = window.location.href;
    const text = `Podívejte se na naši svatební galerii! ${weddingDetails?.coupleNames || 'Naše svatba'}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: text,
          url: url,
        });
      } catch (error) {
        console.log('Sharing failed:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Odkaz zkopírován",
          description: "Odkaz na svatbu byl zkopírován do schránky",
          duration: 3000,
        });
      } catch (error) {
        console.log('Copy failed:', error);
      }
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('cs-CZ', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
        
        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % tabs.length;
            handleTabClick(tabs[nextIndex].id);
            break;
          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault();
            const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
            handleTabClick(tabs[prevIndex].id);
            break;
          case 'Home':
            e.preventDefault();
            scrollToSection('home');
            break;
        }
      }
      
      // Escape to close mobile menu
      if (e.key === 'Escape' && showMobileMenu) {
        setShowMobileMenu(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, tabs, showMobileMenu]);

  const isAdmin = true;

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isDarkMode ? 'dark' : ''}`}>
      {/* Main Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm">
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-300 ease-out" 
             style={{ width: `${scrollProgress * 100}%` }}></div>
        
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-pink-500 to-red-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer flex-shrink-0"
                onClick={() => scrollToSection('home')}
              >
                <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </motion.div>
              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white truncate">
                  {weddingDetails?.coupleNames || 'Naše Svatba'}
                </h1>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                    {weddingDate.toLocaleDateString('cs-CZ', { 
                      day: 'numeric', 
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                  {/* Current Section Breadcrumb */}
                  <span className="text-gray-400 hidden sm:inline">•</span>
                  <span className="text-xs sm:text-sm text-pink-600 dark:text-pink-400 font-medium">
                    {tabs.find(tab => tab.id === activeTab)?.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive 
                        ? 'text-white bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg shadow-pink-500/25' 
                        : 'text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'animate-pulse' : ''}`} />
                    <span>{tab.label}</span>
                    
                    {/* Active indicator dot */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                        initial={false}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}

                    {/* Section completion indicator */}
                    {index < tabs.findIndex(t => t.id === activeTab) && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </motion.button>
                );
              })}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-8 h-8 sm:w-10 sm:h-10 p-0"
              >
                <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full"></div>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={shareWedding}
                className="w-8 h-8 sm:w-10 sm:h-10 p-0"
              >
                <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>

              {isAdmin && (
                <Button
                  onClick={() => setShowAdmin(true)}
                  variant="outline"
                  size="sm"
                  className="bg-purple-600 text-white border-purple-600 hover:bg-purple-700 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm hidden sm:flex"
                >
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              )}

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <motion.button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="relative w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex flex-col items-center justify-center space-y-1 transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.span 
                    className="w-5 h-0.5 bg-gray-600 dark:bg-gray-300 rounded"
                    animate={{
                      rotate: showMobileMenu ? 45 : 0,
                      y: showMobileMenu ? 4 : 0
                    }}
                    transition={{ duration: 0.2 }}
                  />
                  <motion.span 
                    className="w-5 h-0.5 bg-gray-600 dark:bg-gray-300 rounded"
                    animate={{
                      opacity: showMobileMenu ? 0 : 1
                    }}
                    transition={{ duration: 0.2 }}
                  />
                  <motion.span 
                    className="w-5 h-0.5 bg-gray-600 dark:bg-gray-300 rounded"
                    animate={{
                      rotate: showMobileMenu ? -45 : 0,
                      y: showMobileMenu ? -4 : 0
                    }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg"
            >
              <div className="px-4 py-4 space-y-2">
                {tabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  const isCompleted = index < tabs.findIndex(t => t.id === activeTab);
                  
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`group w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                        isActive 
                          ? 'text-white bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg shadow-pink-500/25' 
                          : 'text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`h-5 w-5 ${isActive ? 'animate-pulse' : ''}`} />
                        <span>{tab.label}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {isCompleted && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                        {isActive && (
                          <ChevronRight className="h-4 w-4 animate-pulse" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
                
                {/* Quick Actions in Mobile Menu */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                  <div className="flex items-center justify-around">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="flex flex-col items-center space-y-1 p-2"
                    >
                      <Bell className="h-4 w-4" />
                      <span className="text-xs">Oznámení</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={shareWedding}
                      className="flex flex-col items-center space-y-1 p-2"
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="text-xs">Sdílet</span>
                    </Button>
                    
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAdmin(true)}
                        className="flex flex-col items-center space-y-1 p-2"
                      >
                        <Settings className="h-4 w-4" />
                        <span className="text-xs">Admin</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 right-4 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-40"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 dark:text-white">Oznámení</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(false)}
                  className="w-8 h-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-2 space-y-1">
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">Nová fotka přidána</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">před 2 minutami</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">Nová hudba navržena</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">před 5 minutami</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">Nový komentář</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">před 10 minutami</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main>

        {/* Hero Section */}
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=80" 
            alt="Wedding venue"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="relative z-20 text-center text-white max-w-4xl px-4 py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="space-y-6"
            >
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold leading-tight bg-gradient-to-r from-white via-pink-100 to-white bg-clip-text">
                {weddingDetails?.coupleNames || "Marcela & Zbyněk"}
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-pink-100 px-4">
                {weddingDate.toLocaleDateString('cs-CZ', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })} • {weddingDetails?.venue}
              </p>
              <div className="text-sm sm:text-base md:text-lg text-white/90">
                <CountdownTimer targetDate={weddingDate} />
              </div>
            </motion.div>
          </div>

          {/* Scroll indicator - Hidden on mobile */}
          <motion.div 
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 hidden sm:block"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
              <div className="w-0.5 h-2 bg-white/60 rounded-full mt-2"></div>
            </div>
          </motion.div>
        </section>

        {/* Hero Section - Wedding Info */}
        <section id="info" className="px-4 py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-pink-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Heart className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4 px-2">
              {weddingDetails?.coupleNames || 'Naše svatba'}
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6 px-4">
              {weddingDate.toLocaleDateString('cs-CZ', { 
                weekday: 'long',
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
            <div className="mb-8">
              <CountdownTimer targetDate={weddingDate} />
            </div>
          </motion.div>

          {/* Mobile Optimized Cards */}
          <div className="space-y-3 sm:space-y-4 max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-lg border-0 rounded-xl sm:rounded-2xl">
                <div className="flex items-center p-3 sm:p-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">Místo konání</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                      {weddingDetails?.venue || 'Krásné místo'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 hidden sm:block">
                      {weddingDetails?.venueAddress || 'Adresa bude upřesněna'}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="w-8 h-8 sm:w-10 sm:h-10 p-0 rounded-full flex-shrink-0">
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-lg border-0 rounded-xl sm:rounded-2xl">
                <div className="flex items-center p-3 sm:p-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">Čas začátku</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {weddingDate.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 hidden sm:block">
                      Doporučujeme příchod o 15 minut dříve
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="w-8 h-8 sm:w-10 sm:h-10 p-0 rounded-full flex-shrink-0">
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-2xl">
                <div className="flex items-center p-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mr-4">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 dark:text-white">Dress code</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Elegantní oblečení
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Prosíme, vyhněte se bílé barvě
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="w-10 h-10 p-0 rounded-full">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Wedding Schedule */}
            {schedule && schedule.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-2xl">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">Program svatby</h3>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    {schedule.map((item, index) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 text-sm font-medium text-gray-600 dark:text-gray-400">
                          {item.time}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 dark:text-white">{item.title}</p>
                          {item.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </section>

        {/* Photo Gallery Section */}
        <section id="gallery" className="px-2 sm:px-4 py-6 sm:py-8">
          <PhotoGallery />
        </section>

        {/* Playlist Section */}
        <section id="playlist" className="px-3 sm:px-4 py-6 sm:py-8">
          <Playlist />
        </section>

        {/* Upload Section */}
        <section id="upload" className="px-3 sm:px-4 py-6 sm:py-8">
          <PhotoUpload />
        </section>

        {/* Highlights Section */}
        <section id="highlights" className="px-3 sm:px-4 py-6 sm:py-8">
          <HighlightReel />
        </section>

        {/* AI Features Section */}
        <section id="ai" className="px-3 sm:px-4 py-6 sm:py-8">
          <AiFeatures />
        </section>
      </main>

      {/* Floating Back to Top Button */}
      <AnimatePresence>
        {scrollProgress > 0.2 && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setActiveTab('info');
            }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full shadow-lg shadow-pink-500/25 flex items-center justify-center hover:shadow-xl transition-shadow"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 rotate-[-90deg]" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Navigation Helper Toast - Hidden on mobile */}
      <AnimatePresence>
        {scrollProgress === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 bg-black/80 text-white px-3 py-2 sm:px-4 rounded-lg text-xs sm:text-sm backdrop-blur-sm hidden sm:block"
          >
            💡 Tip: Use Alt + arrows for keyboard navigation
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Panel */}
      <AdminPanel isOpen={showAdmin} onClose={() => setShowAdmin(false)} />
    </div>
  );
}