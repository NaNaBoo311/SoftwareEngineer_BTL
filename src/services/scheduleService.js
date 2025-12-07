import { supabase } from "../lib/supabaseClient";

class ScheduleService {
    /**
     * Get all schedules for a specific class
     * @param {number} classId - The ID of the class
     * @returns {Promise<Array>} Array of schedules with formatted data
     */
    async getSchedulesByClassId(classId) {
        const { data, error } = await supabase
            .from("schedules")
            .select(`
                id,
                class_id,
                day,
                period,
                weeks,
                room,
                class_mode,
                created_at
            `)
            .eq("class_id", classId)
            .order("weeks", { ascending: true })
            .order("day", { ascending: true })
            .order("period", { ascending: true });

        if (error) throw error;

        return data || [];
    }

    /**
     * Update a single schedule entry
     * @param {number} scheduleId - The ID of the schedule to update
     * @param {Object} updates - Object containing fields to update (day, period, weeks, room)
     * @returns {Promise<Object>} Updated schedule data
     */
    async updateSchedule(scheduleId, updates) {
        const { data, error } = await supabase
            .from("schedules")
            .update(updates)
            .eq("id", scheduleId)
            .select()
            .single();

        if (error) throw error;

        return data;
    }

    /**
     * Bulk update schedules matching specific criteria
     * @param {number} classId - The class ID
     * @param {Object} filters - Filters to match schedules (e.g., { day: "1", period: "1" })
     * @param {Object} updates - Fields to update
     * @returns {Promise<Array>} Updated schedules
     */
    async bulkUpdateSchedules(classId, filters, updates) {
        let query = supabase
            .from("schedules")
            .update(updates)
            .eq("class_id", classId);

        // Apply filters
        Object.keys(filters).forEach(key => {
            query = query.eq(key, filters[key]);
        });

        const { data, error } = await query.select();

        if (error) throw error;

        return data || [];
    }

    /**
     * Create a new schedule entry
     * @param {number} classId - The class ID
     * @param {Object} scheduleData - Schedule data (day, period, weeks, room)
     * @returns {Promise<Object>} Created schedule
     */
    async createSchedule(classId, scheduleData) {
        const { data, error } = await supabase
            .from("schedules")
            .insert({
                class_id: classId,
                ...scheduleData
            })
            .select()
            .single();

        if (error) throw error;

        return data;
    }

    /**
     * Delete a schedule entry
     * @param {number} scheduleId - The ID of the schedule to delete
     * @returns {Promise<void>}
     */
    async deleteSchedule(scheduleId) {
        const { error } = await supabase
            .from("schedules")
            .delete()
            .eq("id", scheduleId);

        if (error) throw error;
    }

    /**
     * Get grouped schedules by day and period for easier display
     * @param {number} classId - The class ID
     * @returns {Promise<Object>} Schedules grouped by day and period
     */
    async getGroupedSchedules(classId) {
        const schedules = await this.getSchedulesByClassId(classId);

        // Group by day and period
        const grouped = {};

        schedules.forEach(schedule => {
            const key = `${schedule.day}-${schedule.period}`;
            if (!grouped[key]) {
                grouped[key] = {
                    day: schedule.day,
                    period: schedule.period,
                    room: schedule.room,
                    weeks: [],
                    scheduleIds: []
                };
            }
            grouped[key].weeks.push(schedule.weeks);
            grouped[key].scheduleIds.push(schedule.id);
        });

        // Convert to array and sort weeks
        return Object.values(grouped).map(group => ({
            ...group,
            weeks: group.weeks.sort((a, b) => parseInt(a) - parseInt(b)),
            weeksRange: this._formatWeeksRange(group.weeks)
        }));
    }

    /**
     * Helper to format weeks array into a readable range
     * @private
     */
    // --- MAKEUP SCHEDULE METHODS ---

    /**
     * Get makeup schedules for a specific class
     */
    async getMakeupSchedules(classId) {
        const { data, error } = await supabase
            .from("schedule_makeup")
            .select("*")
            .eq("class_id", classId);

        if (error) throw error;
        return data || [];
    }

    /**
     * Add a record to schedule_makeup (type='added' or 'removed')
     * This effectively "saves" the makeup change.
     */
    async addMakeupSchedule(classId, scheduleData) {
        // scheduleData: { week, day, period, type, room, class_mode }
        const { data, error } = await supabase
            .from("schedule_makeup")
            .insert({
                class_id: classId,
                ...scheduleData
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Delete a record from schedule_makeup by its properties (undoing a change)
     * Used when user clicks on a 'Yellow' slot (delete added) or 'Gray' slot (restore removed)
     */
    async removeMakeupSchedule(classId, week, day, period) {
        // We delete ANY makeup record for this specific slot
        const { error } = await supabase
            .from("schedule_makeup")
            .delete()
            .eq("class_id", classId)
            .eq("week", week)
            .eq("day", day)
            .eq("period", period);

        if (error) throw error;
    }

    /**
     * Get all makeup schedules for classes taught by a specific tutor
     * Used for conflict detection across classes
     */
    async getMakeupSchedulesByTutor(tutorId) {
        // First get all classes by this tutor
        const { data: classes, error: classError } = await supabase
            .from("classes")
            .select("id")
            .eq("tutor_id", tutorId);

        if (classError) throw classError;

        const classIds = classes.map(c => c.id);

        if (classIds.length === 0) return [];

        // Then get makeup schedules for these classes
        const { data, error } = await supabase
            .from("schedule_makeup")
            .select("*")
            .in("class_id", classIds);

        if (error) throw error;
        return data || [];
    }

    _formatWeeksRange(weeks) {
        if (weeks.length === 0) return "";
        if (weeks.length === 1) return weeks[0];

        const sorted = weeks.map(w => parseInt(w)).sort((a, b) => a - b);
        const ranges = [];
        let start = sorted[0];
        let end = sorted[0];

        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] === end + 1) {
                end = sorted[i];
            } else {
                ranges.push(start === end ? `${start}` : `${start}-${end}`);
                start = sorted[i];
                end = sorted[i];
            }
        }
        ranges.push(start === end ? `${start}` : `${start}-${end}`);

        return ranges.join(", ");
    }
}

// Export a single shared instance
export const scheduleService = new ScheduleService();
