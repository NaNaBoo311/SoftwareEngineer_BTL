# HCMUT Tutor Support System

A comprehensive web application for managing tutoring programs at Ho Chi Minh University of Technology (HCMUT). This system streamlines class registration, schedule management, and communication between students and tutors.

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- A modern web browser

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd SoftwareEngineer_BTL
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## 🧪 Test Accounts

Use these credentials to explore the application:

### Student Account
- **Username:** `an.pham3101`
- **Password:** `naman311`

### Tutor Account
- **Username:** `nhp`
- **Password:** `123456`

> **Note:** The system automatically appends `@hcmut.edu.vn` to usernames during login.

## ✨ Features

### For Students

#### 🏠 Student Home Dashboard
- View enrolled classes and programs
- Quick access to course materials and schedules
- Track academic progress

#### 📚 Class Registration
- Browse available tutoring programs
- Filter programs by name, code, or subject
- View detailed program information (duration, schedule, tutor)
- Register for classes with real-time availability checking
- Auto-matching system for optimal class placement
- Unregister from classes when needed

#### 📖 Course Page
- Access course materials and resources
- View class schedules and room assignments
- Participate in community forums
- Submit and view feedback
- Track attendance records

#### 👤 Profile Management
- Update personal information
- View enrollment history
- Manage account settings

### For Tutors

#### 🏠 Tutor Home Dashboard
- Overview of assigned classes
- Quick access to teaching schedules
- Student enrollment statistics

#### 📝 Class Assignment & Registration
- Browse available tutoring programs
- Register to teach specific classes
- Configure class schedules with:
  - Week selection (flexible multi-week planning)
  - Time slot configuration (day and period)
  - Room assignment with conflict detection
  - Visual calendar interface
- Modify existing class schedules
- Unregister from classes

#### 📅 Advanced Schedule Editor
- **Single-week editing mode** for precise schedule management
- Navigate between weeks (Previous/Next/Jump to specific week)
- Add make-up classes in any week within the program duration
- Interactive calendar grid for easy slot selection
- Room selection with building and floor filters
- Real-time conflict detection
- **Authorization-based editing** - only assigned tutors can modify schedules
- Instant save confirmation with notification modal

#### 📊 Schedule Overview
- View all teaching schedules across programs
- Filter by program, class, or time period
- Export schedule data

#### 👥 Student Management
- View enrolled students per class
- Track student attendance
- Manage class rosters

#### 👤 Profile Management
- Update professional information
- View teaching history
- Manage account settings

## 🛠️ Technology Stack

- **Frontend:** React 19.1.1
- **Routing:** React Router DOM 7.8.2
- **Styling:** Tailwind CSS 3.4.17
- **Backend:** Supabase (PostgreSQL database)
- **Icons:** Lucide React
- **Testing:** Jest & React Testing Library

## 📁 Project Structure

```
SoftwareEngineer_BTL/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable React components
│   │   ├── ScheduleEditor.js      # Advanced schedule management
│   │   ├── NotificationModal.js   # User feedback system
│   │   ├── RoomSelectionModal.js  # Room booking interface
│   │   └── ...
│   ├── context/         # React Context providers
│   ├── pages/           # Page components
│   │   ├── StudentHomePage.js
│   │   ├── TutorHomePage.js
│   │   ├── StudentRegister.js
│   │   ├── TutorRegister.js
│   │   ├── CoursePage.js
│   │   └── ...
│   ├── services/        # API and business logic
│   │   ├── authService.js
│   │   ├── classService.js
│   │   ├── scheduleService.js
│   │   ├── programService.js
│   │   └── ...
│   └── lib/             # Utilities and configurations
└── tests/               # Test files

```

## 🔐 Security Features

- Role-based access control (Student/Tutor/Admin)
- Protected routes requiring authentication
- Authorization checks for schedule editing
- Secure password handling via Supabase Auth

## 🎨 User Experience Highlights

- **Modern UI Design:** Clean, intuitive interface with Tailwind CSS
- **Responsive Layout:** Works seamlessly on desktop and mobile devices
- **Real-time Updates:** Instant feedback on all actions
- **Custom Modals:** Polished notification system replacing browser alerts
- **Interactive Calendars:** Visual schedule management tools
- **Smart Filtering:** Quick search and filter across all data

## 📝 Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder

## 🗄️ Database Schema

The application uses Supabase with the following main tables:
- `users` - User authentication and profiles
- `students` - Student-specific information
- `tutors` - Tutor-specific information
- `programs` - Tutoring program definitions
- `classes` - Class instances
- `schedules` - Class schedules and room assignments
- `student_classes` - Student enrollment records

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is developed for educational purposes at HCMUT.

## 📧 Contact

For technical support or inquiries:
- Email: an.pham3101@hcmut.edu.vn
- Tel: (+84) 123 456 789

---

**Copyright © 2024 Ho Chi Minh University of Technology. All rights reserved.**
