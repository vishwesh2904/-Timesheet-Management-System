import React, { useState, useEffect } from "react";
import {
  FileCheck,
  AlertCircle,
  Filter,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  User,
  Search,
  Download,
  Eye,
  CheckCircle2,
  FileText,
} from "lucide-react";
import axios from "axios";

function ViewTimesheets() {
  const base_url = "https://timesheet-management-system-api.vercel.app";
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTimesheets, setExpandedTimesheets] = useState({});
  const [filters, setFilters] = useState({
    status: "all",
    associate: "all",
  });
  const [associates, setAssociates] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchTimesheets = async () => {
      try {
        const response = await axios.get(`${base_url}/api/timesheets/all`);
        setTimesheets(response.data.timesheets);

        const uniqueAssociates = [
          ...new Set(response.data.timesheets?.map((ts) => ts.userId)),
        ];
        setAssociates(
          uniqueAssociates.map((id) => {
            const timesheet = response.data.timesheets?.find(
              (ts) => ts.userId === id
            );
            return {
              id: timesheet.userId._id,
              name: timesheet.userId.name || "Unknown",
            };
          })
        );

        setLoading(false);
      } catch (err) {
        console.error("Error fetching timesheets:", err);
        setError("Failed to load timesheets. Please try again later.");
        setLoading(false);
      }
    };

    fetchTimesheets();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleTimesheet = (id) => {
    setExpandedTimesheets((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredTimesheets = timesheets.filter((timesheet) => {
    // Status filter
    if (filters.status !== "all") {
      const isSubmitted = timesheet.status === "submitted";
      if (filters.status === "submitted" && !isSubmitted) return false;
      if (filters.status === "draft" && isSubmitted) return false;
    }

    // Associate filter
    if (
      filters.associate !== "all" &&
      timesheet.userId._id !== filters.associate
    ) {
      return false;
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const userName = timesheet?.userId?.name?.toLowerCase() || "";
      const weekStart = formatDate(timesheet.weekStart).toLowerCase();
      return userName.includes(searchLower) || weekStart.includes(searchLower);
    }

    return true;
  });

  const getStatusBadge = (status) => {
    if (status === "submitted") {
      return {
        bg: "bg-emerald-50 border-emerald-200",
        text: "text-emerald-700",
        icon: CheckCircle2,
        label: "Submitted",
      };
    }
    return {
      bg: "bg-amber-50 border-amber-200",
      text: "text-amber-700",
      icon: FileText,
      label: "Draft",
    };
  };

  const getTotalHours = (entries, type = "actual") => {
    return entries.reduce((sum, entry) => {
      if (type === "estimated") {
        return (
          sum + (entry?.estimatedHours || entry?.taskId?.estimatedHours || 0)
        );
      }
      return sum + (entry?.actualHours || entry?.taskId?.actualHours || 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading timesheets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-8 max-w-md w-full">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
            Something went wrong
          </h3>
          <p className="text-red-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Timesheets
              </h1>
              <p className="text-gray-600">Manage and review team timesheets</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
                <span className="text-sm font-medium text-gray-600">
                  Total:{" "}
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {filteredTimesheets.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by associate name "
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  showFilters
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Filter className="h-5 w-5" />
                Filters
                {showFilters ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="all">All Statuses</option>
                      <option value="submitted">Submitted</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Associate
                    </label>
                    <select
                      name="associate"
                      value={filters.associate}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="all">All Associates</option>
                      {associates.map((associate) => (
                        <option key={associate.id} value={associate.id}>
                          {associate.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Timesheets List */}
        {filteredTimesheets.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileCheck className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No timesheets found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters or search terms.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTimesheets.map((timesheet) => {
              const statusInfo = getStatusBadge(timesheet.status);
              const StatusIcon = statusInfo.icon;
              const totalActualHours = getTotalHours(
                timesheet.entries,
                "actual"
              );
              const totalEstimatedHours = getTotalHours(
                timesheet.entries,
                "estimated"
              );
              const isExpanded = expandedTimesheets[timesheet._id];

              return (
                <div
                  key={timesheet._id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="p-6">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleTimesheet(timesheet._id)}
                    >
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg">
                          {(timesheet?.userId?.name || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        {/* Info */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {timesheet?.userId?.name || "Unknown User"}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Week of {formatDate(timesheet.weekStart)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {totalActualHours}h logged
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Status Badge */}
                        <div
                          className={`px-3 py-1.5 rounded-full border ${statusInfo.bg} ${statusInfo.text} flex items-center gap-2`}
                        >
                          <StatusIcon className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {statusInfo.label}
                          </span>
                        </div>

                        {/* Expand Button */}
                        <div className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <div className="text-blue-600 text-sm font-medium mb-1">
                              Estimated Hours
                            </div>
                            <div className="text-2xl font-bold text-blue-700">
                              {totalEstimatedHours}
                            </div>
                          </div>
                          <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                            <div className="text-green-600 text-sm font-medium mb-1">
                              Actual Hours
                            </div>
                            <div className="text-2xl font-bold text-green-700">
                              {totalActualHours}
                            </div>
                          </div>
                          <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                            <div className="text-purple-600 text-sm font-medium mb-1">
                              Variance
                            </div>
                            <div className="text-2xl font-bold text-purple-700">
                              {totalActualHours - totalEstimatedHours > 0
                                ? "+"
                                : ""}
                              {totalActualHours - totalEstimatedHours}h
                            </div>
                          </div>
                        </div>

                        {/* Entries Table */}
                        <div className="bg-gray-50 rounded-xl overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-white border-b border-gray-200">
                                <tr>
                                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">
                                    Date
                                  </th>
                                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">
                                    Task Description
                                  </th>
                                  <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900">
                                    Est. Hours
                                  </th>
                                  <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900">
                                    Actual Hours
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {timesheet.entries.map((entry, index) => (
                                  <tr
                                    key={index}
                                    className="hover:bg-white transition-colors"
                                  >
                                    <td className="px-4 py-4 text-sm text-gray-600">
                                      {formatDate(entry?.taskId?.date)}
                                    </td>
                                    <td className="px-4 py-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {entry?.taskId?.description ||
                                          "Unknown Task"}
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                      <span className="text-sm font-medium text-blue-600">
                                        {entry?.taskId?.estimatedHours ||
                                          entry?.estimatedHours ||
                                          "N/A"}
                                      </span>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                      <span className="text-sm font-medium text-green-600">
                                        {entry?.taskId?.actualHours ||
                                          entry?.actualHours ||
                                          0}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Submission Info */}
                        {timesheet.status === "submitted" &&
                          timesheet.submittedAt && (
                            <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
                              <div className="flex items-center gap-2 text-sm text-green-700">
                                <CheckCircle2 className="h-4 w-4" />
                                Submitted on{" "}
                                {formatDateTime(timesheet.submittedAt)}
                              </div>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewTimesheets;
