#!/usr/bin/env node

/**
 * Seed script for loading sample responses into the runtime database
 *
 * This script loads sample responses from data/seed-data.json (if it exists)
 * into the database. It's idempotent - can be run multiple times safely.
 *
 * Usage:
 *   node scripts/seed.mjs
 *   npm run seed
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function seed() {
  const seedPath = path.join(process.cwd(), 'data', 'seed-data.json');

  // Check if seed data exists
  if (!fs.existsSync(seedPath)) {
    console.log('ℹ️  No sample data found (data/seed-data.json) - skipping seed');
    return;
  }

  console.log('🌱 Loading sample data...\n');

  try {
    const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
    const deploymentId = process.env.DEPLOYMENT_ID || null;

    if (!seedData.responses || !Array.isArray(seedData.responses)) {
      console.error('❌ Invalid seed data format');
      return;
    }

    console.log(`Found ${seedData.responses.length} sample responses`);
    console.log(`Deployment ID: ${deploymentId || 'none (development mode)'}\n`);

    let seeded = 0;
    let skipped = 0;

    for (const response of seedData.responses) {
      // Check if already seeded (by sessionId - unique constraint)
      const exists = await prisma.surveyResponse.findUnique({
        where: { sessionId: response.sessionId },
      });

      if (exists) {
        skipped++;
        continue;
      }

      // Create response with answers
      await prisma.surveyResponse.create({
        data: {
          sessionId: response.sessionId,
          deploymentId: deploymentId,
          respondentName: response.respondentName || null,
          metadata: response.metadata || null,
          completedAt: new Date(response.completedAt),
          answers: {
            create: response.answers.map(answer => ({
              blockId: answer.blockId,
              answer: answer.answer,
            })),
          },
        },
      });

      seeded++;
    }

    console.log('✅ Sample data loaded successfully!');
    console.log(`   Seeded: ${seeded}`);
    console.log(`   Skipped (already exists): ${skipped}`);
    console.log(`\nDashboard available at: http://localhost:3000/dashboard\n`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}

seed()
  .catch((error) => {
    console.error('Failed to seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
