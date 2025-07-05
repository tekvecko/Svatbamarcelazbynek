import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useWeddingSchedule } from "@/hooks/use-schedule";
import CountdownTimer from "@/components/countdown-timer";
import PhotoGallery from "@/components/photo-gallery";
import PhotoUpload from "@/components/photo-upload";
import AdminPanel from "@/components/admin-panel";
import Playlist from "@/components/playlist";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, MapPin, Camera, Music, Phone, Settings } from "lucide-react";

export default function WeddingPage() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  
  const { data: weddingDetails } = useQuery({
    queryKey: ["/api/wedding-details"],
    queryFn: api.getWeddingDetails,
  });

  const { data: schedule } = useWeddingSchedule();

  const weddingDate = weddingDetails?.weddingDate ? new Date(weddingDetails.weddingDate) : new Date("2025-10-11T14:00:00");
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80; // Navigation bar height
      const elementPosition = element.offsetTop - headerHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  // Track active section during scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['odpocet', 'program', 'mapa', 'galerie', 'playlist', 'kontakt'];
      const headerHeight = 80;
      
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= headerHeight && rect.bottom >= headerHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial section
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Toggle Button - Mobile */}
      <div className="fixed top-20 right-4 z-40 md:hidden">
        <Button
          onClick={() => setShowAdmin(true)}
          size="icon"
          className="bg-primary hover:bg-primary/90 rounded-full shadow-lg"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Admin Panel */}
      <AdminPanel isOpen={showAdmin} onClose={() => setShowAdmin(false)} />

      {/* Hero Section */}
      <header 
        className="relative h-screen bg-cover bg-center flex flex-col justify-center items-center text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`
        }}
      >
        <div className="text-center px-4 sm:px-6 lg:px-8 max-w-4xl w-full">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
            {weddingDetails?.coupleNames || "Marcela & Zbyněk"}
          </h1>
          <div className="mb-6 sm:mb-8">
            <p className="text-base sm:text-lg md:text-xl mb-2">
              {weddingDate.toLocaleDateString('cs-CZ', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
            <p className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 text-yellow-300">
              12:00
            </p>
            <p className="text-base sm:text-lg md:text-xl">
              {weddingDetails?.venue || "Stará pošta, Kovalovice"}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Button 
              onClick={() => scrollToSection('program')}
              className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 rounded-full transition-colors w-full sm:w-auto text-sm sm:text-base"
            >
              Zobrazit program
            </Button>
            <Button 
              onClick={() => scrollToSection('galerie')}
              variant="outline"
              className="border-2 border-white hover:bg-white hover:text-gray-900 text-white px-6 sm:px-8 py-3 rounded-full transition-colors w-full sm:w-auto text-sm sm:text-base"
            >
              Prohlédnout galerii
            </Button>
          </div>
        </div>
        <div className="absolute bottom-4 sm:bottom-8 animate-bounce">
          <div className="text-xl sm:text-2xl">⬇️</div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-wedding shadow-md">
        <div className="max-w-6xl mx-auto px-2 sm:px-4">
          <div className="flex justify-between items-center py-3 sm:py-4">
            {/* Desktop Admin */}
            <div className="hidden md:block">
              <Button
                onClick={() => setShowAdmin(true)}
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:text-primary"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Navigation Links */}
            <div className="flex gap-1 sm:gap-2 md:gap-4 mx-auto md:mx-0 text-xs sm:text-sm overflow-x-auto scrollbar-hide">
              {[
                { id: 'odpocet', label: 'Odpočet' },
                { id: 'program', label: 'Program' },
                { id: 'mapa', label: 'Mapa' },
                { id: 'galerie', label: 'Galerie' },
                { id: 'playlist', label: 'Playlist' },
                { id: 'kontakt', label: 'Kontakt' }
              ].map((section) => (
                <button 
                  key={section.id}
                  onClick={() => scrollToSection(section.id)} 
                  className={`transition-all duration-300 px-2 sm:px-3 py-1 sm:py-2 rounded-full whitespace-nowrap min-w-max ${
                    activeSection === section.id 
                      ? 'text-white bg-primary shadow-lg' 
                      : 'text-primary hover:text-primary/80 hover:bg-primary/10'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>
            
            <div className="hidden md:block w-6"></div>
          </div>
        </div>
      </nav>

      {/* Countdown Section */}
      <section id="odpocet" className="py-12 sm:py-16 gradient-accent">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-gray-800 dark:text-white">
            <Heart className="inline-block text-secondary mr-2 sm:mr-3 h-6 w-6 sm:h-8 sm:w-8" />
            Do svatby zbývá
          </h2>
          <CountdownTimer targetDate={weddingDate} />
        </div>
      </section>

      {/* Program Section */}
      <section id="program" className="py-12 sm:py-16 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">
            <Calendar className="inline-block text-primary mr-2 sm:mr-3 h-6 w-6 sm:h-8 sm:w-8" />
            Program svatby
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {schedule && schedule.length > 0 ? (
              schedule.map((item, index) => {
                const colorClasses = [
                  'bg-primary',
                  'bg-secondary', 
                  'bg-accent',
                  'bg-success'
                ];
                return (
                  <div key={item.id} className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className={`${colorClasses[index % colorClasses.length]} text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0`}>
                      {item.time.substring(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base sm:text-lg mb-1">{item.title}</h3>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{item.description}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center text-gray-500">
                Načítám harmonogram...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section id="mapa" className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">
            <MapPin className="inline-block text-primary mr-2 sm:mr-3 h-6 w-6 sm:h-8 sm:w-8" />
            Místo konání
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-2">
                {weddingDetails?.venue || "Stará pošta, Kovalovice"}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                {weddingDetails?.venueAddress || "Kovalovice 109, 664 07 Kovalovice"}
              </p>
            </div>
            <iframe 
              className="w-full h-64 sm:h-80" 
              src="https://maps.google.com/maps?q=Kovalovice%20109&t=&z=15&ie=UTF8&iwloc=&output=embed" 
              loading="lazy"
              style={{ border: 0 }}
              title="Mapa místa konání"
            />
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="galerie" className="py-12 sm:py-16 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">
            <Camera className="inline-block text-primary mr-2 sm:mr-3 h-6 w-6 sm:h-8 sm:w-8" />
            Svatební galerie
          </h2>
          
          {weddingDetails?.allowUploads && <PhotoUpload />}
          <PhotoGallery />
        </div>
      </section>

      {/* Playlist Section */}
      <section id="playlist" className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">
            <Music className="inline-block text-primary mr-2 sm:mr-3 h-6 w-6 sm:h-8 sm:w-8" />
            Party Playlist
          </h2>
          <Playlist />
        </div>
      </section>

      {/* Contact Section */}
      <section id="kontakt" className="py-12 sm:py-16 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-12">
            <Phone className="inline-block text-primary mr-2 sm:mr-3 h-6 w-6 sm:h-8 sm:w-8" />
            Kontakt
          </h2>
          <div className="gradient-accent rounded-xl p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">Máte dotazy nebo chcete potvrdit účast?</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
              Neváhejte nás kontaktovat. Těšíme se na oslavu s vámi!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Button asChild className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 rounded-lg w-full sm:w-auto text-sm sm:text-base">
                <a href="mailto:svatba2025@example.com" className="block truncate">
                  📧 svatba2025@example.com
                </a>
              </Button>
              <Button asChild variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-6 sm:px-8 py-3 rounded-lg w-full sm:w-auto text-sm sm:text-base">
                <a href="tel:+420123456789">
                  📞 +420 123 456 789
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="mb-4">
            <h3 className="font-serif text-2xl font-bold text-primary">
              {weddingDetails?.coupleNames || "Marcela & Zbyněk"}
            </h3>
            <p className="text-gray-400">
              {weddingDate.toLocaleDateString('cs-CZ', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
          <div className="border-t border-gray-700 pt-4">
            <p className="text-gray-400 text-sm">
              &copy; 2025 Svatební web s láskou vytvořený pro naše nejbližší
              <Heart className="inline-block text-secondary mx-2 h-4 w-4" />
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
