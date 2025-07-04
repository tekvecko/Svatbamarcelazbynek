import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import CountdownTimer from "@/components/countdown-timer";
import PhotoGallery from "@/components/photo-gallery";
import PhotoUpload from "@/components/photo-upload";
import AdminPanel from "@/components/admin-panel";
import Playlist from "@/components/playlist";
import HighlightReel from "@/components/highlight-reel";
import CinematicControls from "@/components/cinematic-controls";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, MapPin, Camera, Music, Phone, Settings, Film } from "lucide-react";

export default function WeddingPage() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [highlightReelSettings, setHighlightReelSettings] = useState({
    transition: 'fadeIn',
    speed: 5000,
    autoPlay: true
  });
  
  const { data: weddingDetails } = useQuery({
    queryKey: ["/api/wedding-details"],
    queryFn: api.getWeddingDetails,
  });

  const weddingDate = weddingDetails?.weddingDate ? new Date(weddingDetails.weddingDate) : new Date("2025-10-11T14:00:00");
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Toggle Button - Mobile */}
      <div className="fixed top-4 right-4 z-50 md:hidden">
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
          backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`
        }}
      >
        <div className="text-center px-4 max-w-4xl">
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4">
            {weddingDetails?.coupleNames || "Marcela & Zbyněk"}
          </h1>
          <p className="text-lg md:text-xl mb-8">
            {weddingDate.toLocaleDateString('cs-CZ', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })} – {weddingDetails?.venue || "Stará pošta, Kovalovice"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => scrollToSection('highlight-reel')}
              className="bg-accent hover:bg-accent/90 text-white px-8 py-3 rounded-full transition-colors"
            >
              🎬 Naše momenty
            </Button>
            <Button 
              onClick={() => scrollToSection('program')}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full transition-colors"
            >
              Zobrazit program
            </Button>
            <Button 
              onClick={() => scrollToSection('galerie')}
              variant="outline"
              className="border-2 border-white hover:bg-white hover:text-gray-900 text-white px-8 py-3 rounded-full transition-colors"
            >
              Prohlédnout galerii
            </Button>
          </div>
        </div>
        <div className="absolute bottom-8 animate-bounce">
          <div className="text-2xl">⬇️</div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-0 z-20 backdrop-blur-wedding shadow-md">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
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
            <div className="flex gap-4 mx-auto md:mx-0 text-sm">
              <button onClick={() => scrollToSection('odpocet')} className="text-primary hover:text-primary/80 transition-colors">
                Odpočet
              </button>
              <button onClick={() => scrollToSection('highlight-reel')} className="text-primary hover:text-primary/80 transition-colors">
                Momenty
              </button>
              <button onClick={() => scrollToSection('program')} className="text-primary hover:text-primary/80 transition-colors">
                Program
              </button>
              <button onClick={() => scrollToSection('mapa')} className="text-primary hover:text-primary/80 transition-colors">
                Mapa
              </button>
              <button onClick={() => scrollToSection('galerie')} className="text-primary hover:text-primary/80 transition-colors">
                Galerie
              </button>
              <button onClick={() => scrollToSection('playlist')} className="text-primary hover:text-primary/80 transition-colors">
                Playlist
              </button>
              <button onClick={() => scrollToSection('kontakt')} className="text-primary hover:text-primary/80 transition-colors">
                Kontakt
              </button>
            </div>
            
            <div className="hidden md:block w-6"></div>
          </div>
        </div>
      </nav>

      {/* Countdown Section */}
      <section id="odpocet" className="py-16 gradient-accent">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-8 text-gray-800 dark:text-white">
            <Heart className="inline-block text-secondary mr-3" />
            Do svatby zbývá
          </h2>
          <CountdownTimer targetDate={weddingDate} />
        </div>
      </section>

      {/* Highlight Reel Section */}
      <section id="highlight-reel" className="py-16 bg-gray-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              <Film className="inline-block text-accent mr-3" />
              Highlight Reel našich momentů
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Prožijte naše nejkrásnější okamžiky s kinematografickými přechody a hudebním podkresem
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Highlight Reel */}
            <div className="lg:col-span-2">
              <HighlightReel 
                autoPlay={highlightReelSettings.autoPlay}
                transitionDuration={highlightReelSettings.speed}
              />
            </div>

            {/* Cinematic Controls */}
            <div className="lg:col-span-1">
              <CinematicControls
                onTransitionChange={(transition) => 
                  setHighlightReelSettings(prev => ({ ...prev, transition }))
                }
                onSpeedChange={(speed) => 
                  setHighlightReelSettings(prev => ({ ...prev, speed }))
                }
              />
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white/5 rounded-xl backdrop-blur-sm">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Film className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Kinematografické přechody</h3>
              <p className="text-sm text-gray-300">
                Různé styly přechodů pro dokonalou atmosféru
              </p>
            </div>
            
            <div className="text-center p-6 bg-white/5 rounded-xl backdrop-blur-sm">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Hudební podkres</h3>
              <p className="text-sm text-gray-300">
                Emotivní hudba pro lepší prožitek
              </p>
            </div>
            
            <div className="text-center p-6 bg-white/5 rounded-xl backdrop-blur-sm">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Interaktivní ovládání</h3>
              <p className="text-sm text-gray-300">
                Přizpůsobte si prožitek podle vašich představ
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Program Section */}
      <section id="program" className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-12">
            <Calendar className="inline-block text-primary mr-3" />
            Program svatby
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center font-bold">
                  13
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Příjezd hostů</h3>
                  <p className="text-gray-600 dark:text-gray-400">Uvítání a registrace hostů</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="bg-secondary text-white rounded-full w-12 h-12 flex items-center justify-center font-bold">
                  14
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Svatební obřad</h3>
                  <p className="text-gray-600 dark:text-gray-400">Ceremonie a výměna prstenů</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="bg-accent text-white rounded-full w-12 h-12 flex items-center justify-center font-bold">
                  15
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Focení</h3>
                  <p className="text-gray-600 dark:text-gray-400">Svatební fotografie s rodinou</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="bg-success text-white rounded-full w-12 h-12 flex items-center justify-center font-bold">
                  16
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Raut a zábava</h3>
                  <p className="text-gray-600 dark:text-gray-400">Večeře, tanec a oslava</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section id="mapa" className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-12">
            <MapPin className="inline-block text-primary mr-3" />
            Místo konání
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">
                {weddingDetails?.venue || "Stará pošta, Kovalovice"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {weddingDetails?.venueAddress || "Kovalovice 109, 664 07 Kovalovice"}
              </p>
            </div>
            <iframe 
              className="w-full h-80" 
              src="https://maps.google.com/maps?q=Kovalovice%20109&t=&z=15&ie=UTF8&iwloc=&output=embed" 
              loading="lazy"
              style={{ border: 0 }}
              title="Mapa místa konání"
            />
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="galerie" className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-12">
            <Camera className="inline-block text-primary mr-3" />
            Svatební galerie
          </h2>
          
          {weddingDetails?.allowUploads && <PhotoUpload />}
          <PhotoGallery />
        </div>
      </section>

      {/* Playlist Section */}
      <section id="playlist" className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-12">
            <Music className="inline-block text-primary mr-3" />
            Party Playlist
          </h2>
          <Playlist />
        </div>
      </section>

      {/* Contact Section */}
      <section id="kontakt" className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-12">
            <Phone className="inline-block text-primary mr-3" />
            Kontakt
          </h2>
          <div className="gradient-accent rounded-xl p-8">
            <h3 className="text-xl font-semibold mb-4">Máte dotazy nebo chcete potvrdit účast?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Neváhejte nás kontaktovat. Těšíme se na oslavu s vámi!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg">
                <a href="mailto:svatba2025@example.com">
                  📧 svatba2025@example.com
                </a>
              </Button>
              <Button asChild variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-lg">
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
