'use client';

'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { AddBusinessModal } from '@/components/AddBusinessModal';
import { QRCodeModal } from '@/components/QRCodeModal';

async function fetchBusinesses() {
  const res = await fetch('/api/businesses');
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  return res.json();
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  const { data: businesses, isLoading, error } = useQuery({
    queryKey: ['businesses'],
    queryFn: fetchBusinesses,
    enabled: status === 'authenticated', // Only fetch if authenticated
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  if (status === 'loading' || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (status === 'authenticated') {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{session.user.email}</span>
            <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
          </div>
        </header>
        <main>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Your Businesses</h2>
            <AddBusinessModal />
          </div>

          {error && <p className="text-red-500">Error fetching businesses: {error.message}</p>}

          {businesses && businesses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {businesses.map((business) => (
                <Card key={business._id}>
                  <CardHeader>
                    <CardTitle>{business.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div
                      className="flex justify-center p-4 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100"
                      onClick={() => setSelectedBusiness(business)}
                    >
                      <QRCodeSVG value={`${window.location.origin}/f/${business.slug}`} size={128} />
                    </div>
                    <p className="text-sm text-gray-500 text-center truncate">
                      Link: <Link href={`/f/${business.slug}`} className="underline" target="_blank" rel="noopener noreferrer">{`/f/${business.slug}`}</Link>
                    </p>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/business/${business.slug}`} className="flex-1">
                        <Button variant="outline" className="w-full">View Feedback</Button>
                      </Link>
                      <Button variant="secondary" className="flex-1" onClick={() => setSelectedBusiness(business)}>View QR Code</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <h3 className="text-xl font-medium">No businesses yet</h3>
              <p className="text-gray-500 mt-2 mb-4">Click "Add Business" to get started.</p>
            </div>
          )}
        </main>
        <QRCodeModal
          business={selectedBusiness}
          open={!!selectedBusiness}
          onOpenChange={(isOpen) => !isOpen && setSelectedBusiness(null)}
        />
      </div>
    );
  }

  return null;
}
