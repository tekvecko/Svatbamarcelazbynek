import { useState, useEffect } from "react";
import { usePhotos, useTogglePhotoLike, usePhotoComments, useAddPhotoComment } from "@/hooks/use-photos";
import { Button } from "@/components/ui/button";
import { sanitizeInput } from "@/lib/sanitize";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, Download, Share2, Loader2, MessageCircle, Send, ChevronLeft, ChevronRight, X, Search, Menu, MoreVertical, Eye, Camera, Star, Clock, TrendingUp, Grid3X3, List, Play, Pause, Maximize2, MinusCircle, PlusCircle } from "lucide-react";
import SimpleAIPhotoAnalyzer from "@/components/ai-photo-enhancer-simple";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import MobilePhotoViewer from "@/components/mobile-photo-viewer";

interface LikeAnimation {
  id: string;
  x: number;
  y: number;
}

type ViewMode = 'grid' | 'list' | 'cards';
type FilterType = 'all' | 'liked' | 'recent' | 'popular';

export default function PhotoGallery() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: photosResponse, isLoading } = usePhotos(true, currentPage, 12);
  const photos = Array.isArray(photosResponse) ? photosResponse : [];
  const pagination = { page: currentPage, limit: 12, total: photos.length, hasNext: false, hasPrev: false };
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

  // Android-style states
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const selectedPhoto = photos?.[selectedPhotoIndex];
  const { data: comments = [] } = usePhotoComments(selectedPhoto?.id || 0);
  const { data: commentDialogComments = [] } = usePhotoComments(selectedCommentPhotoId || 0);

  // Filter and search photos
  const filteredPhotos = photos?.filter(photo => {
    if (searchTerm && !photo.originalName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    switch (filterType) {
      case 'liked':
        return userLikes.has(photo.id);
      case 'recent':
        return new Date(photo.uploadedAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;
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
      }, 4000);
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
          title: "Líbí se mi!",
          description: "Fotka byla označena jako oblíbená",
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
          description: "Nepodařilo se přidat do oblíbených",
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
          title: "Odebrané z oblíbených",
          description: "Fotka již není v oblíbených",
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
          description: "Nepodařilo se odebrat z oblíbených",
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
          title: "Zkopírováno",
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
            title: "Komentář přidán",
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

  const toggleCardExpansion = (photoId: number) => {
    setExpandedCard(expandedCard === photoId ? null : photoId);
  };

  const getFilterIcon = (filter: FilterType) => {
    switch (filter) {
      case 'liked': return Heart;
      case 'recent': return Clock;
      case 'popular': return TrendingUp;
      default: return Grid3X3;
    }
  };

  const getFilterLabel = (filter: FilterType) => {
    switch (filter) {
      case 'liked': return 'Oblíbené';
      case 'recent': return 'Nedávné';
      case 'popular': return 'Populární';
      default: return 'Vše';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Načítám galerii</h3>
        <p className="text-gray-600 dark:text-gray-400 text-center">Připravuji vaše krásné vzpomínky</p>
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4">
        <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
          <Camera className="h-12 w-12 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">Žádné fotky</h3>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-sm">
          Zatím zde nejsou žádné fotografie. Buďte první, kdo sdílí vzpomínky!
        </p>
        <Button 
          size="lg" 
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
        >
          <Camera className="h-5 w-5 mr-2" />
          Přidat fotku
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Android-style App Bar */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-800 dark:text-white">Galerie</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredPhotos.length} fotek • {photos.reduce((sum, photo) => sum + photo.likes, 0)} srdíček
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchActive(!isSearchActive)}
              className="w-10 h-10 p-0 rounded-full"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="w-10 h-10 p-0 rounded-full"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {isSearchActive && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-3 overflow-hidden"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Hledat fotky..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-100 dark:bg-gray-700 border-0 rounded-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Menu */}
        <AnimatePresence>
          {showFilterMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-3 overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtr:</span>
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'liked', 'recent', 'popular'] as FilterType[]).map((filter) => {
                    const Icon = getFilterIcon(filter);
                    return (
                      <Button
                        key={filter}
                        variant={filterType === filter ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterType(filter)}
                        className={`rounded-full h-8 ${
                          filterType === filter 
                            ? 'bg-blue-600 text-white' 
                            : 'border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="h-3 w-3 mr-1" />
                        {getFilterLabel(filter)}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Zobrazení:</span>
                <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-full p-1">
                  {([
                    { key: 'cards', icon: Grid3X3, label: 'Karty' },
                    { key: 'grid', icon: Grid3X3, label: 'Mřížka' },
                    { key: 'list', icon: List, label: 'Seznam' }
                  ] as const).map(({ key, icon: Icon, label }) => (
                    <Button
                      key={key}
                      variant={viewMode === key ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode(key)}
                      className={`h-8 px-3 rounded-full ${
                        viewMode === key ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Icon className="h-3 w-3 mr-1" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4">
        {/* Android Cards View */}
        {viewMode === 'cards' && (
          <div className="space-y-4">
            {filteredPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
                  {/* Card Header */}
                  <div className="flex items-center justify-between p-4 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Camera className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-white line-clamp-1">
                          {photo.originalName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(photo.uploadedAt).toLocaleDateString('cs-CZ')}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCardExpansion(photo.id)}
                      className="w-8 h-8 p-0 rounded-full"
                    >
                      {expandedCard === photo.id ? (
                        <MinusCircle className="h-4 w-4" />
                      ) : (
                        <PlusCircle className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Photo */}
                  <div 
                    className="relative cursor-pointer group"
                    onClick={() => openPhoto(photos.findIndex(p => p.id === photo.id))}
                  >
                    <img
                      src={photo.thumbnailUrl}
                      alt={photo.originalName}
                      className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
                        <Maximize2 className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="p-4 pt-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(photo.id, e);
                          }}
                          className={`h-9 px-3 rounded-full relative ${
                            userLikes.has(photo.id)
                              ? 'text-red-500 hover:text-red-600'
                              : 'text-gray-600 hover:text-red-500'
                          }`}
                        >
                          <Heart 
                            className={`h-4 w-4 mr-1 ${
                              userLikes.has(photo.id) ? 'fill-current' : ''
                            }`}
                          />
                          {photo.likes}

                          {likeAnimations.map((animation) => (
                            <motion.div
                              key={animation.id}
                              initial={{ opacity: 1, scale: 1, y: 0 }}
                              animate={{ opacity: 0, scale: 1.5, y: -20 }}
                              transition={{ duration: 1 }}
                              className="absolute"
                              style={{
                                left: animation.x,
                                top: animation.y,
                                transform: 'translate(-50%, -50%)',
                              }}
                            >
                              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                            </motion.div>
                          ))}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCommentsDialog(photo.id);
                          }}
                          className="h-9 px-3 rounded-full text-gray-600 hover:text-blue-500"
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {photo.commentCount || 0}
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            shareImage(photo.url);
                          }}
                          className="h-9 w-9 p-0 rounded-full text-gray-600 hover:text-blue-500"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadImage(photo.url, photo.originalName);
                          }}
                          className="h-9 w-9 p-0 rounded-full text-gray-600 hover:text-green-500"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {expandedCard === photo.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <SimpleAIPhotoAnalyzer 
                              photoId={photo.id} 
                              photoUrl={photo.url}
                              inlineMode={true}
                            />
                            {userLikes.has(photo.id) && (
                              <Badge variant="secondary" className="bg-red-100 text-red-800">
                                <Heart className="h-3 w-3 mr-1 fill-current" />
                                Oblíbené
                              </Badge>
                            )}
                          </div>

                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <p className="mb-2">
                              <span className="font-medium">Nahrané:</span> {' '}
                              {new Date(photo.uploadedAt).toLocaleString('cs-CZ')}
                            </p>
                            <p>
                              <span className="font-medium">Velikost:</span> {' '}
                              {photo.originalName}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="relative aspect-square"
              >
                <Card className="overflow-hidden h-full group cursor-pointer">
                  <div 
                    className="relative h-full"
                    onClick={() => openPhoto(photos.findIndex(p => p.id === photo.id))}
                  >
                    <img
                      src={photo.thumbnailUrl}
                      alt={photo.originalName}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-black/60 backdrop-blur-sm rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={(e) => handleLike(photo.id, e)}
                        variant="ghost"
                        size="sm"
                        className={`text-white hover:bg-white/20 rounded-full h-8 px-2 ${
                          userLikes.has(photo.id) ? 'bg-red-500/20' : ''
                        }`}
                      >
                        <Heart 
                          className={`h-4 w-4 ${
                            userLikes.has(photo.id) ? 'fill-current text-red-400' : ''
                          }`}
                        />
                        <span className="ml-1 text-xs">{photo.likes || 0}</span>
                      </Button>

                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          openCommentsDialog(photo.id);
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20 rounded-full h-8 px-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span className="ml-1 text-xs">{photo.commentCount || 0}</span>
                      </Button>
                    </div>

                    <div onClick={(e) => e.stopPropagation()}>
                      <SimpleAIPhotoAnalyzer 
                        photoId={photo.id} 
                        photoUrl={photo.url}
                        inlineMode={true}
                      />
                    </div>
                  </div>

                    {/* Overlay info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-2">
                          <Heart className={`h-4 w-4 ${userLikes.has(photo.id) ? 'fill-current text-red-400' : ''}`} />
                          <span className="text-sm">{photo.likes}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-sm">{photo.commentCount || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Like indicator */}
                    {userLikes.has(photo.id) && (
                      <div className="absolute top-2 right-2">
                        <div className="bg-red-500 text-white rounded-full p-1">
                          <Heart className="h-3 w-3 fill-current" />
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="space-y-2">
            {filteredPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                  <div 
                    className="flex items-center p-4 cursor-pointer"
                    onClick={() => openPhoto(photos.findIndex(p => p.id === photo.id))}
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                      <img
                        src={photo.thumbnailUrl}
                        alt={photo.originalName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-800 dark:text-white truncate">
                        {photo.originalName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(photo.uploadedAt).toLocaleDateString('cs-CZ')}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Heart className={`h-3 w-3 ${userLikes.has(photo.id) ? 'fill-current text-red-500' : ''}`} />
                          {photo.likes}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MessageCircle className="h-3 w-3" />
                          {photo.commentCount || 0}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(photo.id, e);
                        }}
                        className={`w-8 h-8 p-0 rounded-full ${
                          userLikes.has(photo.id) ? 'text-red-500' : 'text-gray-400'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${userLikes.has(photo.id) ? 'fill-current' : ''}`} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Show more options
                        }}
                        className="w-8 h-8 p-0 rounded-full text-gray-400 hover:text-gray-600"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty state for filtered results */}
        {filteredPhotos.length === 0 && photos.length > 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semiboldtext-gray-800 dark:text-white mb-2">
              Nenalezeny žádné fotky
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Zkuste upravit kritéria vyhledávání nebo filtru
            </p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setIsSearchActive(false);
              }}
              variant="outline"
              className="rounded-full"
            >
              Vymazat filtry
            </Button>
          </div>
        )}
      </div>

      {/* Photo Detail Dialog - Enhanced Mobile Full Screen */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-none max-h-none w-screen h-screen p-0 bg-black [&>button]:hidden">
          <DialogTitle className="sr-only">Detail fotky</DialogTitle>
          <DialogDescription className="sr-only">
            Detailní zobrazení fotky s možností navigace a interakce
          </DialogDescription>

          <MobilePhotoViewer 
            photos={photos}
            selectedIndex={selectedPhotoIndex}
            onIndexChange={setSelectedPhotoIndex}
            onClose={() => setIsDialogOpen(false)}
            userLikes={userLikes}
            onLike={handleLike}
            onComment={openCommentsDialog}
            onShare={shareImage}
            onDownload={downloadImage}
            comments={comments}
            isAutoPlay={isAutoPlay}
            onAutoPlayToggle={() => setIsAutoPlay(!isAutoPlay)}
          />
        </DialogContent>
      </Dialog>

      {/* Comments Dialog - Android Style */}
      <Dialog open={isCommentsDialogOpen} onOpenChange={setIsCommentsDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] p-0 m-4 rounded-2xl overflow-hidden">
          <DialogTitle className="sr-only">Komentáře</DialogTitle>
          <DialogDescription className="sr-only">
            Komentáře k fotce
          </DialogDescription>

          <div className="flex flex-col h-full max-h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border-b">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">Komentáře</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {commentDialogComments.length} komentářů
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setIsCommentsDialogOpen(false)}
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Comments list */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {commentDialogComments.map((comment) => (
                  <motion.div 
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-medium">
                        {sanitizeInput(comment.author).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-800 dark:text-white">
                          {sanitizeInput(comment.author)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString('cs-CZ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {sanitizeInput(comment.text)}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {commentDialogComments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">Žádné komentáře</p>
                    <p className="text-sm">Buďte první, kdo přidá komentář</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Add comment form */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t">
              <div className="space-y-3">
                <Input
                  placeholder="Vaše jméno"
                  value={commenterName}
                  onChange={(e) => setCommenterName(e.target.value)}
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded-xl"
                />
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Napište komentář..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 resize-none bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded-xl"
                    rows={2}
                  />
                  <Button
                    onClick={() => handleAddComment(selectedCommentPhotoId || 0)}
                    disabled={!newComment.trim() || !commenterName.trim() || addComment.isPending}
                    className="self-end bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unlike Confirmation Dialog - Android Style */}
      <Dialog open={showUnlikeDialog !== null} onOpenChange={() => setShowUnlikeDialog(null)}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl p-6">
          <DialogTitle className="text-lg font-semibold text-center mb-2">
            Odebrat z oblíbených?
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 dark:text-gray-400 mb-6">
            Tato fotka již nebude v seznamu oblíbených fotek.
          </DialogDescription>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => showUnlikeDialog && confirmUnlike(showUnlikeDialog)}
              variant="default"
              className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl h-12"
            >
              Odebrat z oblíbených
            </Button>
            <Button
              onClick={() => setShowUnlikeDialog(null)}
              variant="outline"
              className="w-full rounded-xl h-12"
            >
              Zrušit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pagination Controls */}
      {photos && photos.length > 12 && (
        <div className="flex justify-center items-center gap-2 mt-8 mb-4">
          <Button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage <= 1}
            variant="outline"
            size="sm"
            className="rounded-full"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Předchozí
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Stránka {currentPage}
            </span>
          </div>

          <Button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={photos.length < 12}
            variant="outline"
            size="sm"
            className="rounded-full"
          >
            Další
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Loading indicator for pagination */}
      {photos && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          Celkem {photos.length} fotek
        </div>
      )}
    </div>
  );
}