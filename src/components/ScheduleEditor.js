import { useState, useEffect } from "react";
import { scheduleService } from "../services/scheduleService";
import { classService } from "../services/classService";
import { notificationService } from "../services/notificationService";
import { programService } from "../services/programService";
import RoomSelectionModal from "./RoomSelectionModal";
import ModeSelectionModal from "./ModeSelectionModal";
import NotificationModal from "./NotificationModal";

export default function ScheduleEditor({ classId, tutorId }) {
    const [schedules, setSchedules] = useState([]); // Real schedules
    const [makeupSchedules, setMakeupSchedules] = useState([]); // Makeup schedules (Current Class)
    const [tutorMakeupSchedules, setTutorMakeupSchedules] = useState([]); // Makeup schedules (All Tutor's Classes)

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [takenSchedules, setTakenSchedules] = useState([]);
    const [students, setStudents] = useState([]);
    const [tutorName, setTutorName] = useState('');

    // State for single week navigation
    const [programInfo, setProgramInfo] = useState(null);
    const [currentWeek, setCurrentWeek] = useState(null);
    const [weekSchedule, setWeekSchedule] = useState([]); // Visual state for current week
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [showModeModal, setShowModeModal] = useState(false);
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

    // Update weekSchedule when currentWeek or schedules/makeup change
    useEffect(() => {
        if (!currentWeek) return;

        // 1. Get Real Schedules for this week
        const realForWeek = schedules.filter(s => parseInt(s.weeks) === currentWeek).map(s => ({
            day: parseInt(s.day),
            period: parseInt(s.period),
            room: s.room,
            class_mode: s.class_mode || (s.room === 'Online' ? 'online' : 'offline'),
            source: 'real',
            id: s.id
        }));

        // 2. Get Makeup Schedules for this week
        const makeupForWeek = makeupSchedules.filter(s => parseInt(s.week) === currentWeek);

        // 3. Merge Logic
        // Start with Real
        let effective = [...realForWeek];

        // Apply "Removed" makeups (Mark as removed, don't delete, so we can show Gray)
        makeupForWeek.filter(m => m.type === 'removed').forEach(rem => {
            const index = effective.findIndex(e => e.day === rem.day && e.period === rem.period && e.source === 'real');
            if (index !== -1) {
                effective[index] = { ...effective[index], status: 'removed' }; // Mark as removed (Gray)
            }
        });

        // Apply "Added" makeups
        makeupForWeek.filter(m => m.type === 'added').forEach(add => {
            // Check if already exists (shouldn't if valid, but overlap check handles safety)
            // If a real slot exists there and wasn't removed, we have a conflict/overlap in DB, but let's just add.
            effective.push({
                day: parseInt(add.day),
                period: parseInt(add.period),
                room: add.room,
                class_mode: add.class_mode,
                source: 'makeup_added',
                id: add.id // Makeup ID
            });
        });

        setWeekSchedule(effective);

    }, [currentWeek, schedules, makeupSchedules]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. Fetch Class & Program Info
            const classDetails = await classService.getClassById(classId);
            if (!classDetails || !classDetails.program) throw new Error("Could not load program details.");

            if (classDetails.tutorId !== tutorId) setIsAuthorized(false);
            else setIsAuthorized(true);

            const program = classDetails.program;
            const startWeek = program.start_week || 1;
            const endWeek = program.end_week || (startWeek + (program.number_of_week || 15) - 1);

            setProgramInfo({
                ...program,
                startWeek,
                endWeek,
                weeks: Array.from({ length: endWeek - startWeek + 1 }, (_, i) => startWeek + i)
            });

            // 2. Fetch Real Schedules
            const scheduleData = await scheduleService.getSchedulesByClassId(classId);
            setSchedules(scheduleData);
            setTutorName(classDetails.tutorName || 'The Tutor');

            // 3. Fetch Makeup Schedules
            const makeupData = await scheduleService.getMakeupSchedules(classId);
            setMakeupSchedules(makeupData);

            // 4. Fetch Taken Schedules
            const takenData = await programService.getTakenSchedules();
            setTakenSchedules(takenData);

            // 5. Fetch Students
            const studentData = await classService.getStudentsInClass(classId);
            setStudents(studentData);

            // 6. Fetch ALL Makeup Schedules for this Tutor (for conflict detection)
            if (tutorId) {
                const allTutorMakeups = await scheduleService.getMakeupSchedulesByTutor(tutorId);
                setTutorMakeupSchedules(allTutorMakeups);
            }

            // Initial Week
            const weeksWithSchedule = [...new Set(scheduleData.map(s => parseInt(s.weeks)))].sort((a, b) => a - b);
            const initialWeek = weeksWithSchedule.length > 0 ? weeksWithSchedule[0] : startWeek;
            setCurrentWeek(initialWeek);

        } catch (err) {
            console.error("Error fetching data:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleWeekChange = (week) => setCurrentWeek(parseInt(week));
    const handlePrevWeek = () => programInfo && currentWeek > programInfo.startWeek && setCurrentWeek(currentWeek - 1);
    const handleNextWeek = () => programInfo && currentWeek < programInfo.endWeek && setCurrentWeek(currentWeek + 1);

    const isTimeOccupiedByMe = (dayId, periodId) => {
        if (!tutorId || !takenSchedules) return null;

        for (const classSched of takenSchedules) {
            // Skip current class
            if (classSched.id === parseInt(classId)) continue;

            // Check only my classes
            if (classSched.tutor_id === tutorId) {
                // 1. Check Real Schedule
                const hasRealSchedule = classSched.schedules.some(s => s.day === dayId && s.period === periodId && s.week === currentWeek);

                // Get relevant makeups for this specific class
                const classMakeups = tutorMakeupSchedules.filter(m => m.class_id === classSched.id && parseInt(m.week) === currentWeek);

                // Check if Removed (Cancellation)
                const isRemoved = classMakeups.some(m => m.type === 'removed' && parseInt(m.day) === dayId && parseInt(m.period) === periodId);

                // Check if Added (Makeup)
                const isAdded = classMakeups.some(m => m.type === 'added' && parseInt(m.day) === dayId && parseInt(m.period) === periodId);

                // Determining Conflict:
                // Conflict if (Real AND !Removed) OR (Added)
                if ((hasRealSchedule && !isRemoved) || isAdded) {
                    return classSched;
                }
            }
        }
        return null;
    };

    const handleSlotClick = (day, period) => {
        if (!isAuthorized) return;
        const occupied = isTimeOccupiedByMe(day, period);
        if (occupied) return;

        // Interactive Logic:
        // 1. If Empty -> Configure (Add)
        // 2. If Real (Normal) -> Delete (Mark Removed)
        // 3. If Makeup Added (Yellow) -> Delete (Remove Makeup)
        // 4. If Real Removed (Gray) -> Restore (Remove Makeup 'removed' record)

        // Find current status in visual state
        const slot = weekSchedule.find(s => s.day === day && s.period === period);

        if (!slot) {
            // Case 1: Empty -> Add
            setCurrentConfiguringSlot({ day, period });
            setShowModeModal(true);
        } else if (slot.source === 'real' && slot.status !== 'removed') {
            // Case 2: Real -> Delete (create removed makeup)
            // We'll treat this as immediate local state update for now, effectively diffing in Save
            // Actually, for immediate visual feedback of "Gray", we need to update local state.
            // But wait, our state is strictly derived from DB state (schedules, makeupSchedules).
            // To support "Drafting", we should modify `makeupSchedules` locally? 
            // Yes, let's treat `makeupSchedules` as the draft state.

            // "Remove" means adding a 'removed' entry to makeupSchedules
            const newMakeup = {
                class_id: classId,
                week: currentWeek,
                day,
                period,
                type: 'removed'
                // room/mode null
            };
            setMakeupSchedules([...makeupSchedules, newMakeup]);

        } else if (slot.source === 'makeup_added') {
            // Case 3: Added -> Delete (Remove from makeupSchedules)
            // Filter out this specific added record. 
            // Note: DB ID might be missing if it's a draft. We match by day/period/week/type.
            const newMakeups = makeupSchedules.filter(m =>
                !(parseInt(m.week) === currentWeek && parseInt(m.day) === day && parseInt(m.period) === period && m.type === 'added')
            );
            setMakeupSchedules(newMakeups);

        } else if (slot.status === 'removed') {
            // Case 4: Real Removed (Gray) -> Restore (Remove 'removed' entry from makeupSchedules)
            const newMakeups = makeupSchedules.filter(m =>
                !(parseInt(m.week) === currentWeek && parseInt(m.day) === day && parseInt(m.period) === period && m.type === 'removed')
            );
            setMakeupSchedules(newMakeups);
        }
    };

    const handleModeSelect = (mode) => {
        setShowModeModal(false);
        const { day, period } = currentConfiguringSlot;

        if (mode === 'online') {
            addMakeupSlot(day, period, 'Online', 'online');
        } else {
            setShowRoomModal(true);
        }
    };

    const handleRoomSelect = (room) => {
        const { day, period } = currentConfiguringSlot;
        addMakeupSlot(day, period, room, 'offline');
        setCurrentConfiguringSlot(null); // Close modal triggers this usually, but safe here
    };

    const addMakeupSlot = (day, period, room, mode) => {
        const newMakeup = {
            class_id: classId,
            week: currentWeek,
            day,
            period,
            type: 'added',
            room,
            class_mode: mode
        };
        setMakeupSchedules([...makeupSchedules, newMakeup]);
        setCurrentConfiguringSlot(null);
    };

    const handleSave = async () => {
        if (!currentWeek || !isAuthorized) return;

        try {
            setSaving(true);

            // We need to sync `makeupSchedules` state to DB.
            // Simplified approach: Identify new changes since fetch? 
            // Or just clear week makeups in DB and re-insert? (Risky if concurrency)
            // Better: Diff against *fetched* makeupSchedules? 
            // Actually, we haven't kept "original" makeup state separate.
            // Let's rely on "Changes" detection similar to before but targeting the makeup table.

            // Wait, previous Save logic was "Calculate Diffs (Added vs Removed) for Notification".
            // NOW we also need to PERSIST these diffs to `schedule_makeup`.
            // But we already modified `makeupSchedules` locally to match the desired end state.

            // Implementation:
            // 1. Compare current local `makeupSchedules` (for this week) with DB state (re-fetch? or assume initial load was DB state).
            // To do this properly, let's just use the `addMakeupSchedule` / `removeMakeupSchedule` API we made.

            // Actually, simplest robust way given current variable state:
            // The `makeupSchedules` state variable holds the DESIRED makeup configuration.
            // We can just iterate through it. 
            // But wait, we didn't track what was *already* in DB vs what is *new*.
            // We need to reload the initial state or re-fetch to diff.

            // Re-fetch current DB makeup for this week to diff
            const dbMakeups = await scheduleService.getMakeupSchedules(classId);
            // Filter for current week
            const dbWeekMakeups = dbMakeups.filter(m => parseInt(m.week) === currentWeek);
            const localWeekMakeups = makeupSchedules.filter(m => parseInt(m.week) === currentWeek);

            // Detect NEW adds (in local, not in DB)
            const toInsert = localWeekMakeups.filter(l =>
                !dbWeekMakeups.some(d => d.day === l.day && d.period === l.period && d.type === l.type)
            );

            // Detect DELETES (in DB, not in local) -> These are "Undos" of makeup actions
            const toDelete = dbWeekMakeups.filter(d =>
                !localWeekMakeups.some(l => l.day === d.day && l.period === d.period && l.type === l.type)
            );

            // Execute DB updates
            for (const item of toInsert) {
                await scheduleService.addMakeupSchedule(classId, item);
            }
            for (const item of toDelete) {
                await scheduleService.removeMakeupSchedule(classId, item.week, item.day, item.period);
            }

            // --- Notification Logic ---
            // Re-calculate effective schedule changes for notification
            // We can reuse the "Diff" logic from before, merging real + makeup
            // Calculate "Original Real" vs "Current Effective"

            const originalReal = schedules.filter(s => parseInt(s.weeks) === currentWeek).map(s => ({
                day: parseInt(s.day),
                period: parseInt(s.period),
                room: s.room,
                class_mode: s.class_mode,
                key: `${s.day}-${s.period}`
            }));

            // Current Effective (calculated in render loop, re-calc here)
            const effective = [...originalReal];
            // Apply local makeups
            localWeekMakeups.filter(m => m.type === 'removed').forEach(rem => {
                const idx = effective.findIndex(e => e.day === rem.day && e.period === rem.period);
                if (idx !== -1) effective.splice(idx, 1); // Remove from "Effective" view for notification diff
            });
            localWeekMakeups.filter(m => m.type === 'added').forEach(add => {
                effective.push({
                    day: parseInt(add.day),
                    period: parseInt(add.period),
                    room: add.room,
                    class_mode: add.class_mode,
                    key: `${add.day}-${add.period}`
                });
            });

            // Notification Diff: Original Real vs Effective
            const changes = [];

            // Added? (In Effective, not in Original Real)
            effective.forEach(eff => {
                const orig = originalReal.find(o => o.key === eff.key);
                if (!orig) {
                    changes.push(`[+] Added: ${formatSlot(eff)}`);
                }
                // If changed logic needed (e.g. room change)? 
                // Currently we model "Change" as Remove Old + Add New, so it appears as [-] then [+]. Valid.
            });

            // Removed? (In Original Real, not in Effective)
            originalReal.forEach(orig => {
                if (!effective.find(e => e.key === orig.key)) {
                    changes.push(`[-] Removed: ${formatSlot(orig)}`);
                }
            });

            if (changes.length > 0) {
                const userIds = students.map(s => s.userId).filter(id => id);
                if (userIds.length > 0) {
                    const title = `Schedule Update: Week ${currentWeek}`;
                    const courseName = programInfo?.name || "Unknown Course";
                    const message = `The schedule for ${courseName} - Week ${currentWeek} has been updated by ${tutorName}.\n\nChanges:\n${changes.join('\n')}\n\n`;

                    await notificationService.createBulkNotifications(userIds, title, message, 'warning');
                }
            }

            setNotification({
                isOpen: true,
                type: 'success',
                title: 'Success',
                message: "Schedule updated successful"
            });

            // Refresh data to get IDs etc
            fetchData();

        } catch (err) {
            console.error(err);
            setNotification({
                isOpen: true,
                type: 'error',
                title: 'Error',
                message: "Failed to save schedule"
            });
        } finally {
            setSaving(false);
        }
    };

    const formatSlot = (s) => {
        const dayName = daysOfWeek.find(d => d.id === (s.day || parseInt(s.day)))?.name || 'Unknown Day';
        const mode = s.class_mode === 'online' || s.room === 'Online' ? 'Online' : `Room ${s.room}`;
        return `${dayName} Period ${s.period} (${mode})`;
    };

    if (loading) return <div className="text-center py-12">Loading...</div>;
    if (error) return <div className="text-red-600 p-6">{error}</div>;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Manage Class Schedule</h2>
                <p className="text-sm text-gray-600 mt-1">
                    Manage updates (Makeup/Cancel) for this week.
                    <br />
                    <span className="text-xs">
                        <span className="inline-block w-3 h-3 bg-yellow-100 border border-yellow-300 mr-1"></span>Added (Makeup)
                        <span className="inline-block w-3 h-3 bg-gray-200 border border-gray-400 ml-3 mr-1"></span>Removed (Cancelled)
                        <span className="inline-block w-3 h-3 bg-white border border-gray-300 ml-3 mr-1"></span>Available
                    </span>
                </p>
            </div>

            {/* Week Nav */}
            {programInfo && (
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <button onClick={handlePrevWeek} disabled={currentWeek <= programInfo.startWeek} className="px-4 py-2 hover:bg-gray-100 rounded-lg">Prev</button>
                    <select value={currentWeek} onChange={(e) => handleWeekChange(e.target.value)} className="px-4 py-2 border rounded-lg font-bold text-blue-700">
                        {programInfo.weeks.map(week => <option key={week} value={week}>Week {week}</option>)}
                    </select>
                    <button onClick={handleNextWeek} disabled={currentWeek >= programInfo.endWeek} className="px-4 py-2 hover:bg-gray-100 rounded-lg">Next</button>
                </div>
            )}

            {/* Calendar */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-blue-700">Week {currentWeek}</h3>
                    {isAuthorized && (
                        <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <div className="w-full min-w-[800px]">
                        {/* Header */}
                        <div className="grid" style={{ gridTemplateColumns: `100px repeat(${daysOfWeek.length}, 1fr)` }}>
                            <div className="p-3 bg-gray-50 border-r border-b text-center font-semibold text-gray-600">Period</div>
                            {daysOfWeek.map(d => <div key={d.id} className="p-3 bg-gray-50 border-b text-center font-semibold text-gray-600">{d.short}</div>)}
                        </div>
                        {/* Body */}
                        {periods.map(period => (
                            <div key={period.id} className="grid" style={{ gridTemplateColumns: `100px repeat(${daysOfWeek.length}, 1fr)` }}>
                                <div className="p-3 border-r border-b bg-gray-50 flex items-center justify-center font-medium">{period.name}</div>
                                {daysOfWeek.map(day => {
                                    const occupied = isTimeOccupiedByMe(day.id, period.id);
                                    const slot = weekSchedule.find(s => s.day === day.id && s.period === period.id);

                                    // Determine Visual Style
                                    let bgClass = 'bg-white hover:bg-blue-50'; // Default Empty
                                    let label = '';

                                    if (occupied) {
                                        bgClass = 'bg-red-50 border-2 border-red-200 cursor-not-allowed';
                                        label = `Busy: ${occupied.class_code}`;
                                    } else if (slot) {
                                        if (slot.status === 'removed') {
                                            bgClass = 'bg-gray-200 border-2 border-gray-400 opacity-60'; // Gray (Removed)
                                            label = `Cancelled: ${slot.room}`;
                                        } else if (slot.source === 'makeup_added') {
                                            bgClass = 'bg-yellow-100 hover:bg-yellow-200 border-2 border-yellow-300'; // Yellow (Added)
                                            label = `Added: ${slot.class_mode === 'online' ? 'Online' : slot.room}`;
                                        } else {
                                            // Real / Normal
                                            bgClass = slot.class_mode === 'online'
                                                ? 'bg-blue-100 hover:bg-blue-200 border-2 border-blue-300'
                                                : 'bg-green-100 hover:bg-green-200 border-2 border-green-300';
                                            label = slot.class_mode === 'online' ? 'Online' : `Room ${slot.room}`;
                                        }
                                    }

                                    return (
                                        <div key={`${day.id}-${period.id}`} className="relative h-16 border-b border-r">
                                            <button
                                                onClick={() => handleSlotClick(day.id, period.id)}
                                                disabled={!isAuthorized || (!!occupied && !slot)} // Allow clicking occupied IF we have a slot there? No, occupied means blocked by OTHER class.
                                                className={`h-full w-full transition-colors relative flex flex-col items-center justify-center p-1 ${bgClass}`}
                                                title={label}
                                            >
                                                {label && <span className="text-[10px] font-bold text-center leading-tight truncate w-full">{label}</span>}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <RoomSelectionModal
                isOpen={showRoomModal}
                onClose={() => { setShowRoomModal(false); setCurrentConfiguringSlot(null); }}
                onSelectRoom={handleRoomSelect}
                selectedRoom={''}
                selectedWeeks={[currentWeek]}
                currentTimeSlot={currentConfiguringSlot}
            />

            <ModeSelectionModal
                isOpen={showModeModal}
                onClose={() => { setShowModeModal(false); setCurrentConfiguringSlot(null); }}
                onSelectMode={handleModeSelect}
            />

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
