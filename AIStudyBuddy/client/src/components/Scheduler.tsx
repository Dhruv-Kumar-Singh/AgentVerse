import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { format } from "date-fns";

interface Task {
  id: string;
  title: string;
  description: string;
  date: Date;
  priority: "high" | "medium" | "low";
}

interface SchedulerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function Scheduler({ open, onOpenChange }: SchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState<"high" | "medium" | "low">("medium");

  const tasksForSelectedDate = tasks.filter(
    (task) => selectedDate && format(task.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
  );

  const handleAddTask = () => {
    if (taskTitle.trim() && selectedDate) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: taskTitle,
        description: taskDescription,
        date: selectedDate,
        priority: taskPriority,
      };
      setTasks([...tasks, newTask]);
      setTaskTitle("");
      setTaskDescription("");
      setTaskPriority("medium");
      setShowTaskForm(false);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500 border-red-500/30";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
      case "low":
        return "bg-green-500/10 text-green-500 border-green-500/30";
      default:
        return "";
    }
  };

  const datesWithTasks = tasks.map((task) => task.date);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Task Scheduler</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Select Date</h3>
            </div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-lg border"
              modifiers={{
                hasTask: datesWithTasks,
              }}
              modifiersStyles={{
                hasTask: {
                  fontWeight: "bold",
                  textDecoration: "underline",
                },
              }}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Tasks for {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
              </h3>
              {selectedDate && (
                <Button
                  size="sm"
                  onClick={() => setShowTaskForm(!showTaskForm)}
                  data-testid="button-toggle-task-form"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              )}
            </div>

            {showTaskForm && (
              <Card className="border-2 border-primary/20 animate-fade-in-scale">
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-title">Task Title</Label>
                    <Input
                      id="task-title"
                      placeholder="Enter task title"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      data-testid="input-task-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-description">Description</Label>
                    <Textarea
                      id="task-description"
                      placeholder="Enter task description"
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      rows={3}
                      data-testid="textarea-task-description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-priority">Priority</Label>
                    <Select value={taskPriority} onValueChange={(value: any) => setTaskPriority(value)}>
                      <SelectTrigger id="task-priority" data-testid="select-task-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="low">Low Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddTask} className="flex-1" data-testid="button-save-task">
                      Save Task
                    </Button>
                    <Button variant="outline" onClick={() => setShowTaskForm(false)} data-testid="button-cancel-task">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {tasksForSelectedDate.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No tasks scheduled for this date
                </p>
              ) : (
                tasksForSelectedDate.map((task) => (
                  <Card key={task.id} className="animate-fade-in-scale">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold" data-testid={`task-title-${task.id}`}>
                              {task.title}
                            </h4>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground" data-testid={`task-description-${task.id}`}>
                              {task.description}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTask(task.id)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                          data-testid={`button-delete-task-${task.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
