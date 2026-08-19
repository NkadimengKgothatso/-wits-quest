import { supabase } from '../db/supabaseClient.js';
import bcrypt from 'bcrypt';

interface AccountConfig {
  studentNum: string;
  email: string;
  name: string;
  violationType: string;
  pings: Array<{ lat: number; lng: number; offsetSeconds: number }>;
}

const accounts: AccountConfig[] = [
  {
    studentNum: '12345',
    email: '0012345@students.wits.ac.za',
    name: 'Sipho 12345',
    violationType: 'Teleport: Great Hall to Science Stadium (600m in 2s)',
    pings: [
      { lat: -26.192177, lng: 28.030361, offsetSeconds: -10 }, // Great Hall
      { lat: -26.190666, lng: 28.025231, offsetSeconds: -8 },  // Science Stadium
    ],
  },
  {
    studentNum: '000000',
    email: '0000000@students.wits.ac.za',
    name: 'Zero 000000',
    violationType: 'Speed Violation: Humphrey Raikes to School of Arts (25 m/s)',
    pings: [
      { lat: -26.192095, lng: 28.031279, offsetSeconds: -20 }, // Humphrey Raikes
      { lat: -26.192037, lng: 28.032449, offsetSeconds: -15 }, // Wits School of the Arts (~120m in 5s)
    ],
  },
  {
    studentNum: '78908',
    email: '0078908@students.wits.ac.za',
    name: 'Thabo 78908',
    violationType: 'Mega Teleport: Origins Centre to Sturrock Park (800m in 2s)',
    pings: [
      { lat: -26.192977, lng: 28.028291, offsetSeconds: -30 }, // Origins Centre
      { lat: -26.193192, lng: 28.021073, offsetSeconds: -28 }, // Sturrock Park (~800m in 2s)
    ],
  },
  {
    studentNum: '568773',
    email: '0568773@students.wits.ac.za',
    name: 'Kagiso 568773',
    violationType: 'High Speed Run: Kambule to Matrix (38 m/s)',
    pings: [
      { lat: -26.190468, lng: 28.026841, offsetSeconds: -45 }, // TW Kambule
      { lat: -26.189616, lng: 28.030808, offsetSeconds: -35 }, // The Matrix (~420m in 10s)
    ],
  },
  {
    studentNum: '675643',
    email: '0675643@students.wits.ac.za',
    name: 'Lerato 675643',
    violationType: 'Double Teleport: Flower Hall -> Great Hall -> Tower of Light',
    pings: [
      { lat: -26.191733, lng: 28.026209, offsetSeconds: -60 }, // Flower Hall
      { lat: -26.192177, lng: 28.030361, offsetSeconds: -58 }, // Great Hall (~450m in 2s)
      { lat: -26.189780, lng: 28.025945, offsetSeconds: -56 }, // Tower of Light (~520m in 2s)
    ],
  },
];

async function seedAndPing() {
  console.log('🚀 Creating 5 student accounts and generating anti-cheat violations...\n');

  const passwordHash = await bcrypt.hash('password123', 10);
  const baseTime = Date.now();

  for (const acc of accounts) {
    const userId = `usr_${acc.studentNum.padStart(7, '0')}`;
    const now = new Date().toISOString();

    // 1. Create or upsert user
    const { error: userError } = await supabase.from('users').upsert(
      {
        id: userId,
        email: acc.email,
        studentNumber: acc.studentNum,
        username: acc.name.replace(/\s+/g, '_'),
        passwordHash,
        role: 'STUDENT',
        level: 1,
        currentXP: 0,
        totalXP: 0,
        essenceBalance: 100,
        dailyStreakCount: 1,
        lastCheckInDate: now,
        streakMultiplier: 1.0,
        eloRating: 1000,
        divisionTier: 'GOLD',
        pvpWins: 0,
        pvpLosses: 0,
        pvpDraws: 0,
        maxStatBudget: 300,
        legendaryCap: 1,
        avatar: 'owl',
        createdAt: now,
        updatedAt: now,
      },
      { onConflict: 'email' }
    );

    if (userError) {
      console.error(`❌ Failed to create user ${acc.email}:`, userError);
      continue;
    }

    console.log(`✅ User created/updated: ${acc.name} (${acc.email}) [${userId}]`);

    // 2. Insert telemetry pings
    const pingRecords = acc.pings.map((p) => ({
      user_id: userId,
      lat: p.lat,
      lng: p.lng,
      timestamp: new Date(baseTime + p.offsetSeconds * 1000).toISOString(),
    }));

    const { error: pingError } = await supabase.from('telemetry_pings').insert(pingRecords);

    if (pingError) {
      console.error(`❌ Failed to insert pings for ${acc.name}:`, pingError);
    } else {
      console.log(`   📍 Flagged with: ${acc.violationType} (${pingRecords.length} pings)`);
    }
  }

  console.log('\n🎉 Done! Check the Admin Anti-Cheat dashboard to inspect and moderate the violations.');
}

seedAndPing().catch(console.error);
