
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, Download, Play, Pause, X, ZoomIn, ZoomOut, RotateCw, Info, ChevronUp, ChevronDown } from "lucide-react";
import SimpleAIPhotoAnalyzer from "@/components/ai-photo-enhancer-simple";

interface Photo {
  id: number;
  url: string;
  thumbnailUrl: string;
  originalName: string;
  likes: number;
  commentCount?: number;
  uploadedAt: string;
}

interface MobilePhotoViewerProps {
  photos: Photo[];
  selectedIndex: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  userLikes: Set<number>;
  onLike: (photoId: number, e?: React.MouseEvent) => void;
  onComment: (photoId: number) => void;
  onShare: (url: string) => void;
  onDownload: (url: string, filename: string) => void;
  comments: any[];
  isAutoPlay: boolean;
  onAutoPlayToggle: () => void;
}

export default function MobilePhotoViewer({
  photos,
  selectedIndex,
  onIndexChange,
  onClose,
  userLikes,
  onLike,
  onComment,
  onShare,
  onDownload,
  comments,
  isAutoPlay,
  onAutoPlayToggle
}: MobilePhotoViewerProps) {
  const [showUI, setShowUI] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const hideUITimeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const selectedPhoto = photos[selectedIndex];

  // Auto-hide UI after 3 seconds
  const resetHideUITimer = useCallback(() => {
    if (hideUITimeoutRef.current) {
      clearTimeout(hideUITimeoutRef.current);
    }
    setShowUI(true);
    hideUITimeoutRef.current = setTimeout(() => {
      if (!isZoomed && !showInfo) {
        setShowUI(false);
      }
    }, 3000);
  }, [isZoomed, showInfo]);

  // Touch and interaction handlers
  const handleTap = useCallback(() => {
    const now = Date.now();
    const timeDiff = now - lastTap;
    
    if (timeDiff < 300 && timeDiff > 0) {
      // Double tap - zoom
      if (isZoomed) {
        setScale(1);
        setPosition({ x: 0, y: 0 });
        setIsZoomed(false);
      } else {
        setScale(2);
        setIsZoomed(true);
      }
    } else {
      // Single tap - toggle UI
      setShowUI(!showUI);
      resetHideUITimer();
    }
    setLastTap(now);
  }, [lastTap, showUI, isZoomed, resetHideUITimer]);

  const handlePan = useCallback((event: any, info: PanInfo) => {
    if (isZoomed) {
      // Pan zoomed image
      setPosition(prev => ({
        x: prev.x + info.delta.x,
        y: prev.y + info.delta.y
      }));
    } else {
      // Swipe to navigate
      const threshold = 50;
      const velocity = Math.abs(info.velocity.x);
      
      if (Math.abs(info.offset.x) > threshold && velocity > 300) {
        if (info.offset.x > 0) {
          setSwipeDirection('right');
          if (selectedIndex > 0) {
            onIndexChange(selectedIndex - 1);
          }
        } else {
          setSwipeDirection('left');
          if (selectedIndex < photos.length - 1) {
            onIndexChange(selectedIndex + 1);
          }
        }
        setTimeout(() => setSwipeDirection(null), 300);
      }
    }
  }, [isZoomed, selectedIndex, photos.length, onIndexChange]);

  const handlePanStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handlePanEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Pinch to zoom (simulated with wheel for now)
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.max(0.5, Math.min(3, prev + delta)));
    setIsZoomed(scale > 1);
  }, [scale]);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlay && photos.length > 1 && !isZoomed) {
      const interval = setInterval(() => {
        onIndexChange((selectedIndex + 1) % photos.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlay, selectedIndex, photos.length, isZoomed, onIndexChange]);

  // Reset zoom when changing photos
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsZoomed(false);
  }, [selectedIndex]);

  // Add wheel event listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  // Reset UI timer on mount
  useEffect(() => {
    resetHideUITimer();
    return () => {
      if (hideUITimeoutRef.current) {
        clearTimeout(hideUITimeoutRef.current);
      }
    };
  }, [resetHideUITimer]);

  if (!selectedPhoto) return null;

  return (
    <div 
      ref={containerRef}
      className="relative h-full w-full bg-black overflow-hidden select-none"
      style={{ touchAction: 'none' }}
    >
      {/* Status Bar (Mobile Only) */}
      <AnimatePresence>
        {showUI && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 h-6 bg-black/80 backdrop-blur-sm md:hidden z-50"
          >
            <div className="flex items-center justify-between px-4 h-full text-white text-xs">
              <span>{new Date().toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}</span>
              <div className="flex items-center gap-2">
                <div className="flex items-end gap-[1px]">
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                  <div className="w-1 h-2 bg-white rounded-[1px]"></div>
                  <div className="w-1 h-3 bg-white rounded-[1px]"></div>
                  <div className="w-1 h-4 bg-white rounded-[1px]"></div>
                </div>
                <div className="w-6 h-3 border border-white rounded-sm relative">
                  <div className="absolute right-[-2px] top-[3px] w-[2px] h-[6px] bg-white rounded-r-sm"></div>
                  <div className="w-4 h-full bg-green-400 rounded-sm"></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <AnimatePresence>
        {showUI && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="absolute top-0 md:top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/80 via-black/40 to-transparent pt-6 md:pt-0"
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 rounded-full w-12 h-12 p-0 touch-manipulation"
                >
                  <X className="h-6 w-6" />
                </Button>
                <div className="text-white">
                  <div className="text-sm font-medium">
                    {selectedIndex + 1} z {photos.length}
                  </div>
                  <div className="text-xs text-gray-300 max-w-[200px] truncate">
                    {selectedPhoto.originalName}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowInfo(!showInfo)}
                  variant="ghost"
                  size="sm"
                  className={`text-white hover:bg-white/20 rounded-full w-12 h-12 p-0 touch-manipulation ${
                    showInfo ? 'bg-white/20' : ''
                  }`}
                >
                  <Info className="h-5 w-5" />
                </Button>

                <Button
                  onClick={onAutoPlayToggle}
                  variant="ghost"
                  size="sm"
                  className={`text-white hover:bg-white/20 rounded-full w-12 h-12 p-0 touch-manipulation ${
                    isAutoPlay ? 'bg-white/20' : ''
                  }`}
                >
                  {isAutoPlay ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedPhoto.id}
            className="relative w-full h-full flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ 
              opacity: 0, 
              x: swipeDirection === 'left' ? -100 : swipeDirection === 'right' ? 100 : 0 
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.img
              ref={imageRef}
              src={selectedPhoto.url}
              alt={selectedPhoto.originalName}
              className="max-w-full max-h-full object-contain cursor-pointer"
              style={{
                scale,
                x: position.x,
                y: position.y,
              }}
              onTap={handleTap}
              onPan={handlePan}
              onPanStart={handlePanStart}
              onPanEnd={handlePanEnd}
              drag={isZoomed}
              dragConstraints={containerRef}
              dragElastic={0.1}
              whileDrag={{ cursor: 'grabbing' }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Zoom Controls */}
      <AnimatePresence>
        {showUI && isZoomed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-1/2 right-4 -translate-y-1/2 z-30 flex flex-col gap-2"
          >
            <Button
              onClick={() => setScale(prev => Math.min(3, prev + 0.5))}
              variant="ghost"
              size="sm"
              className="text-white bg-black/50 hover:bg-black/70 rounded-full w-12 h-12 p-0 touch-manipulation"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => setScale(prev => Math.max(0.5, prev - 0.5))}
              variant="ghost"
              size="sm"
              className="text-white bg-black/50 hover:bg-black/70 rounded-full w-12 h-12 p-0 touch-manipulation"
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => {
                setScale(1);
                setPosition({ x: 0, y: 0 });
                setIsZoomed(false);
              }}
              variant="ghost"
              size="sm"
              className="text-white bg-black/50 hover:bg-black/70 rounded-full w-12 h-12 p-0 touch-manipulation"
            >
              <RotateCw className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Hints */}
      <AnimatePresence>
        {showUI && !isZoomed && (
          <>
            {selectedIndex > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-white/60 z-20 pointer-events-none"
              >
                <div className="flex flex-col items-center">
                  <ChevronUp className="h-6 w-6 rotate-[-90deg]" />
                  <span className="text-xs mt-1">Předchozí</span>
                </div>
              </motion.div>
            )}
            
            {selectedIndex < photos.length - 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 z-20 pointer-events-none"
              >
                <div className="flex flex-col items-center">
                  <ChevronUp className="h-6 w-6 rotate-90" />
                  <span className="text-xs mt-1">Další</span>
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Bottom Action Bar */}
      <AnimatePresence>
        {showUI && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/80 via-black/40 to-transparent pb-4"
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Button
                  onClick={(e) => onLike(selectedPhoto.id, e)}
                  variant="ghost"
                  className={`text-white hover:bg-white/20 rounded-full h-14 px-4 touch-manipulation ${
                    userLikes.has(selectedPhoto.id) ? 'bg-red-500/20' : ''
                  }`}
                >
                  <Heart 
                    className={`h-6 w-6 mr-2 ${
                      userLikes.has(selectedPhoto.id) ? 'fill-current text-red-400' : ''
                    }`}
                  />
                  <span className="text-lg font-medium">{selectedPhoto.likes || 0}</span>
                </Button>

                <Button
                  onClick={() => onComment(selectedPhoto.id)}
                  variant="ghost"
                  className="text-white hover:bg-white/20 rounded-full h-14 px-4 touch-manipulation"
                >
                  <MessageCircle className="h-6 w-6 mr-2" />
                  <span className="text-lg font-medium">{comments.length}</span>
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => onShare(selectedPhoto.url)}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 rounded-full w-14 h-14 p-0 touch-manipulation"
                >
                  <Share2 className="h-6 w-6" />
                </Button>

                <Button
                  onClick={() => onDownload(selectedPhoto.url, selectedPhoto.originalName)}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 rounded-full w-14 h-14 p-0 touch-manipulation"
                >
                  <Download className="h-6 w-6" />
                </Button>
              </div>
            </div>

            {/* Photo Progress Bar */}
            <div className="mx-4 mb-2">
              <div className="w-full bg-white/20 rounded-full h-1">
                <div 
                  className="bg-white rounded-full h-1 transition-all duration-300"
                  style={{ width: `${((selectedIndex + 1) / photos.length) * 100}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Info Panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg rounded-t-2xl p-6 max-h-[60vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Detail fotky</h3>
              <Button
                onClick={() => setShowInfo(false)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
              >
                <ChevronDown className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4 text-white">
              <div>
                <h4 className="font-medium text-gray-300 mb-1">Název</h4>
                <p className="text-lg">{selectedPhoto.originalName}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-300 mb-1">Nahráno</h4>
                <p>{new Date(selectedPhoto.uploadedAt).toLocaleString('cs-CZ')}</p>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <h4 className="font-medium text-gray-300 mb-1">Lajky</h4>
                  <div className="flex items-center gap-2">
                    <Heart className={`h-5 w-5 ${userLikes.has(selectedPhoto.id) ? 'fill-current text-red-400' : 'text-gray-400'}`} />
                    <span className="text-lg font-medium">{selectedPhoto.likes}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-300 mb-1">Komentáře</h4>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-gray-400" />
                    <span className="text-lg font-medium">{selectedPhoto.commentCount || 0}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/20">
                <SimpleAIPhotoAnalyzer 
                  photoId={selectedPhoto.id} 
                  photoUrl={selectedPhoto.url}
                  inlineMode={true}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Touch Instructions */}
      <AnimatePresence>
        {showUI && !isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1, duration: 2 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none md:hidden"
          >
            <div className="bg-black/40 text-white text-xs px-3 py-2 rounded-full backdrop-blur-sm text-center">
              <div>Dvojitý tap: Zoom • Swipe: Navigace</div>
              <div className="text-xs opacity-75">Tap: Skrýt ovládání</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
