import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkResponses() {
  try {
    const responses = await prisma.surveyResponse.findMany({
      include: {
        answers: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('\n=== DATABASE CHECK ===\n');
    console.log(`Total Survey Responses: ${responses.length}\n`);

    if (responses.length === 0) {
      console.log('No responses found in the database.');
    } else {
      responses.forEach((response, index) => {
        console.log(`Response #${index + 1}:`);
        console.log(`  ID: ${response.id}`);
        console.log(`  Session ID: ${response.sessionId}`);
        console.log(`  Deployment ID: ${response.deploymentId}`);
        console.log(`  Completed At: ${response.completedAt}`);
        console.log(`  Created At: ${response.createdAt}`);
        console.log(`  Total Answers: ${response.answers.length}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('Error querying database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkResponses();
