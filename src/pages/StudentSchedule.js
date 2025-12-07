
import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { studentService } from "../services/studentService";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

export default function StudentSchedule() {
    const { user } = useUser();
    const navigate = useNavigate();
    const [scheduleItems, setScheduleItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    // Constants
    const periods = Array.from({ length: 12 }, (_, i) => i + 1); // 1 to 12
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    // Helper to get dates for the current week (starting Monday)
    const getWeekDates = (baseDate) => {
        const dates = [];
        const currentDay = baseDate.getDay(); // 0 is Sunday, 1 is Monday
        const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay; // Calculate overlap to Monday

        // Start from Monday of the current week
        const monday = new Date(baseDate);
        monday.setDate(baseDate.getDate() + diffToMonday);

        for (let i = 0; i < 7; i++) {
            const day = new Date(monday);
            day.setDate(monday.getDate() + i);
            dates.push(day);
        }
        return dates;
    };

    const weekDates = getWeekDates(currentDate);

    useEffect(() => {
        if (user?.role === "student" && user.details?.id) {
            fetchSchedule();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchSchedule = async () => {
        try {
            setLoading(true);
            const data = await studentService.getStudentWeeklySchedule(user.details.id);
            setScheduleItems(data);
        } catch (error) {
            console.error("Error fetching schedule:", error);
        } finally {
            setLoading(false);
        }
    };

    // Helper to format date header
    const formatDateHeader = (date) => {
        const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
        const dayDate = date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" });
        return { dayName, dayDate };
    };

    // Helper to find class for a specific day and period
    const getClassForSlot = (dayName, period) => {
        const dayMap = {
            "1": "Monday", "2": "Tuesday", "3": "Wednesday",
            "4": "Thursday", "5": "Friday", "6": "Saturday", "7": "Sunday"
        };

        return scheduleItems.find(item => {
            // Handle day matching
            const itemDayName = dayMap[String(item.day)] || item.day;
            const isDayMatch = itemDayName === dayName;

            // Handle period matching (loose equality for string/number match)
            const isPeriodMatch = item.period == period;

            return isDayMatch && isPeriodMatch;
        });
    };

    const navigateWeek = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + (direction * 7));
        setCurrentDate(newDate);
    };

    // Helper to generate a consistent color for a program name
    const getColorForProgram = (programName) => {
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

    if (!user || user.role !== "student") {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
                <p>Please log in as a student to view your schedule.</p>
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
                        <CalendarIcon /> Weekly Schedule
                    </h1>
                </div>

                {/* Date Navigation */}
                <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                    <button onClick={() => navigateWeek(-1)} className="p-2 hover:bg-gray-100 rounded-md">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="px-4 font-semibold text-gray-700 min-w-[200px] text-center">
                        {weekDates[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {weekDates[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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
                                    {weekDates.map((date, index) => {
                                        const { dayName, dayDate } = formatDateHeader(date);
                                        const isToday = new Date().toDateString() === date.toDateString();
                                        return (
                                            <th key={index} className={`p-4 border-b border-gray-100 min-w-[140px] ${isToday ? 'bg-blue-50' : 'bg-white'}`}>
                                                <div className="flex flex-col items-center">
                                                    <span className={`text-sm font-bold ${isToday ? 'text-blue-600' : 'text-gray-800'}`}>
                                                        {dayName}
                                                    </span>
                                                    <span className={`text-xs mt-1 px-2 py-0.5 rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-gray-500 bg-gray-100'}`}>
                                                        {dayDate}
                                                    </span>
                                                </div>
                                            </th>
                                        );
                                    })}
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
                                        {daysOfWeek.map((dayName) => {
                                            const classItem = getClassForSlot(dayName, period);
                                            // Get color if class exists
                                            const colorClass = classItem ? getColorForProgram(classItem.program_name) : "";

                                            // Extract parts for styling children if needed, or just apply utility classes
                                            // colorClass looks like "bg-blue-100 border-blue-500 text-blue-800"

                                            return (
                                                <td key={dayName} className="border-b border-r border-gray-100 p-1 h-24 align-top relative">
                                                    {classItem && (
                                                        <div className={`absolute inset-1 border-l-4 rounded p-2 text-xs flex flex-col justify-between overflow-hidden hover:scale-[1.02] transition-transform shadow-sm cursor-pointer z-0 ${colorClass}`}>
                                                            <div>
                                                                <div className="font-bold text-sm truncate opacity-90" title={classItem.class_code}>
                                                                    {classItem.class_code}
                                                                </div>
                                                                <div className="text-xs font-semibold truncate opacity-80" title={classItem.program_name}>
                                                                    {classItem.program_name}
                                                                </div>
                                                                <div className="mt-0.5 truncate text-[10px] opacity-75" title={classItem.tutor_name}>
                                                                    {classItem.tutor_name}
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
