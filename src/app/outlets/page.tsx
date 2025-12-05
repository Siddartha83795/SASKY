'use client';

import { useMemo } from 'react';
import OutletCard from '@/components/outlet-card';
import type { Outlet, UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useDoc, useFirebase, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';

export default function OutletsPage() {
  const { firestore } = useFirebase();
  const { user: authUser } = useUser();
  
  const outletsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'outlets');
  }, [firestore]);

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [firestore, authUser]);

  const { data: outlets, isLoading: areOutletsLoading } = useCollection<Outlet>(outletsQuery);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const isLoading = areOutletsLoading || isProfileLoading;

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
          outlets?.map((outlet) => (
            <OutletCard key={outlet.id} outlet={outlet} userRole={userProfile?.role || 'client'} />
          ))
        )}
      </div>
    </div>
  );
}
