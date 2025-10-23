import React, { useState } from 'react';

const RoomSelectionModal = ({ isOpen, onClose, onSelectRoom, selectedRoom: initialRoom, takenSchedules = [], currentTimeSlot = null, currentClassCode = null }) => {
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');

  // Dummy data for buildings, floors, and rooms
  const buildings = [
    { id: 'A1', name: 'Building A1 - Computer Science' },
    { id: 'A2', name: 'Building A2 - Engineering' },
    { id: 'B1', name: 'Building B1 - Mathematics' },
    { id: 'B2', name: 'Building B2 - Physics' },
    { id: 'C1', name: 'Building C1 - Library' }
  ];

  const floors = {
    'A1': ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'],
    'A2': ['Ground Floor', '1st Floor', '2nd Floor'],
    'B1': ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor'],
    'B2': ['Ground Floor', '1st Floor', '2nd Floor'],
    'C1': ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor', '5th Floor']
  };

  const rooms = {
    'A1': {
      'Ground Floor': ['A1-001', 'A1-002', 'A1-003'],
      '1st Floor': ['A1-101', 'A1-102', 'A1-103', 'A1-104'],
      '2nd Floor': ['A1-201', 'A1-202', 'A1-203'],
      '3rd Floor': ['A1-301', 'A1-302', 'A1-303', 'A1-304']
    },
    'A2': {
      'Ground Floor': ['A2-001', 'A2-002'],
      '1st Floor': ['A2-101', 'A2-102', 'A2-103'],
      '2nd Floor': ['A2-201', 'A2-202']
    },
    'B1': {
      'Ground Floor': ['B1-001', 'B1-002', 'B1-003'],
      '1st Floor': ['B1-101', 'B1-102', 'B1-103'],
      '2nd Floor': ['B1-201', 'B1-202'],
      '3rd Floor': ['B1-301', 'B1-302', 'B1-303'],
      '4th Floor': ['B1-401', 'B1-402']
    },
    'B2': {
      'Ground Floor': ['B2-001', 'B2-002'],
      '1st Floor': ['B2-101', 'B2-102'],
      '2nd Floor': ['B2-201', 'B2-202', 'B2-203']
    },
    'C1': {
      'Ground Floor': ['C1-001', 'C1-002'],
      '1st Floor': ['C1-101', 'C1-102', 'C1-103'],
      '2nd Floor': ['C1-201', 'C1-202'],
      '3rd Floor': ['C1-301', 'C1-302'],
      '4th Floor': ['C1-401', 'C1-402'],
      '5th Floor': ['C1-501', 'C1-502', 'C1-503']
    }
  };

  const handleBuildingChange = (buildingId) => {
    setSelectedBuilding(buildingId);
    setSelectedFloor('');
    setSelectedRoom('');
  };

  const handleFloorChange = (floor) => {
    setSelectedFloor(floor);
    setSelectedRoom('');
  };

  const handleRoomChange = (room) => {
    setSelectedRoom(room);
  };

  // Check if a room is taken (check all schedules across all programs)
  const isRoomTaken = (room) => {
    if (!takenSchedules || takenSchedules.length === 0) return false;
    
    return takenSchedules.some(schedule => {
      return schedule.schedules.some(s => {
        // If we have currentTimeSlot, check for exact conflict at that specific time
        if (currentTimeSlot) {
          const isExactMatch = s.week === currentTimeSlot.week && 
                 s.day === currentTimeSlot.day && 
                 s.period === currentTimeSlot.period && 
                 s.room === room;
          
          if (!isExactMatch) return false;
          
          // If it's an exact match, check if it's from the current tutor's class
          const isCurrentTutorClass = currentClassCode && 
            schedule.class_code === currentClassCode;
          
          // Only consider it a conflict if it's NOT from the current tutor's class
          return !isCurrentTutorClass;
        }
        
        // If no currentTimeSlot, check if room is taken at any time slot
        // but still exclude current tutor's class
        const isCurrentTutorClass = currentClassCode && 
          schedule.class_code === currentClassCode;
        
        if (isCurrentTutorClass) return false;
        
        return s.room === room;
      });
    });
  };

  const handleConfirm = () => {
    if (selectedBuilding && selectedFloor && selectedRoom) {
      // Return only the room code (e.g., "A1-101") instead of full description
      onSelectRoom(selectedRoom);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedBuilding('');
    setSelectedFloor('');
    setSelectedRoom('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Select Room</h2>
        
        <div className="space-y-4">
          {/* Building Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Building</label>
            <select
              value={selectedBuilding}
              onChange={(e) => handleBuildingChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Building</option>
              {buildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
            </select>
          </div>

          {/* Floor Selection */}
          {selectedBuilding && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
              <select
                value={selectedFloor}
                onChange={(e) => handleFloorChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Floor</option>
                {floors[selectedBuilding]?.map((floor) => (
                  <option key={floor} value={floor}>
                    {floor}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Room Selection */}
          {selectedBuilding && selectedFloor && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
              <div className="grid grid-cols-3 gap-2">
                {rooms[selectedBuilding]?.[selectedFloor]?.map((room) => {
                  const isTaken = isRoomTaken(room);
                  return (
                    <button
                      key={room}
                      onClick={() => !isTaken && handleRoomChange(room)}
                      disabled={isTaken}
                      className={`p-3 border-2 rounded-lg text-sm transition-colors ${
                        selectedRoom === room
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : isTaken
                          ? 'border-red-300 bg-red-50 text-red-500 cursor-not-allowed opacity-60'
                          : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span>{room}</span>
                        {isTaken && (
                          <span className="text-xs text-red-500 mt-1">Taken</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Selected Room Display */}
        {selectedBuilding && selectedFloor && selectedRoom && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm">
              <strong>Selected Room:</strong> {selectedRoom} ({buildings.find(b => b.id === selectedBuilding)?.name}, {selectedFloor})
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedBuilding || !selectedFloor || !selectedRoom}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomSelectionModal;
