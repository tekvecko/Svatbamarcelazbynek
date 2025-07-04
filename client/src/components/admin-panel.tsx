import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { usePhotos, useDeletePhoto, useApprovePhoto } from "@/hooks/use-photos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { X, Save, Trash2, Check, Settings, Eye, Download } from "lucide-react";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [weddingForm, setWeddingForm] = useState({
    coupleNames: "",
    weddingDate: "",
    venue: "",
    venueAddress: "",
    allowUploads: true,
    moderateUploads: false,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: weddingDetails } = useQuery({
    queryKey: ["/api/wedding-details"],
    queryFn: api.getWeddingDetails,
  });

  const { data: photos } = usePhotos();
  const { data: pendingPhotos } = usePhotos(false);
  const deletePhoto = useDeletePhoto();
  const approvePhoto = useApprovePhoto();

  const updateWeddingDetails = useMutation({
    mutationFn: api.updateWeddingDetails,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wedding-details"] });
      toast({
        title: "Detaily aktualizovány!",
        description: "Svatební detaily byly úspěšně uloženy",
      });
    },
    onError: (error) => {
      toast({
        title: "Chyba při ukládání",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (weddingDetails) {
      setWeddingForm({
        coupleNames: weddingDetails.coupleNames,
        weddingDate: new Date(weddingDetails.weddingDate).toISOString().slice(0, 16),
        venue: weddingDetails.venue,
        venueAddress: weddingDetails.venueAddress || "",
        allowUploads: weddingDetails.allowUploads,
        moderateUploads: weddingDetails.moderateUploads,
      });
    }
  }, [weddingDetails]);

  const handleLogin = () => {
    // Simple password check - in production, use proper authentication
    if (password === "admin123") {
      setIsAuthenticated(true);
      toast({
        title: "Přihlášení úspěšné",
        description: "Vítejte v admin panelu",
      });
    } else {
      toast({
        title: "Nesprávné heslo",
        description: "Zkuste to znovu",
        variant: "destructive",
      });
    }
  };

  const handleUpdateDetails = () => {
    updateWeddingDetails.mutate({
      coupleNames: weddingForm.coupleNames,
      weddingDate: new Date(weddingForm.weddingDate).toISOString(),
      venue: weddingForm.venue,
      venueAddress: weddingForm.venueAddress,
      allowUploads: weddingForm.allowUploads,
      moderateUploads: weddingForm.moderateUploads,
    });
  };

  const handleDeletePhoto = (photoId: number) => {
    deletePhoto.mutate(photoId);
  };

  const handleApprovePhoto = (photoId: number) => {
    approvePhoto.mutate(photoId);
  };

  const exportPhotos = () => {
    if (!photos || photos.length === 0) {
      toast({
        title: "Žádné fotky k exportu",
        description: "Galerie je prázdná",
        variant: "destructive",
      });
      return;
    }

    // Create a simple CSV with photo metadata
    const csv = [
      'ID,Název,Datum nahrání,Počet lajků,URL',
      ...photos.map(photo => 
        `${photo.id},"${photo.originalName}","${new Date(photo.uploadedAt).toLocaleDateString('cs-CZ')}",${photo.likes},"${window.location.origin}${photo.url}"`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'svatebni_galerie_export.csv';
    link.click();

    toast({
      title: "Export dokončen",
      description: "Seznam fotek byl exportován",
    });
  };

  return (
    <>
      {/* Mobile Sheet */}
      <Sheet open={isOpen && window.innerWidth < 768} onOpenChange={onClose}>
        <SheetContent side="right" className="w-80 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Admin Panel</SheetTitle>
          </SheetHeader>
          <AdminPanelContent 
            isAuthenticated={isAuthenticated}
            password={password}
            setPassword={setPassword}
            handleLogin={handleLogin}
            weddingForm={weddingForm}
            setWeddingForm={setWeddingForm}
            handleUpdateDetails={handleUpdateDetails}
            updateWeddingDetails={updateWeddingDetails}
            photos={photos}
            pendingPhotos={pendingPhotos}
            handleDeletePhoto={handleDeletePhoto}
            handleApprovePhoto={handleApprovePhoto}
            exportPhotos={exportPhotos}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Overlay */}
      {isOpen && window.innerWidth >= 768 && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={onClose} />
          <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-800 shadow-2xl transform translate-x-0 transition-transform duration-300 z-40 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Admin Panel</h3>
                <Button onClick={onClose} variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <AdminPanelContent 
                isAuthenticated={isAuthenticated}
                password={password}
                setPassword={setPassword}
                handleLogin={handleLogin}
                weddingForm={weddingForm}
                setWeddingForm={setWeddingForm}
                handleUpdateDetails={handleUpdateDetails}
                updateWeddingDetails={updateWeddingDetails}
                photos={photos}
                pendingPhotos={pendingPhotos}
                handleDeletePhoto={handleDeletePhoto}
                handleApprovePhoto={handleApprovePhoto}
                exportPhotos={exportPhotos}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}

function AdminPanelContent({ 
  isAuthenticated, 
  password, 
  setPassword, 
  handleLogin, 
  weddingForm, 
  setWeddingForm, 
  handleUpdateDetails, 
  updateWeddingDetails,
  photos,
  pendingPhotos,
  handleDeletePhoto,
  handleApprovePhoto,
  exportPhotos 
}: any) {
  if (!isAuthenticated) {
    return (
      <div className="space-y-4">
        <Label htmlFor="password">Admin heslo</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Zadejte heslo"
          onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
        />
        <Button onClick={handleLogin} className="w-full">
          Přihlásit se
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wedding Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Detaily svatby</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="coupleNames">Názvy novomanželů</Label>
            <Input
              id="coupleNames"
              value={weddingForm.coupleNames}
              onChange={(e) => setWeddingForm(prev => ({ ...prev, coupleNames: e.target.value }))}
              className="text-sm"
            />
          </div>
          <div>
            <Label htmlFor="weddingDate">Datum svatby</Label>
            <Input
              id="weddingDate"
              type="datetime-local"
              value={weddingForm.weddingDate}
              onChange={(e) => setWeddingForm(prev => ({ ...prev, weddingDate: e.target.value }))}
              className="text-sm"
            />
          </div>
          <div>
            <Label htmlFor="venue">Místo konání</Label>
            <Input
              id="venue"
              value={weddingForm.venue}
              onChange={(e) => setWeddingForm(prev => ({ ...prev, venue: e.target.value }))}
              className="text-sm"
            />
          </div>
          <div>
            <Label htmlFor="venueAddress">Adresa</Label>
            <Input
              id="venueAddress"
              value={weddingForm.venueAddress}
              onChange={(e) => setWeddingForm(prev => ({ ...prev, venueAddress: e.target.value }))}
              className="text-sm"
            />
          </div>
          <Button 
            onClick={handleUpdateDetails}
            className="w-full bg-success hover:bg-success/90 text-white"
            disabled={updateWeddingDetails.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {updateWeddingDetails.isPending ? "Ukládám..." : "Aktualizovat"}
          </Button>
        </CardContent>
      </Card>

      {/* Photo Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Správa fotek</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full text-sm">
                <Eye className="h-4 w-4 mr-2" />
                Moderovat fotky
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Moderace fotek</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {pendingPhotos && pendingPhotos.length > 0 ? (
                  pendingPhotos.map((photo) => (
                    <div key={photo.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <img src={photo.thumbnailUrl} alt={photo.originalName} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1">
                        <h4 className="font-medium">{photo.originalName}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Nahráno: {new Date(photo.uploadedAt).toLocaleDateString('cs-CZ')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprovePhoto(photo.id)}
                          size="sm"
                          className="bg-success hover:bg-success/90 text-white"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeletePhoto(photo.id)}
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">Žádné fotky k moderaci</p>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            onClick={exportPhotos}
            variant="outline" 
            className="w-full text-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportovat galerii
          </Button>

          <div className="text-xs text-gray-600 dark:text-gray-400">
            Celkem fotek: {photos?.length || 0}
          </div>
        </CardContent>
      </Card>

      {/* Site Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Nastavení</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="allowUploads" className="text-sm">Povolit nahrávání fotek</Label>
            <Switch
              id="allowUploads"
              checked={weddingForm.allowUploads}
              onCheckedChange={(checked) => setWeddingForm(prev => ({ ...prev, allowUploads: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="moderateUploads" className="text-sm">Moderovat před zveřejněním</Label>
            <Switch
              id="moderateUploads"
              checked={weddingForm.moderateUploads}
              onCheckedChange={(checked) => setWeddingForm(prev => ({ ...prev, moderateUploads: checked }))}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
