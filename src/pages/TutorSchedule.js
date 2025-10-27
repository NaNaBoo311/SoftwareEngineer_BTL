import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tutorService } from '../services/tutorService';
import { useUser } from '../context/UserContext';

const TutorSchedule = () => {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Days of the week (Monday to Saturday)
  const daysOfWeek = [
    { id: 1, name: 'Monday', short: 'Mon' },
    { id: 2, name: 'Tuesday', short: 'Tue' },
    { id: 3, name: 'Wednesday', short: 'Wed' },
    { id: 4, name: 'Thursday', short: 'Thu' },
    { id: 5, name: 'Friday', short: 'Fri' },
    { id: 6, name: 'Saturday', short: 'Sat' }
  ];

  // Periods 1-12
  const periods = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: String(i + 1) }));

  // Color palette for different classes
  const classColors = [
    { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700', hover: 'hover:bg-blue-200' },
    { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-700', hover: 'hover:bg-green-200' },
    { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-700', hover: 'hover:bg-purple-200' },
    { bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-700', hover: 'hover:bg-orange-200' },
    { bg: 'bg-pink-100', border: 'border-pink-400', text: 'text-pink-700', hover: 'hover:bg-pink-200' },
    { bg: 'bg-indigo-100', border: 'border-indigo-400', text: 'text-indigo-700', hover: 'hover:bg-indigo-200' },
    { bg: 'bg-teal-100', border: 'border-teal-400', text: 'text-teal-700', hover: 'hover:bg-teal-200' },
    { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-700', hover: 'hover:bg-red-200' }
  ];

  const [classColorMap, setClassColorMap] = useState({});

  // Fetch schedules on mount
  useEffect(() => {
    if (user?.details?.id) {
      loadSchedules();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await tutorService.getTutorSchedules(user.details.id);
      const normalized = data.map(s => ({
        ...s,
        day: Number(s.day),
        period: Number(s.period),
        weeks: Array.isArray(s.weeks)
          ? s.weeks
          : s.weeks
            ? String(s.weeks)
                .split(',')
                .map(w => Number(w.trim()))
            : [] // default empty
      }));
      
      setSchedules(normalized);
      // Assign unique colors to each class
      const uniqueClasses = [...new Set(data.map(s => s.class?.class_code).filter(Boolean))];
      const colorMapping = {};
      uniqueClasses.forEach((classCode, index) => {
        colorMapping[classCode] = classColors[index % classColors.length];
      });
      setClassColorMap(colorMapping);

    } catch (err) {
      console.error('Error loading schedules:', err);
      setError('Failed to load schedules. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get schedule for a specific day and period
  const getScheduleForSlot = (day, period) => {
    return schedules.find(schedule => 
      Number(schedule.day) === day && Number(schedule.period) === period
    );
  };

  // Loading state
  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 font-medium">
            {userLoading ? 'Loading user information...' : 'Loading schedules...'}
          </p>
        </div>
      </div>
    );
  }

  // Authentication required
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-7xl mb-6">🔒</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-lg text-gray-600 mb-8">Please log in to view your teaching schedules.</p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-7xl mb-6">⚠️</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Error Loading Schedules</h2>
          <p className="text-lg text-gray-600 mb-8">{error}</p>
          <button
            onClick={loadSchedules}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
            My Teaching Schedule
          </h1>

          {user && (
            <div className="inline-block bg-blue-50 border-2 border-blue-200 rounded-xl px-6 py-3 shadow-sm">
              <p className="text-sm md:text-base text-blue-700">
                Tutor: <span className="font-bold">{user.full_name || user.email}</span>
              </p>
            </div>
          )}
        </div>

        {/* Empty state */}
        {schedules.length === 0 ? (
          <div className="text-center py-16 md:py-24">
            <div className="text-gray-400 text-7xl md:text-8xl mb-6">📅</div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-600 mb-4">No Schedules Yet</h3>
            <p className="text-base md:text-lg text-gray-500 mb-8 max-w-md mx-auto">
              You haven't been assigned to any classes yet. Register for classes to get started.
            </p>
            <button
              onClick={() => navigate('/tutor-register')}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg"
            >
              Register for Classes
            </button>
          </div>
        ) : (
          <>
            {/* Calendar Grid */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-6xl mx-auto">
              {/* Calendar Header */}
              <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 border-b border-blue-700">
                <div className="text-center">
                  <h2 className="text-lg md:text-xl font-bold text-white">
                    Teaching Schedule Calendar
                  </h2>
                </div>
              </div>

              {/* Calendar Table */}
              <div className="overflow-x-auto">
                <div className="min-w-[700px]">
                  {/* Header Row: Days of Week */}
                  <div 
                    className="grid bg-gray-100 border-b-2 border-gray-300"
                    style={{ gridTemplateColumns: `80px repeat(6, 1fr)` }}
                  >
                    <div className="p-2 border-r border-gray-300 text-xs md:text-sm font-bold text-gray-700 flex items-center justify-center">
                      Period
                    </div>
                    {daysOfWeek.map((day) => (
                      <div 
                        key={`hdr-${day.id}`} 
                        className="p-2 text-center text-xs md:text-sm font-bold text-gray-700 border-r border-gray-300 last:border-r-0"
                      >
                        {day.short}
                      </div>
                    ))}
                  </div>

                  {/* Period Rows */}
                  {periods.map((period) => (
                    <div 
                      key={`row-${period.id}`}
                      className="grid border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                      style={{ gridTemplateColumns: `80px repeat(6, 1fr)` }}
                    >
                      {/* Period Label */}
                      <div className="p-2 border-r border-gray-300 bg-gray-50 text-xs md:text-sm font-semibold text-gray-700 flex items-center justify-center">
                        {period.name}
                      </div>

                      {/* Day Cells */}
                      {daysOfWeek.map((day) => {
                        const schedule = getScheduleForSlot(day.id, period.id);
                        const color = schedule ? classColorMap[schedule.class?.class_code] : null;
                        
                        return (
                          <div 
                            key={`cell-${day.id}-${period.id}`}
                            className={`relative min-h-[70px] p-2 border-r border-gray-200 last:border-r-0 transition-all duration-300 ${
                              schedule 
                                ? `${color?.bg} ${color?.hover} border-l-4 ${color?.border}` 
                                : 'bg-white hover:bg-gray-50'
                            }`}
                          >
                            {schedule ? (
                              <div className="h-full flex flex-col justify-center items-center space-y-0.5">
                                {/* Program Code */}
                                <div className={`text-[10px] ${color?.text} font-medium text-center opacity-80`}>
                                  {schedule.class?.program?.program_code || ''}
                                </div>
                                
                                {/* Class Code */}
                                <div className={`text-xs font-bold ${color?.text} text-center`}>
                                  {schedule.class?.class_code || 'N/A'}
                                </div>
                                
                                {/* Room Number */}
                                <div className={`text-xs ${color?.text} font-semibold text-center`}>
                                  {schedule.room}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-300">
                <div className="flex flex-wrap gap-3 text-xs items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
                    <span className="text-gray-700 font-medium">No Class</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-100 border-l-4 border-blue-400 rounded"></div>
                    <span className="text-gray-700 font-medium">Scheduled Class</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TutorSchedule;
