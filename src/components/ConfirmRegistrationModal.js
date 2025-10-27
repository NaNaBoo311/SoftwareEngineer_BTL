import { X, BookOpen, GraduationCap, User } from "lucide-react";

export default function ConfirmRegistrationModal({ 
  isOpen, 
  onClose, 
  selectedClass, 
  onConfirm, 
  isRegistering 
}) {
  if (!isOpen || !selectedClass) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl transform transition-all">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Confirm Registration
              </h2>
            </div>
            <button
              onClick={onClose}
              disabled={isRegistering}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all disabled:opacity-50"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="text-blue-100 mt-2 text-sm">
            Please review your selection before confirming
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Program Card */}
            <div className="group hover:shadow-md transition-shadow rounded-xl border-2 border-gray-100 p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                    Program
                  </p>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">
                    {selectedClass.program.program_code}
                  </h3>
                  <p className="text-gray-700 font-medium mt-1">
                    {selectedClass.program.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Class Card */}
            <div className="group hover:shadow-md transition-shadow rounded-xl border-2 border-gray-100 p-4 bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">
                    Class Code
                  </p>
                  <h3 className="font-bold text-gray-900 text-xl">
                    {selectedClass.class.class_code}
                  </h3>
                </div>
              </div>
            </div>

            {/* Tutor Card */}
            <div className="group hover:shadow-md transition-shadow rounded-xl border-2 border-gray-100 p-4 bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">
                    Instructor
                  </p>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {selectedClass.class.tutor_name}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {selectedClass.class.tutor_department}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 text-center">
              <span className="font-semibold">Note:</span> You can only register for one class per program
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="px-6 pb-6">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isRegistering}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isRegistering}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {isRegistering ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Registering...
                </span>
              ) : (
                "Confirm Registration"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}