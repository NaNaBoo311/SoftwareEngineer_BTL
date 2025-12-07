import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { forumService } from '../services/forumService';
import { formatDistanceToNow } from 'date-fns';

const CommunityForum = ({ courseTitle, classId }) => {
  const { user } = useUser();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Detail View State
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTopic, setNewTopic] = useState({
    title: '',
    content: '',
    category: 'Discussion',
    tags: ''
  });

  const categories = ['All', 'Question', 'Discussion', 'Resource', 'Announcement'];

  useEffect(() => {
    if (classId) {
      fetchTopics();
    }
  }, [classId, selectedCategory, searchQuery]);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const data = await forumService.getTopics(classId, selectedCategory, searchQuery);
      setTopics(data);
    } catch (err) {
      console.error("Failed to fetch topics:", err);
      setError("Failed to load discussions.");
    } finally {
      setLoading(false);
    }
  };

  const handleTopicClick = async (topic) => {
    setSelectedTopic(topic);
    setLoadingReplies(true);
    try {
      await forumService.incrementViews(topic.id);
      const data = await forumService.getReplies(topic.id);
      setReplies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleCreateTopic = async () => {
    if (!newTopic.title.trim() || !newTopic.content.trim()) return;

    try {
      const topicData = {
        class_id: classId,
        user_id: user?.id, // Use the proper User ID, not the Student/Tutor ID
        title: newTopic.title,
        content: newTopic.content,
        category: newTopic.category,
        tags: newTopic.tags.split(',').map(t => t.trim()).filter(t => t),
        is_pinned: false // Only tutors can pin? Logic for another time
      };

      await forumService.createTopic(topicData);

      setShowCreateModal(false);
      setNewTopic({ title: '', content: '', category: 'Discussion', tags: '' });
      fetchTopics(); // Refresh list
    } catch (err) {
      console.error(err);
      alert("Failed to create post");
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim() || !selectedTopic) return;

    try {
      const replyData = {
        topic_id: selectedTopic.id,
        user_id: user?.id,
        content: replyContent
      };

      await forumService.createReply(replyData);

      setReplyContent('');
      // Refresh replies
      const updatedReplies = await forumService.getReplies(selectedTopic.id);
      setReplies(updatedReplies);

      // Update reply count in list view locally or refetch
      const updatedTopics = topics.map(t =>
        t.id === selectedTopic.id ? { ...t, repliesCount: t.repliesCount + 1 } : t
      );
      setTopics(updatedTopics);

    } catch (err) {
      console.error(err);
      alert("Failed to post reply");
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // --- Render Detail View ---
  if (selectedTopic) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Post Header */}
        <div className="p-6 border-b border-gray-200">
          <button
            onClick={() => { setSelectedTopic(null); setReplies([]); }}
            className="text-blue-600 hover:text-blue-700 font-medium mb-4 flex items-center gap-2"
          >
            ← Back to discussions
          </button>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {selectedTopic.is_pinned && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">📌 Pinned</span>
                )}
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">{selectedTopic.category}</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{selectedTopic.title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${selectedTopic.authorRole === 'tutor' || selectedTopic.authorRole === 'admin' ? 'bg-indigo-600' : 'bg-blue-600'
                    }`}>
                    {selectedTopic.authorName?.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{selectedTopic.authorName}</div>
                    <div className="text-xs text-gray-500">
                      {selectedTopic.authorRole === 'tutor' ? 'Tutor' : 'Student'} • {formatTime(selectedTopic.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div>{selectedTopic.views} views</div>
              <div>{replies.length} replies</div>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="p-6 border-b border-gray-200">
          <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">{selectedTopic.content}</div>
          {selectedTopic.tags && selectedTopic.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedTopic.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Replies */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
          </h3>

          <div className="space-y-4 mb-6">
            {loadingReplies ? (
              <div className="text-center text-gray-500">Loading replies...</div>
            ) : replies.length === 0 ? (
              <div className="text-gray-500 italic">No replies yet. Be the first to start the conversation!</div>
            ) : (
              replies.map(reply => (
                <div key={reply.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${reply.authorRole === 'tutor' ? 'bg-indigo-600' : 'bg-blue-600'
                      }`}>
                      {reply.authorName?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{reply.authorName}</span>
                        {reply.authorRole === 'tutor' && (
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded">
                            Tutor
                          </span>
                        )}
                        <span className="text-xs text-gray-500">{formatTime(reply.created_at)}</span>
                      </div>
                      <div className="text-gray-700 whitespace-pre-wrap">{reply.content}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Reply Form */}
          <div className="border-t border-gray-200 pt-4">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your reply..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              rows="4"
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={handleReply}
                disabled={!replyContent.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Post Reply
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- List View ---
  return (
    <div className="space-y-6">
      {/* Header with Search and Create */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Community Forum</h2>
            <p className="text-gray-600">Discuss, ask questions, and share knowledge with classmates</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold text-base hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
          >
            + New Post
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Topics List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">Loading discussions...</div>
        ) : topics.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-lg text-gray-600 font-medium">No discussions found</p>
            <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filters, or create a new post.</p>
          </div>
        ) : (
          topics.map(topic => (
            <div
              key={topic.id}
              onClick={() => handleTopicClick(topic)}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${topic.authorRole === 'tutor' ? 'bg-indigo-600' : 'bg-blue-600'
                  }`}>
                  {topic.authorName ? topic.authorName.charAt(0) : '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {topic.is_pinned && (
                      <span className="text-yellow-600 text-sm">📌</span>
                    )}
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      {topic.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-700">
                    {topic.title}
                  </h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">{topic.content}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="font-medium text-gray-700">{topic.authorName}</span>
                    <span>•</span>
                    <span>{topic.authorRole === 'tutor' && '👨‍🏫 '} {formatTime(topic.created_at)}</span>
                    <span>•</span>
                    <span>{topic.repliesCount} replies</span>
                    <span>•</span>
                    <span>{topic.views} views</span>
                  </div>
                  {topic.tags && topic.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {topic.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Create New Post</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={newTopic.title}
                  onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                  placeholder="Enter post title..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={newTopic.category}
                  onChange={(e) => setNewTopic({ ...newTopic, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                >
                  {categories.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={newTopic.content}
                  onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                  placeholder="Write your post content..."
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newTopic.tags}
                  onChange={(e) => setNewTopic({ ...newTopic, tags: e.target.value })}
                  placeholder="e.g., graph-theory, algorithm, help"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTopic}
                disabled={!newTopic.title.trim() || !newTopic.content.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Create Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityForum;

