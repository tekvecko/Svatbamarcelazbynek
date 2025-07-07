import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Download, Share2, X, RotateCcw, Sparkles, Heart, Users, Calendar, MapPin, Zap, Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface PhotoBoothProps {
  weddingDetails?: {
    coupleNames: string;
    weddingDate: string;
    venue: string;
  };
}

export default function PhotoBooth({ weddingDetails }: PhotoBoothProps) {
  const [isActive, setIsActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [guestName, setGuestName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Photo upload mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ file, guestName }: { file: File; guestName: string }) => {
      const formData = new FormData();
      formData.append('photos', file);
      formData.append('guestName', guestName);
      formData.append('isPhotoBooth', 'true');
      
      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/photos'] });
      setUploadSuccess(true);
      toast({
        title: "Foto nahráno!",
        description: "Vaše fotka byla úspěšně přidána do svatební galerie",
      });
      
      // Reset after 3 seconds
      setTimeout(() => {
        setUploadSuccess(false);
        setCapturedPhoto(null);
        setGuestName("");
      }, 3000);
    },
    onError: (error) => {
      toast({
        title: "Chyba při nahrávání",
        description: "Nepodařilo se nahrát fotografii. Zkuste to znovu.",
        variant: "destructive",
      });
    },
  });

  // Start camera with mobile optimizations
  const startCamera = useCallback(async () => {
    try {
      setCameraError("");
      
      // Mobile-optimized camera constraints
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const constraints = {
        video: {
          facingMode,
          width: isMobile ? { ideal: 1280, max: 1920 } : { ideal: 1920 },
          height: isMobile ? { ideal: 720, max: 1080 } : { ideal: 1080 },
          frameRate: isMobile ? { ideal: 15, max: 30 } : { ideal: 30 },
          // Mobile-specific optimizations
          aspectRatio: isMobile ? 16/9 : undefined,
          resizeMode: isMobile ? 'crop-and-scale' : undefined
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Mobile video optimizations
        videoRef.current.playsInline = true;
        videoRef.current.muted = true;
        videoRef.current.autoplay = true;
      }
      setIsActive(true);
    } catch (error) {
      setCameraError("Nepodařilo se spustit kameru. Zkontrolujte oprávnění.");
      console.error('Camera error:', error);
    }
  }, [facingMode]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsActive(false);
    setCapturedPhoto(null);
  }, [stream]);

  // Capture photo with mobile optimizations
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Mobile-optimized canvas sizing
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const maxWidth = isMobile ? 1280 : 1920;
    const maxHeight = isMobile ? 720 : 1080;
    
    let { videoWidth, videoHeight } = video;
    
    // Scale down for mobile to reduce memory usage
    if (isMobile && (videoWidth > maxWidth || videoHeight > maxHeight)) {
      const scale = Math.min(maxWidth / videoWidth, maxHeight / videoHeight);
      videoWidth *= scale;
      videoHeight *= scale;
    }

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, videoWidth, videoHeight);

    // Add wedding overlay
    addWeddingOverlay(context, videoWidth, videoHeight);

    // Mobile-optimized compression
    const quality = isMobile ? 0.8 : 0.9;
    const photoDataUrl = canvas.toDataURL('image/jpeg', quality);
    setCapturedPhoto(photoDataUrl);
    
    // Add haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
  }, []);

  // Add wedding overlay to photo
  const addWeddingOverlay = (context: CanvasRenderingContext2D, width: number, height: number) => {
    const overlayHeight = 120;
    const padding = 20;

    // Semi-transparent overlay at bottom
    const gradient = context.createLinearGradient(0, height - overlayHeight, 0, height);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
    
    context.fillStyle = gradient;
    context.fillRect(0, height - overlayHeight, width, overlayHeight);

    // Wedding details text
    context.fillStyle = 'white';
    context.font = 'bold 24px Arial';
    context.textAlign = 'center';
    
    const centerX = width / 2;
    let textY = height - overlayHeight + 40;

    if (weddingDetails) {
      context.fillText(weddingDetails.coupleNames, centerX, textY);
      
      context.font = '18px Arial';
      textY += 30;
      context.fillText(new Date(weddingDetails.weddingDate).toLocaleDateString('cs-CZ'), centerX, textY);
      
      if (weddingDetails.venue) {
        textY += 25;
        context.fillText(weddingDetails.venue, centerX, textY);
      }
    }

    // Heart decoration
    context.fillStyle = '#ec4899';
    context.font = '30px Arial';
    context.fillText('💕', centerX + 150, height - overlayHeight + 40);
    context.fillText('💕', centerX - 150, height - overlayHeight + 40);
  };

  // Switch camera (front/back)
  const switchCamera = () => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
    if (isActive) {
      stopCamera();
      setTimeout(() => startCamera(), 100);
    }
  };

  // Convert data URL to File
  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Upload captured photo
  const uploadPhoto = () => {
    if (!capturedPhoto || !guestName.trim()) {
      toast({
        title: "Chybí údaje",
        description: "Vyplňte prosím své jméno",
        variant: "destructive",
      });
      return;
    }

    const file = dataURLtoFile(capturedPhoto, `photobooth-${Date.now()}.jpg`);
    uploadMutation.mutate({ file, guestName: guestName.trim() });
  };

  // Download photo
  const downloadPhoto = () => {
    if (!capturedPhoto) return;

    const link = document.createElement('a');
    link.download = `svatba-${weddingDetails?.coupleNames?.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.jpg`;
    link.href = capturedPhoto;
    link.click();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border-pink-200 dark:border-pink-800">
      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <Camera className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Svatební Foto Koutek
            </h3>
            <Sparkles className="h-5 w-5 text-pink-500" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Vytvořte památeční fotku s automatickým svatebním rámečkem
          </p>
        </div>

        {/* Camera Error */}
        {cameraError && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">{cameraError}</p>
          </div>
        )}

        {/* Photo Booth Interface */}
        <AnimatePresence mode="wait">
          {!isActive ? (
            /* Start Screen */
            <motion.div
              key="start"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <div className="mb-6">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                  <Camera className="h-16 w-16 text-white" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex flex-col items-center">
                    <Heart className="h-4 w-4 mb-1 text-pink-500" />
                    <span>Svatební rámeček</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Zap className="h-4 w-4 mb-1 text-yellow-500" />
                    <span>Okamžité sdílení</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Download className="h-4 w-4 mb-1 text-blue-500" />
                    <span>Stažení zdarma</span>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={startCamera}
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg w-full sm:w-auto h-14 text-lg font-semibold"
              >
                <Camera className="h-6 w-6 mr-3" />
                Spustit Foto Koutek
              </Button>
            </motion.div>
          ) : !capturedPhoto ? (
            /* Camera View */
            <motion.div
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="relative bg-black rounded-xl overflow-hidden touch-none">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 sm:h-80 md:h-96 object-cover select-none"
                  style={{ 
                    aspectRatio: '16/9',
                    maxHeight: 'calc(100vh - 400px)'
                  }}
                  onTouchStart={(e) => e.preventDefault()}
                  onTouchEnd={(e) => e.preventDefault()}
                />
                
                {/* Camera Controls Overlay - Mobile Optimized */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={stopCamera}
                    className="bg-black/30 border-white/30 text-white hover:bg-black/50 backdrop-blur-sm h-10 w-10 p-0 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  
                  <Badge variant="secondary" className="bg-black/30 text-white border-white/30 backdrop-blur-sm px-3 py-1 text-xs">
                    {facingMode === "user" ? "📱 Přední" : "📷 Zadní"}
                  </Badge>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={switchCamera}
                    className="bg-black/30 border-white/30 text-white hover:bg-black/50 backdrop-blur-sm h-10 w-10 p-0 rounded-full"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>

                {/* Mobile-Optimized Capture Button */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={capturePhoto}
                    className="w-20 h-20 sm:w-16 sm:h-16 bg-white rounded-full shadow-xl flex items-center justify-center ring-4 ring-white/50 active:ring-white/80 transition-all duration-150"
                    style={{ 
                      touchAction: 'manipulation',
                      userSelect: 'none',
                      WebkitTouchCallout: 'none'
                    }}
                  >
                    <div className="w-16 h-16 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Camera className="h-6 w-6 sm:h-4 sm:w-4 text-white" />
                    </div>
                  </motion.button>
                </div>
                
                {/* Mobile Touch Hint */}
                <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 sm:hidden">
                  <div className="bg-black/40 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                    Dotkněte se pro focení
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Photo Preview & Upload */
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {uploadSuccess ? (
                /* Success State */
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <Check className="h-8 w-8 text-white" />
                  </motion.div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Fotka úspěšně nahrána!
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Vaše fotka je nyní v svatební galerii
                  </p>
                </div>
              ) : (
                /* Photo Preview */
                <>
                  {/* Mobile-Optimized Photo Preview */}
                  <div className="relative rounded-xl overflow-hidden shadow-lg">
                    <img
                      src={capturedPhoto}
                      alt="Captured photo"
                      className="w-full h-64 sm:h-80 md:h-96 object-cover select-none"
                      style={{ 
                        aspectRatio: '16/9',
                        maxHeight: 'calc(100vh - 500px)'
                      }}
                      onTouchStart={(e) => e.preventDefault()}
                      onTouchEnd={(e) => e.preventDefault()}
                    />
                    
                    {/* Photo overlay badge */}
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0 shadow-lg">
                        ✨ Foto koutek
                      </Badge>
                    </div>
                  </div>

                  {/* Mobile-Optimized Guest Name Input */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                      Vaše jméno (zobrazí se u fotky):
                    </label>
                    <Input
                      type="text"
                      placeholder="Zadejte své jméno..."
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="bg-white dark:bg-gray-800 h-12 sm:h-10 text-base sm:text-sm px-4"
                      style={{
                        fontSize: '16px', // Prevents zoom on iOS
                        touchAction: 'manipulation'
                      }}
                      autoComplete="name"
                      autoCapitalize="words"
                    />
                  </div>

                  {/* Mobile-Optimized Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                    {/* Primary action button - full width on mobile */}
                    <Button
                      onClick={uploadPhoto}
                      disabled={uploadMutation.isPending || !guestName.trim()}
                      className="w-full sm:flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 h-12 sm:h-10 text-base sm:text-sm font-semibold"
                    >
                      {uploadMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 sm:h-4 sm:w-4 border-b-2 border-white mr-3 sm:mr-2"></div>
                          Nahrávám...
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 sm:h-4 sm:w-4 mr-3 sm:mr-2" />
                          Sdílet do galerie
                        </>
                      )}
                    </Button>
                    
                    {/* Secondary actions - side by side on mobile */}
                    <div className="flex gap-2 sm:contents">
                      <Button
                        variant="outline"
                        onClick={() => setCapturedPhoto(null)}
                        className="flex-1 sm:flex-initial h-12 sm:h-10"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Znovu</span>
                        <span className="sm:hidden">Opakovat</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={downloadPhoto}
                        className="flex-1 sm:flex-initial h-12 sm:h-10"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Stáhnout</span>
                        <span className="sm:hidden">Uložit</span>
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hidden canvas for photo processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </Card>
  );
}