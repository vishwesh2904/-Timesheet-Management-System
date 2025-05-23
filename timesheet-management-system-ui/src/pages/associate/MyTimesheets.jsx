import { useState, useEffect, useCallback } from "react";
import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  addWeeks,
  isSameWeek,
  eachDayOfInterval,
  isSameDay,
  isWithinInterval,
  isToday,
  isFuture,
} from "date-fns";
import {
  AlertCircle,
  Check,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Save,
  Clock,
  Target,
  TrendingUp,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Filter,
  Search,
  Plus,
  Trash2,
} from "lucide-react";
import axios from "axios";

function MyTimesheets() {
  // Mock data to simulate API responses
  // const mockTasks = [
  //   {
  //     _id: "1",
  //     description: "Frontend Development - User Dashboard",
  //     estimatedHours: 8,
  //     date: "2025-05-19",
  //     priority: "high",
  //     project: "Project Alpha"
  //   },
  //   {
  //     _id: "2",
  //     description: "Backend API Integration",
  //     estimatedHours: 6,
  //     date: "2025-05-20",
  //     priority: "medium",
  //     project: "Project Alpha"
  //   },
  //   {
  //     _id: "3",
  //     description: "Code Review and Testing",
  //     estimatedHours: 4,
  //     date: "2025-05-21",
  //     priority: "low",
  //     project: "Project Beta"
  //   },
  //   {
  //     _id: "4",
  //     description: "Database Optimization",
  //     estimatedHours: 5,
  //     date: "2025-05-22",
  //     priority: "high",
  //     project: "Project Beta"
  //   }
  // ]

  // const mockTimesheets = [
  //   {
  //     _id: "ts1",
  //     weekStart: "2025-05-19",
  //     status: "draft",
  //     updatedAt: "2025-05-23T10:30:00Z",
  //     entries: [
  //       { _id: "e1", taskId: "1", date: "2025-05-19", actualHours: 7.5 },
  //       { _id: "e2", taskId: "2", date: "2025-05-20", actualHours: 6 },
  //       { _id: "e3", taskId: "3", date: "2025-05-21", actualHours: 4 }
  //     ]
  //   },
  //   {
  //     _id: "ts2",
  //     weekStart: "2025-05-12",
  //     status: "submitted",
  //     updatedAt: "2025-05-16T16:45:00Z",
  //     entries: [
  //       { _id: "e4", taskId: "1", date: "2025-05-12", actualHours: 8 },
  //       { _id: "e5", taskId: "2", date: "2025-05-13", actualHours: 6.5 }
  //     ]
  //   }
  // ]

  const base_url = "http://localhost:5000";
  const [tasks, setTasks] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [timeEntries, setTimeEntries] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPreviousTimesheets, setShowPreviousTimesheets] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch tasks and timesheets in parallel
        const [tasksResponse, timesheetsResponse] = await Promise.all([
          axios.get(`${base_url}/api/tasks/my`),
          axios.get(`${base_url}/api/timesheets/my`),
        ]);

        setTasks(tasksResponse.data.tasks || []);
        setTimesheets(timesheetsResponse.data.timesheets || []);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load timesheet data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Toast notification system
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info") => {
    const id = Date.now();
    const toast = { id, message, type };
    setToasts((prev) => [...prev, toast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Get current week's timesheet
  const currentWeekTimesheet = timesheets.find((ts) => {
    try {
      return isSameWeek(parseISO(ts.weekStart), currentWeekStart, {
        weekStartsOn: 1,
      });
    } catch (error) {
      console.error("Error parsing timesheet weekStart:", ts.weekStart, error);
      return false;
    }
  });

  const isWeekSubmitted = currentWeekTimesheet?.status === "submitted" || false;

  // Get week days
  const weekDays = eachDayOfInterval({
    start: currentWeekStart,
    end: endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
  });

  // Initialize time entries
  const initializeTimeEntries = useCallback(() => {
    if (currentWeekTimesheet && currentWeekTimesheet.entries) {
      const entries = {};
      console.log("dfgdr", currentWeekTimesheet.entries);
      currentWeekTimesheet.entries.forEach((entry) => {
        let dateKey;
        try {
          if (
            typeof entry.date === "string" &&
            entry.date.match(/^\d{4}-\d{2}-\d{2}$/)
          ) {
            dateKey = entry.date;
          } else {
            dateKey = format(parseISO(entry.date), "yyyy-MM-dd");
          }
        } catch (error) {
          console.error("Error parsing entry date:", entry.date, error);
          dateKey = entry.date;
        }
        console.log(dateKey);

        const key = `${entry.taskId}-${dateKey}`;
        entries[key] = entry.actualHours;
      });
      setTimeEntries(entries);
      console.log({ timeEntries });
    } else {
      setTimeEntries({});
    }
  }, [currentWeekTimesheet]);

  // Auto-save functionality
  const autoSaveTimesheet = useCallback(async () => {
    if (!autoSave || isWeekSubmitted) return;

    const hasEntries = Object.values(timeEntries).some(
      (hours) => hours !== "" && !isNaN(hours) && hours > 0
    );
    if (!hasEntries) return;

    try {
      // Simulate API call
      console.log(hasEntries, timeEntries);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setLastSaved(new Date());
      showToast("Timesheet auto-saved", "success");
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  }, [timeEntries, autoSave, isWeekSubmitted, showToast]);

  // Initialize data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load timesheet data. Please try again later.");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    initializeTimeEntries();
  }, [initializeTimeEntries]);

  // Auto-save timer
  useEffect(() => {
    if (autoSave) {
      const timer = setTimeout(autoSaveTimesheet, 2000);
      return () => clearTimeout(timer);
    }
  }, [timeEntries, autoSaveTimesheet]);

  const prevWeek = () => {
    setCurrentWeekStart((prev) => addWeeks(prev, -1));
  };

  const nextWeek = () => {
    setCurrentWeekStart((prev) => addWeeks(prev, 1));
  };

  const currentWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const handleHoursChange = (taskId, date, hours) => {
    if (isWeekSubmitted) return;

    const key = `${taskId}-${date}`;
    const parsedHours = hours === "" ? "" : Number.parseFloat(hours);

    if (
      hours !== "" &&
      (isNaN(parsedHours) || parsedHours < 0 || parsedHours > 24)
    ) {
      showToast("Invalid hours value. Must be between 0 and 24.", "error");
      return;
    }

    setTimeEntries((prev) => ({
      ...prev,
      [key]: parsedHours,
    }));
  };

  const saveTimesheet = async () => {
    if (isWeekSubmitted) return;
    setIsSaving(true);

    const entries = Object.entries(timeEntries)
      .filter(([_, hours]) => hours !== "" && !isNaN(hours) && hours > 0)
      .map(([key, hours]) => {
        const dateMatch = key.match(/\d{4}-\d{2}-\d{2}$/);
        const dateStr = dateMatch ? dateMatch[0] : null;
        const taskId = dateStr
          ? key.slice(0, key.lastIndexOf("-" + dateStr))
          : key;
        return {
          taskId,
          date: dateStr,
          actualHours: Number.parseFloat(hours),
        };
      });

    try {
      const payload = {
        weekStart: format(currentWeekStart, "yyyy-MM-dd"),
        entries,
      };

      // API call to save the timesheet
      const response = await axios.post(
        `${base_url}/api/timesheets/save`,
        payload
      );

      // Update local state with the saved timesheet
      const savedTimesheet = response.data.timesheet;
      setTimesheets((prev) => {
        const filtered = prev.filter((ts) => ts._id !== savedTimesheet._id);
        return [...filtered, savedTimesheet];
      });

      setLastSaved(new Date());
      showToast("Timesheet saved successfully!", "success");
    } catch (error) {
      console.error(
        "Save timesheet error:",
        error.response?.data || error.message
      );
      showToast("Failed to save timesheet", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const submitTimesheet = async () => {
    if (isWeekSubmitted) return;

    const hasEntries = Object.values(timeEntries).some(
      (hours) => hours !== "" && !isNaN(hours) && hours > 0
    );

    if (!hasEntries) {
      showToast("Please add some time entries before submitting.", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      // First save the timesheet
      await saveTimesheet();

      // API call to submit the timesheet
      const payload = {
        weekStart: format(currentWeekStart, "yyyy-MM-dd"),
      };
      await axios.post(`${base_url}/api/timesheets/submit`, payload);

      // Update local state to mark the timesheet as submitted
      setTimesheets((prev) =>
        prev.map((ts) =>
          ts.weekStart === format(currentWeekStart, "yyyy-MM-dd")
            ? { ...ts, status: "submitted" }
            : ts
        )
      );

      showToast("Timesheet submitted successfully!", "success");
    } catch (error) {
      console.error(
        "Submit timesheet error:",
        error.response?.data || error.message
      );
      showToast("Failed to submit timesheet", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWeekTasks = () => {
    const weekStart = currentWeekStart;
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

    const tasksInWeek = tasks.filter((task) => {
      const taskDate = parseISO(task.date);
      return isWithinInterval(taskDate, { start: weekStart, end: weekEnd });
    });

    const tasksWithEntries = [];
    if (currentWeekTimesheet && currentWeekTimesheet.entries) {
      currentWeekTimesheet.entries.forEach((entry) => {
        try {
          let entryDate;
          if (
            typeof entry.date === "string" &&
            entry.date.match(/^\d{4}-\d{2}-\d{2}$/)
          ) {
            entryDate = parseISO(entry.date);
          } else {
            entryDate = parseISO(entry.date);
          }

          if (isWithinInterval(entryDate, { start: weekStart, end: weekEnd })) {
            const task = tasks.find((t) => t._id === entry.taskId);
            if (task && !tasksInWeek.find((t) => t._id === task._id)) {
              tasksWithEntries.push(task);
            }
          }
        } catch (error) {
          console.error("Error processing task entry date:", entry.date, error);
        }
      });
    }

    return [...tasksInWeek, ...tasksWithEntries];
  };

  const weekTasks = getWeekTasks();

  const getTaskInfo = (taskId) => {
    const task = tasks.find((t) => t._id === taskId);
    return (
      task || {
        _id: taskId,
        description: `Task ${taskId}`,
        estimatedHours: 0,
        priority: "medium",
        project: "Unknown",
      }
    );
  };

  // Calculate statistics
  const weeklyStats = (() => {
    const totalPlanned = weekTasks.reduce(
      (sum, task) => sum + task.estimatedHours,
      0
    );
    const totalActual = weekTasks.reduce((sum, task) => {
      const taskTotal = weekDays.reduce((daySum, day) => {
        const dayDateStr = format(day, "yyyy-MM-dd");
        const key = `${task._id}-${dayDateStr}`;
        const hours = timeEntries[key] || 0;
        return daySum + (hours === "" ? 0 : Number.parseFloat(hours) || 0);
      }, 0);
      return sum + taskTotal;
    }, 0);

    return { totalPlanned, totalActual };
  })();

  // Filter timesheets
  const filteredTimesheets = timesheets
    .filter((ts) => {
      if (filterStatus === "all") return true;
      return ts.status === filterStatus;
    })
    .filter((ts) => {
      if (!searchTerm) return true;
      const weekStr = format(parseISO(ts.weekStart), "MMMM d, yyyy");
      return weekStr.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => new Date(b.weekStart) - new Date(a.weekStart));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your timesheet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full border border-red-200">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
            <h2 className="text-xl font-bold text-red-700">Error</h2>
          </div>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg border transform transition-all duration-300 ${
              toast.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : toast.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            My Timesheet
          </h1>
          <p className="text-gray-600 text-lg">
            Track your work hours efficiently
          </p>

          {lastSaved && autoSave && (
            <div className="mt-4 flex items-center justify-center text-sm text-green-600">
              <Check className="h-4 w-4 mr-1" />
              Last saved: {format(lastSaved, "HH:mm:ss")}
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Planned Hours
                </h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {weeklyStats.totalPlanned}h
                </p>
              </div>
              <Target className="h-12 w-12 text-blue-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Actual Hours
                </h3>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {weeklyStats.totalActual.toFixed(1)}h
                </p>
              </div>
              <Clock className="h-12 w-12 text-green-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Efficiency
                </h3>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {weeklyStats.totalPlanned > 0
                    ? Math.round(
                        (weeklyStats.totalActual / weeklyStats.totalPlanned) *
                          100
                      )
                    : 0}
                  %
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-purple-500 opacity-80" />
            </div>
          </div>
        </div>

        {/* Main Timesheet */}
        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Weekly Timesheet</h2>
                <p className="text-blue-100 mt-1">
                  Week of {format(currentWeekStart, "MMMM d, yyyy")}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={prevWeek}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={currentWeek}
                  className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-sm font-medium"
                >
                  Current Week
                </button>
                <button
                  onClick={nextWeek}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center mt-4 space-x-4">
              {isWeekSubmitted && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <Check className="h-4 w-4 mr-1" />
                  Submitted
                </span>
              )}
              {currentWeekTimesheet && !isWeekSubmitted && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  <Save className="h-4 w-4 mr-1" />
                  Draft
                </span>
              )}

              <label className="flex items-center text-sm text-blue-100">
                <input
                  type="checkbox"
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                  className="mr-2 rounded"
                />
                Auto-save
              </label>
            </div>
          </div>

          {/* Settings Panel */}
          <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() =>
                    setShowPreviousTimesheets(!showPreviousTimesheets)
                  }
                  className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {showPreviousTimesheets ? (
                    <EyeOff className="h-4 w-4 mr-1" />
                  ) : (
                    <Eye className="h-4 w-4 mr-1" />
                  )}
                  {showPreviousTimesheets ? "Hide" : "Show"} Previous Timesheets
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.location.reload()}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Export"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Timesheet Table */}
          <div className="p-8">
            {weekTasks.length === 0 ? (
              <div className="py-16 text-center">
                <Calendar className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No tasks for this week
                </h3>
                <p className="text-gray-500 mb-6">
                  There are no tasks assigned to you for this week.
                </p>
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50 rounded-tl-lg">
                        Task Details
                      </th>
                      {weekDays.map((day, index) => (
                        <th
                          key={index}
                          className={`px-4 py-4 text-center text-sm font-semibold text-gray-900 bg-gray-50 ${
                            isToday(day) ? "bg-blue-50 text-blue-700" : ""
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="font-bold">
                              {format(day, "EEE")}
                            </div>
                            <div className="text-xs opacity-75">
                              {format(day, "MMM d")}
                            </div>
                          </div>
                        </th>
                      ))}
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 bg-gray-50 rounded-tr-lg">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {weekTasks.map((task, taskIndex) => {
                      const taskDate = parseISO(task.date);
                      const totalHours = weekDays.reduce((sum, day) => {
                        const dayDateStr = format(day, "yyyy-MM-dd");
                        const key = `${task._id}-${dayDateStr}`;
                        const hours = timeEntries[key] || 0;
                        return (
                          sum +
                          (hours === "" ? 0 : Number.parseFloat(hours) || 0)
                        );
                      }, 0);

                      return (
                        <tr
                          key={task._id}
                          className={`hover:bg-gray-50 transition-colors ${
                            taskIndex % 2 === 0 ? "bg-white" : "bg-gray-25"
                          }`}
                        >
                          <td className="px-6 py-6">
                            <div className="max-w-xs">
                              <div className="font-medium text-gray-900 text-sm mb-1">
                                {task.description}
                              </div>
                              <div className="flex items-center space-x-3 text-xs text-gray-500">
                                <span className="flex items-center">
                                  <Target className="h-3 w-3 mr-1" />
                                  {task.estimatedHours}h planned
                                </span>
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Due {format(taskDate, "MMM d")}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    task.priority === "high"
                                      ? "bg-red-100 text-red-700"
                                      : task.priority === "medium"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {task.priority}
                                </span>
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {task.project}
                              </div>
                            </div>
                          </td>
                          {weekDays.map((day, dayIndex) => {
                            const isTaskDay = isSameDay(day, taskDate);
                            const dayDateStr = format(day, "yyyy-MM-dd");
                            const key = `${task._id}-${dayDateStr}`;
                            const currentValue = timeEntries[key];
                            const isPastDay = !isFuture(day) && !isToday(day);

                            return (
                              <td
                                key={dayIndex}
                                className={`px-4 py-6 text-center ${
                                  isToday(day) ? "bg-blue-25" : ""
                                }`}
                              >
                                <input
                                  type="number"
                                  min="0"
                                  max="24"
                                  step="0.25"
                                  value={
                                    currentValue !== undefined
                                      ? currentValue
                                      : ""
                                  }
                                  onChange={(e) =>
                                    handleHoursChange(
                                      task._id,
                                      dayDateStr,
                                      e.target.value
                                    )
                                  }
                                  disabled={isWeekSubmitted}
                                  className={`w-20 p-3 text-center border-2 rounded-lg transition-all font-medium ${
                                    isTaskDay
                                      ? "border-blue-300 bg-blue-50 text-blue-700 ring-2 ring-blue-100"
                                      : "border-gray-200 hover:border-gray-300 focus:border-blue-400"
                                  } ${
                                    isWeekSubmitted
                                      ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200"
                                      : "focus:ring-2 focus:ring-blue-100"
                                  } ${isPastDay ? "bg-gray-50" : ""}`}
                                  placeholder={
                                    isTaskDay
                                      ? task.estimatedHours.toString()
                                      : "0"
                                  }
                                />
                              </td>
                            );
                          })}
                          <td className="px-6 py-6 text-center">
                            <div
                              className={`inline-flex items-center px-3 py-2 rounded-lg font-bold ${
                                totalHours > task.estimatedHours
                                  ? "bg-orange-100 text-orange-700"
                                  : totalHours === task.estimatedHours
                                  ? "bg-green-100 text-green-700"
                                  : totalHours > 0
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              {totalHours.toFixed(2)}h
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Daily Totals Row */}
                    <tr className="bg-gradient-to-r from-gray-100 to-gray-50 border-t-2 border-gray-300">
                      <td className="px-6 py-4 font-bold text-gray-900">
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 mr-2" />
                          Daily Totals
                        </div>
                      </td>
                      {weekDays.map((day, dayIndex) => {
                        const dailyTotal = weekTasks.reduce((sum, task) => {
                          const dayDateStr = format(day, "yyyy-MM-dd");
                          const key = `${task._id}-${dayDateStr}`;
                          const hours = timeEntries[key] || 0;
                          return (
                            sum +
                            (hours === "" ? 0 : Number.parseFloat(hours) || 0)
                          );
                        }, 0);

                        return (
                          <td
                            key={dayIndex}
                            className={`px-4 py-4 text-center ${
                              isToday(day) ? "bg-blue-50" : ""
                            }`}
                          >
                            <div
                              className={`inline-flex items-center px-3 py-2 rounded-lg font-bold text-sm ${
                                dailyTotal > 8
                                  ? "bg-red-100 text-red-800"
                                  : dailyTotal === 8
                                  ? "bg-green-100 text-green-800"
                                  : dailyTotal > 0
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              {dailyTotal.toFixed(2)}h
                            </div>
                          </td>
                        );
                      })}

                      {/* Weekly Total */}
                      <td className="px-6 py-4 text-center">
                        {(() => {
                          const weeklyTotal = weekTasks.reduce((sum, task) => {
                            const taskTotal = weekDays.reduce((daySum, day) => {
                              const dayDateStr = format(day, "yyyy-MM-dd");
                              const key = `${task._id}-${dayDateStr}`;
                              const hours = timeEntries[key] || 0;
                              return (
                                daySum +
                                (hours === ""
                                  ? 0
                                  : Number.parseFloat(hours) || 0)
                              );
                            }, 0);
                            return sum + taskTotal;
                          }, 0);

                          return (
                            <div
                              className={`inline-flex items-center px-4 py-3 rounded-xl font-bold text-lg ${
                                weeklyTotal > 40
                                  ? "bg-red-100 text-red-800 border-2 border-red-200"
                                  : weeklyTotal >= 35
                                  ? "bg-green-100 text-green-800 border-2 border-green-200"
                                  : weeklyTotal > 0
                                  ? "bg-blue-100 text-blue-800 border-2 border-blue-200"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              <TrendingUp className="h-5 w-5 mr-2" />
                              {weeklyTotal.toFixed(2)}h
                            </div>
                          );
                        })()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {!isWeekSubmitted && weekTasks.length > 0 && (
            <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {Object.values(timeEntries).some(
                    (hours) => hours !== "" && !isNaN(hours) && hours > 0
                  ) ? (
                    <div className="flex items-center text-orange-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      You have unsaved changes
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      No time entries yet
                    </div>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={saveTimesheet}
                    disabled={isSaving}
                    className="inline-flex items-center px-6 py-3 border-2 border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isSaving ? (
                      <span className="inline-flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent mr-2"></div>
                        Saving...
                      </span>
                    ) : (
                      <span className="inline-flex items-center">
                        <Save className="h-4 w-4 mr-2" />
                        Save as Draft
                      </span>
                    )}
                  </button>

                  <button
                    onClick={submitTimesheet}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-6 py-3 border-2 border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Submitting...
                      </span>
                    ) : (
                      <span className="inline-flex items-center">
                        <Check className="h-4 w-4 mr-2" />
                        Submit Timesheet
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Previous Timesheets */}
        {showPreviousTimesheets && (
          <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-8 py-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-6 w-6 mr-3" />
                  <h3 className="text-xl font-bold">Previous Timesheets</h3>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search weeks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm w-48"
                    />
                  </div>

                  {/* Filter */}
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="pl-10 pr-8 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50 text-sm appearance-none cursor-pointer"
                    >
                      <option value="all" className="text-gray-900">
                        All Status
                      </option>
                      <option value="draft" className="text-gray-900">
                        Draft
                      </option>
                      <option value="submitted" className="text-gray-900">
                        Submitted
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {filteredTimesheets.length === 0 ? (
              <div className="px-8 py-16 text-center">
                <Calendar className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h4 className="text-xl font-medium text-gray-900 mb-2">
                  No timesheets found
                </h4>
                <p className="text-gray-500">
                  {searchTerm || filterStatus !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "You haven't created any timesheets yet."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredTimesheets.map((timesheet, index) => (
                  <div
                    key={timesheet._id}
                    className={`px-8 py-6 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-25"
                    }`}
                  >
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="text-lg font-semibold text-gray-900">
                              Week of{" "}
                              {format(
                                parseISO(timesheet.weekStart),
                                "MMMM d, yyyy"
                              )}
                            </p>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {timesheet.entries.length} entries
                              </span>
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                Updated{" "}
                                {format(
                                  parseISO(timesheet.updatedAt),
                                  "MMM d, HH:mm"
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span
                            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                              timesheet.status === "submitted"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                            }`}
                          >
                            {timesheet.status === "submitted" ? (
                              <>
                                <Check className="h-4 w-4 mr-1" /> Submitted
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-1" /> Draft
                              </>
                            )}
                          </span>

                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100">
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Entries */}
                      {timesheet.entries.length > 0 && (
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Time Entries Summary
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            {timesheet.entries.map((entry) => {
                              const taskInfo = getTaskInfo(entry.taskId);
                              return (
                                <div
                                  key={entry._id}
                                  className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate mb-1">
                                        {taskInfo.description}
                                      </p>
                                      <div className="flex items-center text-xs text-gray-500 space-x-2">
                                        <span>
                                          {format(
                                            parseISO(entry.date),
                                            "EEE, MMM d"
                                          )}
                                        </span>
                                        <span
                                          className={`px-2 py-1 rounded-full ${
                                            taskInfo.priority === "high"
                                              ? "bg-red-100 text-red-600"
                                              : taskInfo.priority === "medium"
                                              ? "bg-yellow-100 text-yellow-600"
                                              : "bg-green-100 text-green-600"
                                          }`}
                                        >
                                          {taskInfo.priority}
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-400 mt-1">
                                        {taskInfo.project}
                                      </p>
                                    </div>
                                    <div className="ml-3 text-right">
                                      <div className="text-lg font-bold text-blue-600">
                                        {entry.actualHours}h
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        logged
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Weekly Summary */}
                          <div className="bg-white rounded-lg p-4 border-2 border-blue-100">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                  <TrendingUp className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-700">
                                    Weekly Total
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {timesheet.entries.length} time entries
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600">
                                  {timesheet.entries
                                    .reduce(
                                      (sum, entry) => sum + entry.actualHours,
                                      0
                                    )
                                    .toFixed(2)}
                                  h
                                </div>
                                <div className="text-xs text-gray-500">
                                  total hours
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyTimesheets;
