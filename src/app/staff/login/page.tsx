'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Mail, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { useFirebase } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const DEMO_STAFF_EMAIL = 'staff@example.com';
const DEMO_STAFF_PASSWORD = 'password';

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});
type LoginFormValues = z.infer<typeof loginSchema>;

export default function StaffLoginPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { auth, firestore } = useFirebase();

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        mode: 'onTouched',
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const handleLogin = async (data: LoginFormValues) => {
        if (!auth) {
            toast({ variant: 'destructive', title: 'Firebase not initialized.'});
            return;
        }
        setIsSubmitting(true);
        try {
            await signInWithEmailAndPassword(auth, data.email, data.password);
            toast({ title: "Staff Login Successful" });
            router.push('/outlets');
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: "Staff Login Failed",
                description: "Invalid credentials. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const useDemo = async () => {
        if (!auth || !firestore) {
            toast({ variant: 'destructive', title: 'Firebase not initialized.'});
            return;
        }
        setIsSubmitting(true);
        
        try {
            // First, try to sign in, assuming the user exists
            await signInWithEmailAndPassword(auth, DEMO_STAFF_EMAIL, DEMO_STAFF_PASSWORD);
            toast({ title: "Staff Login Successful" });
            router.push('/outlets');

        } catch (error: any) {
            // If login fails because the user is not found, create the user
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                try {
                    const userCredential = await createUserWithEmailAndPassword(auth, DEMO_STAFF_EMAIL, DEMO_STAFF_PASSWORD);
                    const user = userCredential.user;

                    // Create the staff user profile in Firestore
                    const userProfile = {
                        id: user.uid,
                        fullName: 'Demo Staff',
                        email: DEMO_STAFF_EMAIL,
                        phoneNumber: '+910000000000',
                        role: 'staff'
                    };
                    await setDoc(doc(firestore, 'users', user.uid), userProfile);
                    
                    toast({ title: "Demo account created. Logging in..." });
                    
                    // Now log in with the newly created account
                    await signInWithEmailAndPassword(auth, DEMO_STAFF_EMAIL, DEMO_STAFF_PASSWORD);
                    toast({ title: "Staff Login Successful" });
                    router.push('/outlets');

                } catch (creationError: any) {
                     toast({
                        variant: 'destructive',
                        title: "Demo Login Failed",
                        description: "Could not create or log into the demo account.",
                    });
                }
            } else {
                // For other login errors
                 toast({
                    variant: 'destructive',
                    title: "Staff Login Failed",
                    description: error.message || "An unexpected error occurred.",
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    }

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Staff Login</CardTitle>
          <CardDescription>Login with your staff credentials or use the demo account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input type="email" placeholder="staff@example.com" {...field} className="pl-10" />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="pl-10"/>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>
           <div className="mt-4 border-t pt-4">
                <p className="text-sm text-center text-muted-foreground">Want to try the app as staff quickly?</p>
                <Button onClick={useDemo} className="mt-2 w-full bg-accent hover:bg-accent/90" disabled={isSubmitting}>
                    Use Demo Staff Account
                </Button>
                <p className="mt-2 text-xs text-muted-foreground text-center">(Demo: {DEMO_STAFF_EMAIL} / {DEMO_STAFF_PASSWORD})</p>
            </div>
            <div className="mt-4 text-center text-sm">
              Not a staff member?{' '}
              <Link href="/auth/login" className="underline">
                Go to Client Login
              </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
