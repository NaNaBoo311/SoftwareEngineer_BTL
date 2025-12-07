
import React from 'react';

const ModeSelectionModal = ({ isOpen, onClose, onSelectMode }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl transform transition-all scale-100">
                <div className="text-center mb-6">
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <span className="text-2xl">🌐</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Select Class Mode</h3>
                    <p className="text-gray-500 mt-2 text-sm">
                        How would you like to conduct this class?
                    </p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => onSelectMode('online')}
                        className="w-full p-4 border-2 border-blue-100 rounded-xl hover:bg-blue-50 hover:border-blue-500 transition-all duration-200 group flex items-center justify-between"
                    >
                        <div className="flex items-center space-x-3">
                            <span className="text-2xl group-hover:scale-110 transition-transform">💻</span>
                            <div className="text-left">
                                <span className="block font-bold text-gray-800">Online</span>
                                <span className="text-xs text-gray-500">Virtual class via meeting link</span>
                            </div>
                        </div>
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 group-hover:border-blue-500"></div>
                    </button>

                    <button
                        onClick={() => onSelectMode('offline')}
                        className="w-full p-4 border-2 border-green-100 rounded-xl hover:bg-green-50 hover:border-green-500 transition-all duration-200 group flex items-center justify-between"
                    >
                        <div className="flex items-center space-x-3">
                            <span className="text-2xl group-hover:scale-110 transition-transform">🏫</span>
                            <div className="text-left">
                                <span className="block font-bold text-gray-800">Offline</span>
                                <span className="text-xs text-gray-500">In-person at campus</span>
                            </div>
                        </div>
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 group-hover:border-green-500"></div>
                    </button>
                </div>

                <div className="mt-6">
                    <button
                        onClick={onClose}
                        className="w-full py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModeSelectionModal;
