import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useUploadPhotos } from "@/hooks/use-photos";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Plus, CloudUpload, Camera, X, CheckCircle, AlertCircle, Image, FileImage, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import AIPhotoEnhancer from "@/components/ai-photo-enhancer";

export default function PhotoUpload() {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<Array<{id: number, url: string}>>([]);
  const [showAnalysisFor, setShowAnalysisFor] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadPhotos = useUploadPhotos();
  const { toast } = useToast();

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    setSelectedFiles(files);
    
    // Create preview URLs
    const urls: string[] = [];
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        urls.push(URL.createObjectURL(file));
      }
    });
    setPreviewUrls(urls);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      return;
    }

    try {
      const result = await uploadPhotos.mutateAsync(selectedFiles);
      
      // If we got uploaded photos data, store it and show analysis for the first one
      if (result && Array.isArray(result)) {
        setUploadedPhotos(result.map(photo => ({ id: photo.id, url: photo.url })));
        if (result.length === 1) {
          setShowAnalysisFor(result[0].id);
        }
      }
      
      setSelectedFiles(null);
      setPreviewUrls([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast({
        title: "Fotky nahrány!",
        description: `${selectedFiles.length} fotek bylo úspěšně nahráno`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Chyba při nahrávání",
        description: "Nepodařilo se nahrát fotky. Zkuste to znovu.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const removeFile = (index: number) => {
    if (!selectedFiles) return;
    
    const newFiles = Array.from(selectedFiles);
    newFiles.splice(index, 1);
    
    const newPreviewUrls = [...previewUrls];
    URL.revokeObjectURL(newPreviewUrls[index]);
    newPreviewUrls.splice(index, 1);
    
    setPreviewUrls(newPreviewUrls);
    
    // Create new FileList
    const dt = new DataTransfer();
    newFiles.forEach(file => dt.items.add(file));
    setSelectedFiles(dt.files);
  };

  const selectFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  const captureFromCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const clearAll = () => {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setSelectedFiles(null);
    setPreviewUrls([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Android-style Header */}
      <div className="flex items-center gap-3 px-4">
        <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
          <Upload className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Nahrát fotky</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Sdílejte své svatební vzpomínky</p>
        </div>
      </div>

      {/* Upload Area */}
      <Card className="mx-4 overflow-hidden bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-2xl">
        <div
          className={`relative p-8 text-center transition-all duration-300 ${
            dragActive 
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600' 
              : 'bg-gray-50 dark:bg-gray-700/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleInputChange}
            className="hidden"
          />
          
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: dragActive ? 1.05 : 1 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
              dragActive 
                ? 'bg-blue-600 text-white' 
                : 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
            }`}>
              {dragActive ? (
                <Upload className="h-8 w-8" />
              ) : (
                <Camera className="h-8 w-8" />
              )}
            </div>
            
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              {dragActive ? 'Pusťte zde pro nahrání' : 'Přidejte fotky'}
            </h4>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
              {dragActive 
                ? 'Pusťte soubory pro rychlé nahrání'
                : 'Přetáhněte fotky sem nebo klikněte pro výběr souborů'
              }
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={selectFiles}
                className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6 py-2 font-medium shadow-lg"
              >
                <Image className="h-4 w-4 mr-2" />
                Vybrat fotky
              </Button>
              
              <Button
                variant="outline"
                onClick={captureFromCamera}
                className="rounded-full px-6 py-2 font-medium border-gray-300 dark:border-gray-600"
              >
                <Camera className="h-4 w-4 mr-2" />
                Z kamery
              </Button>
            </div>
            
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Podporované formáty: JPG, PNG, GIF • Max. 10MB na soubor
            </div>
          </motion.div>
        </div>
      </Card>

      {/* File Previews */}
      <AnimatePresence>
        {selectedFiles && selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4"
          >
            <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-2xl">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <FileImage className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">
                        Vybrané fotky ({selectedFiles.length})
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Připravené k nahrání
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    className="w-8 h-8 p-0 rounded-full text-gray-500 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {previewUrls.map((url, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative group"
                    >
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-xl border border-gray-200 dark:border-gray-600"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      
                      <div className="absolute bottom-2 left-2 right-2">
                        <Badge variant="secondary" className="text-xs bg-black/70 text-white border-0">
                          {Array.from(selectedFiles)[index]?.name.slice(0, 12)}...
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleUpload}
                    disabled={uploadPhotos.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-full py-3 font-medium shadow-lg"
                  >
                    {uploadPhotos.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Nahrávám...
                      </>
                    ) : (
                      <>
                        <CloudUpload className="h-4 w-4 mr-2" />
                        Nahrát fotky ({selectedFiles.length})
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={selectFiles}
                    className="rounded-full px-6 py-3 font-medium border-gray-300 dark:border-gray-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Přidat další
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Status */}
      <AnimatePresence>
        {uploadPhotos.isPending && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-4"
          >
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 rounded-2xl">
              <div className="p-4 flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                <div className="flex-1">
                  <p className="font-medium text-blue-800 dark:text-blue-200">
                    Nahrávám fotky...
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    Prosím počkejte, fotky se zpracovávají
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {uploadPhotos.isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-4"
          >
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 rounded-2xl">
              <div className="p-4 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-green-800 dark:text-green-200">
                    Fotky úspěšně nahrány!
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    Vaše fotky byly přidány do galerie
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {uploadPhotos.isError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-4"
          >
            <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 rounded-2xl">
              <div className="p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div className="flex-1">
                  <p className="font-medium text-red-800 dark:text-red-200">
                    Chyba při nahrávání
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    Něco se pokazilo. Zkuste to prosím znovu.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => uploadPhotos.reset()}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Zkusit znovu
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uploaded Photos with AI Analysis */}
      <AnimatePresence>
        {uploadedPhotos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-4"
          >
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-green-200 dark:border-green-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-800 dark:text-green-200">
                      Fotky úspěšně nahrány!
                    </h4>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      Nyní můžete spustit AI analýzu
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                {uploadedPhotos.map((photo, index) => (
                  <div key={photo.id} className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-green-700">
                    <img
                      src={photo.url}
                      alt={`Nahraná fotka ${index + 1}`}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 dark:text-white">
                        Fotka #{photo.id}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Připravena k analýze
                      </p>
                    </div>
                    <AIPhotoEnhancer 
                      photoId={photo.id} 
                      photoUrl={photo.url} 
                      inlineMode={true}
                    />
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUploadedPhotos([])}
                  className="w-full mt-4"
                >
                  <X className="h-4 w-4 mr-2" />
                  Skrýt nahrané fotky
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}