import { db } from "./db";
import { gameChallenges, gameAchievements } from "@shared/schema";

const defaultChallenges = [
  // Photo Challenges
  {
    title: "První svatební foto",
    description: "Nahrajte svou první fotku ze svatby",
    category: "photo",
    difficultyLevel: 1,
    pointsReward: 20,
    badgeIcon: "📸",
    isActive: true,
    requiresApproval: false,
    maxCompletions: 1,
  },
  {
    title: "Selfie s novomanželi",
    description: "Vyfotěte se s nevěstou a ženichem",
    category: "photo",
    difficultyLevel: 2,
    pointsReward: 30,
    badgeIcon: "🤳",
    isActive: true,
    requiresApproval: true,
    maxCompletions: 1,
  },
  {
    title: "Fotograf roku",
    description: "Nahrajte 5 krásných svatebních fotek",
    category: "photo",
    difficultyLevel: 3,
    pointsReward: 50,
    badgeIcon: "📷",
    isActive: true,
    requiresApproval: false,
    maxCompletions: 1,
  },
  
  // Social Challenges
  {
    title: "První komentář",
    description: "Napište svůj první komentář k fotce",
    category: "social",
    difficultyLevel: 1,
    pointsReward: 10,
    badgeIcon: "💬",
    isActive: true,
    requiresApproval: false,
    maxCompletions: 1,
  },
  {
    title: "Sociální motýl",
    description: "Pochvalte si 10 fotek od ostatních hostů",
    category: "social",
    difficultyLevel: 2,
    pointsReward: 25,
    badgeIcon: "❤️",
    isActive: true,
    requiresApproval: false,
    maxCompletions: 1,
  },
  {
    title: "Svatební influencer",
    description: "Získejte 20 lajků na své fotky",
    category: "social",
    difficultyLevel: 4,
    pointsReward: 40,
    badgeIcon: "🌟",
    isActive: true,
    requiresApproval: false,
    maxCompletions: 1,
  },

  // Activity Challenges
  {
    title: "DJ asistent",
    description: "Navrhněte písničku do svatebního playlistu",
    category: "activity",
    difficultyLevel: 1,
    pointsReward: 15,
    badgeIcon: "🎵",
    isActive: true,
    requiresApproval: false,
    maxCompletions: 3,
  },
  {
    title: "Tanečník večera",
    description: "Zatančete si na parketu (vyfotěte důkaz)",
    category: "activity",
    difficultyLevel: 2,
    pointsReward: 25,
    badgeIcon: "💃",
    isActive: true,
    requiresApproval: true,
    maxCompletions: 1,
  },
  {
    title: "Svatební řečník",
    description: "Přednesite přípitek nebo projev",
    category: "activity",
    difficultyLevel: 3,
    pointsReward: 40,
    badgeIcon: "🗣️",
    isActive: true,
    requiresApproval: true,
    maxCompletions: 1,
  },

  // Discovery Challenges
  {
    title: "Detektiv květin",
    description: "Najděte a vyfotěte všechny druhy květin na svatbě",
    category: "discovery",
    difficultyLevel: 3,
    pointsReward: 35,
    badgeIcon: "🌸",
    isActive: true,
    requiresApproval: true,
    maxCompletions: 1,
  },
  {
    title: "Svatební poklad",
    description: "Najděte skrytý svatební detail (možná prsteny?)",
    category: "discovery",
    difficultyLevel: 4,
    pointsReward: 50,
    badgeIcon: "💍",
    isActive: true,
    requiresApproval: true,
    maxCompletions: 1,
  },
  {
    title: "Čestný host",
    description: "Najděte a poznejte všechny členy svatebního party",
    category: "discovery",
    difficultyLevel: 2,
    pointsReward: 30,
    badgeIcon: "👥",
    isActive: true,
    requiresApproval: true,
    maxCompletions: 1,
  },

  // Fun Challenges
  {
    title: "Foto koutek mistr",
    description: "Použijte foto koutek a nahrajte vtipnou fotku",
    category: "photo",
    difficultyLevel: 1,
    pointsReward: 20,
    badgeIcon: "🎭",
    isActive: true,
    requiresApproval: false,
    maxCompletions: 1,
  },
  {
    title: "Svatební básník",
    description: "Napište krátkou báseň o novomanželích",
    category: "social",
    difficultyLevel: 3,
    pointsReward: 35,
    badgeIcon: "📝",
    isActive: true,
    requiresApproval: true,
    maxCompletions: 1,
  },
  {
    title: "Věčný optimista",
    description: "Napište 5 pozitivních komentářů k různým fotkám",
    category: "social",
    difficultyLevel: 2,
    pointsReward: 20,
    badgeIcon: "😊",
    isActive: true,
    requiresApproval: false,
    maxCompletions: 1,
  },

  // Special Challenges
  {
    title: "Křestní host",
    description: "Buďte mezi prvními 5 hosty, kteří se zaregistrují do hry",
    category: "activity",
    difficultyLevel: 1,
    pointsReward: 25,
    badgeIcon: "🥇",
    isActive: true,
    requiresApproval: false,
    maxCompletions: 5,
  },
  {
    title: "Svatební maratón",
    description: "Splňte 10 různých výzev během svatby",
    category: "activity",
    difficultyLevel: 5,
    pointsReward: 100,
    badgeIcon: "🏆",
    isActive: true,
    requiresApproval: false,
    maxCompletions: 1,
  }
];

