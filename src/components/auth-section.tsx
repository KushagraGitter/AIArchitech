"use client";

import React, { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel as ShadFormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/logo';

const authFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});
type AuthFormValues = z.infer<typeof authFormSchema>;

export function AuthSection() {
  const { signup, login, error: authError, loading: authLoading, clearError } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);

  const authForm = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleAuthSubmit = async (values: AuthFormValues) => {
    clearError();
    if (isLoginMode) {
      await login(values.email, values.password);
    } else {
      await signup(values.email, values.password);
    }
  };

  useEffect(() => {
    authForm.reset();
    clearError();
  }, [isLoginMode, authForm, clearError]);


  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo variant="full" />
          </div>
          <CardTitle className="text-2xl">{isLoginMode ? "Welcome Back!" : "Create Account"}</CardTitle>
          <CardDescription>
            {isLoginMode ? "Sign in to continue to Architech AI." : "Sign up to start designing."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...authForm}>
            <form onSubmit={authForm.handleSubmit(handleAuthSubmit)} className="space-y-6">
              <FormField
                control={authForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <ShadFormLabel>Email</ShadFormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={authForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <ShadFormLabel>Password</ShadFormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {authError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Authentication Error</AlertTitle>
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={authLoading}>
                {authLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isLoginMode ? "Login" : "Sign Up")}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <Button variant="link" onClick={() => setIsLoginMode(!isLoginMode)} className="text-sm">
            {isLoginMode ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
