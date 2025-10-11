/**
 * Test Prisma Client Connection
 * Quick script to verify Prisma can connect and query the database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function main() {
  console.log('🔍 Testing Prisma Client connection...\n');
  
  try {
    // Test 1: Simple query
    console.log('Test 1: Counting users...');
    const userCount = await prisma.users.count();
    console.log(`✅ Found ${userCount} users\n`);
    
    // Test 2: Fetch first 3 users
    console.log('Test 2: Fetching first 3 users...');
    const users = await prisma.users.findMany({
      take: 3,
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
      },
    });
    console.log(`✅ Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });
    console.log('');
    
    // Test 3: Count exams
    console.log('Test 3: Counting exams...');
    const examCount = await prisma.exams.count();
    console.log(`✅ Found ${examCount} exams\n`);
    
    // Test 4: Count questions
    console.log('Test 4: Counting questions...');
    const questionCount = await prisma.question.count();
    console.log(`✅ Found ${questionCount} questions\n`);
    
    console.log('🎉 All tests passed! Prisma Client is working correctly.');
    
  } catch (error) {
    console.error('❌ Error testing Prisma Client:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

