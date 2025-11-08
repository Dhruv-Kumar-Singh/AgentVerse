import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookOpen } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LoadingDots } from "@/components/ui/loading-dots";

const TEST_USER_ID = "test-user-123";

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && !isGenerating) {
      setIsGenerating(true);
      try {
        const response = await apiRequest("POST", "/api/topics", {
          title: searchQuery.trim(),
          userId: TEST_USER_ID,
        });

        const data = await response.json();
        
        if (response.ok) {
          toast({
            title: "Topic generated!",
            description: "AI has created subtopics for your learning journey.",
          });
          setLocation(`/topic/${data.topic.id}`);
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to generate topic. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error creating topic:", error);
        toast({
          title: "Error",
          description: "Failed to generate topic. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsGenerating(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none animate-gradient" />
      
      <header className="flex items-center justify-between p-4 md:p-6 relative z-10 animate-fade-in">
        <div className="flex items-center gap-2 hover-elevate transition-all duration-300 px-2 py-1 rounded-lg">
          <BookOpen className="w-6 h-6 text-primary animate-pulse-slow" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">AgentVerse</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" data-testid="button-login" className="transition-all duration-300 hover:scale-105">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button data-testid="button-signup" className="transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/20">
              Sign Up
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 relative z-10">
        <div className="w-full max-w-3xl space-y-10 text-center">
          <div className="space-y-6 animate-slide-up">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent animate-fade-in-up">
              Your AI-Powered Learning Assistant
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up-delay leading-relaxed">
              Master any topic with personalized explanations, interactive examples, and adaptive quizzes
            </p>
          </div>

          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto animate-fade-in-up-delay-2">
            <div className="relative group">
              <Input
                type="search"
                placeholder="Enter your topic and press Enter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-6 pr-14 h-16 text-lg rounded-full bg-card/50 backdrop-blur-sm border-2 border-card-border hover:border-primary/50 focus:border-primary transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/10"
                data-testid="input-topic-search"
                disabled={isGenerating}
              />
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary pointer-events-none transition-all duration-300 group-hover:scale-110" />
            </div>
            {isGenerating && (
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-10 text-sm text-muted-foreground animate-pulse">
                <LoadingDots text="Generating topic" />
              </div>
            )}
          </form>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground animate-fade-in-up-delay-3">
            <span className="font-medium">Try:</span>
            {["Quantum Physics", "Python Programming", "World History", "Calculus"].map((topic, index) => (
              <Button
                key={topic}
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery(topic)}
                className="rounded-full transition-all duration-300 hover:scale-105 hover:shadow-md border-2 animate-fade-in-scale"
                style={{ animationDelay: `${index * 0.1}s` }}
                data-testid={`button-topic-${topic.toLowerCase().replace(" ", "-")}`}
              >
                {topic}
              </Button>
            ))}
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-sm text-muted-foreground relative z-10 animate-fade-in">
        <p className="transition-all duration-300 hover:text-foreground">Powered by AI to help you learn smarter, not harder</p>
      </footer>
    </div>
  );
}
