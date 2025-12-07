import { useState } from 'react';

const LearningResourcesModal = ({ isOpen, onClose, onAddResource, onUploadCustom, addedResourceIds = [] }) => {
  const [activeTab, setActiveTab] = useState('library'); // 'library' or 'custom'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Sample learning resources
  const learningResources = [
    {
      id: 1,
      title: 'Introduction to Discrete Mathematics',
      type: 'pdf',
      category: 'Textbook',
      size: '2.5 MB',
      url: '/resources/intro-discrete-math.pdf',
      description: 'Comprehensive introduction to discrete mathematical structures'
    },
    {
      id: 2,
      title: 'Graph Theory Fundamentals',
      type: 'pdf',
      category: 'Lecture Notes',
      size: '1.8 MB',
      url: '/resources/graph-theory.pdf',
      description: 'Detailed notes on graph theory concepts and applications'
    },
    {
      id: 3,
      title: 'Set Theory and Logic',
      type: 'pdf',
      category: 'Reference',
      size: '3.2 MB',
      url: '/resources/set-theory-logic.pdf',
      description: 'Fundamental concepts of set theory and logical reasoning'
    },
    {
      id: 4,
      title: 'Practice Problems - Chapter 1',
      type: 'pdf',
      category: 'Exercise',
      size: '950 KB',
      url: '/resources/practice-ch1.pdf',
      description: 'Practice problems with solutions for chapter 1'
    },
    {
      id: 5,
      title: 'Video Tutorial: Combinatorics',
      type: 'video',
      category: 'Video',
      size: '45 MB',
      url: '/resources/combinatorics-video.mp4',
      description: 'Step-by-step tutorial on combinatorics principles'
    },
    {
      id: 6,
      title: 'Recursion and Induction',
      type: 'pdf',
      category: 'Lecture Notes',
      size: '2.1 MB',
      url: '/resources/recursion-induction.pdf',
      description: 'Understanding recursion and mathematical induction'
    },
    {
      id: 7,
      title: 'Tree Structures Explained',
      type: 'pdf',
      category: 'Tutorial',
      size: '1.5 MB',
      url: '/resources/tree-structures.pdf',
      description: 'Visual guide to tree data structures and algorithms'
    },
    {
      id: 8,
      title: 'Final Exam Preparation Guide',
      type: 'pdf',
      category: 'Study Guide',
      size: '890 KB',
      url: '/resources/exam-prep.pdf',
      description: 'Comprehensive guide for final exam preparation'
    }
  ];

  const filteredResources = learningResources.filter(resource =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getResourceIcon = (type) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'video': return '🎥';
      case 'link': return '🔗';
      default: return '📎';
    }
  };

  const handleCustomUpload = async () => {
    if (!selectedFile || !onUploadCustom) return;
    setIsUploading(true);
    try {
      await onUploadCustom(selectedFile);
      setSelectedFile(null); // Reset
      onClose(); // Close on success
    } catch (error) {
      console.error("Upload failed", error);
      // Parent handles error alert potentially, or we show it here if we had state
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add Materials</h2>
              <p className="text-sm text-gray-600 mt-1">Choose from library or upload your own</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold p-2 hover:bg-white rounded-lg transition-colors"
            >
              ×
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200">
            <button
              className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'library'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('library')}
            >
              From Library
            </button>
            <button
              className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'custom'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('custom')}
            >
              Upload Custom File
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'library' ? (
          <>
            {/* Search Bar */}
            <div className="px-6 py-4 border-b border-gray-200 bg-white">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-10 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
              <div className="space-y-3">
                {filteredResources.map((resource) => (
                  <div key={resource.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{getResourceIcon(resource.type)}</div>
                      <div>
                        <h3 className="font-medium text-gray-900">{resource.title}</h3>
                        <p className="text-sm text-gray-500">{resource.category} • {resource.size}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onAddResource(resource)}
                      disabled={addedResourceIds.includes(resource.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${addedResourceIds.includes(resource.id)
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                      {addedResourceIds.includes(resource.id) ? 'Added' : 'Select'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 flex flex-col items-center justify-center flex-1">
            <div className="w-full max-w-md p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-center">
              <div className="text-5xl mb-4">📂</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload your materials</h3>
              <p className="text-gray-500 mb-6 text-sm">Supported formats: PDF, DOC, PPT, ZIP</p>

              <input
                type="file"
                id="custom-file-upload"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />

              {!selectedFile ? (
                <label
                  htmlFor="custom-file-upload"
                  className="inline-block px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Choose File
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-gray-700 font-medium bg-white p-3 rounded-lg border border-gray-200">
                    <span>📄</span>
                    {selectedFile.name}
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                  <button
                    onClick={handleCustomUpload}
                    disabled={isUploading}
                    className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Uploading...
                      </>
                    ) : (
                      'Upload Selected File'
                    )}
                  </button>
                </div>
              )}
            </div>

            <p className="mt-8 text-sm text-gray-500 max-w-lg text-center">
              Note: Files uploaded here will be saved to your private or public course folder depending on your role.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningResourcesModal;
