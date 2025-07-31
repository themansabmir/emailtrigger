import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Business from '@/models/Business';
import { nanoid } from 'nanoid';

// GET /api/businesses - Fetch all businesses for the logged-in user
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();

    const businesses = await Business.find({ owner: session.user.id }).sort({ createdAt: -1 });

    return NextResponse.json(businesses, { status: 200 });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json({ error: 'An error occurred while fetching businesses.' }, { status: 500 });
  }
}

// POST /api/businesses - Create a new business
export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Business name is required.' }, { status: 400 });
    }

    const business = await Business.create({
      name,
      owner: session.user.id,
      slug: nanoid(10), // Generate a 10-character unique slug
    });

    return NextResponse.json(business, { status: 201 });
  } catch (error) {
    console.error('Error creating business:', error);
    return NextResponse.json({ error: 'An error occurred while creating the business.' }, { status: 500 });
  }
}
