import { useState } from "react";
import { Link, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LoadingDots } from "@/components/ui/loading-dots";
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

const TEST_USER_ID = "test-user-123";

type Section = "explanation" | "examples" | "quiz";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export default function SubtopicPage() {
  const params = useParams();
  const subtopicId = params.id ? parseInt(params.id) : null;
  
  const [currentSection, setCurrentSection] = useState<Section>("explanation");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<"correct" | "incorrect" | null>(null);

  const { data: subtopic } = useQuery({
    queryKey: ["/api/subtopics", subtopicId],
    queryFn: async () => {
      const response = await fetch(`/api/subtopics/${subtopicId}`);
      if (!response.ok) throw new Error("Failed to fetch subtopic");
      return response.json();
    },
    enabled: !!subtopicId,
  });

  const { data: content, isLoading, error } = useQuery({
    queryKey: ["/api/subtopics", subtopicId, "content"],
    queryFn: async () => {
      const response = await fetch(`/api/subtopics/${subtopicId}/content`);
      if (!response.ok) throw new Error("Failed to fetch content");
      return response.json();
    },
    enabled: !!subtopicId,
  });

  const sections: Section[] = ["explanation", "examples", "quiz"];
  const currentIndex = sections.indexOf(currentSection);
  
  const quizQuestions: QuizQuestion[] = content?.quizQuestions || [];
  const currentQuizQuestion = quizQuestions.length > 0 ? quizQuestions[currentQuestionIndex] : null;

  const recordQuizAttemptMutation = useMutation({
    mutationFn: async (attempt: {
      userId: string;
      subtopicId: number;
      topicId: number;
      questionIndex: number;
      selectedAnswer: number;
      correctAnswer: number;
      isCorrect: boolean;
    }) => {
      const response = await apiRequest("POST", "/api/quiz-attempts", attempt);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quiz-attempts"] });
    },
  });

  const handleNext = () => {
    if (currentSection === "quiz" && currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setQuizSubmitted(false);
      setQuizResult(null);
    } else if (currentIndex < sections.length - 1) {
      setCurrentSection(sections[currentIndex + 1]);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setQuizSubmitted(false);
      setQuizResult(null);
    }
  };

  const handlePrevious = () => {
    if (currentSection === "quiz" && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(null);
      setQuizSubmitted(false);
      setQuizResult(null);
    } else if (currentIndex > 0) {
      setCurrentSection(sections[currentIndex - 1]);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setQuizSubmitted(false);
      setQuizResult(null);
    }
  };

  const handleQuizSubmit = () => {
    if (selectedAnswer !== null && currentQuizQuestion && subtopic && subtopicId) {
      const isCorrect = selectedAnswer === currentQuizQuestion.correctAnswer;
      setQuizSubmitted(true);
      setQuizResult(isCorrect ? "correct" : "incorrect");
      
      recordQuizAttemptMutation.mutate({
        userId: TEST_USER_ID,
        subtopicId: subtopicId,
        topicId: subtopic.topicId,
        questionIndex: currentQuestionIndex,
        selectedAnswer: selectedAnswer,
        correctAnswer: currentQuizQuestion.correctAnswer,
        isCorrect: isCorrect,
      });
    }
  };

  const hasQuizQuestions = quizQuestions.length > 0;
  const isLastQuestion = currentSection === "quiz" && hasQuizQuestions && currentQuestionIndex === quizQuestions.length - 1;
  const isFirstQuestion = currentSection === "quiz" && currentQuestionIndex === 0;
  const canGoNext = currentSection !== "quiz" ? currentIndex < sections.length - 1 : hasQuizQuestions && !isLastQuestion;
  const canGoPrevious = currentSection !== "quiz" ? currentIndex > 0 : !isFirstQuestion || currentIndex > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between p-4 md:p-6 border-b border-border">
        <Link href={subtopic ? `/topic/${subtopic.topicId}` : "/home"}>
          <Button variant="ghost" size="sm" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Topic
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          {sections.map((section, index) => (
            <Badge
              key={section}
              variant={currentSection === section ? "default" : "outline"}
              className="capitalize cursor-pointer"
              onClick={() => {
                setCurrentSection(section);
                setSelectedAnswer(null);
                setQuizSubmitted(false);
                setQuizResult(null);
              }}
              data-testid={`badge-section-${section}`}
            >
              {section}
            </Badge>
          ))}
        </div>
        <Link href="/profile">
          <Button variant="outline" size="sm" data-testid="button-profile">
            Profile
          </Button>
        </Link>
      </header>

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <LoadingDots text="Loading content" className="text-lg text-primary" />
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-destructive">Failed to load content. Please try again.</p>
            </div>
          )}

          {content && (
            <>
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold">{subtopic?.title || "Subtopic"}</h1>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="capitalize text-2xl">
                    {currentSection}
                    {currentSection === "quiz" && quizQuestions.length > 0 && (
                      <span className="text-base font-normal text-muted-foreground ml-2">
                        ({currentQuestionIndex + 1} of {quizQuestions.length})
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {currentSection === "explanation" && (
                    <div className="prose prose-invert max-w-none">
                      <p className="whitespace-pre-line text-foreground leading-relaxed">
                        {content.explanation}
                      </p>
                    </div>
                  )}

                  {currentSection === "examples" && (
                    <div className="space-y-6">
                      <div className="prose prose-invert max-w-none">
                        <p className="whitespace-pre-line text-foreground leading-relaxed">
                          {content.examples}
                        </p>
                      </div>
                    </div>
                  )}

                  {currentSection === "quiz" && (
                    <div className="space-y-6">
                      {!hasQuizQuestions && (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No quiz questions available for this subtopic.</p>
                        </div>
                      )}
                      
                      {currentQuizQuestion && (
                        <div className="space-y-6">
                          <div className="space-y-4">
                        <h3 className="text-xl font-semibold">{currentQuizQuestion.question}</h3>
                        <RadioGroup
                          key={`question-${currentQuestionIndex}`}
                          value={selectedAnswer === null ? undefined : selectedAnswer.toString()}
                          onValueChange={(value) => {
                            setSelectedAnswer(parseInt(value));
                            setQuizSubmitted(false);
                            setQuizResult(null);
                          }}
                          disabled={quizSubmitted}
                          className="space-y-3"
                        >
                          {currentQuizQuestion.options.map((option, index) => (
                            <div
                              key={index}
                              className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors ${
                                quizSubmitted && index === currentQuizQuestion.correctAnswer
                                  ? "border-green-500 bg-green-500/20"
                                  : quizSubmitted && selectedAnswer === index && index !== currentQuizQuestion.correctAnswer
                                  ? "border-red-500 bg-red-500/20"
                                  : "border-border"
                              }`}
                              data-testid={`radio-option-${index}`}
                            >
                              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                              <Label
                                htmlFor={`option-${index}`}
                                className="flex-1 cursor-pointer leading-relaxed"
                              >
                                {option}
                              </Label>
                              {quizSubmitted && index === currentQuizQuestion.correctAnswer && (
                                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                              )}
                              {quizSubmitted && selectedAnswer === index && index !== currentQuizQuestion.correctAnswer && (
                                <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                              )}
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      {!quizSubmitted && (
                        <Button
                          onClick={handleQuizSubmit}
                          disabled={selectedAnswer === null}
                          className="w-full md:w-auto"
                          data-testid="button-submit-quiz"
                        >
                          Submit Answer
                        </Button>
                      )}

                      {quizSubmitted && quizResult && (
                        <Card className={quizResult === "correct" ? "border-primary" : "border-destructive"}>
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                              {quizResult === "correct" ? (
                                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                              ) : (
                                <XCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
                              )}
                              <div>
                                <p className="font-semibold text-lg">
                                  {quizResult === "correct" ? "Correct!" : "Incorrect"}
                                </p>
                                <p className="text-muted-foreground mt-1">
                                  {quizResult === "correct"
                                    ? "Great job! You've mastered this concept."
                                    : "The correct answer is highlighted above. Review the explanation to better understand this concept."}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={!canGoPrevious}
                  data-testid="button-previous"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!canGoNext}
                  data-testid="button-next"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
