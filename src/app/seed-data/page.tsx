'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { outlets, menuItems } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Database } from 'lucide-react';

export default function SeedDataPage() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);

  const handleSeedDatabase = async () => {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Firestore is not initialized.',
      });
      return;
    }

    setIsSeeding(true);
    try {
      const batch = writeBatch(firestore);

      // Seed outlets
      const outletsCollection = collection(firestore, 'outlets');
      outlets.forEach((outlet) => {
        const docRef = doc(outletsCollection, outlet.id);
        batch.set(docRef, outlet);
      });

      // Seed menu items
      const menuItemsCollection = collection(firestore, 'menu_items');
      menuItems.forEach((item) => {
        const docRef = doc(menuItemsCollection, item.id);
        batch.set(docRef, item);
      });

      await batch.commit();
      
      setIsSeeded(true);
      toast({
        title: 'Database Seeded!',
        description: 'Your Firestore database has been populated with initial data.',
      });
    } catch (error) {
      console.error('Error seeding database:', error);
      toast({
        variant: 'destructive',
        title: 'Seeding Failed',
        description: 'There was an error populating the database.',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <Database className="h-6 w-6" />
            Seed Database
          </CardTitle>
          <CardDescription>
            Click the button below to populate your Firestore database with the initial sample data for outlets and menu items. This only needs to be done once.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSeeded ? (
            <div className="text-center text-green-600 font-semibold p-4 bg-green-100 rounded-md">
              Database has been seeded successfully! You can now navigate to the outlets page.
            </div>
          ) : (
            <Button onClick={handleSeedDatabase} disabled={isSeeding} className="w-full">
              {isSeeding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding...
                </>
              ) : (
                'Populate Firestore Data'
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
