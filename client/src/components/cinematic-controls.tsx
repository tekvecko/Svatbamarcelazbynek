import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX, Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { motion } from "framer-motion";

interface CinematicControlsProps {
  onTransitionChange?: (transition: string) => void;
  onSpeedChange?: (speed: number) => void;
  className?: string;
}

const cinematicMoods = [
  { name: "Romantický", transition: "fadeIn", speed: 5000, description: "Jemné přechody" },
  { name: "Dynamický", transition: "slideLeft", speed: 3000, description: "Energické přechody" },
  { name: "Snový", transition: "zoom", speed: 6000, description: "Mystické přechody" },
  { name: "Klasický", transition: "slideUp", speed: 4000, description: "Elegantní přechody" },
  { name: "Moderní", transition: "flip", speed: 2500, description: "Stylové přechody" },
  { name: "Vintage", transition: "rotate", speed: 4500, description: "Retro přechody" }
];

const backgroundMusic = [
  { name: "Svatební klasika", file: "wedding-classic.mp3" },
  { name: "Romantická instrumentální", file: "romantic-instrumental.mp3" },
  { name: "Jazzové ladění", file: "jazz-mood.mp3" },
  { name: "Akustická kytara", file: "acoustic-guitar.mp3" },
  { name: "Smyčcové nástroje", file: "strings.mp3" }
];

export default function CinematicControls({ 
  onTransitionChange, 
  onSpeedChange, 
  className = "" 
}: CinematicControlsProps) {
  const [selectedMood, setSelectedMood] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([70]);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume[0] / 100;
    }
  }, [volume, isMuted]);

  const selectMood = (index: number) => {
    setSelectedMood(index);
    const mood = cinematicMoods[index];
    onTransitionChange?.(mood.transition);
    onSpeedChange?.(mood.speed);
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % backgroundMusic.length);
  };

  const previousTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + backgroundMusic.length) % backgroundMusic.length);
  };

  return (
    <Card className={`p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-xl font-serif font-bold mb-2">Kinematografické nastavení</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Vytvořte dokonalou atmosféru pro vaše svatební momenty
          </p>
        </div>

        {/* Mood Selection */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            🎬 Kinematografické nálady
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {cinematicMoods.map((mood, index) => (
              <motion.button
                key={mood.name}
                onClick={() => selectMood(index)}
                className={`p-3 rounded-lg text-left transition-all duration-200 ${
                  selectedMood === index
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="font-medium text-sm">{mood.name}</div>
                <div className="text-xs opacity-80">{mood.description}</div>
                <div className="text-xs opacity-60 mt-1">
                  {(mood.speed / 1000).toFixed(1)}s interval
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Background Music Controls */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            🎵 Hudební podkres
          </h4>

          {/* Track Selection */}
          <div className="bg-white dark:bg-gray-600 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-sm">
                {backgroundMusic[currentTrack].name}
              </span>
              <div className="flex items-center gap-2">
                <Button onClick={previousTrack} size="sm" variant="ghost">
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button onClick={toggleMusic} size="sm" className="bg-primary hover:bg-primary/90">
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button onClick={nextTrack} size="sm" variant="ghost">
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3">
              <Button onClick={toggleMute} size="sm" variant="ghost">
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={100}
                step={5}
                className="flex-1"
                disabled={isMuted}
              />
              <span className="text-xs text-gray-500 w-8">
                {isMuted ? 0 : volume[0]}%
              </span>
            </div>
          </div>

          {/* Note about music */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 Tip: Hudba je simulovaná pro demonstraci. V produkční verzi by zde byla integrace s hudebním přehrávačem.
            </p>
          </div>
        </div>

        {/* Advanced Settings */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            ⚙️ Pokročilé nastavení
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-600 rounded-lg p-3">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Rychlost přechodů
              </label>
              <div className="text-sm font-medium mt-1">
                {(cinematicMoods[selectedMood].speed / 1000).toFixed(1)} sekund
              </div>
            </div>
            <div className="bg-white dark:bg-gray-600 rounded-lg p-3">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Typ přechodu
              </label>
              <div className="text-sm font-medium mt-1 capitalize">
                {cinematicMoods[selectedMood].transition.replace(/([A-Z])/g, ' $1')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        loop
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        {/* In a real implementation, these would be actual audio files */}
        <source src={`/audio/${backgroundMusic[currentTrack].file}`} type="audio/mpeg" />
      </audio>
    </Card>
  );
}