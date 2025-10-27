import React from 'react';

export default function ProgramCard({ program, onClick }) {
  return (
    <div
      className="group bg-white border-2 border-gray-200 rounded-2xl p-8 cursor-pointer hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      onClick={() => onClick(program)}
    >
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
          <span className="text-2xl">📖</span>
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-xl text-gray-800">{program.name}</h4>
          <p className="text-blue-600 font-medium">{program.program_code}</p>
          {program.faculty && (
            <p className="text-gray-500 text-sm mt-1 flex items-center">
              <span className="mr-1">🏛️</span>
              {program.faculty}
            </p>
          )}
        </div>
      </div>
      <p className="text-gray-600 leading-relaxed">{program.description}</p>
    </div>
  );
}