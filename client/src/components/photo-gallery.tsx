import { useState } from "react";
import { usePhotos, useTogglePhotoLike } from "@/hooks/use-photos";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Grid, Images, Heart, Download, Share2, Loader2 } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export default function PhotoGallery() {
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('grid');
  const { data: photos, isLoading } = usePhotos(true);
  const toggleLike = useTogglePhotoLike();

  const handleLike = (photoId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike.mutate(photoId);
  };

  const downloadImage = (url: string, filename: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const shareImage = async (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
      // Fallback - copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.origin + url);
        // Could show a toast here
      } catch (error) {
        console.log('Copy failed:', error);
      }
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
        <Images className="h-16 w-16 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Zatím žádné fotky</h3>
        <p>Buďte první, kdo sdílí své snímky ze svatby!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Gallery Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex">
          <Button
            onClick={() => setViewMode('grid')}
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            className={viewMode === 'grid' ? 'bg-white dark:bg-gray-600 text-primary shadow-sm' : ''}
          >
            <Grid className="h-4 w-4 mr-2" />
            Mřížka
          </Button>
          <Button
            onClick={() => setViewMode('carousel')}
            variant={viewMode === 'carousel' ? 'default' : 'ghost'}
            size="sm"
            className={viewMode === 'carousel' ? 'bg-white dark:bg-gray-600 text-primary shadow-sm' : ''}
          >
            <Images className="h-4 w-4 mr-2" />
            Karusel
          </Button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <Dialog key={photo.id}>
              <DialogTrigger asChild>
                <Card className="relative group cursor-pointer bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 photo-item">
                  <img 
                    src={photo.thumbnailUrl} 
                    alt={photo.originalName}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                      <Button
                        onClick={(e) => handleLike(photo.id, e)}
                        size="sm"
                        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-full transition-colors"
                      >
                        <Heart className="h-4 w-4 text-red-400" fill="currentColor" />
                        <span>{photo.likes}</span>
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          onClick={(e) => downloadImage(photo.url, photo.originalName, e)}
                          size="icon"
                          className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={(e) => shareImage(photo.url, e)}
                          size="icon"
                          className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                <div className="relative">
                  <img 
                    src={photo.url} 
                    alt={photo.originalName}
                    className="w-full h-auto max-h-[80vh] object-contain"
                  />
                  <div className="p-4 bg-gradient-to-t from-black/70 to-transparent absolute bottom-0 left-0 right-0">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-4">
                        <Button
                          onClick={(e) => handleLike(photo.id, e)}
                          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-full transition-colors like-btn"
                        >
                          <Heart className="h-4 w-4 text-red-400" fill="currentColor" />
                          <span>{photo.likes}</span>
                        </Button>
                        <span className="text-sm opacity-75">{photo.originalName}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={(e) => downloadImage(photo.url, photo.originalName, e)}
                          size="icon"
                          className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={(e) => shareImage(photo.url, e)}
                          size="icon"
                          className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}

      {/* Carousel View */}
      {viewMode === 'carousel' && (
        <div className="max-w-4xl mx-auto">
          <Carousel className="w-full">
            <CarouselContent>
              {photos.map((photo) => (
                <CarouselItem key={photo.id}>
                  <div className="relative bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
                    <img 
                      src={photo.url} 
                      alt={photo.originalName}
                      className="w-full h-96 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <Button
                        onClick={() => handleLike(photo.id, {} as React.MouseEvent)}
                        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-full transition-colors text-white"
                      >
                        <Heart className="h-4 w-4 text-red-400" fill="currentColor" />
                        <span>{photo.likes}</span>
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => downloadImage(photo.url, photo.originalName, {} as React.MouseEvent)}
                          size="icon"
                          className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors text-white"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => shareImage(photo.url, {} as React.MouseEvent)}
                          size="icon"
                          className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors text-white"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
          <div className="text-center mt-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {photos.length} {photos.length === 1 ? 'fotka' : 'fotek'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}