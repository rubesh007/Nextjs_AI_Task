import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, account } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const userId = searchParams.get('userId');

    // Validate that at least one parameter is provided
    if (!email && !userId) {
      return NextResponse.json(
        { 
          error: 'email or userId parameter required',
          code: 'MISSING_PARAMETER' 
        },
        { status: 400 }
      );
    }

    // Look up user by email or userId
    let userRecord;
    if (email) {
      const users = await db.select().from(user).where(eq(user.email, email)).limit(1);
      userRecord = users[0];
    } else if (userId) {
      const users = await db.select().from(user).where(eq(user.id, userId)).limit(1);
      userRecord = users[0];
    }

    // Check if user was found
    if (!userRecord) {
      return NextResponse.json(
        { 
          error: 'User not found',
          code: 'USER_NOT_FOUND',
          searchedBy: email ? { email } : { userId }
        },
        { status: 404 }
      );
    }

    // Get all accounts for this user
    const accounts = await db.select().from(account).where(eq(account.userId, userRecord.id));

    // Format accounts to show hasPassword instead of actual password hash
    const formattedAccounts = accounts.map(acc => ({
      id: acc.id,
      accountId: acc.accountId,
      providerId: acc.providerId,
      hasPassword: acc.password !== null && acc.password !== undefined,
      createdAt: acc.createdAt,
      updatedAt: acc.updatedAt
    }));

    // Return comprehensive diagnostic information
    return NextResponse.json({
      user: {
        id: userRecord.id,
        email: userRecord.email,
        name: userRecord.name,
        emailVerified: userRecord.emailVerified,
        image: userRecord.image,
        createdAt: userRecord.createdAt,
        updatedAt: userRecord.updatedAt
      },
      accounts: formattedAccounts,
      accountCount: formattedAccounts.length
    });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}