import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, User, Calendar as CalendarIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LoadingDots } from "@/components/ui/loading-dots";
import SettingsMenu from "@/components/SettingsMenu";
import Scheduler from "@/components/Scheduler";

const TEST_USER_ID = "test-user-123";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [schedulerOpen, setSchedulerOpen] = useState(false);
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
          throw new Error(data.error || "Failed to generate topic");
        }
      } catch (error) {
        console.error("Error generating topic:", error);
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
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between p-4 md:p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold">AgentVerse</span>
        </div>
        <div className="flex items-center gap-2">
          <SettingsMenu />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSchedulerOpen(true)}
            data-testid="button-scheduler"
          >
            <CalendarIcon className="w-5 h-5" />
          </Button>
          <Link href="/profile">
            <Button variant="outline" data-testid="button-profile">
              <User className="w-4 h-4 mr-2" />
              My Profile
            </Button>
          </Link>
        </div>
      </header>

      <Scheduler open={schedulerOpen} onOpenChange={setSchedulerOpen} />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-3xl space-y-8 text-center">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold">
              What would you like to learn today?
            </h1>
            <p className="text-lg text-muted-foreground">
              Enter any topic and get personalized learning content
            </p>
          </div>

          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <div className="relative group">
              <Input
                type="search"
                placeholder="Enter your topic and press Enter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-6 pr-14 h-16 text-lg rounded-full bg-card/50 backdrop-blur-sm border-2 border-card-border hover:border-primary/50 focus:border-primary transition-all duration-300 shadow-lg hover:shadow-xl"
                data-testid="input-topic-search"
                disabled={isGenerating}
              />
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary pointer-events-none transition-all duration-300 group-hover:scale-110" />
            </div>
            {isGenerating && (
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 text-sm text-muted-foreground">
                <LoadingDots text="Generating topic" />
              </div>
            )}
          </form>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>Popular topics:</span>
            {["Machine Learning", "Organic Chemistry", "Data Structures", "Economics"].map((topic) => (
              <Button
                key={topic}
                variant="outline"
                size="sm"
                onClick={async () => {
                  setSearchQuery(topic);
                  if (!isGenerating) {
                    setIsGenerating(true);
                    try {
                      const response = await apiRequest("POST", "/api/topics", {
                        title: topic,
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
                        throw new Error(data.error || "Failed to generate topic");
                      }
                    } catch (error) {
                      console.error("Error generating topic:", error);
                      toast({
                        title: "Error",
                        description: "Failed to generate topic. Please try again.",
                        variant: "destructive",
                      });
                    } finally {
                      setIsGenerating(false);
                    }
                  }
                }}
                className="rounded-full"
                data-testid={`button-topic-${topic.toLowerCase().replace(" ", "-")}`}
                disabled={isGenerating}
              >
                {topic}
              </Button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
