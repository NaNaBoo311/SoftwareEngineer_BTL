import { useState } from 'react';

const CommunityForum = ({ courseTitle }) => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: 'Question about Graph Theory in Chapter 5',
      content: 'I\'m having trouble understanding how to apply Dijkstra\'s algorithm in the practice problems. Can someone explain step by step?',
      author: 'Nguyễn Văn A',
      authorRole: 'student',
      timestamp: '2 hours ago',
      replies: 3,
      views: 45,
      category: 'Question',
      tags: ['graph-theory', 'algorithm'],
      isPinned: false,
      repliesList: [
        {
          id: 1,
          content: 'Dijkstra\'s algorithm is great for finding shortest paths. Start by marking the starting node with distance 0, then iteratively visit adjacent nodes...',
          author: 'Trần Tuấn Anh',
          authorRole: 'tutor',
          timestamp: '1 hour ago',
          isVerified: true
        },
        {
          id: 2,
          content: 'Thanks! That helps a lot. I think I understand now.',
          author: 'Lê Thị B',
          authorRole: 'student',
          timestamp: '30 minutes ago',
          isVerified: false
        },
        {
          id: 3,
          content: 'You can also check the slides from week 5, they have good examples.',
          author: 'Phạm Văn C',
          authorRole: 'student',
          timestamp: '15 minutes ago',
          isVerified: false
        }
      ]
    },
    {
      id: 2,
      title: 'Helpful Resource: Visual Guide to Trees',
      content: 'I found this amazing visualization tool that helped me understand binary trees better. Sharing it here for everyone! Link: https://visualgo.net/en/bst',
      author: 'Hoàng Thị D',
      authorRole: 'student',
      timestamp: '5 hours ago',
      replies: 8,
      views: 127,
      category: 'Resource',
      tags: ['tree', 'resources', 'visualization'],
      isPinned: true,
      repliesList: []
    },
    {
      id: 3,
      title: 'Announcement: Assignment 3 Deadline Extended',
      content: 'Due to several requests, I\'m extending the deadline for Assignment 3 by 2 days. The new deadline is Friday, 11:59 PM.',
      author: 'Trần Tuấn Anh',
      authorRole: 'tutor',
      timestamp: '1 day ago',
      replies: 12,
      views: 234,
      category: 'Announcement',
      tags: ['assignment', 'deadline'],
      isPinned: true,
      repliesList: []
    },
    {
      id: 4,
      title: 'Study Group for Final Exam',
      content: 'Anyone interested in forming a study group for the final exam? We can meet online or on campus.',
      author: 'Đỗ Văn E',
      authorRole: 'student',
      timestamp: '2 days ago',
      replies: 5,
      views: 89,
      category: 'Discussion',
      tags: ['study-group', 'exam'],
      isPinned: false,
      repliesList: []
    }
  ]);

  const [selectedPost, setSelectedPost] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [replyContent, setReplyContent] = useState('');
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'Discussion',
    tags: ''
  });

  // Get current user (mock - in real app, get from context/auth)
  const currentUser = {
    name: 'Nguyễn Văn F',
    role: 'student'
  };

  const categories = ['All', 'Question', 'Discussion', 'Resource', 'Announcement'];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort posts: pinned first, then by timestamp
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return b.isPinned - a.isPinned;
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;

    const post = {
      id: posts.length + 1,
      title: newPost.title,
      content: newPost.content,
      author: currentUser.name,
      authorRole: currentUser.role,
      timestamp: 'Just now',
      replies: 0,
      views: 0,
      category: newPost.category,
      tags: newPost.tags.split(',').map(t => t.trim()).filter(t => t),
      isPinned: false,
      repliesList: []
    };

    setPosts([post, ...posts]);
    setNewPost({ title: '', content: '', category: 'Discussion', tags: '' });
    setShowCreateModal(false);
  };

  const handleReply = (postId) => {
    if (!replyContent.trim()) return;

    const reply = {
      id: Date.now(),
      content: replyContent,
      author: currentUser.name,
      authorRole: currentUser.role,
      timestamp: 'Just now',
      isVerified: false
    };

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          replies: post.replies + 1,
          repliesList: [...post.repliesList, reply]
        };
      }
      return post;
    }));

    setReplyContent('');
    // Keep the post expanded to show the new reply
  };

  const formatTimestamp = (timestamp) => {
    return timestamp;
  };

  if (selectedPost) {
    const post = posts.find(p => p.id === selectedPost);
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Post Header */}
        <div className="p-6 border-b border-gray-200">
          <button
            onClick={() => setSelectedPost(null)}
            className="text-blue-600 hover:text-blue-700 font-medium mb-4 flex items-center gap-2"
          >
            ← Back to discussions
          </button>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {post.isPinned && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">📌 Pinned</span>
                )}
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">{post.category}</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{post.title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    post.authorRole === 'tutor' ? 'bg-indigo-600' : 'bg-blue-600'
                  }`}>
                    {post.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{post.author}</div>
                    <div className="text-xs text-gray-500">
                      {post.authorRole === 'tutor' ? 'Tutor' : 'Student'} • {post.timestamp}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div>{post.views} views</div>
              <div>{post.replies} replies</div>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="p-6 border-b border-gray-200">
          <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">{post.content}</div>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map(tag => (
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
            {post.repliesList.length} {post.repliesList.length === 1 ? 'Reply' : 'Replies'}
          </h3>

          <div className="space-y-4 mb-6">
            {post.repliesList.map(reply => (
              <div key={reply.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                    reply.authorRole === 'tutor' ? 'bg-indigo-600' : 'bg-blue-600'
                  }`}>
                    {reply.author.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{reply.author}</span>
                      {reply.authorRole === 'tutor' && (
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded">
                          Tutor
                        </span>
                      )}
                      <span className="text-xs text-gray-500">{reply.timestamp}</span>
                    </div>
                    <div className="text-gray-700 whitespace-pre-wrap">{reply.content}</div>
                  </div>
                </div>
              </div>
            ))}
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
                onClick={() => handleReply(post.id)}
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
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
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

      {/* Posts List */}
      <div className="space-y-4">
        {sortedPosts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-lg text-gray-600 font-medium">No discussions found</p>
            <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          sortedPosts.map(post => (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post.id)}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${
                  post.authorRole === 'tutor' ? 'bg-indigo-600' : 'bg-blue-600'
                }`}>
                  {post.author.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {post.isPinned && (
                      <span className="text-yellow-600 text-sm">📌</span>
                    )}
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      {post.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-700">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="font-medium text-gray-700">{post.author}</span>
                    <span>•</span>
                    <span>{post.authorRole === 'tutor' && '👨‍🏫 '} {post.timestamp}</span>
                    <span>•</span>
                    <span>{post.replies} replies</span>
                    <span>•</span>
                    <span>{post.views} views</span>
                  </div>
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {post.tags.map(tag => (
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
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="Enter post title..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
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
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Write your post content..."
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newPost.tags}
                  onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
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
                onClick={handleCreatePost}
                disabled={!newPost.title.trim() || !newPost.content.trim()}
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

