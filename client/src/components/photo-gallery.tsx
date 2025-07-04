
import { useState } from "react";
import { usePhotos, useTogglePhotoLike } from "@/hooks/use-photos";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Download, Share2, Loader2, MessageCircle, Send, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface Comment {
  id: number;
  text: string;
  author: string;
  timestamp: Date;
}

export default function PhotoGallery() {
  const { data: photos, isLoading } = usePhotos(true);
  const toggleLike = useTogglePhotoLike();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [comments, setComments] = useState<{ [photoId: number]: Comment[] }>({});
  const [newComment, setNewComment] = useState("");
  const [commenterName, setCommenterName] = useState("");

  const handleLike = (photoId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    toggleLike.mutate(photoId);
  };

  const downloadImage = (url: string, filename: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const shareImage = async (url: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
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
      } catch (error) {
        console.log('Copy failed:', error);
      }
    }
  };

  const addComment = (photoId: number) => {
    if (!newComment.trim() || !commenterName.trim()) return;
    
    const comment: Comment = {
      id: Date.now(),
      text: newComment,
      author: commenterName,
      timestamp: new Date()
    };

    setComments(prev => ({
      ...prev,
      [photoId]: [...(prev[photoId] || []), comment]
    }));
    setNewComment("");
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Načítám galerii...</span>
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <MessageCircle className="h-12 w-12" />
        </div>
        <h3 className="text-2xl font-semibold mb-4">Zatím žádné fotky</h3>
        <p className="text-lg">Buďte první, kdo sdílí své snímky ze svatby!</p>
      </div>
    );
  }

  const selectedPhoto = photos[selectedPhotoIndex];

  return (
    <div className="space-y-8">
      {/* Professional Carousel Gallery */}
      <div className="max-w-6xl mx-auto">
        <Carousel className="w-full">
          <CarouselContent className="-ml-2 md:-ml-4">
            {photos.map((photo, index) => (
              <CarouselItem key={photo.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                <Card 
                  className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
                  onClick={() => openPhoto(index)}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img 
                      src={photo.thumbnailUrl} 
                      alt={photo.originalName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Overlay with info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white text-sm font-medium mb-3 truncate">
                        {photo.originalName}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={(e) => handleLike(photo.id, e)}
                            size="sm"
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-0 text-white px-3 py-1.5 rounded-full"
                          >
                            <Heart className={`h-4 w-4 mr-1 ${photo.likes > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                            <span className="text-xs">{photo.likes}</span>
                          </Button>
                          <div className="flex items-center gap-1 text-white/80">
                            <MessageCircle className="h-4 w-4" />
                            <span className="text-xs">{comments[photo.id]?.length || 0}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            onClick={(e) => downloadImage(photo.url, photo.originalName, e)}
                            size="sm"
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-0 text-white p-1.5 rounded-full"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={(e) => shareImage(photo.url, e)}
                            size="sm"
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-0 text-white p-1.5 rounded-full"
                          >
                            <Share2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 bg-white/90 hover:bg-white border-0 shadow-lg" />
          <CarouselNext className="right-4 bg-white/90 hover:bg-white border-0 shadow-lg" />
        </Carousel>
        
        {/* Gallery stats */}
        <div className="text-center mt-6">
          <p className="text-gray-600 dark:text-gray-400">
            {photos.length} {photos.length === 1 ? 'fotka' : photos.length < 5 ? 'fotky' : 'fotek'} • 
            {' '}{photos.reduce((sum, photo) => sum + photo.likes, 0)} srdíček • 
            {' '}{Object.values(comments).reduce((sum, photoComments) => sum + photoComments.length, 0)} komentářů
          </p>
        </div>
      </div>

      {/* Photo Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] p-0 overflow-hidden">
          <DialogTitle className="sr-only">Detail fotky</DialogTitle>
          <DialogDescription className="sr-only">
            Detailní zobrazení fotky s možností lajkování, komentování a stahování
          </DialogDescription>
          
          <div className="grid lg:grid-cols-3 h-full">
            {/* Main image */}
            <div className="lg:col-span-2 relative bg-black">
              <Button
                onClick={() => setIsDialogOpen(false)}
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
              
              {/* Navigation arrows */}
              <Button
                onClick={() => navigatePhoto('prev')}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-3"
                size="sm"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <Button
                onClick={() => navigatePhoto('next')}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-3"
                size="sm"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>

              <img 
                src={selectedPhoto?.url} 
                alt={selectedPhoto?.originalName}
                className="w-full h-full object-contain"
              />
              
              {/* Photo indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {selectedPhotoIndex + 1} z {photos.length}
              </div>
            </div>

            {/* Sidebar with details and comments */}
            <div className="bg-white dark:bg-gray-800 flex flex-col">
              {/* Photo info */}
              <div className="p-6 border-b">
                <h3 className="font-semibold text-lg mb-2">{selectedPhoto?.originalName}</h3>
                <div className="flex items-center gap-4 mb-4">
                  <Button
                    onClick={() => handleLike(selectedPhoto?.id || 0)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                  >
                    <Heart className={`h-5 w-5 ${(selectedPhoto?.likes || 0) > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{selectedPhoto?.likes || 0}</span>
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
              </div>

              {/* Comments section */}
              <div className="flex-1 flex flex-col">
                <div className="p-4 border-b">
                  <h4 className="font-medium mb-3">
                    Komentáře ({comments[selectedPhoto?.id || 0]?.length || 0})
                  </h4>
                </div>
                
                {/* Comments list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {comments[selectedPhoto?.id || 0]?.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{comment.author}</span>
                        <span className="text-xs text-gray-500">
                          {comment.timestamp.toLocaleTimeString('cs-CZ', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <p className="text-sm">{comment.text}</p>
                    </div>
                  ))}
                  
                  {(!comments[selectedPhoto?.id || 0] || comments[selectedPhoto?.id || 0].length === 0) && (
                    <p className="text-gray-500 text-center py-8">
                      Zatím žádné komentáře. Buďte první!
                    </p>
                  )}
                </div>

                {/* Add comment form */}
                <div className="p-4 border-t bg-gray-50 dark:bg-gray-700/50">
                  <div className="space-y-3">
                    <Input
                      placeholder="Vaše jméno"
                      value={commenterName}
                      onChange={(e) => setCommenterName(e.target.value)}
                      className="text-sm"
                    />
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Napište komentář..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-1 text-sm resize-none"
                        rows={2}
                      />
                      <Button
                        onClick={() => addComment(selectedPhoto?.id || 0)}
                        size="sm"
                        className="self-end"
                        disabled={!newComment.trim() || !commenterName.trim()}
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
    </div>
  );
}
