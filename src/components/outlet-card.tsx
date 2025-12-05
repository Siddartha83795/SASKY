
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Outlet } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type OutletCardProps = {
  outlet: Outlet;
  userRole: 'client' | 'staff';
};

export default function OutletCard({ outlet, userRole }: OutletCardProps) {
  const image = PlaceHolderImages.find((img) => img.id === outlet.imageId);
  
  const href = userRole === 'staff' 
    ? `/staff/dashboard/${outlet.id}` 
    : `/menu/${outlet.id}`;

  return (
    <Link href={href} className="group block">
      <Card className="h-full overflow-hidden transition-all duration-300 group-hover:border-primary group-hover:shadow-lg">
        <div className="relative h-48 w-full">
          {image && (
            <Image
              src={image.imageUrl}
              alt={image.description}
              fill
              className="object-cover transition-transform duration-in-out group-hover:scale-105"
              data-ai-hint={image.imageHint}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
           {!outlet.isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <span className="rounded-full bg-destructive px-3 py-1 text-sm font-medium text-destructive-foreground">CLOSED</span>
            </div>
          )}
        </div>
        <CardHeader>
          <CardTitle className="font-headline">{outlet.name}</CardTitle>
          <CardDescription>{outlet.description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
