'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, Download, Star } from 'lucide-react';
import { Parser } from 'json2csv';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from 'react';

async function fetchFeedbackForBusiness(slug) {
  const res = await fetch(`/api/feedback/${slug}`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to fetch feedback');
  }
  return res.json();
}

const StarDisplay = ({ rating }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ))}
  </div>
);

export default function FeedbackViewerPage() {
  const params = useParams();
  const router = useRouter();
  const { slug } = params;
  const [ratingFilter, setRatingFilter] = useState('all');

  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/');
    },
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['feedback', slug],
    queryFn: () => fetchFeedbackForBusiness(slug),
    enabled: !!slug && status === 'authenticated',
  });

  const filteredFeedbacks = data?.feedbacks?.filter(fb =>
    ratingFilter === 'all' || fb.rating === parseInt(ratingFilter, 10)
  ) || [];

  if (isLoading || status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading feedback...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">Error: {error.message}</div>;
  }

  const { business } = data || {};

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-800">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{business?.name}</CardTitle>
          <div className="flex justify-between items-center pt-1">
            <CardDescription>
              Here is the feedback submitted by your customers.
            </CardDescription>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="rating-filter" className="text-sm font-normal">Filter by rating</Label>
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger id="rating-filter" className="w-[180px]">
                    <SelectValue placeholder="Filter by rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                onClick={() => exportToCsv(filteredFeedbacks, business?.name)}
                disabled={filteredFeedbacks.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Date</TableHead>
                <TableHead className="w-[120px]">Rating</TableHead>
                <TableHead>Comment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeedbacks.length > 0 ? (
                filteredFeedbacks.map((fb) => (
                  <TableRow key={fb._id}>
                    <TableCell className="font-medium">
                      {new Date(fb.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <StarDisplay rating={fb.rating} />
                    </TableCell>
                    <TableCell className="text-gray-600">{fb.comment || <span className="text-gray-400">-</span>}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="3" className="h-24 text-center">
                    No feedback found for the selected filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
