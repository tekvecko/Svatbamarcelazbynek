import { useState, useEffect } from "react";
import { usePhotos } from "@/hooks/use-photos";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Play, Pause, SkipBack, SkipForward, X, Maximize } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HighlightReelProps {
  autoPlay?: boolean;
  showControls?: boolean;
  transitionDuration?: number;
}

const transitionVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slideLeft: {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 }
  },
  slideUp: {
    initial: { y: "100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "-100%", opacity: 0 }
  },
  zoom: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.2, opacity: 0 }
  },
  rotate: {
    initial: { rotate: -180, scale: 0.8, opacity: 0 },
    animate: { rotate: 0, scale: 1, opacity: 1 },
    exit: { rotate: 180, scale: 0.8, opacity: 0 }
  },
  flip: {
    initial: { rotateY: -90, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    exit: { rotateY: 90, opacity: 0 }
  }
};

export default function HighlightReel({ 
  autoPlay = true, 
  showControls = true, 
  transitionDuration = 4000 
}: HighlightReelProps) {
  const { data: photos, isLoading } = usePhotos(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTransition, setCurrentTransition] = useState<keyof typeof transitionVariants>('fadeIn');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const transitionTypes = Object.keys(transitionVariants) as Array<keyof typeof transitionVariants>;

  useEffect(() => {
    if (!isPlaying || !photos || photos.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = (prev + 1) % photos.length;
        // Change transition type every few photos for variety
        if (nextIndex % 3 === 0) {
          setCurrentTransition(transitionTypes[Math.floor(Math.random() * transitionTypes.length)]);
        }
        return nextIndex;
      });
    }, transitionDuration);

    return () => clearInterval(interval);
  }, [isPlaying, photos, transitionDuration, transitionTypes]);

  const goToNext = () => {
    if (!photos || photos.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % photos.length);
    setCurrentTransition(transitionTypes[Math.floor(Math.random() * transitionTypes.length)]);
  };

  const goToPrevious = () => {
    if (!photos || photos.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    setCurrentTransition(transitionTypes[Math.floor(Math.random() * transitionTypes.length)]);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const jumpToPhoto = (index: number) => {
    setCurrentIndex(index);
    setCurrentTransition(transitionTypes[Math.floor(Math.random() * transitionTypes.length)]);
  };

  if (isLoading) {
    return (
      <Card className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Načítám moment...</p>
        </div>
      </Card>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <Card className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📸</div>
          <h3 className="text-xl font-semibold mb-2">Žádné momenty k zobrazení</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Nahraje první fotky, aby se spustil highlight reel
          </p>
        </div>
      </Card>
    );
  }

  const ReelContent = ({ isFullscreenMode = false }) => (
    <div className={`relative ${isFullscreenMode ? 'h-screen w-screen' : 'aspect-video'} bg-black rounded-xl overflow-hidden`}>
      {/* Main Photo Display */}
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentIndex}-${currentTransition}`}
            className="absolute inset-0"
            variants={transitionVariants[currentTransition]}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ 
              duration: 0.8, 
              ease: [0.4, 0, 0.2, 1],
              type: currentTransition === 'rotate' || currentTransition === 'flip' ? 'spring' : 'tween'
            }}
          >
            <div className="relative w-full h-full">
              <img
                src={photos[currentIndex].url}
                alt={photos[currentIndex].originalName}
                className="w-full h-full object-cover"
              />
              
              {/* Gradient Overlay for Text */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Photo Info */}
              <motion.div 
                className="absolute bottom-6 left-6 right-6 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-lg font-semibold mb-1">
                  {photos[currentIndex].originalName}
                </h3>
                <div className="flex items-center gap-4 text-sm opacity-90">
                  <span>💝 {photos[currentIndex].likes} lajků</span>
                  <span>📷 {currentIndex + 1} z {photos.length}</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Cinematic Bars for Fullscreen */}
        {isFullscreenMode && (
          <>
            <div className="absolute top-0 left-0 right-0 h-16 bg-black z-10" />
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-black z-10" />
          </>
        )}
      </div>

      {/* Controls */}
      {showControls && (
        <motion.div 
          className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300"
          whileHover={{ opacity: 1 }}
        >
          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-colors"
          >
            <SkipBack className="h-6 w-6 text-white" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-colors"
          >
            <SkipForward className="h-6 w-6 text-white" />
          </button>

          {/* Center Controls */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4">
            <Button
              onClick={togglePlayPause}
              size="lg"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-0 rounded-full w-16 h-16"
            >
              {isPlaying ? (
                <Pause className="h-8 w-8 text-white" />
              ) : (
                <Play className="h-8 w-8 text-white ml-1" />
              )}
            </Button>
          </div>

          {/* Top Right Controls */}
          <div className="absolute top-4 right-4 flex gap-2">
            {!isFullscreenMode && (
              <Button
                onClick={() => setIsFullscreen(true)}
                size="sm"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-0 rounded-full"
              >
                <Maximize className="h-4 w-4 text-white" />
              </Button>
            )}
            {isFullscreenMode && (
              <Button
                onClick={() => setIsFullscreen(false)}
                size="sm"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-0 rounded-full"
              >
                <X className="h-4 w-4 text-white" />
              </Button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-20 left-6 right-6">
            <div className="bg-white/20 rounded-full h-1 overflow-hidden">
              <motion.div
                className="bg-white h-full"
                initial={{ width: 0 }}
                animate={{ width: isPlaying ? '100%' : `${((currentIndex + 1) / photos.length) * 100}%` }}
                transition={{ 
                  duration: isPlaying ? transitionDuration / 1000 : 0.3,
                  ease: "linear"
                }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Thumbnail Strip */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-2">
        {photos.slice(0, Math.min(7, photos.length)).map((photo, index) => (
          <button
            key={photo.id}
            onClick={() => jumpToPhoto(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
        {photos.length > 7 && (
          <div className="w-3 h-3 rounded-full bg-white/30 flex items-center justify-center">
            <div className="text-white text-xs">+</div>
          </div>
        )}
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-none max-h-none w-screen h-screen p-0 bg-black">
          <ReelContent isFullscreenMode={true} />
        </DialogContent>
      </Dialog>
    );
  }

  return <ReelContent />;
}