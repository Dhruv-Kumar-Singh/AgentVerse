import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingDots } from "@/components/ui/loading-dots";
import { ArrowLeft, Edit2, Check, X, BookOpen } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const TEST_USER_ID = "test-user-123";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedPhone, setEditedPhone] = useState("");

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/users", TEST_USER_ID],
    queryFn: async () => {
      const response = await fetch(`/api/users/${TEST_USER_ID}`);
      if (!response.ok) throw new Error("Failed to fetch user");
      const data = await response.json();
      setEditedName(data.name || "");
      setEditedEmail(data.email || "");
      setEditedPhone(data.phone || "");
      return data;
    },
  });

  const { data: quizAttempts = [], isLoading: attemptsLoading } = useQuery({
    queryKey: ["/api/quiz-attempts", TEST_USER_ID],
    queryFn: async () => {
      const response = await fetch(`/api/quiz-attempts/${TEST_USER_ID}`);
      if (!response.ok) throw new Error("Failed to fetch quiz attempts");
      return response.json();
    },
  });

  const { data: topics = [] } = useQuery({
    queryKey: ["/api/topics"],
    queryFn: async () => {
      const response = await fetch(`/api/topics?userId=${TEST_USER_ID}`);
      if (!response.ok) throw new Error("Failed to fetch topics");
      return response.json();
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (updates: { name?: string; email?: string; phone?: string }) => {
      const response = await apiRequest("PATCH", `/api/users/${TEST_USER_ID}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", TEST_USER_ID] });
      setIsEditing(false);
    },
  });

  const handleSaveProfile = () => {
    updateUserMutation.mutate({
      name: editedName,
      email: editedEmail,
      phone: editedPhone,
    });
  };

  const handleCancelEdit = () => {
    setEditedName(user?.name || "");
    setEditedEmail(user?.email || "");
    setEditedPhone(user?.phone || "");
    setIsEditing(false);
  };

  const totalAttempted = quizAttempts.length;
  const correctAnswers = quizAttempts.filter((a: any) => a.isCorrect).length;
  const wrongAnswers = totalAttempted - correctAnswers;
  const accuracy = totalAttempted > 0 ? Math.round((correctAnswers / totalAttempted) * 100) : 0;

  const chartData = [
    { name: "Correct", value: correctAnswers, color: "#4ade80" },
    { name: "Wrong", value: wrongAnswers, color: "#ef4444" },
  ];

  const topicStats = topics.reduce((acc: any, topic: any) => {
    const topicAttempts = quizAttempts.filter((a: any) => a.topicId === topic.id);
    if (topicAttempts.length > 0) {
      acc[topic.id] = {
        title: topic.title,
        attempted: topicAttempts.length,
        correct: topicAttempts.filter((a: any) => a.isCorrect).length,
      };
    }
    return acc;
  }, {});

  if (userLoading || attemptsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingDots text="Loading profile" className="text-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between p-4 md:p-6 border-b border-border">
        <Link href="/home">
          <Button variant="ghost" size="sm" data-testid="button-back-home">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <span className="text-lg font-bold">AgentVerse</span>
        </div>
        <div className="w-24"></div>
      </header>

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold">My Profile</h1>
            <p className="text-muted-foreground mt-2">Manage your information and track your progress</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    data-testid="button-edit-profile"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      data-testid="button-cancel-edit"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveProfile}
                      disabled={updateUserMutation.isPending}
                      data-testid="button-save-profile"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      data-testid="input-name"
                    />
                  ) : (
                    <p className="text-lg" data-testid="text-name">{user?.name || "Not set"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                      data-testid="input-email"
                    />
                  ) : (
                    <p className="text-lg" data-testid="text-email">{user?.email || "Not set"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      type="tel"
                      value={editedPhone}
                      onChange={(e) => setEditedPhone(e.target.value)}
                      data-testid="input-phone"
                    />
                  ) : (
                    <p className="text-lg" data-testid="text-phone">{user?.phone || "Not set"}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quiz Statistics</CardTitle>
              <CardDescription>Your overall quiz performance</CardDescription>
            </CardHeader>
            <CardContent>
              {totalAttempted === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No quiz attempts yet. Start learning to see your statistics!
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Total Attempted</p>
                            <p className="text-3xl font-bold text-primary" data-testid="stat-total">{totalAttempted}</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Accuracy</p>
                            <p className="text-3xl font-bold text-primary" data-testid="stat-accuracy">{accuracy}%</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="border-green-500/30 bg-green-500/10">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Correct</p>
                            <p className="text-3xl font-bold text-green-500" data-testid="stat-correct">{correctAnswers}</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border-red-500/30 bg-red-500/10">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Wrong</p>
                            <p className="text-3xl font-bold text-red-500" data-testid="stat-wrong">{wrongAnswers}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                      <ResponsiveContainer width={280} height={280}>
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="text-5xl font-bold text-primary" data-testid="chart-accuracy">{accuracy}%</div>
                        <div className="text-sm text-muted-foreground mt-1">Success Rate</div>
                      </div>
                    </div>
                    <div className="flex gap-8 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <span className="text-muted-foreground">
                          Correct: <strong className="text-green-500">{Math.round((correctAnswers / totalAttempted) * 100)}%</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                        <span className="text-muted-foreground">
                          Wrong: <strong className="text-red-500">{Math.round((wrongAnswers / totalAttempted) * 100)}%</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning History</CardTitle>
              <CardDescription>Topics you've attempted with detailed statistics</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(topicStats).length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No learning history yet. Start a quiz to track your progress!
                </p>
              ) : (
                <div className="space-y-4">
                  {Object.values(topicStats).map((topic: any, index) => {
                    const topicAccuracy = Math.round((topic.correct / topic.attempted) * 100);
                    return (
                      <Card key={index} className="border-border">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold" data-testid={`topic-title-${index}`}>
                                {topic.title}
                              </h3>
                              <div className="flex gap-6 mt-2 text-sm text-muted-foreground">
                                <span data-testid={`topic-attempted-${index}`}>
                                  Questions Attempted: <strong className="text-foreground">{topic.attempted}</strong>
                                </span>
                                <span data-testid={`topic-correct-${index}`}>
                                  Correct Answers: <strong className="text-green-500">{topic.correct}</strong>
                                </span>
                                <span data-testid={`topic-accuracy-${index}`}>
                                  Accuracy: <strong className="text-primary">{topicAccuracy}%</strong>
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
