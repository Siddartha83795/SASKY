'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OutletCard from '@/components/outlet-card';
import { outlets as mockOutlets } from '@/lib/data';
import type { Outlet } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function OutletsPage() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate fetching data
    const timer = setTimeout(() => {
      setOutlets(mockOutlets);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const renderSkeletons = () => (
    [...Array(3)].map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-6 w-3/4 mt-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    ))
  );
  
  return (
    <div className="container py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground sm:text-5xl">
          Choose an Outlet
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Select a cafeteria to continue.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? renderSkeletons() : (
          outlets.map((outlet) => (
            <OutletCard key={outlet.id} outlet={outlet} />
          ))
        )}
      </div>
    </div>
  );
}
