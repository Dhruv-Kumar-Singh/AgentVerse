import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingDots } from "@/components/ui/loading-dots";
import { ArrowLeft, BookOpen, ChevronRight } from "lucide-react";

export default function TopicPage() {
  const params = useParams();
  const topicId = params.id ? parseInt(params.id) : null;

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/topics", topicId],
    queryFn: async () => {
      const response = await fetch(`/api/topics/${topicId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch topic");
      }
      return response.json();
    },
    enabled: !!topicId,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between p-4 md:p-6 border-b border-border">
        <Link href="/home">
          <Button variant="ghost" size="sm" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <span className="text-lg font-bold">AgentVerse</span>
        </div>
        <Link href="/profile">
          <Button variant="outline" size="sm" data-testid="button-profile">
            Profile
          </Button>
        </Link>
      </header>

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <LoadingDots text="Loading topic" className="text-lg text-primary" />
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-destructive">Failed to load topic. Please try again.</p>
            </div>
          )}

          {data && (
            <>
              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-bold">{data.topic.title}</h1>
                <p className="text-lg text-muted-foreground">
                  {data.topic.description || "Choose a subtopic to begin your learning journey"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.subtopics.map((subtopic: any) => (
                  <Link key={subtopic.id} href={`/subtopic/${subtopic.id}`}>
                    <Card className="h-full hover-elevate active-elevate-2 cursor-pointer transition-all" data-testid={`card-subtopic-${subtopic.id}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between gap-2">
                          <span className="text-lg">{subtopic.title}</span>
                          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