const defaultAchievements = [
  {
    title: "Rychlá ruka",
    description: "První host, který nahrál fotku",
    badgeIcon: "⚡",
    badgeColor: "#FFD700",
    requirements: JSON.stringify({ firstPhotoUpload: true }),
    pointsReward: 50,
    isSecret: false,
    category: "speed",
  },
  {
    title: "Společenský typ",
    description: "Napsal komentář k 10 různým fotkám",
    badgeIcon: "🗨️",
    badgeColor: "#FF6B6B",
    requirements: JSON.stringify({ commentCount: 10 }),
    pointsReward: 30,
    isSecret: false,
    category: "social",
  },
  {
    title: "Hlavní hvězda",
    description: "Získal 50 lajků na své fotky",
    badgeIcon: "⭐",
    badgeColor: "#4ECDC4",
    requirements: JSON.stringify({ totalLikesReceived: 50 }),
    pointsReward: 75,
    isSecret: false,
    category: "popularity",
  },
  {
    title: "Svatební legendář",
    description: "Splnil všechny dostupné výzvy",
    badgeIcon: "👑",
    badgeColor: "#9B59B6",
    requirements: JSON.stringify({ allChallengesCompleted: true }),
    pointsReward: 200,
    isSecret: true,
    category: "completion",
  },
  {
    title: "Tanečník roku",
    description: "Zatančil si na parketu",
    badgeIcon: "💃",
    badgeColor: "#E74C3C",
    requirements: JSON.stringify({ dancingChallenge: true }),
    pointsReward: 40,
    isSecret: false,
    category: "activity",
  },
  {
    title: "Svatební fotograf",
    description: "Nahrál více než 20 fotek",
    badgeIcon: "📸",
    badgeColor: "#3498DB",
    requirements: JSON.stringify({ photoCount: 20 }),
    pointsReward: 60,
    isSecret: false,
    category: "photo",
  },
  {
    title: "DJ náhradník",
    description: "Navrhl 5 písniček do playlistu",
    badgeIcon: "🎧",
    badgeColor: "#F39C12",
    requirements: JSON.stringify({ playlistSuggestions: 5 }),
    pointsReward: 45,
    isSecret: false,
    category: "music",
  },
  {
    title: "Neúnavný objevitel",
    description: "Splnil všechny discovery výzvy",
    badgeIcon: "🔍",
    badgeColor: "#2ECC71",
    requirements: JSON.stringify({ allDiscoveryCompleted: true }),
    pointsReward: 80,
    isSecret: true,
    category: "discovery",
  }
];

export async function seedGameChallenges() {
  try {
    console.log("🎮 Seeding game challenges...");
    
    // Check if challenges already exist
    const existingChallenges = await db.select().from(gameChallenges).limit(1);
    
    if (existingChallenges.length === 0) {
      console.log("📝 Creating default challenges...");
      await db.insert(gameChallenges).values(defaultChallenges);
      console.log(`✅ Created ${defaultChallenges.length} default challenges`);
    } else {
      console.log("ℹ️ Challenges already exist, skipping...");
    }

    // Check if achievements already exist
    const existingAchievements = await db.select().from(gameAchievements).limit(1);
    
    if (existingAchievements.length === 0) {
      console.log("🏆 Creating default achievements...");
      await db.insert(gameAchievements).values(defaultAchievements);
      console.log(`✅ Created ${defaultAchievements.length} default achievements`);
    } else {
      console.log("ℹ️ Achievements already exist, skipping...");
    }

    console.log("🎉 Game seeding completed!");
    
  } catch (error) {
    console.error("❌ Error seeding game challenges:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedGameChallenges()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}