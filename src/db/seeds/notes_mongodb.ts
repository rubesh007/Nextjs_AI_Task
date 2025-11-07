import { db } from '@/db';
import { notes } from '@/db/schema';

async function main() {
  const now = new Date();
  const daysAgo = (days: number) =>
    new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const sampleNotes = [
    {
      userId: 'user_abc123',
      title: 'Project Ideas',
      content:
        'Brainstorming session for new startup ideas:\n\n1. AI-powered study assistant for students\n2. Collaborative meal planning app for families\n3. Sustainable fashion marketplace\n4. Remote team building platform\n\nNext steps: Research market size and competition for each idea. Schedule follow-up meeting to discuss feasibility.',
      tags: ['ideas', 'startup'],
      createdAt: daysAgo(20).toISOString(),
      updatedAt: daysAgo(20).toISOString(),
    },
    {
      userId: 'user_xyz789',
      title: 'Meeting Notes - Q1 Planning',
      content:
        'Q1 2024 Planning Session - January 15, 2024\n\nAttendees: Sarah, Mike, Jessica, Tom\n\nKey Decisions:\n- Launch new feature by end of February\n- Increase marketing budget by 20%\n- Hire 2 new developers\n- Focus on customer retention\n\nAction Items:\n- Sarah: Prepare product roadmap (Due: Jan 22)\n- Mike: Review budget allocation (Due: Jan 20)\n- Jessica: Draft job descriptions (Due: Jan 25)',
      tags: ['meeting', 'work'],
      createdAt: daysAgo(15).toISOString(),
      updatedAt: daysAgo(15).toISOString(),
    },
    {
      userId: 'user_abc123',
      title: 'Learning Goals 2024',
      content:
        'My learning objectives for this year:\n\n📚 Technical Skills:\n- Master TypeScript advanced patterns\n- Learn system design principles\n- Complete AWS certification\n\n🎨 Creative Skills:\n- UI/UX design fundamentals\n- Figma proficiency\n\n💼 Soft Skills:\n- Public speaking course\n- Leadership training\n\nTimeline: Dedicate 10 hours per week. Review progress monthly.',
      tags: ['goals', 'learning'],
      createdAt: daysAgo(12).toISOString(),
      updatedAt: daysAgo(12).toISOString(),
    },
    {
      userId: 'user_xyz789',
      title: 'Recipe: Pasta Carbonara',
      content:
        'Authentic Italian Carbonara Recipe\n\nIngredients:\n- 400g spaghetti\n- 200g guanciale (or pancetta)\n- 4 egg yolks + 1 whole egg\n- 100g Pecorino Romano cheese\n- Black pepper\n- Salt\n\nInstructions:\n1. Cook pasta in salted boiling water\n2. Cube and fry guanciale until crispy\n3. Mix eggs and cheese in bowl\n4. Combine hot pasta with guanciale\n5. Remove from heat, add egg mixture\n6. Toss quickly, add pasta water if needed\n7. Serve with extra cheese and pepper\n\nTips: Never add cream! Use pasta water to create silky sauce.',
      tags: ['recipe', 'cooking'],
      createdAt: daysAgo(8).toISOString(),
      updatedAt: daysAgo(8).toISOString(),
    },
    {
      userId: 'user_abc123',
      title: 'Travel Plans - Japan Trip',
      content:
        'Japan Itinerary - Spring 2024 (14 days)\n\nTokyo (5 days):\n- Shibuya, Harajuku, Shinjuku\n- TeamLab Borderless Museum\n- Tsukiji Fish Market\n- Day trip to Mount Fuji\n\nKyoto (4 days):\n- Fushimi Inari Shrine\n- Arashiyama Bamboo Grove\n- Traditional tea ceremony\n- Geisha district walking tour\n\nOsaka (3 days):\n- Dotonbori food street\n- Osaka Castle\n- Universal Studios Japan\n\nNara (2 days):\n- Deer park\n- Todai-ji Temple\n\nBudget: $4,000 per person\nAccommodation: Mix of hotels and ryokans',
      tags: ['travel', 'planning'],
      createdAt: daysAgo(5).toISOString(),
      updatedAt: daysAgo(3).toISOString(),
    },
    {
      userId: 'user_xyz789',
      title: 'Book Summary: Atomic Habits',
      content:
        'Key Takeaways from "Atomic Habits" by James Clear\n\n🎯 Core Concepts:\n1. Focus on systems, not goals\n2. Identity-based habits\n3. 1% better every day compounds\n\n📊 The Four Laws:\n1. Make it Obvious (Cue)\n2. Make it Attractive (Craving)\n3. Make it Easy (Response)\n4. Make it Satisfying (Reward)\n\n💡 Implementation Ideas:\n- Habit stacking: After [current habit], I will [new habit]\n- Environment design: Remove friction for good habits\n- Two-minute rule: Start with tiny versions\n\nPersonal Application:\n- Morning routine: Wake up → Make bed → Meditate 2 min\n- Reading: Keep book on nightstand\n- Exercise: Lay out gym clothes night before',
      tags: ['books', 'productivity'],
      createdAt: daysAgo(4).toISOString(),
      updatedAt: daysAgo(4).toISOString(),
    },
    {
      userId: 'user_abc123',
      title: "Daily Journal",
      content:
        "Today's Reflections - A Great Day!\n\n🌟 Wins:\n- Completed the project presentation\n- Had a productive team meeting\n- Finished morning run (5km)\n- Cooked healthy dinner\n\n💭 Thoughts:\nFeeling grateful for the support from my colleagues. The presentation went better than expected. Client seemed very interested in our proposal.\n\n📝 Tomorrow's Priorities:\n1. Follow up with client\n2. Review code PR from team\n3. Plan weekend activities\n4. Call mom\n\n😊 Mood: Energized and optimistic\n\nGratitude: Family, health, meaningful work",
      tags: ['journal', 'personal'],
      createdAt: daysAgo(1).toISOString(),
      updatedAt: daysAgo(1).toISOString(),
    },
    {
      userId: 'user_xyz789',
      title: 'Code Snippets - React Hooks',
      content:
        'Useful React Hooks Patterns\n\n1. Custom useDebounce Hook:\n\nfunction useDebounce<T>(value: T, delay: number): T {\n  const [debouncedValue, setDebouncedValue] = useState(value);\n  useEffect(() => {\n    const timer = setTimeout(() => { setDebouncedValue(value); }, delay);\n    return () => clearTimeout(timer);\n  }, [value, delay]);\n  return debouncedValue;\n}\n\n2. useLocalStorage Hook:\n\nfunction useLocalStorage<T>(key: string, initialValue: T) {\n  const [value, setValue] = useState<T>(() => {\n    const item = localStorage.getItem(key);\n    return item ? JSON.parse(item) : initialValue;\n  });\n  useEffect(() => {\n    localStorage.setItem(key, JSON.stringify(value));\n  }, [key, value]);\n  return [value, setValue] as const;\n}\n',
      tags: ['code', 'react'],
      createdAt: daysAgo(2).toISOString(),
      updatedAt: daysAgo(1).toISOString(),
    },
  ];

  // ✅ Insert into SQLite/Postgres via Drizzle
  await db.insert(notes).values(sampleNotes);
  console.log('✅ Notes seeder completed successfully');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  });
