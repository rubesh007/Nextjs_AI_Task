import { db } from '@/db';
import { user } from '@/db/schema';

async function main() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const twentyFiveDaysAgo = new Date();
  twentyFiveDaysAgo.setDate(twentyFiveDaysAgo.getDate() - 25);

  const sampleUsers = [
    {
      id: 'user_2abc123def456ghi789jkl', // ✅ matches user.id
      name: 'Sarah Chen',
      email: 'sarah.chen@example.com',
      emailVerified: true, // ✅ boolean required
      image: null,
      createdAt: thirtyDaysAgo, // ✅ must be Date, not string
      updatedAt: thirtyDaysAgo,
    },
    {
      id: 'user_2xyz987wvu654tsr321qpo',
      name: 'Michael Rodriguez',
      email: 'michael.rodriguez@example.com',
      emailVerified: false,
      image: null,
      createdAt: twentyFiveDaysAgo,
      updatedAt: twentyFiveDaysAgo,
    },
  ];

  await db.insert(user).values(sampleUsers);

  console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
  console.error('❌ Seeder failed:', error);
});
