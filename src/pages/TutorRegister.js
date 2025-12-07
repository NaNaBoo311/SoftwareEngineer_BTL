import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tutorService } from '../services/tutorService';
import { programService } from '../services/programService';
import NotificationModal from '../components/NotificationModal';
import RoomSelectionModal from '../components/RoomSelectionModal';
import ModeSelectionModal from '../components/ModeSelectionModal';
import ProgramCard from '../components/ProgramCard';
import ClassCard from '../components/ClassCard';
import { useUser } from '../context/UserContext';

const TutorRegister = () => {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedWeeks, setSelectedWeeks] = useState([]);
  const [sharedConfiguration, setSharedConfiguration] = useState({ periods: [] });
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showModeModal, setShowModeModal] = useState(false);
  const [notification, setNotification] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' // success, error, warning, info
  });

  const showNotification = (title, message, type = 'info') => {
    setNotification({
      isOpen: true,
      title,
      message,
      type
    });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  };

  // State for programs and taken schedules
  const [programs, setPrograms] = useState([]);
  const [takenSchedules, setTakenSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Available periods (individual periods, range 1-12)
  const periods = [
    { id: 1, name: '1', count: 1 },
    { id: 2, name: '2', count: 1 },
    { id: 3, name: '3', count: 1 },
    { id: 4, name: '4', count: 1 },
    { id: 5, name: '5', count: 1 },
    { id: 6, name: '6', count: 1 },
    { id: 7, name: '7', count: 1 },
    { id: 8, name: '8', count: 1 },
    { id: 9, name: '9', count: 1 },
    { id: 10, name: '10', count: 1 },
    { id: 11, name: '11', count: 1 },
    { id: 12, name: '12', count: 1 }
  ];

  // Days of the week (excluding Sunday)
  const daysOfWeek = [
    { id: 1, name: 'Monday', short: 'Mon' },
    { id: 2, name: 'Tuesday', short: 'Tue' },
    { id: 3, name: 'Wednesday', short: 'Wed' },
    { id: 4, name: 'Thursday', short: 'Thu' },
    { id: 5, name: 'Friday', short: 'Fri' },
    { id: 6, name: 'Saturday', short: 'Sat' }
  ];

  // Function to load data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load programs with classes
      const programsData = await programService.getProgramsWithClasses();
      setPrograms(programsData);

      // Load taken schedules
      const takenSchedulesData = await programService.getTakenSchedules();
      setTakenSchedules(takenSchedulesData);

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load programs and schedules. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load programs and taken schedules on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Load existing schedules when a class is selected for modification
  useEffect(() => {
    if (selectedClass && user) {
      const isCurrentTutor = selectedClass.tutor_id === user.details.id;

      if (isCurrentTutor) {
        // Load existing schedules for this class
        const loadExistingSchedules = async () => {
          try {
            // Find existing schedules for this class
            const classSchedules = takenSchedules.find(schedule =>
              schedule.class_code === selectedClass.class_code
            );

            if (classSchedules && classSchedules.schedules) {
              // Extract unique weeks
              const weeks = [...new Set(classSchedules.schedules.map(s => s.week))].sort((a, b) => a - b);
              setSelectedWeeks(weeks);

              // Load the shared configuration from the first week (since all weeks have the same config)
              const firstWeekSchedules = classSchedules.schedules.filter(s => s.week === weeks[0]);
              const sharedPeriods = firstWeekSchedules.map(schedule => ({
                day: schedule.day,
                period: schedule.period,
                room: schedule.room,
                class_mode: schedule.class_mode || (schedule.room === 'Online' ? 'online' : 'offline')
              }));

              setSharedConfiguration({ periods: sharedPeriods });
            } else {
              // If no existing schedules, reset the configurations
              setSharedConfiguration({ periods: [] });
              setSelectedWeeks([]);
            }
          } catch (err) {
            console.error('Error loading existing schedules:', err);
          }
        };

        loadExistingSchedules();
      } else {
        // If not current tutor, reset configurations
        setSharedConfiguration({ periods: [] });
        setSelectedWeeks([]);
      }
    }
  }, [selectedClass, user, takenSchedules]);

  // Refetch data when entering step 3 to ensure schedules are up-to-date
  useEffect(() => {
    if (currentStep === 3) {
      loadData();
    }
  }, [currentStep]);

  // Generate available weeks based on program constraints
  const getAvailableWeeks = (program) => {
    if (!program) return [];
    const weeks = [];
    for (let i = program.start_week; i <= program.end_week; i++) {
      weeks.push(i);
    }
    return weeks;
  };

  // Validate week selection (total must equal program.number_of_week)
  const validateWeeks = (selectedWeeks, program) => {
    if (!program || selectedWeeks.length !== program.number_of_week) {
      return false;
    }
    return true;
  };


  const handleProgramSelect = (program) => {
    setSelectedProgram(program);
    setSelectedClass(null);
    setSelectedWeeks([]);
    setSharedConfiguration({ periods: [] });
    setCurrentStep(2);
  };

  // Filter programs based on search query
  const filteredPrograms = programs.filter(program => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      program.name?.toLowerCase().includes(query) ||
      program.description?.toLowerCase().includes(query) ||
      program.program_code?.toLowerCase().includes(query)
    );
  });

  const handleClassSelect = (classItem) => {
    console.log("Class Item", classItem);
    // Allow selection if class is available OR if current user is the assigned tutor
    const isCurrentTutor = user && classItem.tutor_id === user.details.id;

    if (classItem.available || isCurrentTutor) {
      setSelectedClass(classItem);
      setCurrentStep(3);
    }
  };

  const handleWeekToggle = (week) => {
    if (selectedWeeks.includes(week)) {
      setSelectedWeeks(selectedWeeks.filter(w => w !== week));
    } else {
      if (selectedWeeks.length < selectedProgram.number_of_week) {
        setSelectedWeeks([...selectedWeeks, week]);
      }
    }
  };

  const handleSharedConfiguration = (day, period, room) => {
    const currentConfig = sharedConfiguration;

    // Check if we're trying to add more periods than allowed
    if (currentConfig.periods.length >= selectedProgram?.period_per_week) {
      showNotification('Limit Reached', `You can only have ${selectedProgram?.period_per_week} period(s) per week for this program.`, 'warning');
      return;
    }

    // Check if this specific slot is already configured
    const isSlotAlreadyConfigured = currentConfig.periods.some(p => p.day === day && p.period === period);
    if (isSlotAlreadyConfigured) {
      showNotification('Slot Configured', 'This time slot is already configured.', 'info');
      return;
    }

    const newPeriods = [...currentConfig.periods, { day, period, room }];

    setSharedConfiguration({
      periods: newPeriods
    });
  };

  const handleSlotClick = (day, period) => {
    const slotKey = `${day}-${period}`;
    setCurrentConfiguringSlot(slotKey);

    // Check if this specific slot is already configured
    const isSlotConfigured = sharedConfiguration?.periods?.some(p => p.day === day && p.period === period);

    if (isSlotConfigured) {
      // If configured, maybe allow edit/delete? For now just show modal to overwrite?
      // Or just do nothing / let delete handle it.
      // Existing logic opened room modal. Let's keep opening logic but maybe ask mode again?
      // Actually, typically click on filled slot might mean "edit".
      // Let's stick to existing flow: open mode modal.
      setShowModeModal(true);
    } else {
      setShowModeModal(true);
    }
  };

  const handleModeSelect = (mode) => {
    setShowModeModal(false);
    if (mode === 'online') {
      if (currentConfiguringSlot) {
        const [day, period] = currentConfiguringSlot.split('-').map(Number);
        handleSharedConfiguration(day, period, 'Online', 'online');
        setCurrentConfiguringSlot(null);
      }
    } else {
      setShowRoomModal(true);
    }
  };

  const handleSlotDelete = (day, period) => {
    const config = sharedConfiguration;
    if (config && config.periods) {
      // Remove the specific period from the shared configuration
      const newPeriods = config.periods.filter(p => !(p.day === day && p.period === period));

      setSharedConfiguration({
        periods: newPeriods
      });
    }
  };

  const isSlotConfigured = (day, period) => {
    return sharedConfiguration && sharedConfiguration.periods && sharedConfiguration.periods.some(p => p.day === day && p.period === period);
  };

  const isSharedConfigurationComplete = () => {
    if (!sharedConfiguration || !sharedConfiguration.periods) return false;

    // Check if the shared configuration has exactly the required number of periods
    return sharedConfiguration.periods.length === selectedProgram?.period_per_week;
  };


  const handleUnregister = async () => {
    if (!selectedClass || !user) return;

    const isCurrentTutor = selectedClass.tutor_id === user.details.id;
    if (!isCurrentTutor) {
      showNotification('Permission Denied', 'You can only unregister from classes you are assigned to.', 'error');
      return;
    }

    if (window.confirm(`Are you sure you want to unregister from class ${selectedClass.class_code}? This will remove all your schedules and make the class available for other tutors.`)) {
      try {
        setLoading(true);
        await programService.unregisterTutorFromClass(selectedClass.id);
        showNotification('Success', 'Successfully unregistered from the class!', 'success');

        // Refresh data to show updated class status
        await loadData();

        // Reset form state
        setSelectedClass(null);
        setSelectedWeeks([]);
        setSharedConfiguration({ periods: [] });
        setCurrentStep(1);
      } catch (error) {
        console.error('Unregister failed:', error);
        showNotification('Unregister Failed', error.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUnregisterFromClass = async (classId) => {
    try {
      setLoading(true);
      await programService.unregisterTutorFromClass(classId);
      showNotification('Success', 'Successfully unregistered from the class!', 'success');

      // Refresh data to show updated class status
      await loadData();
    } catch (error) {
      console.error('Unregister failed:', error);
      showNotification('Unregister Failed', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const [currentConfiguringSlot, setCurrentConfiguringSlot] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateWeeks(selectedWeeks, selectedProgram)) {
      showNotification('Invalid Weeks', 'Please select the correct number of weeks as required by the program.', 'warning');
      return;
    }

    // Check if the shared configuration has the correct number of periods
    if (!isSharedConfigurationComplete()) {
      showNotification('Incomplete Schedule', `Please configure exactly ${selectedProgram?.period_per_week} period(s) for your schedule.`, 'warning');
      return;
    }

    // Validate for Overlaps (Redundant check for safety)
    for (const config of sharedConfiguration.periods) {
      // Check against all taken schedules
      for (const classSched of takenSchedules) {
        if (String(classSched.id) === String(selectedClass?.id)) continue;
        if (String(classSched.tutor_id) === String(user.details.id)) {
          const hasConflict = classSched.schedules.some(s =>
            parseInt(s.day) === parseInt(config.day) &&
            parseInt(s.period) === parseInt(config.period) &&
            selectedWeeks.some(week => parseInt(week) === parseInt(s.week))
          );
          if (hasConflict) {
            showNotification('Schedule Conflict', `You already have ${classSched.class_code} scheduled at Period ${config.period} on Day ${config.day} during selected weeks.`, 'error');
            return;
          }
        }
      }
    }

    // Convert shared configuration to per-week configurations
    const weekConfigurations = {};
    selectedWeeks.forEach(week => {
      weekConfigurations[week] = { periods: [...sharedConfiguration.periods] };
    });
    try {
      setLoading(true);

      // Prepare tutor information
      const tutorInfo = user ? {
        id: user.details.id,
        name: user.full_name || user.email || 'Unknown Tutor'
      } : null;

      // Check if this is a modification of existing assignment
      const isModification = user && selectedClass?.tutor_id === user.details.id;

      if (isModification) {
        // Update existing tutor assignment
        await programService.updateTutorAssignment(selectedClass.id, weekConfigurations, tutorInfo);
        alert('Tutor assignment updated successfully!');
      } else {
        // Create new tutor assignment
        await programService.saveSchedulesForClass(selectedClass.id, weekConfigurations, tutorInfo);
        showNotification('Success', 'Tutor assignment successful!', 'success');
      }

      // Refresh data to show updated class status
      await loadData();

      // Reset form state
      setSelectedClass(null);
      setSelectedWeeks([]);
      setSharedConfiguration({ periods: [] });
      setCurrentStep(1);

    } catch (error) {
      console.error('Assignment failed:', error);
      showNotification('Assignment Failed', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => {
    if (userLoading) {
      return (
        <div className="max-w-6xl mx-auto p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading user information...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return (
        <div className="max-w-6xl mx-auto p-8">
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
            <p className="text-lg text-gray-600 mb-6">Please log in to register as a tutor.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="max-w-6xl mx-auto p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading programs...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="max-w-6xl mx-auto p-8">
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Data</h2>
            <p className="text-lg text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4"> Tutor Class Assignment</h1>
          {user && (
            <div className="mt-4 inline-block bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <p className="text-sm text-blue-700">
                Logged in as: <span className="font-semibold">{user.full_name || user.email}</span>
              </p>
            </div>
          )}
        </div>

        <div className="mb-8">

          {/* Search Bar */}
          {programs.length > 0 && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search programs by name or code."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-700 placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="mt-2 text-sm text-gray-600 text-center">
                  Found {filteredPrograms.length} program{filteredPrograms.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}

          {programs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Programs Available</h3>
              <p className="text-gray-500">There are currently no programs available for tutor assignment.</p>
            </div>
          ) : filteredPrograms.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Programs Found</h3>
              <p className="text-gray-500">No programs match your search criteria.</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredPrograms.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  onClick={handleProgramSelect}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStep2 = () => (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <button
          onClick={() => setCurrentStep(1)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Program Selection</span>
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Select Class for {selectedProgram?.name}</h2>
        </div>
      </div>

      <div className="space-y-4">
        {selectedProgram?.classes.map((classItem) => (
          <ClassCard
            key={classItem.id}
            classItem={classItem}
            user={user}
            onClassSelect={handleClassSelect}
            onUnregister={handleUnregisterFromClass}
          />
        ))}
      </div>
    </div>
  );

  const renderCalendarSchedule = () => {
    const availableWeeks = getAvailableWeeks(selectedProgram);

    // Helper to check if the time slot is occupied by the CURRENT TUTOR in another class
    const isTimeOccupiedByMe = (dayId, periodId) => {
      if (!user?.details?.id || !selectedWeeks.length) return null;

      // Iterate through all taken schedules
      for (const classSched of takenSchedules) {
        // Skip the current class we are editing (using unique ID)
        if (String(classSched.id) === String(selectedClass?.id)) continue;

        // Check if this class is taught by ME (normalize IDs to strings for safety)
        if (String(classSched.tutor_id) === String(user.details.id)) {
          // Check if there is a schedule conflict
          const hasConflict = classSched.schedules.some(s =>
            parseInt(s.day) === parseInt(dayId) &&
            parseInt(s.period) === parseInt(periodId) &&
            selectedWeeks.some(week => parseInt(week) === parseInt(s.week))
          );

          if (hasConflict) return classSched;
        }
      }
      return null;
    };

    return (
      <div className="p-6">
        {/* Header with week selection */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-800">Select Weeks to Teach</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableWeeks.map((week) => (
              <button
                key={week}
                onClick={() => handleWeekToggle(week)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${selectedWeeks.includes(week)
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                disabled={selectedWeeks.length >= selectedProgram?.number_of_week && !selectedWeeks.includes(week)}
              >
                Week {week}
              </button>
            ))}
          </div>
          {selectedWeeks.length > 0 && (
            <p className="text-sm text-gray-600 mt-3">
              Selected: {selectedWeeks.sort((a, b) => a - b).join(', ')} ({selectedWeeks.length}/{selectedProgram?.number_of_week} weeks)
            </p>
          )}
        </div>

        {/* Single Shared Calendar */}
        {selectedWeeks.length > 0 && (
          <div className="overflow-x-auto">
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Calendar Header */}
              <div className="px-4 py-4 bg-blue-50 border-b border-blue-100">
                <div className="text-center">
                  <span className="text-lg font-bold text-blue-700">Configure Your Schedule</span>
                  <p className="text-sm text-blue-600 mt-1">This schedule will apply to all selected weeks</p>
                </div>
              </div>

              {/* Calendar Table */}
              <div className="w-full">
                {/* Header Row */}
                <div className="grid" style={{ gridTemplateColumns: `200px repeat(${daysOfWeek.length}, minmax(120px, 1fr))` }}>
                  <div className="p-3 bg-gray-50 border-r border-b border-gray-200 text-sm font-semibold text-gray-600">Period</div>
                  {daysOfWeek.map((day) => (
                    <div key={`hdr-${day.id}`} className="p-3 bg-gray-50 border-b border-gray-200 text-center text-sm font-semibold text-gray-600">
                      {day.short}
                    </div>
                  ))}
                </div>

                {/* Period Rows */}
                {periods.map((period) => (
                  <div key={`row-${period.id}`} className="grid" style={{ gridTemplateColumns: `200px repeat(${daysOfWeek.length}, minmax(120px, 1fr))` }}>
                    {/* Period label (leftmost) */}
                    <div className="p-3 border-r border-b border-gray-200 text-sm font-medium text-gray-700 flex items-center justify-center">
                      {period.name}
                    </div>
                    {/* Day cells */}
                    {daysOfWeek.map((day) => {
                      const isConfigured = isSlotConfigured(day.id, period.id);
                      const slotConfig = sharedConfiguration?.periods?.find(p => p.day === day.id && p.period === period.id);
                      const occupiedByMeClass = isTimeOccupiedByMe(day.id, period.id);

                      return (
                        <div key={`cell-${day.id}-${period.id}`} className="relative h-12 border-b border-gray-200">
                          <button
                            onClick={() => !occupiedByMeClass && handleSlotClick(day.id, period.id)}
                            disabled={!!occupiedByMeClass}
                            className={`h-full w-full relative transition-all duration-200 ${occupiedByMeClass
                              ? 'bg-red-50 border-2 border-red-200 cursor-not-allowed' // Occupied style
                              : isConfigured
                                ? slotConfig?.class_mode === 'online'
                                  ? 'bg-blue-100 border-2 border-blue-400' // Online style
                                  : 'bg-green-100 border-2 border-green-400' // Offline style
                                : 'bg-gray-50 hover:bg-gray-100 hover:border-blue-300 border border-transparent'
                              }`}
                            title={
                              occupiedByMeClass
                                ? `Occupied by your class: ${occupiedByMeClass.class_code}`
                                : isConfigured
                                  ? `${slotConfig?.class_mode === 'online' ? 'Online Class' : `Room: ${slotConfig?.room}`}`
                                  : 'Click to configure'
                            }
                          >
                            {occupiedByMeClass && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                                <span className="text-[10px] font-bold text-red-400">Busy</span>
                                <span className="text-[10px] text-red-300 truncate w-full text-center">
                                  {occupiedByMeClass.class_code}
                                </span>
                                <span className="text-[9px] text-red-300 truncate w-full text-center opacity-75">
                                  {occupiedByMeClass.program_name}
                                </span>
                              </div>
                            )}

                            {!occupiedByMeClass && isConfigured && (
                              <div className="absolute inset-0 flex items-center justify-center p-1">
                                <span className={`text-sm font-bold truncate w-full text-center ${slotConfig?.class_mode === 'online' ? 'text-blue-700' : 'text-green-700'
                                  }`}>
                                  {slotConfig?.class_mode === 'online' ? 'Online' : slotConfig?.room}
                                </span>
                              </div>
                            )}
                          </button>

                          {/* Delete button for configured slots */}
                          {isConfigured && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSlotDelete(day.id, period.id);
                              }}
                              className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                              title="Delete this schedule"
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
        )}

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 border-2 border-green-400 rounded"></div>
            <span>Your Schedule (shows room code)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 border border-red-400 rounded"></div>
            <span>Your Occupied Slots</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
            <span>Available</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">Instructions:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• First, select the weeks you want to teach from the buttons above</li>
            <li>• Then, configure your schedule in the calendar below</li>
            <li>• Click any slot to select a time and room</li>
            <li>• The same schedule will automatically apply to ALL selected weeks</li>
            <li>• Click the red × button to delete a configured slot</li>
            <li>• Green slots show your selected room code</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <button
          onClick={() => setCurrentStep(2)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Class Selection</span>
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {user && selectedClass?.tutor_id === user.details.id ? '📝 Modify Your Class Schedule' : '📅 Schedule Your Classes'}
          </h2>
          <p className="text-gray-600">
            Class: <span className="font-semibold text-blue-600">{selectedClass?.class_code}</span>
            {user && selectedClass?.tutor_id === user.details.id && (
              <span className="ml-2 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                Your Assignment
              </span>
            )}
          </p>
          {user && selectedClass?.tutor_id === user.details.id && (
            <div className="mt-4">
              <button
                onClick={handleUnregister}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm mx-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>{loading ? 'Unregistering...' : 'Unregister from Class'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Program Information */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📋</span>
          Program Requirements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-xl border border-blue-100 text-center">
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl mr-3">⏱️</span>
              <span className="font-semibold text-gray-700">Periods per week</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">{selectedProgram?.period_per_week}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-blue-100 text-center">
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl mr-3">📅</span>
              <span className="font-semibold text-gray-700">Total weeks</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">{selectedProgram?.number_of_week}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-blue-100 text-center">
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl mr-3">🗓️</span>
              <span className="font-semibold text-gray-700">Week range</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">{selectedProgram?.start_week} - {selectedProgram?.end_week}</span>
          </div>
        </div>
      </div>

      {/* Calendar Schedule Interface */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          📅 Select Your Teaching Schedule
        </h3>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {renderCalendarSchedule()}
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-12 flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={
            loading ||
            !validateWeeks(selectedWeeks, selectedProgram) ||
            !isSharedConfigurationComplete()
          }
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <span className="flex items-center space-x-2">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>{user && selectedClass?.tutor_id === user.details.id ? 'Updating Assignment...' : 'Saving Assignment...'}</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{user && selectedClass?.tutor_id === user.details.id ? 'Update Assignment' : 'Complete Assignment'}</span>
              </>
            )}
          </span>
        </button>
      </div>

      {/* Room Selection Modal */}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      {/* Modals placed here to be available across all steps if needed, 
          though Room/Mode are mostly for Step 3, Notification is for all */}
      <RoomSelectionModal
        isOpen={showRoomModal}
        onClose={() => {
          setShowRoomModal(false);
          setCurrentConfiguringSlot(null);
        }}
        onSelectRoom={(room) => {
          if (currentConfiguringSlot) {
            const [day, period] = currentConfiguringSlot.split('-').map(Number);
            handleSharedConfiguration(day, period, room, 'offline');
          }
        }}
        selectedWeeks={selectedWeeks}
        takenSchedules={takenSchedules}
        currentTimeSlot={
          currentConfiguringSlot
            ? {
              day: Number(currentConfiguringSlot.split('-')[0]),
              period: Number(currentConfiguringSlot.split('-')[1])
            }
            : null
        }
        currentClassCode={selectedClass?.class_code}
      />

      <ModeSelectionModal
        isOpen={showModeModal}
        onClose={() => {
          setShowModeModal(false);
          setCurrentConfiguringSlot(null);
        }}
        onSelectMode={handleModeSelect}
      />

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={closeNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
};

export default TutorRegister;
