import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tutorService } from '../services/tutorService';
import { programService } from '../services/programService';
import RoomSelectionModal from '../components/RoomSelectionModal';
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

  // State for programs and taken schedules
  const [programs, setPrograms] = useState([]);
  const [takenSchedules, setTakenSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
                room: schedule.room
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
      alert(`You can only have ${selectedProgram?.period_per_week} period(s) per week for this program.`);
      return;
    }
    
    // Check if this specific slot is already configured
    const isSlotAlreadyConfigured = currentConfig.periods.some(p => p.day === day && p.period === period);
    if (isSlotAlreadyConfigured) {
      alert('This time slot is already configured.');
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
      setShowRoomModal(true);
    } else {
      // Don't configure the slot yet - just open room modal
      // The slot will only be configured when room is actually selected
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
      alert('You can only unregister from classes you are assigned to.');
      return;
    }
    
    if (window.confirm(`Are you sure you want to unregister from class ${selectedClass.class_code}? This will remove all your schedules and make the class available for other tutors.`)) {
      try {
        setLoading(true);
        await programService.unregisterTutorFromClass(selectedClass.id);
        alert('Successfully unregistered from the class!');
        
        // Refresh data to show updated class status
        await loadData();
        
        // Reset form state
        setSelectedClass(null);
        setSelectedWeeks([]);
        setSharedConfiguration({ periods: [] });
        setCurrentStep(1);
      } catch (error) {
        console.error('Unregister failed:', error);
        alert('Unregister failed: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUnregisterFromClass = async (classId) => {
    try {
      setLoading(true);
      await programService.unregisterTutorFromClass(classId);
      alert('Successfully unregistered from the class!');
      
      // Refresh data to show updated class status
      await loadData();
    } catch (error) {
      console.error('Unregister failed:', error);
      alert('Unregister failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const [currentConfiguringSlot, setCurrentConfiguringSlot] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateWeeks(selectedWeeks, selectedProgram)) {
      alert('Please select the correct number of weeks as required by the program.');
      return;
    }

    // Check if the shared configuration has the correct number of periods
    if (!isSharedConfigurationComplete()) {
      alert(`Please configure exactly ${selectedProgram?.period_per_week} period(s) for your schedule.`);
      return;
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
        alert('Tutor assignment successful!');
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
      alert('Assignment failed: ' + error.message);
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
          <h1 className="text-4xl font-bold text-gray-800 mb-4">🎓 Tutor Class Assignment</h1>
          <p className="text-lg text-gray-600">Choose a program and assign yourself to a class</p>
          {user && (
            <div className="mt-4 inline-block bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <p className="text-sm text-blue-700">
                Logged in as: <span className="font-semibold">{user.full_name || user.email}</span>
              </p>
            </div>
          )}
        </div>
        
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">📚 Select Program to Teach</h3>
          {programs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Programs Available</h3>
              <p className="text-gray-500">There are currently no programs available for tutor assignment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {programs.map((program) => (
                <div
                  key={program.id}
                  className="group bg-white border-2 border-gray-200 rounded-2xl p-8 cursor-pointer hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => handleProgramSelect(program)}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                      <span className="text-2xl">📖</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xl text-gray-800">{program.name}</h4>
                      <p className="text-blue-600 font-medium">{program.program_code}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{program.description}</p>
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <span className="bg-gray-100 px-3 py-1 rounded-full">Click to select</span>
                  </div>
                </div>
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
          <h2 className="text-3xl font-bold text-gray-800 mb-2">🏫 Select Class for {selectedProgram?.name}</h2>
          <p className="text-gray-600">Choose an available class to teach</p>
        </div>
      </div>

      <div className="space-y-4">
        {selectedProgram?.classes.map((classItem) => {
          const isCurrentTutor = user && classItem.tutor_id === user.details.id;
          const isSelectable = classItem.available || isCurrentTutor;
          
          return (
            <div
              key={classItem.id}
              className={`border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                isSelectable
                  ? isCurrentTutor 
                    ? 'border-blue-200 bg-blue-50 hover:border-blue-300 hover:bg-blue-100 hover:shadow-lg'
                    : 'border-green-200 bg-green-50 hover:border-green-300 hover:bg-green-100 hover:shadow-lg'
                  : 'border-red-200 bg-red-50 cursor-not-allowed opacity-75'
              }`}
              onClick={() => handleClassSelect(classItem)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isCurrentTutor ? 'bg-blue-100' : classItem.available ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <span className="text-2xl">
                      {isCurrentTutor ? '👤' : classItem.available ? '✅' : '❌'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-gray-800">{classItem.class_code}</h4>
                    <p className={`text-sm ${
                      isCurrentTutor 
                        ? 'text-blue-600' 
                        : classItem.available 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {isCurrentTutor 
                        ? `Your assigned class - Click to modify` 
                        : classItem.available 
                        ? 'Available for assignment' 
                        : `Taken by ${classItem.tutor_name}`
                      }
                    </p>
                    {isCurrentTutor && (
                      <div className="mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Are you sure you want to unregister from class ${classItem.class_code}? This will remove all your schedules and make the class available for other tutors.`)) {
                              handleUnregisterFromClass(classItem.id);
                            }
                          }}
                          className="text-xs text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
                        >
                          Unregister from this class
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {isSelectable && (
                  <div className={isCurrentTutor ? 'text-blue-600' : 'text-green-600'}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderCalendarSchedule = () => {
    const availableWeeks = getAvailableWeeks(selectedProgram);
    
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
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  selectedWeeks.includes(week)
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
                      
                      return (
                        <div key={`cell-${day.id}-${period.id}`} className="relative h-12 border-b border-gray-200">
                          <button
                            onClick={() => handleSlotClick(day.id, period.id)}
                            className={`h-full w-full ${
                              isConfigured
                                ? 'bg-green-100 border-2 border-green-400'
                                : 'bg-gray-50 hover:bg-blue-50 hover:border-blue-300'
                            }`}
                            title={
                              isConfigured 
                                ? `Configured: ${slotConfig?.room || 'No room'}` 
                                : 'Click to configure'
                            }
                          >
                            {isConfigured && slotConfig?.room && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs text-green-700 font-medium truncate px-1">
                                  {slotConfig.room}
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
      <RoomSelectionModal
        isOpen={showRoomModal}
        onClose={() => {
          setShowRoomModal(false);
          setCurrentConfiguringSlot(null);
        }}
        onSelectRoom={(room) => {
          // Get the slot information from the current configuring slot
          const slotParts = currentConfiguringSlot?.split('-');
          if (slotParts && slotParts.length === 2) {
            const day = parseInt(slotParts[0]);
            const period = parseInt(slotParts[1]);
            
            // Configure the slot with the selected room
            // (conflict checking is already done in the modal)
            handleSharedConfiguration(day, period, room);
          }
          setShowRoomModal(false);
          setCurrentConfiguringSlot(null);
        }}
        takenSchedules={takenSchedules}
        selectedWeeks={selectedWeeks}
        currentTimeSlot={currentConfiguringSlot ? {
          week: null,
          day: parseInt(currentConfiguringSlot.split('-')[0]),
          period: parseInt(currentConfiguringSlot.split('-')[1])
        } : null}
        currentClassCode={selectedClass?.class_code}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
    </div>
  );
};

export default TutorRegister;
