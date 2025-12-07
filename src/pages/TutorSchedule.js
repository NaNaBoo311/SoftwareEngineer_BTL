
import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { tutorService } from "../services/tutorService";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

export default function TutorSchedule() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [scheduleItems, setScheduleItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(35); // Default to week 35 as per semester start

  // Constants
  const periods = Array.from({ length: 12 }, (_, i) => i + 1); // 1 to 12
  const daysOfWeek = [
    { id: 1, name: "Monday" },
    { id: 2, name: "Tuesday" },
    { id: 3, name: "Wednesday" },
    { id: 4, name: "Thursday" },
    { id: 5, name: "Friday" },
    { id: 6, name: "Saturday" },
    { id: 7, name: "Sunday" }
  ];

  useEffect(() => {
    if (user?.role === "tutor" && user.details?.id) {
      fetchSchedule();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const data = await tutorService.getTutorSchedules(user.details.id);

      // Map the nested tutor schedule structure
      const formattedItems = data.map(item => ({
        day: item.day,
        period: item.period,
        weeks: Array.isArray(item.weeks) ? item.weeks : [item.weeks], // Ensure array
        room: item.room,
        class_code: item.class?.class_code,
        program_name: item.class?.program?.name || "Unknown Program"
      }));

      setScheduleItems(formattedItems);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to find class for a specific day and period in the CURRENT WEEK
  const getClassForSlot = (dayId, period) => {
    return scheduleItems.find(item => {
      // 1. Match Day
      const isDayMatch = item.day == dayId;

      // 2. Match Period
      const isPeriodMatch = item.period == period;

      // 3. Match Week
      // item.weeks is array of strings/numbers like ["35", "36"]
      // We check if currentWeek is in that array
      const isWeekMatch = item.weeks.some(w => parseInt(w) === currentWeek);

      return isDayMatch && isPeriodMatch && isWeekMatch;
    });
  };

  const navigateWeek = (direction) => {
    setCurrentWeek(prev => {
      const next = prev + direction;
      // Optional: clamped between 1 and 52 or 35 and 50? 
      // Let's allow free navigation for now or semantic range if known.
      // Given StudentRegister uses 35-50, we might want to stay in that range or just open.
      // Let's keep it open but generic.
      return next > 0 ? next : 1;
    });
  };

  // Helper to generate a consistent color for a program name
  const getColorForProgram = (programName) => {
    if (!programName) return "bg-gray-100 border-gray-500 text-gray-800";

    const colors = [
      "bg-blue-100 border-blue-500 text-blue-800",
      "bg-green-100 border-green-500 text-green-800",
      "bg-purple-100 border-purple-500 text-purple-800",
      "bg-orange-100 border-orange-500 text-orange-800",
      "bg-pink-100 border-pink-500 text-pink-800",
      "bg-teal-100 border-teal-500 text-teal-800",
      "bg-indigo-100 border-indigo-500 text-indigo-800",
      "bg-rose-100 border-rose-500 text-rose-800",
    ];

    let hash = 0;
    for (let i = 0; i < programName.length; i++) {
      hash = programName.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  if (!user || user.role !== "tutor") {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
        <p>Please log in as a tutor to view your schedule.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-200 rounded-full transition"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-2">
            <CalendarIcon /> Teaching Schedule
          </h1>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-1">
          <button onClick={() => navigateWeek(-1)} className="p-2 hover:bg-gray-100 rounded-md">
            <ChevronLeft size={20} />
          </button>
          <span className="px-4 font-semibold text-gray-700 min-w-[150px] text-center">
            Week {currentWeek}
          </span>
          <button onClick={() => navigateWeek(1)} className="p-2 hover:bg-gray-100 rounded-md">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading schedule...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse">
              <thead>
                <tr>
                  <th className="p-4 border-b border-r border-gray-100 bg-gray-50 w-24 sticky left-0 z-10 text-gray-400 font-medium">
                    Period
                  </th>
                  {daysOfWeek.map((day) => (
                    <th key={day.id} className="p-4 border-b border-gray-100 min-w-[140px] bg-white">
                      <div className="flex flex-col items-center">
                        <span className="text-gray-800 font-bold text-sm">
                          {day.name}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periods.map((period) => (
                  <tr key={period} className="hover:bg-gray-50 transition-colors">
                    {/* Period Column */}
                    <td className="p-4 border-b border-r border-gray-100 bg-gray-50 text-center font-semibold text-gray-600 sticky left-0 z-10">
                      {period}
                    </td>

                    {/* Day Columns */}
                    {daysOfWeek.map((day) => {
                      const classItem = getClassForSlot(day.id, period);
                      // Get color if class exists
                      const colorClass = classItem ? getColorForProgram(classItem.program_name) : "";

                      return (
                        <td key={day.id} className="border-b border-r border-gray-100 p-1 h-24 align-top relative">
                          {classItem && (
                            <div className={`absolute inset-1 border-l-4 rounded p-2 text-xs flex flex-col justify-between overflow-hidden hover:scale-[1.02] transition-transform shadow-sm cursor-pointer z-0 ${colorClass}`}>
                              <div>
                                <div className="font-bold text-sm truncate opacity-90" title={classItem.class_code}>
                                  {classItem.class_code}
                                </div>
                                <div className="text-xs font-semibold truncate opacity-80" title={classItem.program_name}>
                                  {classItem.program_name}
                                </div>
                              </div>
                              <div className="font-medium flex items-center gap-1 mt-1 opacity-70">
                                <span className="bg-white/50 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
                                  Room {classItem.room}
                                </span>
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
