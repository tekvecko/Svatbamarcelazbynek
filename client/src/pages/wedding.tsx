import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useWeddingSchedule, WeddingScheduleItem } from "@/hooks/use-schedule";
import CountdownTimer from "@/components/countdown-timer";
import PhotoGallery from "@/components/photo-gallery";
import PhotoUpload from "@/components/photo-upload";
import AdminPanel from "@/components/admin-panel";
import Playlist from "@/components/playlist";
import HighlightReel from "@/components/highlight-reel";
import AiFeatures from "@/components/ai-features";
import PhotoBooth from "@/components/photo-booth";
import WeddingGameTracker from "@/components/wedding-game-tracker";
import WeddingNavigation from "@/components/wedding-navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Calendar, MapPin, Camera, Music, Phone, Settings, Clock, Users, Bell, Share2, MoreVertical, X, ChevronRight, Info, Upload, Star, Home, ArrowLeft, Wifi, Battery, Signal, Brain, Menu, Sparkles, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function WeddingPage() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
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

  // Handle tab changes from navigation
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Handle admin panel
  const handleAdminClick = () => {
    setShowAdmin(true);
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
      {/* New Professional Wedding Navigation */}
      <WeddingNavigation
        weddingDetails={weddingDetails}
        schedule={schedule || []}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onAdminClick={handleAdminClick}
        onShareClick={shareWedding}
        isAdmin={isAdmin}
      />

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
                      <div key={item.id} data-event-time={item.time} className="flex items-center gap-3 p-2 rounded-lg transition-all duration-300">
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

        {/* Photo Booth Section */}
        <section id="photobooth" className="px-3 sm:px-4 py-6 sm:py-8">
          <PhotoBooth weddingDetails={weddingDetails} />
        </section>

        {/* Wedding Game Section */}
        <section id="game" className="px-3 sm:px-4 py-6 sm:py-8">
          <WeddingGameTracker />
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



      {/* Admin Panel */}
      <AdminPanel isOpen={showAdmin} onClose={() => setShowAdmin(false)} />
    </div>
  );
}