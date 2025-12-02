import { useState, useEffect } from "react";
import { scheduleService } from "../services/scheduleService";
import { classService } from "../services/classService";
import RoomSelectionModal from "./RoomSelectionModal";
import NotificationModal from "./NotificationModal";

export default function ScheduleEditor({ classId, tutorId }) {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);

    // State for single week navigation
    const [programInfo, setProgramInfo] = useState(null);
    const [currentWeek, setCurrentWeek] = useState(null);
    const [weekSchedule, setWeekSchedule] = useState([]); // Local state for the current week's schedule
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [currentConfiguringSlot, setCurrentConfiguringSlot] = useState(null);

    // Notification modal state
    const [notification, setNotification] = useState({
        isOpen: false,
        type: 'info',
        title: '',
        message: ''
    });

    // Constants
    const periods = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: `${i + 1}` }));
    const daysOfWeek = [
        { id: 1, name: 'Monday', short: 'Mon' },
        { id: 2, name: 'Tuesday', short: 'Tue' },
        { id: 3, name: 'Wednesday', short: 'Wed' },
        { id: 4, name: 'Thursday', short: 'Thu' },
        { id: 5, name: 'Friday', short: 'Fri' },
        { id: 6, name: 'Saturday', short: 'Sat' }
    ];

    useEffect(() => {
        fetchData();
    }, [classId, tutorId]);

    // Update weekSchedule when currentWeek or schedules change
    useEffect(() => {
        if (currentWeek && schedules.length > 0) {
            const currentWeekSchedules = schedules.filter(s => parseInt(s.weeks) === currentWeek);
            const formattedSchedule = currentWeekSchedules.map(s => ({
                day: parseInt(s.day),
                period: parseInt(s.period),
                room: s.room
            }));
            setWeekSchedule(formattedSchedule);
        } else if (currentWeek) {
            // If no schedules for this week (e.g., make-up class scenario), start empty
            setWeekSchedule([]);
        }
    }, [currentWeek, schedules]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. Fetch Class & Program Info to get week range
            const classDetails = await classService.getClassById(classId);
            console.log("📚 Class Details:", classDetails);

            if (!classDetails || !classDetails.program) {
                throw new Error("Could not load program details for this class.");
            }

            // Authorization Check
            if (classDetails.tutorId !== tutorId) {
                setIsAuthorized(false);
                console.log("🔒 Not authorized - tutorId mismatch:", { classDetails: classDetails.tutorId, current: tutorId });
            } else {
                setIsAuthorized(true);
                console.log("✅ Authorized");
            }

            const program = classDetails.program;
            const startWeek = program.start_week || 1;
            const endWeek = program.end_week || (startWeek + (program.number_of_week || 15) - 1);

            console.log("📅 Week Range:", { startWeek, endWeek, program });

            setProgramInfo({
                ...program,
                startWeek,
                endWeek,
                weeks: Array.from({ length: endWeek - startWeek + 1 }, (_, i) => startWeek + i)
            });

            // 2. Fetch Schedules
            const scheduleData = await scheduleService.getSchedulesByClassId(classId);
            console.log("📋 Fetched Schedules:", scheduleData);
            setSchedules(scheduleData);

            // Set initial week: First week with a schedule, or start week
            const weeksWithSchedule = [...new Set(scheduleData.map(s => parseInt(s.weeks)))].sort((a, b) => a - b);
            const initialWeek = weeksWithSchedule.length > 0 ? weeksWithSchedule[0] : startWeek;
            console.log("🎯 Initial Week:", initialWeek, "Weeks with schedules:", weeksWithSchedule);
            setCurrentWeek(initialWeek);

        } catch (err) {
            console.error("❌ Error fetching data:", err);
            setError(err.message || "Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleWeekChange = (week) => {
        setCurrentWeek(parseInt(week));
    };

    const handlePrevWeek = () => {
        if (programInfo && currentWeek > programInfo.startWeek) {
            setCurrentWeek(currentWeek - 1);
        }
    };

    const handleNextWeek = () => {
        if (programInfo && currentWeek < programInfo.endWeek) {
            setCurrentWeek(currentWeek + 1);
        }
    };

    const isSlotConfigured = (day, period) => {
        return weekSchedule.some(p => p.day === day && p.period === period);
    };

    const handleSlotClick = (day, period) => {
        if (!isAuthorized) return;
        setCurrentConfiguringSlot({ day, period });
        setShowRoomModal(true);
    };

    const handleSlotDelete = (day, period) => {
        if (!isAuthorized) return;
        const newSchedule = weekSchedule.filter(p => !(p.day === day && p.period === period));
        setWeekSchedule(newSchedule);
    };

    const handleRoomSelect = (room) => {
        if (!currentConfiguringSlot) return;

        const { day, period } = currentConfiguringSlot;

        // Remove existing config for this slot if any
        const otherPeriods = weekSchedule.filter(p => !(p.day === day && p.period === period));

        // Add new config
        const newSchedule = [...otherPeriods, { day, period, room }];

        setWeekSchedule(newSchedule);
        setCurrentConfiguringSlot(null);
    };

    const handleSave = async () => {
        if (!currentWeek || !isAuthorized) return;

        try {
            setSaving(true);
            setError(null);

            // 1. Delete existing schedules for THIS week only
            const schedulesToDelete = schedules.filter(s => parseInt(s.weeks) === currentWeek);

            const deletePromises = schedulesToDelete.map(s => scheduleService.deleteSchedule(s.id));
            await Promise.all(deletePromises);

            // 2. Create new schedules for THIS week
            const createPromises = weekSchedule.map(config =>
                scheduleService.createSchedule(classId, {
                    day: config.day.toString(),
                    period: config.period.toString(),
                    weeks: currentWeek.toString(),
                    room: config.room
                })
            );

            await Promise.all(createPromises);

            // Refresh data to ensure sync
            const updatedSchedules = await scheduleService.getSchedulesByClassId(classId);
            setSchedules(updatedSchedules);

            // Show success notification
            setNotification({
                isOpen: true,
                type: 'success',
                title: 'Schedule Saved',
                message: `Schedule for Week ${currentWeek} has been saved successfully!`
            });

        } catch (err) {
            console.error("Error saving schedule:", err);
            setError(err.message || "Failed to save changes");

            // Show error notification
            setNotification({
                isOpen: true,
                type: 'error',
                title: 'Save Failed',
                message: err.message || "Failed to save schedule changes. Please try again."
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Loading schedule data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                        <h3 className="font-semibold text-red-900">Error</h3>
                        <p className="text-red-700 text-sm mt-1">{error}</p>
                    </div>
                </div>
                <button
                    onClick={fetchData}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Manage Class Schedule</h2>
                <p className="text-sm text-gray-600 mt-1">
                    Navigate to a week and configure the schedule. You can add make-up classes in any available week.
                </p>
                {!isAuthorized && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-center gap-2">
                        <span className="text-xl">🔒</span>
                        <span>You are viewing this schedule in read-only mode because you are not the assigned tutor.</span>
                    </div>
                )}
            </div>

            {/* Week Navigation */}
            {programInfo && (
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <button
                        onClick={handlePrevWeek}
                        disabled={currentWeek <= programInfo.startWeek}
                        className="px-4 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous Week
                    </button>

                    <div className="flex items-center gap-3">
                        <span className="text-gray-600 font-medium">Current Week:</span>
                        <select
                            value={currentWeek}
                            onChange={(e) => handleWeekChange(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-700"
                        >
                            {programInfo.weeks.map(week => (
                                <option key={week} value={week}>
                                    Week {week}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleNextWeek}
                        disabled={currentWeek >= programInfo.endWeek}
                        className="px-4 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next Week
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Calendar Grid */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-blue-700">Week {currentWeek} Schedule</h3>
                        <p className="text-sm text-blue-600 mt-1">
                            {isAuthorized ? "Click slots to assign/edit rooms for this week" : "Read-only view"}
                        </p>
                    </div>
                    {isAuthorized && (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <div className="w-full min-w-[800px]">
                        {/* Header Row */}
                        <div className="grid" style={{ gridTemplateColumns: `100px repeat(${daysOfWeek.length}, 1fr)` }}>
                            <div className="p-3 bg-gray-50 border-r border-b border-gray-200 text-sm font-semibold text-gray-600 text-center">
                                Period
                            </div>
                            {daysOfWeek.map((day) => (
                                <div key={`hdr-${day.id}`} className="p-3 bg-gray-50 border-b border-gray-200 text-center text-sm font-semibold text-gray-600">
                                    {day.short}
                                </div>
                            ))}
                        </div>

                        {/* Period Rows */}
                        {periods.map((period) => (
                            <div key={`row-${period.id}`} className="grid" style={{ gridTemplateColumns: `100px repeat(${daysOfWeek.length}, 1fr)` }}>
                                {/* Period label */}
                                <div className="p-3 border-r border-b border-gray-200 text-sm font-medium text-gray-700 flex items-center justify-center bg-gray-50">
                                    {period.name}
                                </div>
                                {/* Day cells */}
                                {daysOfWeek.map((day) => {
                                    const isConfigured = isSlotConfigured(day.id, period.id);
                                    const slotConfig = weekSchedule.find(p => p.day === day.id && p.period === period.id);

                                    return (
                                        <div key={`cell-${day.id}-${period.id}`} className="relative h-16 border-b border-r border-gray-200">
                                            <button
                                                onClick={() => handleSlotClick(day.id, period.id)}
                                                disabled={!isAuthorized}
                                                className={`h-full w-full transition-colors ${isConfigured
                                                    ? 'bg-green-100 hover:bg-green-200'
                                                    : isAuthorized ? 'bg-white hover:bg-blue-50' : 'bg-gray-50'
                                                    }`}
                                            >
                                                {isConfigured && slotConfig?.room && (
                                                    <div className="flex flex-col items-center justify-center h-full">
                                                        <span className="text-xs font-bold text-green-800 bg-green-200 px-2 py-1 rounded-full">
                                                            {slotConfig.room}
                                                        </span>
                                                    </div>
                                                )}
                                            </button>

                                            {/* Delete button */}
                                            {isConfigured && isAuthorized && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSlotDelete(day.id, period.id);
                                                    }}
                                                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-sm z-10"
                                                    title="Clear slot"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex gap-6 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                    <span>Configured Slot</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
                    <span>Available Slot</span>
                </div>
            </div>

            {/* Room Selection Modal */}
            <RoomSelectionModal
                isOpen={showRoomModal}
                onClose={() => {
                    setShowRoomModal(false);
                    setCurrentConfiguringSlot(null);
                }}
                onSelectRoom={handleRoomSelect}
                selectedRoom={
                    currentConfiguringSlot
                        ? weekSchedule.find(
                            p => p.day === currentConfiguringSlot.day && p.period === currentConfiguringSlot.period
                        )?.room
                        : ''
                }
                selectedWeeks={currentWeek ? [currentWeek] : []}
                currentTimeSlot={currentConfiguringSlot}
            />

            {/* Notification Modal */}
            <NotificationModal
                isOpen={notification.isOpen}
                onClose={() => setNotification({ ...notification, isOpen: false })}
                type={notification.type}
                title={notification.title}
                message={notification.message}
            />
        </div>
    );
}
