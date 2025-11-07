import { db } from '@/db';
import { notes } from '@/db/schema';

async function main() {
  const now = new Date();

  const sampleNotes = [
    {
      userId: '1', // ✅ string
      title: 'Project Ideas',
      content:
        '1. AI-powered study companion app\n2. Local marketplace for sustainable goods\n3. Fitness tracker with social challenges\n4. Smart recipe suggestions based on pantry items\n5. Collaborative music playlist generator',
      tags: ['ideas', 'startup', 'brainstorming', 'projects'],
      createdAt: new Date(now.getTime() - 20 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 20 * 86400000).toISOString(),
    },
    {
      userId: '1', // ✅ string
      title: 'Meeting Notes - Q1 Planning',
      content:
        'Team meeting on January 15th\n\nKey Discussion Points:\n- Product roadmap for Q1...',
      tags: ['meeting', 'planning', 'work', 'team'],
      createdAt: new Date(now.getTime() - 15 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 15 * 86400000).toISOString(),
    },
    {
      userId: '2',
      title: 'Learning Goals 2024',
      content:
        'Personal Development Goals:\n\n1. Learn TypeScript and Next.js...',
      tags: ['goals', 'learning', 'personal', 'development'],
      createdAt: new Date(now.getTime() - 18 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 10 * 86400000).toISOString(),
    },
    {
      userId: '2',
      title: 'Recipe: Pasta Carbonara',
      content:
        'Ingredients:\n- 400g spaghetti\n- 200g guanciale or pancetta\n...',
      tags: ['recipe', 'cooking', 'italian', 'pasta'],
      createdAt: new Date(now.getTime() - 12 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 12 * 86400000).toISOString(),
    },
    {
      userId: '1',
      title: 'Travel Plans - Japan Trip',
      content:
        'Japan Vacation Planning (April 2024)\n\nCities:\n- Tokyo (5 days)...',
      tags: ['travel', 'planning', 'vacation', 'japan'],
      createdAt: new Date(now.getTime() - 8 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
    },
    {
      userId: '2',
      title: 'Book Summary: Atomic Habits',
      content:
        'Key Takeaways from Atomic Habits by James Clear\n\nCore Concepts:',
      tags: ['books', 'productivity', 'habits', 'notes'],
      createdAt: new Date(now.getTime() - 7 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 7 * 86400000).toISOString(),
    },
    {
      userId: '1',
      title: 'Daily Journal - Feb 3',
      content:
        "Reflections from today:\n\nWins:\n- Completed the new feature implementation...",
      tags: ['journal', 'personal', 'reflection', 'daily'],
      createdAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
    },
    {
      userId: '2',
      title: 'Code Snippets - React Hooks',
      content:
        'Useful React Hook Patterns\n\n// Custom hook for localStorage\nfunction useLocalStorage...',
      tags: ['code', 'react', 'javascript', 'programming'],
      createdAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
    },
  ];

  await db.insert(notes).values(sampleNotes);
  console.log('✅ Notes seeder completed successfully');
}

main().catch((error) => {
  console.error('❌ Seeder failed:', error);
});
