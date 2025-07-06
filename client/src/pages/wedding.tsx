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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 140; // Android-style headers
      const elementPosition = element.offsetTop - headerHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
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

  const isAdmin = true;

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isDarkMode ? 'dark' : ''}`}>
      {/* Android Status Bar */}
      <div className="h-6 bg-black text-white text-xs flex items-center justify-between px-4 font-medium">
        <div className="flex items-center gap-2">
          <span>{currentTime}</span>
          <div className="flex gap-1">
            <Wifi className="w-3 h-3" />
            <Signal className="w-3 h-3" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Battery className="w-4 h-4" />
          <span>87%</span>
        </div>
      </div>

      {/* Android App Bar */}
      <div className="sticky top-6 z-50 bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
                {weddingDetails?.coupleNames || 'Naše Svatba'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {weddingDate.toLocaleDateString('cs-CZ', { 
                  day: 'numeric', 
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-10 h-10 p-0 rounded-full relative"
            >
              <Bell className="h-5 w-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                3
              </div>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={shareWedding}
              className="w-10 h-10 p-0 rounded-full"
            >
              <Share2 className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdmin(true)}
              className="w-10 h-10 p-0 rounded-full"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Material Design Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex justify-around items-center py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 relative ${
                  isActive 
                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
                }`}
              >
                <div className={`p-1 rounded-full ${isActive ? tab.color : ''}`}>
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : ''}`} />
                </div>
                <span className="text-xs font-medium">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 right-4 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 z-40"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 dark:text-white">Oznámení</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(false)}
                  className="w-8 h-8 p-0 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-2 space-y-1">
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">Nová fotka přidána</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">před 2 minutami</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">Nová hudba navržena</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">před 5 minutami</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700">
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

      {/* Main Content with bottom padding for navigation */}
      <div className="pb-20">
        {/* Navigation Menu */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-pink-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-pink-600 mr-2" />
                <span className="text-xl font-bold text-gray-900">
                  {weddingDetails?.coupleNames?.split(' & ')[0] || "Marcela"} & {weddingDetails?.coupleNames?.split(' & ')[1] || "Zbyněk"}
                </span>
              </div>

              <div className="hidden md:flex items-center space-x-8">
                <a href="#home" className="text-gray-700 hover:text-pink-600 transition-colors">Domů</a>
                <a href="#gallery" className="text-gray-700 hover:text-pink-600 transition-colors">Galerie</a>
                <a href="#playlist" className="text-gray-700 hover:text-pink-600 transition-colors">Playlist</a>
                <a href="#upload" className="text-gray-700 hover:text-pink-600 transition-colors">Nahrát foto</a>
                <a href="#ai" className="text-gray-700 hover:text-pink-600 transition-colors">AI Asistent</a>
                {isAdmin && (
                  <Button
                    onClick={() => setShowAdmin(true)}
                    variant="outline"
                    size="sm"
                    className="bg-purple-600 text-white border-purple-600 hover:bg-purple-700"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdmin(!showAdmin)}
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden pt-16">
          <div className="absolute inset-0 bg-black/30 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=80" 
            alt="Wedding venue"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="relative z-20 text-center text-white max-w-4xl px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-pink-100 to-white bg-clip-text">
                {weddingDetails?.coupleNames || "Marcela & Zbyněk"}
              </h1>
              <p className="text-xl md:text-2xl mb-4 text-pink-100">
                {weddingDetails?.weddingDate} • {weddingDetails?.venue}
              </p>
              <div className="text-lg text-white/90 mb-8">
                <CountdownTimer targetDate={weddingDetails?.weddingDate} />
              </div>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div 
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-8 h-12 border-2 border-white/60 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2"></div>
            </div>
          </motion.div>
        </section>

        {/* Hero Section - Wedding Info */}
        <section id="info" className="px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-pink-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Heart className="h-16 w-16 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
              {weddingDetails?.coupleNames || 'Naše svatba'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              {weddingDate.toLocaleDateString('cs-CZ', { 
                weekday: 'long',
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
            <CountdownTimer targetDate={weddingDate} />
          </motion.div>

          {/* Android Material Cards */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-2xl">
                <div className="flex items-center p-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 dark:text-white">Místo konání</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {weddingDetails?.venue || 'Krásné místo'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {weddingDetails?.venueAddress || 'Adresa bude upřesněna'}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="w-10 h-10 p-0 rounded-full">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-2xl">
                <div className="flex items-center p-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-4">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 dark:text-white">Čas začátku</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {weddingDate.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Doporučujeme příchod o 15 minut dříve
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="w-10 h-10 p-0 rounded-full">
                    <ChevronRight className="h-5 w-5" />
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
        <section id="gallery" className="px-0 py-8">
          <PhotoGallery />
        </section>

        {/* Playlist Section */}
        <section id="playlist" className="px-4 py-8">
          <Playlist />
        </section>

        {/* Upload Section */}
        <section id="upload" className="px-4 py-8">
          <PhotoUpload />
        </section>

        {/* Highlights Section */}
        <section id="highlights" className="px-4 py-8">
          <HighlightReel />
        </section>

        {/* AI Features Section */}
        <section id="ai" className="px-4 py-8">
          <AiFeatures />
        </section>
      </div>

      {/* Admin Panel */}
      <AdminPanel isOpen={showAdmin} onClose={() => setShowAdmin(false)} />
    </div>
  );
}