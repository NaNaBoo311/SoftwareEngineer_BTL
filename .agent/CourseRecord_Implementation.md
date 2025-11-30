# CourseRecord Component - Role-Based Implementation

## Overview
Modified the CourseRecord component to display different views based on user role (student vs tutor).

## Changes Made

### 1. Created New Service: `classService.js`
**Location:** `src/services/classService.js`

**Functions:**
- `getStudentsInClass(classId)` - Fetches all students enrolled in a specific class
- `getStudentRecordInClass(studentId, classId)` - Gets a specific student's record (for future use)
- `getClassById(classId)` - Retrieves class details

**Database Tables Used:**
- `student_classes` - Junction table linking students to classes
- `students` - Student information
- `users` - User account information
- `classes` - Class information
- `programs` - Program/course information

### 2. Updated CoursePage Component
**Location:** `src/pages/CoursePage.js`

**Changes:**
- Now passes `classId={course.id}` to the CourseRecord component
- This allows CourseRecord to fetch student data for the specific class

### 3. Completely Rewrote CourseRecord Component
**Location:** `src/components/CourseRecord.js`

**New Features:**

#### For Students (role === 'student'):
- Shows their own academic record directly
- Displays grades, assignments, quizzes, and exams
- Shows progress overview and grade breakdown

#### For Tutors (role === 'tutor'):
- **Initial View - Student List:**
  - Displays a table of all students enrolled in the class
  - Shows: Student Code, Full Name, Email, Major, Enrolled Date
  - Each row is clickable to view that student's detailed record
  - "View Record" button for each student
  - Shows total count of enrolled students
  - Empty state when no students are enrolled

- **Detail View - Individual Student Record:**
  - Shows the selected student's complete academic record
  - Includes a "Back to Student List" button
  - Displays student email in the header (for tutor reference)
  - Shows all grades, assignments, quizzes, and exams
  - **Note:** Tutors can view records but cannot modify them yet (save functionality to be implemented later)

**Component Structure:**
```
CourseRecord (Main Component)
├── Student Role → StudentRecordView (direct)
└── Tutor Role
    ├── List View → Student table with click handlers
    └── Detail View → StudentRecordView (with back button)
```

**State Management:**
- `view` - Tracks current view ('list' or 'detail')
- `students` - Array of enrolled students (for tutors)
- `selectedStudent` - Currently selected student (for detail view)
- `loading` - Loading state while fetching data
- `error` - Error state for failed API calls

**UI Components Used:**
- Lucide React icons: `Loader2`, `Users`, `ArrowLeft`, `GraduationCap`
- UserContext for accessing current user role
- Responsive table layout for student list
- Gradient headers and modern card designs

## Database Schema Reference

### student_classes table
```sql
- id (bigint, primary key)
- student_id (uuid, foreign key → students.id)
- class_id (bigint, foreign key → classes.id)
- enrolled_at (timestamp)
```

### students table
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → users.id)
- student_code (text, unique)
- major (text)
- faculty (text)
```

### users table
```sql
- id (uuid, primary key)
- full_name (text)
- email (text, unique)
- role (text: 'student' | 'tutor' | 'admin')
```

## Future Enhancements
1. **Grade Modification for Tutors:**
   - Add edit mode for tutors to modify student grades
   - Implement save functionality to persist changes to database
   - Add validation and confirmation dialogs

2. **Real Grade Data:**
   - Replace mock data with actual grades from database
   - Create grade-related tables and services
   - Implement grade calculation logic

3. **Filtering and Sorting:**
   - Add search functionality for student list
   - Sort by name, student code, or enrolled date
   - Filter by major or grade range

4. **Export Functionality:**
   - Export student list to CSV/Excel
   - Generate grade reports for individual students
   - Bulk grade entry for tutors

## Testing Notes
- Ensure user role is correctly set in UserContext
- Test with both student and tutor accounts
- Verify classId is properly passed from CoursePage
- Check loading and error states
- Test navigation between list and detail views
