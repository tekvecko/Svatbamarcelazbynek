import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useUploadPhotos } from "@/hooks/use-photos";
import { Card } from "@/components/ui/card";
import { Upload, Plus, CloudUpload } from "lucide-react";

export default function PhotoUpload() {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadPhotos = useUploadPhotos();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      return;
    }

    try {
      await uploadPhotos.mutateAsync(selectedFiles);
      setSelectedFiles(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const selectFiles = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 border-0">
      <div className="p-6 text-center">
        <CloudUpload className="h-12 w-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Sdílejte své fotky!</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Nahrajte své nejlepší snímky ze svatby
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            onClick={selectFiles}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Vybrat fotky
          </Button>
          
          <Button
            onClick={handleUpload}
            disabled={!selectedFiles || selectedFiles.length === 0 || uploadPhotos.isPending}
            className="bg-secondary hover:bg-secondary/90 text-white px-6 py-3 rounded-lg disabled:opacity-50"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploadPhotos.isPending ? "Nahrávám..." : "Nahrát"}
          </Button>
        </div>

        {selectedFiles && selectedFiles.length > 0 && (
          <p className="text-sm mt-3 text-gray-600 dark:text-gray-400">
            Vybráno {selectedFiles.length} {selectedFiles.length === 1 ? 'soubor' : 'souborů'}
          </p>
        )}

        {uploadPhotos.isPending && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full animate-pulse w-1/2"></div>
            </div>
            <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
              Nahrávám fotky...
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
