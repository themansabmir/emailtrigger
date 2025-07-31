import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Feedback from '@/models/Feedback';
import Business from '@/models/Business';

// GET /api/feedback/[businessSlug] - Fetch all feedback for a specific business
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();

    const { businessSlug } = params;

    const business = await Business.findOne({ slug: businessSlug, owner: session.user.id });

    if (!business) {
      // This check ensures that the user requesting the feedback is the owner of the business
      return NextResponse.json({ error: 'Business not found or you do not have permission to view it.' }, { status: 404 });
    }

    const feedbacks = await Feedback.find({ business: business._id }).sort({ createdAt: -1 });

    return NextResponse.json({ business, feedbacks }, { status: 200 });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({ error: 'An error occurred while fetching feedback.' }, { status: 500 });
  }
}
