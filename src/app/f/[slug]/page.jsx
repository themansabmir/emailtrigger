'use client';

import { useState } from 'react';
import { useQuery, useMutation, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

// It's good practice to create a new QueryClient instance for each page
// if you're not using a global provider, but since we have a global one,
// this is just for demonstration if this page were standalone.
const queryClient = new QueryClient();

async function fetchBusinessBySlug(slug) {
  const res = await fetch(`/api/businesses/${slug}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error('Business not found');
    throw new Error('Could not fetch business details.');
  }
  return res.json();
}

async function submitFeedback({ rating, comment, businessId }) {
  const res = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating, comment, businessId }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to submit feedback');
  }
  return res.json();
}

const StarRating = ({ rating, setRating, disabled }) => {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-10 w-10 ${disabled ? 'cursor-default' : 'cursor-pointer'} ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          onClick={() => !disabled && setRating(star)}
        />
      ))}
    </div>
  );
};

function FeedbackForm() {
  const params = useParams();
  const { slug } = params;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const { data: business, isLoading, error } = useQuery({
    queryKey: ['business', slug],
    queryFn: () => fetchBusinessBySlug(slug),
    enabled: !!slug,
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: submitFeedback,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating before submitting.');
      return;
    }
    mutation.mutate({ rating, comment, businessId: business._id });
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading form...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen text-red-500 font-semibold">Error: {error.message}</div>;

  if (mutation.isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md text-center p-8">
          <CardHeader>
            <CardTitle className="text-2xl">Thank You!</CardTitle>
            <CardDescription className="pt-2">Your feedback has been submitted successfully.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {business?.logoUrl && <img src={business.logoUrl} alt={`${business.name} logo`} className="mx-auto h-16 w-16 mb-4 rounded-full object-cover" />}
          <CardTitle className="text-2xl">{business?.name}</CardTitle>
          <CardDescription className="pt-2">We&apos;d love to hear your feedback!</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-3 text-center">
              <Label className="font-semibold">How would you rate your experience?</Label>
              <div className="flex justify-center">
                <StarRating rating={rating} setRating={setRating} disabled={mutation.isLoading} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="comment">Any comments? (Optional)</Label>
              <Textarea
                id="comment"
                placeholder="Tell us more about your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={mutation.isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={mutation.isLoading || rating === 0}>
              {mutation.isLoading ? 'Submitting...' : 'Submit Feedback'}
            </Button>
            {mutation.isError && <p className="text-red-500 text-sm text-center">{mutation.error.message}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Wrap the page in its own QueryClientProvider
export default function FeedbackPageWrapper() {
    return (
        <QueryClientProvider client={queryClient}>
            <FeedbackForm />
        </QueryClientProvider>
    )
}
