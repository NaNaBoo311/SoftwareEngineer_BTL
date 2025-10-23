import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tutorService } from '../services/tutorService';
import { programService } from '../services/programService';
import RoomSelectionModal from '../components/RoomSelectionModal';

const TutorRegister = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedWeeks, setSelectedWeeks] = useState([]);
  const [weekConfigurations, setWeekConfigurations] = useState({});
  const [isOffline, setIsOffline] = useState(true); // Default to offline
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('');

  // Dummy data for programs with taken schedules
  const [programs, setPrograms] = useState([
    {
      id: 1,
      name: 'Software Engineering',
      program_code: 'SE101',
      description: 'Introduction to Software Engineering',
      period_of_week: 2,
      number_of_week: 7,
      start_week: 35,
      end_week: 50,
      classes: [
        { id: 1, class_code: 'CC01', tutor_name: null, available: true },
        { id: 2, class_code: 'CC02', tutor_name: 'Dr. Smith', available: false },
        { id: 3, class_code: 'CC03', tutor_name: null, available: true }
      ]
    },
    {
      id: 2,
      name: 'Data Structures',
      program_code: 'DS201',
      description: 'Advanced Data Structures and Algorithms',
      period_of_week: 3,
      number_of_week: 10,
      start_week: 30,
      end_week: 45,
      classes: [
        { id: 4, class_code: 'CC04', tutor_name: null, available: true },
        { id: 5, class_code: 'CC05', tutor_name: 'Prof. Johnson', available: false }
      ]
    }
  ]);

  // Dummy data for taken schedules to prevent overlap
  const [takenSchedules, setTakenSchedules] = useState([
    {
      class_code: 'CC02',
      tutor_name: 'Dr. Smith',
      schedules: [
        { week: 35, day: 1, period: 1, room: 'A1-101 (Building A1 - Computer Science, 1st Floor)' },
        { week: 36, day: 1, period: 1, room: 'A1-101 (Building A1 - Computer Science, 1st Floor)' },
        { week: 37, day: 1, period: 1, room: 'A1-101 (Building A1 - Computer Science, 1st Floor)' }
      ]
    },
    {
      class_code: 'CC05',
      tutor_name: 'Prof. Johnson',
      schedules: [
        { week: 30, day: 2, period: 2, room: 'B1-201 (Building B1 - Mathematics, 2nd Floor)' },
        { week: 31, day: 2, period: 2, room: 'B1-201 (Building B1 - Mathematics, 2nd Floor)' },
        { week: 32, day: 2, period: 2, room: 'B1-201 (Building B1 - Mathematics, 2nd Floor)' }
      ]
    }
  ]);

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

  // Generate available weeks based on program constraints
  const getAvailableWeeks = (program) => {
    if (!program) return [];
    const weeks = [];
    for (let i = program.start_week; i <= program.end_week; i++) {
      weeks.push(i);
    }
    return weeks;
  };

  // Validate period selection (must match program requirements)
  const validatePeriods = (selectedPeriods, program) => {
    if (!program || !selectedPeriods) return false;
    
    // Calculate total periods selected
    const totalPeriods = selectedPeriods.reduce((sum, period) => sum + period.count, 0);
    return totalPeriods === program.period_of_week;
  };

  // Validate week selection (total must equal program.number_of_week)
  const validateWeeks = (selectedWeeks, program) => {
    if (!program || selectedWeeks.length !== program.number_of_week) {
      return false;
    }
    return true;
  };

  // Check if a schedule slot is taken
  const isScheduleTaken = (week, day, period, room) => {
    return takenSchedules.some(schedule => 
      schedule.schedules.some(s => 
        s.week === week && s.day === day && s.period === period && s.room === room
      )
    );
  };

  // Get taken schedules for display
  const getTakenSchedulesForDisplay = () => {
    return takenSchedules.map(schedule => ({
      ...schedule,
      displayText: schedule.schedules.map(s => 
        `Week ${s.week}, ${daysOfWeek.find(d => d.id === s.day)?.name}, ${periods.find(p => p.id === s.period)?.name}, ${s.room}`
      ).join('; ')
    }));
  };

  const handleProgramSelect = (program) => {
    setSelectedProgram(program);
    setSelectedClass(null);
    setSelectedWeeks([]);
    setWeekConfigurations({});
    setCurrentStep(2);
  };

  const handleClassSelect = (classItem) => {
    if (classItem.available) {
      setSelectedClass(classItem);
      setCurrentStep(3);
    }
  };

  const handleWeekToggle = (week) => {
    if (selectedWeeks.includes(week)) {
      setSelectedWeeks(selectedWeeks.filter(w => w !== week));
      // Remove configuration for this week
      const newConfigs = { ...weekConfigurations };
      delete newConfigs[week];
      setWeekConfigurations(newConfigs);
    } else {
      if (selectedWeeks.length < selectedProgram.number_of_week) {
        setSelectedWeeks([...selectedWeeks, week]);
      }
    }
  };

  const handleWeekConfiguration = (week, day, period, room) => {
    const currentConfig = weekConfigurations[week] || { periods: [] };
    const newPeriods = [...currentConfig.periods, { day, period, room }];
    
    setWeekConfigurations({
      ...weekConfigurations,
      [week]: { periods: newPeriods }
    });
  };

  const handleSlotClick = (week, day, period) => {
    const slotKey = `${week}-${day}-${period}`;
    setCurrentConfiguringSlot(slotKey);
    setCurrentConfiguringWeek(week);
    
    // Check if this specific slot is already configured
    const currentConfig = weekConfigurations[week];
    const isSlotConfigured = currentConfig?.periods?.some(p => p.day === day && p.period === period);
    
    if (isSlotConfigured) {
      setShowRoomModal(true);
    } else {
      // Don't configure the slot yet - just open room modal
      // The slot will only be configured when room is actually selected
      setShowRoomModal(true);
    }
  };

  const handleSlotDelete = (week, day, period) => {
    const config = weekConfigurations[week];
    if (config && config.periods) {
      // Remove the specific period from this week
      const newPeriods = config.periods.filter(p => !(p.day === day && p.period === period));
      
      if (newPeriods.length === 0) {
        // If no periods left, remove the week configuration
        const newConfigs = { ...weekConfigurations };
        delete newConfigs[week];
        setWeekConfigurations(newConfigs);
      } else {
        // Update with remaining periods
        setWeekConfigurations({
          ...weekConfigurations,
          [week]: { periods: newPeriods }
        });
      }
    }
  };

  const isSlotConfigured = (week, day, period) => {
    const config = weekConfigurations[week];
    return config && config.periods && config.periods.some(p => p.day === day && p.period === period);
  };

  const isSlotTaken = (week, day, period) => {
    return takenSchedules.some(schedule => 
      schedule.schedules.some(s => 
        s.week === week && s.day === day && s.period === period
      )
    );
  };

  const isWeekFullyConfigured = (week) => {
    const config = weekConfigurations[week];
    if (!config || !config.periods) return false;
    
    // Check if this week has the required number of periods
    return config.periods.length >= selectedProgram?.period_of_week;
  };

  const canSelectSlot = (week, day, period) => {
    // Check if this specific slot is taken by others
    return !isSlotTaken(week, day, period);
  };

  const getWeekPeriodCount = (week) => {
    const config = weekConfigurations[week];
    if (!config || !config.periods) return 0;
    
    // Count all selected periods for this week
    return config.periods.length;
  };

  const canSelectSlotForWeek = (week, day, period) => {
    // All slots can be selected - no slot conflicts
    return true;
  };

  const copyConfigurationToOtherWeeks = (sourceWeek) => {
    const sourceConfig = weekConfigurations[sourceWeek];
    if (!sourceConfig || !sourceConfig.periods) return;

    const newConfigs = { ...weekConfigurations };
    selectedWeeks.forEach(week => {
      if (week !== sourceWeek) {
        newConfigs[week] = { periods: [...sourceConfig.periods] };
      }
    });
    setWeekConfigurations(newConfigs);
  };

  const [currentConfiguringWeek, setCurrentConfiguringWeek] = useState(null);
  const [currentConfiguringSlot, setCurrentConfiguringSlot] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateWeeks(selectedWeeks, selectedProgram)) {
      alert('Please select the correct number of weeks with no consecutive weeks as required by the program.');
      return;
    }

    // Check if all selected weeks have configurations
    const allWeeksConfigured = selectedWeeks.every(week => weekConfigurations[week]);
    if (!allWeeksConfigured) {
      alert('Please configure all selected weeks.');
      return;
    }

    try {
      // Here you would assign the tutor to the class with their selected weeks and configurations
      // This would require additional API calls to update the class assignment
      
      alert('Tutor assignment successful!');
      navigate('/');
    } catch (error) {
      alert('Assignment failed: ' + error.message);
    }
  };

  const renderStep1 = () => (
    <div className="max-w-6xl mx-auto p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">🎓 Tutor Class Assignment</h1>
        <p className="text-lg text-gray-600">Choose a program and assign yourself to a class</p>
      </div>
      
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">📚 Select Program to Teach</h3>
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
      </div>
    </div>
  );

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
        {selectedProgram?.classes.map((classItem) => (
          <div
            key={classItem.id}
            className={`border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
              classItem.available
                ? 'border-green-200 bg-green-50 hover:border-green-300 hover:bg-green-100 hover:shadow-lg'
                : 'border-red-200 bg-red-50 cursor-not-allowed opacity-75'
            }`}
            onClick={() => handleClassSelect(classItem)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  classItem.available ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <span className="text-2xl">{classItem.available ? '✅' : '❌'}</span>
                </div>
                <div>
                  <h4 className="font-bold text-xl text-gray-800">{classItem.class_code}</h4>
                  <p className={`text-sm ${
                    classItem.available ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {classItem.available ? 'Available for assignment' : `Taken by ${classItem.tutor_name}`}
                  </p>
                </div>
              </div>
              {classItem.available && (
                <div className="text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderWeekConfiguration = (week) => {
    const config = weekConfigurations[week] || {};
    const isFullyConfigured = config.day && config.period && config.room;
    
    return (
      <div key={week} className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-6 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">W{week}</span>
            </div>
            <h4 className="text-lg font-semibold text-gray-800">Week {week} Configuration</h4>
            {isFullyConfigured && (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                ✓ Configured
              </span>
            )}
          </div>
          {Object.keys(weekConfigurations).length > 1 && isFullyConfigured && (
            <button
              onClick={() => copyConfigurationToOtherWeeks(week)}
              className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy to other weeks</span>
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Day Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-3">📅 Day of Week</label>
            <select
              value={config.day || ''}
              onChange={(e) => handleWeekConfiguration(week, { ...config, day: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Choose a day</option>
              {daysOfWeek.map((day) => {
                const isTaken = isScheduleTaken(week, day.id, config.period, config.room);
                return (
                  <option key={day.id} value={day.id} disabled={isTaken}>
                    {day.name} {isTaken ? '(Taken)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Period Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-3">⏰ Period</label>
            <select
              value={config.period || ''}
              onChange={(e) => {
                const periodId = parseInt(e.target.value);
                const period = periods.find(p => p.id === periodId);
                handleWeekConfiguration(week, { ...config, period: periodId, periodName: period?.name });
              }}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Choose a period</option>
              {periods.map((period) => {
                const isTaken = isScheduleTaken(week, config.day, period.id, config.room);
                return (
                  <option key={period.id} value={period.id} disabled={isTaken}>
                    {period.name} {isTaken ? '(Taken)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Room Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-3">🏢 Room</label>
            <button
              onClick={() => {
                setCurrentConfiguringWeek(week);
                setShowRoomModal(true);
              }}
              className={`w-full px-4 py-3 border-2 rounded-lg text-left transition-colors ${
                config.room 
                  ? 'border-green-300 bg-green-50 text-green-800' 
                  : 'border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              }`}
            >
              {config.room || 'Choose a room'}
            </button>
          </div>
        </div>

        {isFullyConfigured && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm font-medium text-gray-800">
                <strong>Schedule:</strong> {daysOfWeek.find(d => d.id === config.day)?.name}, {config.periodName}, {config.room}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCalendarSchedule = () => {
    const availableWeeks = getAvailableWeeks(selectedProgram);
    
    return (
      <div className="p-6">
        {/* Header with week selection */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Select Weeks to Teach</h4>
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

        {/* Calendar Grid */}
        {selectedWeeks.length > 0 && (
          <div className="overflow-x-auto">
            <div className="min-w-full space-y-6">
              {selectedWeeks.map((week) => {
                const isFullyConfigured = isWeekFullyConfigured(week);
                const config = weekConfigurations[week];
                
                return (
                  <div key={week} className="border border-gray-200 rounded-xl overflow-hidden">
                    {/* Week Header with Copy Button */}
                    <div className="px-4 py-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
                      <span className="text-lg font-bold text-blue-700 text-center flex-1">Week W{week}</span>
                      {getWeekPeriodCount(week) > 0 && selectedWeeks.length > 1 && (
                        <button
                          onClick={() => copyConfigurationToOtherWeeks(week)}
                          className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>Copy to other weeks</span>
                        </button>
                      )}
                    </div>

                    {/* Per-week Table: first column = Period labels, remaining = days */}
                    <div className="w-full">
                      {/* Header Row */}
                      <div className="grid" style={{ gridTemplateColumns: `200px repeat(${daysOfWeek.length}, minmax(120px, 1fr))` }}>
                        <div className="p-3 bg-gray-50 border-r border-b border-gray-200 text-sm font-semibold text-gray-600">Period</div>
                        {daysOfWeek.map((day) => (
                          <div key={`hdr-${week}-${day.id}`} className="p-3 bg-gray-50 border-b border-gray-200 text-center text-sm font-semibold text-gray-600">
                            {day.short}
                          </div>
                        ))}
                      </div>

                      {/* Period Rows */}
                      {periods.map((period) => (
                        <div key={`row-${week}-${period.id}`} className="grid" style={{ gridTemplateColumns: `200px repeat(${daysOfWeek.length}, minmax(120px, 1fr))` }}>
                          {/* Period label (leftmost) */}
                          <div className="p-3 border-r border-b border-gray-200 text-sm font-medium text-gray-700 flex items-center justify-center">
                            {period.name}
                          </div>
                          {/* Day cells */}
                          {daysOfWeek.map((day) => {
                            const isConfigured = isSlotConfigured(week, day.id, period.id);
                            const config = weekConfigurations[week];
                            const slotConfig = config?.periods?.find(p => p.day === day.id && p.period === period.id);
                            
                            return (
                              <div key={`cell-${week}-${day.id}-${period.id}`} className="relative h-12 border-b border-gray-200">
                                <button
                                  onClick={() => handleSlotClick(week, day.id, period.id)}
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
                                        {slotConfig.room.split(' ')[0]}
                                      </span>
                                    </div>
                                  )}
                                </button>
                                
                                {/* Delete button for configured slots */}
                                {isConfigured && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSlotDelete(week, day.id, period.id);
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
                );
              })}
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
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
            <span>Week Already Configured</span>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">Instructions:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Click any available slot to configure it</li>
            <li>• Each week can only have one schedule (one day + one period)</li>
            <li>• Click the red × button to delete a configured schedule</li>
            <li>• Use "Copy to other weeks" to duplicate a complete schedule</li>
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
          <h2 className="text-3xl font-bold text-gray-800 mb-2">📅 Schedule Your Classes</h2>
          <p className="text-gray-600">Class: <span className="font-semibold text-blue-600">{selectedClass?.class_code}</span></p>
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
            <span className="text-2xl font-bold text-blue-600">{selectedProgram?.period_of_week}</span>
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
            !validateWeeks(selectedWeeks, selectedProgram) ||
            !selectedWeeks.every(week => weekConfigurations[week])
          }
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <span className="flex items-center space-x-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Complete Assignment</span>
          </span>
        </button>
      </div>

      {/* Room Selection Modal */}
      <RoomSelectionModal
        isOpen={showRoomModal}
        onClose={() => {
          setShowRoomModal(false);
          setCurrentConfiguringWeek(null);
          setCurrentConfiguringSlot(null);
        }}
        onSelectRoom={(room) => {
          if (currentConfiguringWeek) {
            // Get the slot information from the current configuring slot
            const slotParts = currentConfiguringSlot?.split('-');
            if (slotParts && slotParts.length === 3) {
              const week = parseInt(slotParts[0]);
              const day = parseInt(slotParts[1]);
              const period = parseInt(slotParts[2]);
              
              // Check if this room is already taken by other schedules at this specific time slot
              const isRoomTaken = takenSchedules.some(schedule => 
                schedule.schedules.some(s => {
                  const roomCode = room.split(' ')[0];
                  return s.week === week && s.day === day && s.period === period && s.room.includes(roomCode);
                })
              );
              
              if (isRoomTaken) {
                alert('This room is already taken by another tutor. Please select a different room.');
                return;
              }
              
              // Now configure the slot with the selected room
              handleWeekConfiguration(week, day, period, room);
            }
          }
          setShowRoomModal(false);
          setCurrentConfiguringWeek(null);
          setCurrentConfiguringSlot(null);
        }}
        selectedRoom={selectedRoom}
        takenSchedules={takenSchedules}
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
