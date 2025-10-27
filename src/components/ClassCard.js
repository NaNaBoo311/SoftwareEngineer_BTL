import React from 'react';

const ClassCard = ({ classItem, user, onClassSelect, onUnregister }) => {
  const isCurrentTutor = user && classItem.tutor_id === user.details.id;
  const isSelectable = classItem.available || isCurrentTutor;

  const handleUnregisterClick = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to unregister from class ${classItem.class_code}? This will remove all your schedules and make the class available for other tutors.`)) {
      onUnregister(classItem.id);
    }
  };

  return (
    <div
      className={`border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
        isSelectable
          ? isCurrentTutor 
            ? 'border-blue-200 bg-blue-50 hover:border-blue-300 hover:bg-blue-100 hover:shadow-lg'
            : 'border-green-200 bg-green-50 hover:border-green-300 hover:bg-green-100 hover:shadow-lg'
          : 'border-red-200 bg-red-50 cursor-not-allowed opacity-75'
      }`}
      onClick={() => onClassSelect(classItem)}
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
                  onClick={handleUnregisterClick}
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
};

export default ClassCard;

