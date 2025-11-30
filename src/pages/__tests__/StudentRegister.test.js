import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StudentRegister from '../StudentRegister';

// Mock UserContext
const mockUseUser = jest.fn();

jest.mock('../../context/UserContext', () => ({
  useUser: () => mockUseUser()
}));

// Mock programService
jest.mock('../../services/programService', () => ({
  programService: {
    getProgramsForRegistration: jest.fn()
  }
}));

// Mock studentService
jest.mock('../../services/studentService', () => ({
  studentService: {
    getStudentEnrollments: jest.fn(),
    registerClass: jest.fn(),
    unregisterClass: jest.fn()
  }
}));

describe('StudentRegister', () => {
  const { programService } = require('../../services/programService');
  const { studentService } = require('../../services/studentService');

  const mockUser = {
    id: 'user-123',
    role: 'student',
    details: { id: 'student-123' }
  };

  const mockPrograms = [
    {
      id: 'prog-1',
      program_code: 'CS101',
      name: 'Introduction to Computer Science',
      description: 'Fundamentals of programming',
      category: 'Academic',
      status: 'active',
      classes: [
        {
          id: 'class-1',
          class_code: 'CS101-01',
          current_students: 10,
          max_students: 30,
          status: 'Active',
          tutor_name: 'Dr. Smith',
          schedule: [
            { day: '1', period: '1', room: 'H1-101', weeks: '35' }
          ]
        }
      ]
    },
    {
      id: 'prog-2',
      program_code: 'MUSIC101',
      name: 'Music Appreciation',
      description: 'Introduction to music theory',
      category: 'Non-Academic',
      status: 'active',
      classes: [
        {
          id: 'class-2',
          class_code: 'MUSIC101-01',
          current_students: 20,
          max_students: 25,
          status: 'Active',
          tutor_name: 'Prof. Johnson',
          schedule: [
            { day: '2', period: '3', room: 'H2-201', weeks: '35' }
          ]
        }
      ]
    }
  ];

  beforeEach(() => {
    mockUseUser.mockReturnValue({ user: mockUser, loading: false });
    programService.getProgramsForRegistration.mockResolvedValue(mockPrograms);
    studentService.getStudentEnrollments.mockResolvedValue([]);
    jest.clearAllMocks();
    // Re-setup mocks after clearing
    mockUseUser.mockReturnValue({ user: mockUser, loading: false });
    programService.getProgramsForRegistration.mockResolvedValue(mockPrograms);
    studentService.getStudentEnrollments.mockResolvedValue([]);
  });

  it('renders program list after loading', async () => {
    render(<StudentRegister />);

    // Initially shows loading
    expect(screen.queryByText(/Introduction to Computer Science/i)).not.toBeInTheDocument();

    // Wait for programs to load
    await waitFor(() => {
      expect(screen.getByText(/Introduction to Computer Science/i)).toBeInTheDocument();
      expect(screen.getByText(/Music Appreciation/i)).toBeInTheDocument();
    });
  });

  it('calls programService and studentService on mount', async () => {
    render(<StudentRegister />);

    await waitFor(() => {
      expect(programService.getProgramsForRegistration).toHaveBeenCalledTimes(1);
      expect(studentService.getStudentEnrollments).toHaveBeenCalledWith('student-123');
    });
  });

  it('filters programs by search term', async () => {
    render(<StudentRegister />);

    await waitFor(() => {
      expect(screen.getByText(/Introduction to Computer Science/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search/i);
    await userEvent.type(searchInput, 'Music');

    await waitFor(() => {
      expect(screen.getByText(/Music Appreciation/i)).toBeInTheDocument();
      expect(screen.queryByText(/Introduction to Computer Science/i)).not.toBeInTheDocument();
    });
  });

  it('filters programs by category', async () => {
    render(<StudentRegister />);

    await waitFor(() => {
      expect(screen.getByText(/Introduction to Computer Science/i)).toBeInTheDocument();
      expect(screen.getByText(/Music Appreciation/i)).toBeInTheDocument();
    });

    // Find and click Academic filter
    const academicButton = screen.getByRole('button', { name: /^academic$/i });
    await userEvent.click(academicButton);

    await waitFor(() => {
      expect(screen.getByText(/Introduction to Computer Science/i)).toBeInTheDocument();
      expect(screen.queryByText(/Music Appreciation/i)).not.toBeInTheDocument();
    });
  });

  it('expands program to show classes when clicked', async () => {
    render(<StudentRegister />);

    await waitFor(() => {
      expect(screen.getByText(/Introduction to Computer Science/i)).toBeInTheDocument();
    });

    // Class code should not be visible initially
    expect(screen.queryByText('CS101-01')).not.toBeInTheDocument();

    // Click expand button
    const expandButtons = screen.getAllByRole('button', { name: /view classes/i });
    await userEvent.click(expandButtons[0]);

    // Class code should now be visible
    await waitFor(() => {
      expect(screen.getByText('CS101-01')).toBeInTheDocument();
    });
  });

  it('opens confirmation modal when register button clicked', async () => {
    render(<StudentRegister />);

    await waitFor(() => {
      expect(screen.getByText(/Introduction to Computer Science/i)).toBeInTheDocument();
    });

    // Expand program to show classes
    const expandButtons = screen.getAllByRole('button', { name: /view classes/i });
    await userEvent.click(expandButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('CS101-01')).toBeInTheDocument();
    });

    // Click register button
    const registerButton = screen.getByRole('button', { name: /register now/i });
    await userEvent.click(registerButton);

    // Modal should appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /confirm registration/i })).toBeInTheDocument();
    });
  });

  it('successfully registers for a class', async () => {
    studentService.enrollStudentInClass = jest.fn().mockResolvedValue({ success: true });

    render(<StudentRegister />);

    await waitFor(() => {
      expect(screen.getByText(/Introduction to Computer Science/i)).toBeInTheDocument();
    });

    // Expand program
    const expandButtons = screen.getAllByRole('button', { name: /view classes/i });
    await userEvent.click(expandButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('CS101-01')).toBeInTheDocument();
    });

    // Click register
    const registerButton = screen.getByRole('button', { name: /register now/i });
    await userEvent.click(registerButton);

    // Confirm in modal
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /confirm registration/i })).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /confirm registration/i });
    await userEvent.click(confirmButton);

    // Verify service called
    await waitFor(() => {
      expect(studentService.enrollStudentInClass).toHaveBeenCalledWith('student-123', 'class-1');
      expect(global.alert).toHaveBeenCalled();
    });
  });

  it('shows error alert when registration fails', async () => {
    studentService.enrollStudentInClass = jest.fn().mockRejectedValue(new Error('Registration failed'));

    render(<StudentRegister />);

    await waitFor(() => {
      expect(screen.getByText(/Introduction to Computer Science/i)).toBeInTheDocument();
    });

    // Expand and register
    const expandButtons = screen.getAllByRole('button', { name: /view classes/i });
    await userEvent.click(expandButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('CS101-01')).toBeInTheDocument();
    });

    const registerButton = screen.getByRole('button', { name: /register now/i });
    await userEvent.click(registerButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /confirm registration/i })).toBeInTheDocument();
    });

      const confirmButton = screen.getByRole('button', { name: /confirm registration/i });
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('failed'));
    });
  });

  it('shows enrolled badge for enrolled classes', async () => {
    studentService.getStudentEnrollments.mockResolvedValue([
      {
        enrollmentId: 'enroll-1',
        class: { 
          id: 'class-1',
          classCode: 'CS101-01' 
        }
      }
    ]);

    render(<StudentRegister />);

    await waitFor(() => {
      expect(screen.getByText(/Introduction to Computer Science/i)).toBeInTheDocument();
    });

    // Expand program
    const expandButtons = screen.getAllByRole('button', { name: /view classes/i });
    await userEvent.click(expandButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/✓ enrolled/i)).toBeInTheDocument();
    });
  });

  it('disables register button for full classes', async () => {
    const fullPrograms = [{
      ...mockPrograms[0],
      classes: [{
        id: 'class-1',
        class_code: 'CS101-01',
        current_students: 30,
        max_students: 30,
        status: 'Active',
        tutor_name: 'Dr. Smith',
        schedule: []
      }]
    }];

    programService.getProgramsForRegistration.mockResolvedValue(fullPrograms);

    render(<StudentRegister />);

    await waitFor(() => {
      expect(screen.getByText(/Introduction to Computer Science/i)).toBeInTheDocument();
    });

    // Expand program
    const expandButton = screen.getByRole('button', { name: /view classes/i });
    await userEvent.click(expandButton);

    await waitFor(() => {
      expect(screen.getByText(/class full/i)).toBeInTheDocument();
    });
  });

  it('does not load enrollments for non-student users', async () => {
    mockUseUser.mockReturnValue({
      user: { ...mockUser, role: 'tutor' },
      loading: false
    });

    render(<StudentRegister />);

    await waitFor(() => {
      expect(programService.getProgramsForRegistration).toHaveBeenCalled();
    });

    expect(studentService.getStudentEnrollments).not.toHaveBeenCalled();
  });

  it('handles search with no results', async () => {
    render(<StudentRegister />);

    await waitFor(() => {
      expect(screen.getByText(/Introduction to Computer Science/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search/i);
    await userEvent.type(searchInput, 'NonExistentProgram');

    await waitFor(() => {
      expect(screen.queryByText(/Introduction to Computer Science/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Music Appreciation/i)).not.toBeInTheDocument();
    });
  });

  it('unregisters from a class successfully', async () => {
    studentService.getStudentEnrollments.mockResolvedValue([
      {
        enrollmentId: 'enroll-1',
        class: { 
          id: 'class-1',
          classCode: 'CS101-01' 
        }
      }
    ]);
    studentService.unenrollStudentFromClass = jest.fn().mockResolvedValue({ success: true });
    global.confirm = jest.fn(() => true);

    render(<StudentRegister />);

    await waitFor(() => {
      expect(screen.getByText(/Introduction to Computer Science/i)).toBeInTheDocument();
    });

    // Expand program
    const expandButtons = screen.getAllByRole('button', { name: /view classes/i });
    await userEvent.click(expandButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/✓ enrolled/i)).toBeInTheDocument();
    });

    // Click unregister button
    const unregisterButton = screen.getByRole('button', { name: /unregister/i });
    await userEvent.click(unregisterButton);

    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalled();
      expect(studentService.unenrollStudentFromClass).toHaveBeenCalledWith('student-123', 'class-1');
    });
  });
});
