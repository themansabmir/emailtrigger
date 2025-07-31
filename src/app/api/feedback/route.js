import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Feedback from '@/models/Feedback';
import Business from '@/models/Business'; // Needed to verify business existence

export async function POST(req) {
  try {
    await dbConnect();

    const { rating, comment, businessId } = await req.json();

    if (!rating || !businessId) {
      return NextResponse.json({ error: 'Rating and businessId are required.' }, { status: 400 });
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be a number between 1 and 5.' }, { status: 400 });
    }

    // Verify that the business exists
    const business = await Business.findById(businessId);
    if (!business) {
      return NextResponse.json({ error: 'Business not found.' }, { status: 404 });
    }

    const feedback = await Feedback.create({
      rating,
      comment,
      business: businessId,
    });

    return NextResponse.json({ message: 'Feedback submitted successfully!' }, { status: 201 });
  } catch (error) {
    console.error('Error creating feedback:', error);
    // Provide a more generic error message to the client
    return NextResponse.json({ error: 'An error occurred while submitting feedback.' }, { status: 500 });
  }
}
