import { useState, useEffect } from "react";
import { usePhotos, useTogglePhotoLike, usePhotoComments, useAddPhotoComment } from "@/hooks/use-photos";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, Download, Share2, Loader2, MessageCircle, Send, ChevronLeft, ChevronRight, X, Grid, Filter, Search, Eye, Camera, Sparkles, ZoomIn, Play, Pause } from "lucide-react";
import AIPhotoEnhancer from "@/components/ai-photo-enhancer";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface LikeAnimation {
  id: string;
  x: number;
  y: number;
}

type ViewMode = 'grid' | 'masonry' | 'carousel';
type FilterType = 'all' | 'liked' | 'recent' | 'popular';

export default function PhotoGallery() {
  const { data: photos, isLoading } = usePhotos(true);
  const toggleLike = useTogglePhotoLike();
  const addComment = useAddPhotoComment();
  const { toast } = useToast();
  
  // States
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCommentsDialogOpen, setIsCommentsDialogOpen] = useState(false);
  const [selectedCommentPhotoId, setSelectedCommentPhotoId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [commenterName, setCommenterName] = useState("");
  const [userLikes, setUserLikes] = useState<Set<number>>(new Set());
  const [likeAnimations, setLikeAnimations] = useState<LikeAnimation[]>([]);
  const [showUnlikeDialog, setShowUnlikeDialog] = useState<number | null>(null);
  
  // New states for enhanced gallery
  const [viewMode, setViewMode] = useState<ViewMode>('masonry');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [hoveredPhoto, setHoveredPhoto] = useState<number | null>(null);

  const selectedPhoto = photos?.[selectedPhotoIndex];
  const { data: comments = [] } = usePhotoComments(selectedPhoto?.id || 0);
  const { data: commentDialogComments = [] } = usePhotoComments(selectedCommentPhotoId || 0);

  // Filter and search photos
  const filteredPhotos = photos?.filter(photo => {
    // Search filter
    if (searchTerm && !photo.originalName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Type filter
    switch (filterType) {
      case 'liked':
        return userLikes.has(photo.id);
      case 'recent':
        return new Date(photo.uploadedAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000; // Last 7 days
      case 'popular':
        return photo.likes >= 3;
      default:
        return true;
    }
  }) || [];

  // Load user likes from localStorage
  useEffect(() => {
    const savedLikes = localStorage.getItem('user-likes');
    if (savedLikes) {
      try {
        const likesObj = JSON.parse(savedLikes);
        const likedPhotoIds = Object.keys(likesObj).filter(id => likesObj[id]).map(Number);
        setUserLikes(new Set(likedPhotoIds));
      } catch (error) {
        console.error('Failed to load user likes:', error);
      }
    }
  }, []);

  // Auto-play slideshow
  useEffect(() => {
    if (isAutoPlay && isDialogOpen && photos && photos.length > 1) {
      const interval = setInterval(() => {
        setSelectedPhotoIndex(prev => (prev + 1) % photos.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlay, isDialogOpen, photos]);

  // Clean up animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setLikeAnimations(prev => prev.slice(0, -1));
    }, 2000);
    return () => clearTimeout(timer);
  }, [likeAnimations]);

  const createHeartAnimation = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const animationId = `heart-${Date.now()}-${Math.random()}`;
    setLikeAnimations(prev => [...prev, { id: animationId, x, y }]);
  };

  const handleLike = (photoId: number, e?: React.MouseEvent) => {
    const isAlreadyLiked = userLikes.has(photoId);
    
    if (isAlreadyLiked) {
      setShowUnlikeDialog(photoId);
      return;
    }

    if (e) {
      createHeartAnimation(e);
    }

    setUserLikes(prev => {
      const newSet = new Set(prev);
      newSet.add(photoId);
      return newSet;
    });
    
    toggleLike.mutate(photoId, {
      onSuccess: (data) => {
        const savedLikes = JSON.parse(localStorage.getItem('user-likes') || '{}');
        savedLikes[photoId] = data.liked;
        localStorage.setItem('user-likes', JSON.stringify(savedLikes));
        
        toast({
          title: "❤️ Lajk přidán!",
          description: "Foto se vám líbí",
          duration: 2000,
        });
      },
      onError: () => {
        setUserLikes(prev => {
          const newSet = new Set(prev);
          newSet.delete(photoId);
          return newSet;
        });
        toast({
          title: "Chyba",
          description: "Nepodařilo se přidat lajk",
          variant: "destructive",
        });
      }
    });
  };

  const confirmUnlike = (photoId: number) => {
    setUserLikes(prev => {
      const newSet = new Set(prev);
      newSet.delete(photoId);
      return newSet;
    });

    toggleLike.mutate(photoId, {
      onSuccess: (data) => {
        const savedLikes = JSON.parse(localStorage.getItem('user-likes') || '{}');
        savedLikes[photoId] = data.liked;
        localStorage.setItem('user-likes', JSON.stringify(savedLikes));
        
        toast({
          title: "💔 Lajk odebrán",
          description: "Lajk byl úspěšně odebrán",
          duration: 2000,
        });
      },
      onError: () => {
        setUserLikes(prev => {
          const newSet = new Set(prev);
          newSet.add(photoId);
          return newSet;
        });
        toast({
          title: "Chyba",
          description: "Nepodařilo se odebrat lajk",
          variant: "destructive",
        });
      }
    });
    setShowUnlikeDialog(null);
  };

  const downloadImage = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const shareImage = async (url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Svatební fotka',
          url: window.location.origin + url,
        });
      } catch (error) {
        console.log('Sharing failed:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.origin + url);
        toast({
          title: "Zkopírováno!",
          description: "Odkaz byl zkopírován do schránky",
          duration: 2000,
        });
      } catch (error) {
        console.log('Copy failed:', error);
      }
    }
  };

  const handleAddComment = (photoId: number) => {
    if (!newComment.trim() || !commenterName.trim()) return;
    
    addComment.mutate(
      { 
        photoId, 
        author: commenterName.trim(), 
        text: newComment.trim() 
      },
      {
        onSuccess: () => {
          setNewComment("");
          toast({
            title: "Komentář přidán!",
            description: "Váš komentář byl úspěšně přidán",
            duration: 2000,
          });
        }
      }
    );
  };

  const openCommentsDialog = (photoId: number) => {
    setSelectedCommentPhotoId(photoId);
    setIsCommentsDialogOpen(true);
  };

  const openPhoto = (index: number) => {
    setSelectedPhotoIndex(index);
    setIsDialogOpen(true);
  };

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (!photos) return;
    
    if (direction === 'next') {
      setSelectedPhotoIndex((prev) => (prev + 1) % photos.length);
    } else {
      setSelectedPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  const getGridClasses = () => {
    switch (viewMode) {
      case 'grid':
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4';
      case 'masonry':
        return 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4';
      case 'carousel':
        return 'flex overflow-x-auto gap-4 pb-4';
      default:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-xl font-medium">Načítám galerii...</p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Připravuji krásné vzpomínky</p>
        </div>
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="max-w-md mx-auto">
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
            <Camera className="h-16 w-16 text-primary" />
          </div>
          <h3 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">Zatím žádné fotky</h3>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Buďte první, kdo sdílí své snímky ze svatby!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              <Camera className="h-5 w-5 mr-2" />
              Přidat fotku
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Gallery Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Camera className="h-8 w-8 text-primary" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              Svatební galerie
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredPhotos.length} {filteredPhotos.length === 1 ? 'fotka' : filteredPhotos.length < 5 ? 'fotky' : 'fotek'} • 
              {' '}{photos.reduce((sum, photo) => sum + photo.likes, 0)} srdíček
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Hledat fotky..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-48"
            />
          </div>

          {/* Filter */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {[
              { key: 'all', label: 'Vše', icon: Grid },
              { key: 'liked', label: 'Líbí se', icon: Heart },
              { key: 'recent', label: 'Nové', icon: Eye },
              { key: 'popular', label: 'Populární', icon: Sparkles }
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                onClick={() => setFilterType(key as FilterType)}
                variant={filterType === key ? 'default' : 'ghost'}
                size="sm"
                className="h-8 px-3 text-xs"
              >
                <Icon className="h-3 w-3 mr-1" />
                {label}
              </Button>
            ))}
          </div>

          {/* View Mode */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {[
              { key: 'masonry', label: 'Zeď', icon: Grid },
              { key: 'grid', label: 'Mřížka', icon: Grid },
              { key: 'carousel', label: 'Posuvník', icon: Eye }
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                onClick={() => setViewMode(key as ViewMode)}
                variant={viewMode === key ? 'default' : 'ghost'}
                size="sm"
                className="h-8 px-3 text-xs"
              >
                <Icon className="h-3 w-3 mr-1" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={getGridClasses()}
        >
          {filteredPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`group relative ${viewMode === 'masonry' ? 'break-inside-avoid mb-4' : ''} ${
                viewMode === 'carousel' ? 'flex-shrink-0 w-80' : ''
              }`}
              onMouseEnter={() => setHoveredPhoto(photo.id)}
              onMouseLeave={() => setHoveredPhoto(null)}
            >
              <Card className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform group-hover:scale-[1.02] border-0">
                <div className="relative">
                  <img 
                    src={photo.thumbnailUrl} 
                    alt={photo.originalName}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Photo info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h4 className="font-medium text-sm mb-2 truncate">{photo.originalName}</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(photo.id, e);
                          }}
                          size="sm"
                          className={`relative overflow-hidden h-8 px-3 rounded-full backdrop-blur-sm ${
                            userLikes.has(photo.id) 
                              ? 'bg-red-500/80 hover:bg-red-600/80' 
                              : 'bg-white/20 hover:bg-white/30'
                          }`}
                        >
                          <Heart 
                            className={`h-4 w-4 mr-1 ${
                              userLikes.has(photo.id) ? 'fill-white' : ''
                            }`} 
                          />
                          <span className="text-xs">{photo.likes}</span>
                          
                          {/* Floating hearts */}
                          {likeAnimations.map((animation) => (
                            <div
                              key={animation.id}
                              className="absolute pointer-events-none"
                              style={{
                                left: animation.x,
                                top: animation.y,
                                transform: 'translate(-50%, -50%)',
                              }}
                            >
                              <Heart className="h-3 w-3 fill-red-500 text-red-500 animate-ping" />
                            </div>
                          ))}
                        </Button>
                        
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            openCommentsDialog(photo.id);
                          }}
                          size="sm"
                          className="h-8 px-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          <span className="text-xs">{photo.commentCount || 0}</span>
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            openPhoto(photos.findIndex(p => p.id === photo.id));
                          }}
                          size="sm"
                          className="h-8 px-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                        >
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                        
                        <div onClick={(e) => e.stopPropagation()}>
                          <AIPhotoEnhancer 
                            photoId={photo.id} 
                            photoUrl={photo.url}
                            inlineMode={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick actions on hover */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadImage(photo.url, photo.originalName);
                      }}
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        shareImage(photo.url);
                      }}
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Liked indicator */}
                  {userLikes.has(photo.id) && (
                    <div className="absolute top-3 left-3">
                      <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Heart className="h-3 w-3 fill-white" />
                        Líbí se
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty state for filtered results */}
      {filteredPhotos.length === 0 && photos.length > 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Search className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Žádné fotky nenalezeny</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Zkuste změnit vyhledávací kritéria nebo filtr
          </p>
          <Button 
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
            }}
            variant="outline"
          >
            Obnovit filtry
          </Button>
        </div>
      )}

      {/* Photo Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[95vh] p-0 overflow-hidden [&>button]:hidden">
          <DialogTitle className="sr-only">Detail fotky</DialogTitle>
          <DialogDescription className="sr-only">
            Detailní zobrazení fotky s možností lajkování, komentování a stahování
          </DialogDescription>
          
          <div className="grid lg:grid-cols-4 h-[95vh]">
            {/* Main image */}
            <div className="lg:col-span-3 relative bg-black flex items-center justify-center">
              {/* Header controls */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-black/50 text-white backdrop-blur-sm">
                    {selectedPhotoIndex + 1} z {photos.length}
                  </Badge>
                  <Button
                    onClick={() => setIsAutoPlay(!isAutoPlay)}
                    size="sm"
                    className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
                  >
                    {isAutoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>
                
                <Button
                  onClick={() => setIsDialogOpen(false)}
                  size="sm"
                  className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Navigation arrows */}
              <Button
                onClick={() => navigatePhoto('prev')}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
                size="lg"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              
              <Button
                onClick={() => navigatePhoto('next')}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
                size="lg"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              <motion.img 
                key={selectedPhoto?.id}
                src={selectedPhoto?.url} 
                alt={selectedPhoto?.originalName}
                className="max-w-full max-h-full object-contain"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Sidebar */}
            <div className="bg-white dark:bg-gray-900 flex flex-col">
              {/* Photo info */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-xl mb-3 text-gray-800 dark:text-white">
                  {selectedPhoto?.originalName}
                </h3>
                
                <div className="flex items-center gap-3 mb-4">
                  <Button
                    onClick={(e) => handleLike(selectedPhoto?.id || 0, e)}
                    className={`relative overflow-hidden flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                      userLikes.has(selectedPhoto?.id || 0)
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Heart 
                      className={`h-5 w-5 ${
                        userLikes.has(selectedPhoto?.id || 0)
                          ? 'fill-white text-white'
                          : 'text-gray-600 dark:text-gray-300'
                      }`} 
                    />
                    <span className="font-medium">{selectedPhoto?.likes || 0}</span>
                    
                    {likeAnimations.map((animation) => (
                      <div
                        key={animation.id}
                        className="absolute pointer-events-none"
                        style={{
                          left: animation.x,
                          top: animation.y,
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <Heart className="h-4 w-4 fill-red-500 text-red-500 animate-ping" />
                      </div>
                    ))}
                  </Button>
                  
                  <Button
                    onClick={() => downloadImage(selectedPhoto?.url || '', selectedPhoto?.originalName || '')}
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Stáhnout
                  </Button>
                </div>
                
                {/* AI Enhancement */}
                {selectedPhoto && (
                  <div className="mb-4">
                    <AIPhotoEnhancer 
                      photoId={selectedPhoto.id} 
                      photoUrl={selectedPhoto.url}
                      inlineMode={true}
                    />
                  </div>
                )}
              </div>

              {/* Comments section */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    Komentáře ({comments.length})
                  </h4>
                </div>
                
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <motion.div 
                        key={comment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-primary">{comment.author}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleString('cs-CZ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
                      </motion.div>
                    ))}
                    
                    {comments.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Zatím žádné komentáře</p>
                        <p className="text-sm">Buďte první, kdo přidá komentář!</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Add comment form */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <div className="space-y-3">
                    <Input
                      placeholder="Vaše jméno"
                      value={commenterName}
                      onChange={(e) => setCommenterName(e.target.value)}
                      className="bg-white dark:bg-gray-900"
                    />
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Napište komentář..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-1 resize-none bg-white dark:bg-gray-900"
                        rows={2}
                      />
                      <Button
                        onClick={() => handleAddComment(selectedPhoto?.id || 0)}
                        disabled={!newComment.trim() || !commenterName.trim() || addComment.isPending}
                        className="self-end"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comments Dialog */}
      <Dialog open={isCommentsDialogOpen} onOpenChange={setIsCommentsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Komentáře
          </DialogTitle>
          <DialogDescription>
            Komentáře k fotce {photos?.find(p => p.id === selectedCommentPhotoId)?.originalName}
          </DialogDescription>
          
          <div className="flex flex-col max-h-[60vh]">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {commentDialogComments.map((comment) => (
                  <motion.div 
                    key={comment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-primary">{comment.author}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString('cs-CZ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
                    </div>
                  </motion.div>
                ))}
                
                {commentDialogComments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Zatím žádné komentáře</p>
                    <p className="text-sm">Buďte první, kdo přidá komentář!</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Add comment form */}
            <div className="p-4 border-t bg-gray-50 dark:bg-gray-800">
              <div className="space-y-3">
                <Input
                  placeholder="Vaše jméno"
                  value={commenterName}
                  onChange={(e) => setCommenterName(e.target.value)}
                  className="bg-white dark:bg-gray-900"
                />
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Napište komentář..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 resize-none bg-white dark:bg-gray-900"
                    rows={2}
                  />
                  <Button
                    onClick={() => handleAddComment(selectedCommentPhotoId || 0)}
                    disabled={!newComment.trim() || !commenterName.trim() || addComment.isPending}
                    className="self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unlike Confirmation Dialog */}
      <Dialog open={showUnlikeDialog !== null} onOpenChange={() => setShowUnlikeDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Odebrat lajk?
          </DialogTitle>
          <DialogDescription>
            Už jste této fotce dal/a lajk. Chcete svůj lajk odebrat?
          </DialogDescription>
          
          <div className="flex items-center gap-3 mt-6">
            <Button
              onClick={() => setShowUnlikeDialog(null)}
              variant="outline"
              className="flex-1"
            >
              Ne, ponechat lajk
            </Button>
            <Button
              onClick={() => showUnlikeDialog && confirmUnlike(showUnlikeDialog)}
              variant="destructive"
              className="flex-1"
            >
              Ano, odebrat lajk
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}