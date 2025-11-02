import { useState } from 'react';

const LearningResourcesModal = ({ isOpen, onClose, onAddResource, addedResourceIds = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Sample learning resources - in a real app, this would come from props or an API
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

  // Filter resources based on search query
  const filteredResources = learningResources.filter(resource =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleView = (resource) => {
    // In a real app, this would open the resource in a new tab or viewer
    window.open(resource.url, '_blank');
  };

  const handleDownload = (resource) => {
    // In a real app, this would trigger a download
    const link = document.createElement('a');
    link.href = resource.url;
    link.download = resource.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'video':
        return '🎥';
      case 'link':
        return '🔗';
      default:
        return '📎';
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
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Learning Resources</h2>
            <p className="text-sm text-gray-600 mt-1">Search and access course materials</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold p-2 hover:bg-white rounded-lg transition-colors"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white">
          <div className="relative">
            <input
              type="text"
              placeholder="Search resources by title, category, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-600 mt-2">
              Found {filteredResources.length} result{filteredResources.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Resources List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filteredResources.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-lg text-gray-600 font-medium">No resources found</p>
              <p className="text-sm text-gray-500 mt-2">
                Try adjusting your search terms
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredResources.map((resource) => (
                <div
                  key={resource.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all bg-white"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="text-3xl flex-shrink-0">{getResourceIcon(resource.type)}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {resource.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {resource.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-medium">
                              {resource.category}
                            </span>
                            <span>{resource.size}</span>
                            <span className="uppercase">{resource.type}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0 flex-wrap">
                      <button
                        onClick={() => handleView(resource)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(resource)}
                        className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors"
                      >
                        Download
                      </button>
                      {onAddResource && (
                        <button
                          onClick={() => {
                            if (!addedResourceIds.includes(resource.id)) {
                              onAddResource(resource);
                            }
                          }}
                          disabled={addedResourceIds.includes(resource.id)}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                            addedResourceIds.includes(resource.id)
                              ? 'bg-green-100 text-green-700 border border-green-300 cursor-not-allowed'
                              : 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                          }`}
                          title={addedResourceIds.includes(resource.id) ? 'Already added to course' : 'Add to course'}
                        >
                          {addedResourceIds.includes(resource.id) ? '✓ Added' : 'Add'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Total: {learningResources.length} resources available</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningResourcesModal;

