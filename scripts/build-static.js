
import fs from 'fs';
import fetch from 'node-fetch';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

async function buildStaticData() {
  try {
    console.log('Fetching data for static build...');
    
    // Fetch all data from API
    const [weddingDetails, photos, schedule, playlist] = await Promise.all([
      fetch(`${API_BASE_URL}/api/wedding-details`).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/photos?approved=true`).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/schedule`).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/playlist`).then(r => r.json())
    ]);

    // Create static data file
    const staticData = {
      weddingDetails,
      photos,
      schedule,
      playlist,
      buildTime: new Date().toISOString()
    };

    // Ensure client/src/data directory exists
    if (!fs.existsSync('client/src/data')) {
      fs.mkdirSync('client/src/data', { recursive: true });
    }

    // Write to static data file
    fs.writeFileSync(
      'client/src/data/static-data.json',
      JSON.stringify(staticData, null, 2)
    );

    console.log('✅ Static data generated successfully');
  } catch (error) {
    console.error('❌ Failed to generate static data:', error);
    process.exit(1);
  }
}

buildStaticData();
