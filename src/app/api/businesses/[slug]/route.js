import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Business from '@/models/Business';

// GET /api/businesses/[slug] - Fetch a single business by its slug for public view
export async function GET(req, { params }) {
  try {
    await dbConnect();

    const { slug } = params;

    if (!slug) {
      return NextResponse.json({ error: 'Business slug is required.' }, { status: 400 });
    }

    const business = await Business.findOne({ slug });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Return only the data needed for the public form
    const publicBusinessData = {
      _id: business._id,
      name: business.name,
      logoUrl: business.logoUrl,
    };

    return NextResponse.json(publicBusinessData, { status: 200 });
  } catch (error) {
    console.error('Error fetching business by slug:', error);
    return NextResponse.json({ error: 'An error occurred while fetching the business.' }, { status: 500 });
  }
}
