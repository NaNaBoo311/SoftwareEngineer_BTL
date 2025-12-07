import { Link, useNavigate } from "react-router-dom";
import { Bell, MessageSquare } from "lucide-react"; // icons
import { useState, useEffect } from "react";
import { authService } from "../services/authService";
import { notificationService } from "../services/notificationService";

export default function Navbar() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [expandedNotifIds, setExpandedNotifIds] = useState([]);

  const toggleExpand = (id) => {
    setExpandedNotifIds(prev =>
      prev.includes(id) ? prev.filter(notifId => notifId !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const user = await authService.getUserProfile();
        setUserRole(user.role);
        setUserId(user.id);

        // Fetch notifications
        if (user.id) {
          const fetchedNotifs = await notificationService.getNotifications(user.id);
          setNotifications(fetchedNotifs || []);
          setUnreadCount(fetchedNotifs.filter(n => !n.is_read).length);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };
    fetchUserProfile();
  }, []);

  const handleCreateNotificationTest = async () => {
    if (userId) {
      await notificationService.createNotification(userId, 'Test Notification', 'This is a test message from NavBar.', 'info');
      const updated = await notificationService.getNotifications(userId);
      setNotifications(updated);
      setUnreadCount(updated.filter(n => !n.is_read).length);
    }
  }

  const handleNotificationClick = async () => {
    setIsNotifDropdownOpen(!isNotifDropdownOpen);
    if (!isNotifDropdownOpen && unreadCount > 0) {
      // Mark all as read when opening? Or just visually? 
      // Let's mark specific one as read when clicked, or mark all as read button?
      // For now, let's keep it simple: clicking the bell just toggles dropdown.
    }
  };

  const markAsRead = async (notification) => {
    if (!notification.is_read) {
      await notificationService.markAsRead(notification.id);
      const updated = notifications.map(n => n.id === notification.id ? { ...n, is_read: true } : n);
      setNotifications(updated);
      setUnreadCount(updated.filter(n => !n.is_read).length);
    }
  };

  const handleExit = async () => {
    try {
      await authService.signOut(); //
      navigate("/");
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };

  return (
    <nav className="bg-[#0388B4] text-white px-6 py-2 flex justify-between items-center shadow-md select-none relative z-50">
      {/* Left: Logo */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate(userRole === 'tutor' ? '/tutor-home' : '/student-home')}>
        <img src="/assets/bk_logo.png" alt="Logo" className="h-10 w-10" />
        <span className="font-bold text-lg">HCMUT Portal</span>
      </div>

      {/* Center: Links */}
      <div className="flex space-x-6">
        {/* Student Links - Always show for students */}
        {userRole === "student" && (
          <>
            <Link to="/student-home" className="hover:text-gray-300">
              Home
            </Link>
            <Link to="/student-register" className="hover:text-gray-300">
              Register
            </Link>
            <Link to="/student-schedule" className="hover:text-gray-300">
              Schedule
            </Link>
            {/* <Link to="/support" className="hover:text-gray-300">
              Support
            </Link> */}
          </>
        )}

        {/* Tutor Links - Show for tutors */}
        {userRole === "tutor" && (
          <>
            <Link to="/tutor-home" className="hover:text-gray-300">
              Home
            </Link>
            <Link to="/tutor-register" className="hover:text-gray-300">
              Register
            </Link>
            <Link to="/tutor-schedule" className="hover:text-gray-300">
              Schedule
            </Link>
            {/* <Link to="/support" className="hover:text-gray-300">
              Support
            </Link> */}
          </>
        )}
      </div>

      {/* Right: Notifications, Messages, Avatar */}
      <div className="flex items-center space-x-5">
        {/* Notification Icon */}
        <div className="relative">
          <button className="relative hover:text-gray-300 focus:outline-none" onClick={handleNotificationClick}>
            <Bell className="h-5 w-5" />
            {/* Red dot for new notifications */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 bg-red-500 text-[10px] font-bold rounded-full">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white text-gray-800 rounded-lg shadow-xl py-2 z-[100] border border-gray-200">
              <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={async () => {
                      await notificationService.markAllAsRead(userId);
                      const updated = notifications.map(n => ({ ...n, is_read: true }));
                      setNotifications(updated);
                      setUnreadCount(0);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>
                ) : (
                  notifications.map(notif => {
                    const isExpanded = expandedNotifIds.includes(notif.id);
                    return (
                      <div
                        key={notif.id}
                        className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!notif.is_read ? 'bg-blue-50' : ''}`}
                      >
                        <div
                          className="cursor-pointer"
                          onClick={() => markAsRead(notif)}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className={`text-sm font-semibold ${!notif.is_read ? 'text-blue-700' : 'text-gray-700'}`}>{notif.title}</h4>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                              {new Date(notif.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className={`text-xs text-gray-600 mt-1 ${isExpanded ? '' : 'line-clamp-3'}`}>
                            {notif.message}
                          </div>
                        </div>
                        {notif.message.length > 100 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(notif.id);
                            }}
                            className="text-[10px] text-blue-500 hover:text-blue-700 mt-1 font-medium bg-transparent border-none p-0 focus:outline-none"
                          >
                            {isExpanded ? 'Show less' : 'Show more'}
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Message Icon */}
        <button className="relative hover:text-gray-300">
          <MessageSquare className="h-5 w-5" />
          <span className="absolute top-0 right-0 inline-block h-2 w-2 bg-red-500 rounded-full"></span>
        </button>
        {/* Avatar  */}
        <div className="relative">
          <img
            src="/assets/truongan.jpg"
            alt="User Avatar"
            className="h-9 w-9 rounded-full cursor-pointer border-2 border-white hover:border-gray-300 transition-colors"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          />
          {/* Drop Down Menu When Avatar is Clicked  */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-md shadow-lg py-2 z-50">
              <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">
                Profile
              </Link>
              <Link to="/grades" className="block px-4 py-2 hover:bg-gray-100">
                Grades
              </Link>
              <Link
                to="/settings"
                className="block px-4 py-2 hover:bg-gray-100"
              >
                Settings
              </Link>
              <button
                onClick={handleExit}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Exit
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
