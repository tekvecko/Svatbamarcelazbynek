import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Calendar, MapPin, Camera, Music, Phone, Settings, Clock, Users, Bell, Share2, MoreVertical, X, ChevronRight, Info, Upload, Star, Home, ArrowLeft, Wifi, Battery, Signal, Brain, Menu, Sparkles, Trophy, ChevronDown, ArrowUp, Zap, Target, Navigation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WeddingScheduleItem } from "@/hooks/use-schedule";

interface WeddingNavigationProps {
  weddingDetails: any;
  schedule: WeddingScheduleItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onAdminClick: () => void;
  onShareClick: () => void;
  isAdmin: boolean;
}

export default function WeddingNavigation({
  weddingDetails,
  schedule,
  activeTab,
  onTabChange,
  onAdminClick,
  onShareClick,
  isAdmin
}: WeddingNavigationProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState('info');
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { toast } = useToast();

  const weddingDate = weddingDetails?.weddingDate ? new Date(weddingDetails.weddingDate) : new Date("2025-10-11T14:00:00");

  const navigationTabs = [
    { 
      id: "info", 
      label: "Informace", 
      icon: Info, 
      color: "from-blue-500 to-indigo-600",
      description: "Základní informace o svatbě"
    },
    { 
      id: "gallery", 
      label: "Galerie", 
      icon: Camera, 
      color: "from-emerald-500 to-teal-600",
      description: "Fotografie ze svatby"
    },
    { 
      id: "playlist", 
      label: "Hudba", 
      icon: Music, 
      color: "from-purple-500 to-violet-600",
      description: "Svatební playlist"
    },
    { 
      id: "upload", 
      label: "Nahrát", 
      icon: Upload, 
      color: "from-orange-500 to-red-600",
      description: "Nahrát vlastní fotky"
    },
    { 
      id: "photobooth", 
      label: "Foto Koutek", 
      icon: Sparkles, 
      color: "from-pink-500 to-rose-600",
      description: "Interaktivní foto koutek"
    },
    { 
      id: "game", 
      label: "Svatební Hra", 
      icon: Trophy, 
      color: "from-yellow-500 to-amber-600",
      description: "Svatební kvíz a výzvy"
    },
    { 
      id: "ai", 
      label: "AI Asistent", 
      icon: Brain, 
      color: "from-cyan-500 to-blue-600",
      description: "AI pomocník pro svatbu"
    },
    { 
      id: "highlights", 
      label: "Nejlepší Momenty", 
      icon: Star, 
      color: "from-indigo-500 to-purple-600",
      description: "Video highlights svatby"
    },
  ];

  // Enhanced scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollTop / docHeight, 1);
      setScrollProgress(progress);

      // Detect scroll direction
      setIsScrollingUp(scrollTop < lastScrollY);
      setLastScrollY(scrollTop);

      // Show floating navigation after scrolling past header
      setShowFloatingNav(scrollTop > 100);

      // Find active section based on scroll position
      const sections = navigationTabs.map(tab => tab.id);
      const headerHeight = 140; // Zvýšeno kvůli vyšší navigaci
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i]);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= headerHeight) {
            setCurrentSection(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, navigationTabs]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    
    if (element) {
      const headerHeight = 140; // Zvýšeno kvůli vyšší navigaci
      const elementPosition = element.offsetTop - headerHeight;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
      
      onTabChange(sectionId);
      setShowMobileMenu(false);
      setShowNotifications(false);
      
      toast({
        title: "Navigace",
        description: `Přechod na sekci: ${navigationTabs.find(t => t.id === sectionId)?.label}`,
        duration: 1500,
      });
    }
  };

  const getUpcomingEvents = () => {
    if (!schedule) return [];
    
    const now = new Date();
    return schedule.filter(event => {
      const eventTime = new Date();
      const [hours, minutes] = event.time.split(':');
      eventTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return eventTime > now;
    }).slice(0, 3);
  };

  const upcomingEvents = getUpcomingEvents();

  return (
    <>
      {/* Main Navigation Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrollingUp || lastScrollY < 50 
          ? 'translate-y-0' 
          : '-translate-y-full'
      }`}>
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-700/20 shadow-lg">
          {/* Progress Bar */}
          <div 
            className="h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 transition-all duration-300 ease-out" 
            style={{ width: `${scrollProgress * 100}%` }}
          />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 sm:h-20">
              {/* Logo and Branding */}
              <div className="flex items-center space-x-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 rounded-2xl flex items-center justify-center shadow-xl cursor-pointer"
                    onClick={() => scrollToSection('info')}
                  >
                    <Heart className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </motion.div>
                
                <div className="hidden sm:block">
                  <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 via-pink-700 to-purple-700 dark:from-white dark:via-pink-300 dark:to-purple-300 bg-clip-text text-transparent">
                    {weddingDetails?.coupleNames || 'Naše Svatba'}
                  </h1>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>{weddingDate.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })}</span>
                    <span>•</span>
                    <span className="text-pink-600 dark:text-pink-400 font-medium">
                      {navigationTabs.find(tab => tab.id === currentSection)?.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-2">
                {navigationTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => scrollToSection(tab.id)}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`group relative flex items-center space-x-2 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${
                        isActive 
                          ? `text-white bg-gradient-to-r ${tab.color} shadow-lg shadow-pink-500/25 ring-2 ring-white/20` 
                          : 'text-gray-700 dark:text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-600 hover:shadow-lg hover:shadow-pink-500/20'
                      }`}
                    >
                      <Icon className={`h-4 w-4 transition-transform duration-300 ${
                        isActive ? 'animate-pulse' : 'group-hover:scale-110'
                      }`} />
                      <span className="whitespace-nowrap">{tab.label}</span>
                      
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 opacity-100"
                          style={{ zIndex: -1 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </nav>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {/* Notifications */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                >
                  <Bell className="h-5 w-5" />
                  {upcomingEvents.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce">
                      {upcomingEvents.length}
                    </div>
                  )}
                </motion.button>

                {/* Share Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onShareClick}
                  className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-green-500/25 transition-all duration-300"
                >
                  <Share2 className="h-5 w-5" />
                </motion.button>

                {/* Admin Button */}
                {isAdmin && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onAdminClick}
                    className="hidden sm:flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="text-sm font-medium">Admin</span>
                  </motion.button>
                )}

                {/* Mobile Menu Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="lg:hidden p-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl shadow-lg transition-all duration-300"
                >
                  <Menu className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-700/20 shadow-2xl"
            >
              <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-2 gap-3">
                  {navigationTabs.map((tab, index) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    
                    return (
                      <motion.button
                        key={tab.id}
                        onClick={() => scrollToSection(tab.id)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center space-x-3 p-4 rounded-2xl text-left transition-all duration-300 ${
                          isActive 
                            ? `text-white bg-gradient-to-r ${tab.color} shadow-lg` 
                            : 'text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-600 hover:text-white'
                        }`}
                      >
                        <Icon className={`h-6 w-6 ${isActive ? 'animate-pulse' : ''}`} />
                        <div>
                          <div className="font-medium">{tab.label}</div>
                          <div className={`text-xs mt-1 ${
                            isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {tab.description}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
                
                {/* Mobile Admin Button */}
                {isAdmin && (
                  <motion.button
                    onClick={onAdminClick}
                    className="w-full mt-4 p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl shadow-lg flex items-center justify-center space-x-3"
                  >
                    <Settings className="h-5 w-5" />
                    <span className="font-medium">Administrace</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Floating Navigation Hub */}
      <AnimatePresence>
        {showFloatingNav && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden xl:block"
          >
            <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20 shadow-2xl p-4 rounded-2xl">
              <div className="space-y-3">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Navigation className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Navigace</div>
                </div>
                
                <div className="space-y-2">
                  {navigationTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    
                    return (
                      <motion.button
                        key={tab.id}
                        onClick={() => scrollToSection(tab.id)}
                        whileHover={{ scale: 1.1, x: -5 }}
                        whileTap={{ scale: 0.9 }}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          isActive 
                            ? `bg-gradient-to-r ${tab.color} text-white shadow-lg` 
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-600 hover:text-white'
                        }`}
                        title={tab.label}
                      >
                        <Icon className="h-5 w-5" />
                      </motion.button>
                    );
                  })}
                </div>
                
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {Math.round(scrollProgress * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-20 right-4 w-80 sm:w-96 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/20 dark:border-gray-700/20 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xl">🔔 Svatební Program</h3>
                  <p className="text-white/80 text-sm mt-1">Nadcházející události</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowNotifications(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
            </div>

            {/* Events List */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map((event, index) => {
                    const eventTime = new Date();
                    const [hours, minutes] = event.time.split(':');
                    eventTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                    
                    const timeDiff = eventTime.getTime() - new Date().getTime();
                    const hoursUntil = Math.floor(timeDiff / (1000 * 60 * 60));
                    const minutesUntil = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                    
                    let timeText = '';
                    if (hoursUntil > 0) {
                      timeText = `za ${hoursUntil}h ${minutesUntil}min`;
                    } else if (minutesUntil > 0) {
                      timeText = `za ${minutesUntil} minut`;
                    } else {
                      timeText = 'právě teď!';
                    }

                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => {
                          scrollToSection('info');
                          setShowNotifications(false);
                        }}
                        className="group p-4 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl border border-pink-200/50 dark:border-pink-700/50 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mt-2 animate-pulse"></div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                              {event.title}
                            </h4>
                            <div className="flex items-center space-x-3 mt-2 text-sm">
                              <span className="flex items-center text-pink-600 dark:text-pink-400">
                                <Clock className="h-4 w-4 mr-1" />
                                {event.time}
                              </span>
                              <span className="text-gray-600 dark:text-gray-400 font-medium">
                                {timeText}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-pink-500 transition-colors" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Žádné nadcházející události</p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Všechny události proběhly</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="p-6 border-t border-gray-200/20 dark:border-gray-700/20">
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    scrollToSection('info');
                    setShowNotifications(false);
                  }}
                  className="flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Program</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    scrollToSection('info');
                    setShowNotifications(false);
                  }}
                  className="flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-pink-500/25 transition-all duration-300"
                >
                  <Heart className="h-4 w-4" />
                  <span className="text-sm font-medium">Svatba</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showFloatingNav && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => scrollToSection('info')}
            className="fixed bottom-8 right-8 z-40 w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 flex items-center justify-center group"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowUp className="h-6 w-6 group-hover:animate-bounce" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}