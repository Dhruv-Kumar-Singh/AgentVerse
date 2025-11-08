import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login submitted:", { email, password });
    setLocation("/home");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between p-4 md:p-6">
        <Link href="/">
          <Button variant="ghost" size="sm" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <span className="text-lg font-bold">AgentVerse</span>
        </div>
        <div className="w-20" />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Enter your credentials to continue learning</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email or Mobile Number</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="input-password"
                />
              </div>
              <Button type="submit" className="w-full" data-testid="button-submit">
                Login
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link href="/signup" className="text-primary hover:underline font-medium" data-testid="link-signup">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
