import { db } from "./db";
import { photos } from "../shared/schema";

const demoPhotos = [
  {
    filename: "wedding-ceremony-1.jpg",
    originalName: "Svatební obřad - výměna prstenů",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop",
    approved: true
  },
  {
    filename: "wedding-kiss-2.jpg", 
    originalName: "První polibek jako manželé",
    url: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=300&fit=crop",
    approved: true
  },
  {
    filename: "wedding-rings-3.jpg",
    originalName: "Svatební prsteny na polštářku",
    url: "https://images.unsplash.com/photo-1594241483888-76ad31b7e17a?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1594241483888-76ad31b7e17a?w=400&h=300&fit=crop",
    approved: true
  },
  {
    filename: "wedding-dance-4.jpg",
    originalName: "První tanec",
    url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop",
    approved: true
  },
  {
    filename: "wedding-bouquet-5.jpg",
    originalName: "Nevěstin pugét",
    url: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400&h=300&fit=crop",
    approved: true
  },
  {
    filename: "wedding-venue-6.jpg",
    originalName: "Místo konání slavnosti",
    url: "https://images.unsplash.com/photo-1470905046158-8e04f2e3cbd5?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1470905046158-8e04f2e3cbd5?w=400&h=300&fit=crop",
    approved: true
  },
  {
    filename: "wedding-cake-7.jpg",
    originalName: "Svatební dort",
    url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    approved: true
  },
  {
    filename: "wedding-guests-8.jpg",
    originalName: "Svatební hosté při oslavě",
    url: "https://images.unsplash.com/photo-1519167758481-83f29c8f9b61?w=800&h=600&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1519167758481-83f29c8f9b61?w=400&h=300&fit=crop",
    approved: true
  }
];

export async function seedDemoPhotos() {
  try {
    console.log("🌱 Přidávám demo fotky...");
    
    for (const photo of demoPhotos) {
      await db.insert(photos).values(photo).onConflictDoNothing();
    }
    
    console.log(`✅ Úspěšně přidáno ${demoPhotos.length} demo fotek`);
  } catch (error) {
    console.error("❌ Chyba při přidávání demo fotek:", error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDemoPhotos().then(() => {
    console.log("🎉 Demo fotky byly úspěšně přidány!");
    process.exit(0);
  });
}