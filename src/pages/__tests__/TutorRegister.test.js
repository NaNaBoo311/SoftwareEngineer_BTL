import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import TutorRegister from '../TutorRegister';

// Mocks
const mockUseUser = jest.fn();
jest.mock('../../context/UserContext', () => ({ useUser: () => mockUseUser() }));

jest.mock('../../services/programService', () => {
  const mockProgramService = {
    getProgramsWithClasses: jest.fn(),
    getTakenSchedules: jest.fn(),
    unregisterTutorFromClass: jest.fn(),
    updateTutorAssignment: jest.fn(),
    saveSchedulesForClass: jest.fn()
  };
  return { programService: mockProgramService };
});
const { programService } = require('../../services/programService');

// We don't exercise tutorService directly here
jest.mock('../../services/tutorService', () => ({ tutorService: {} }));

// Simplify ProgramCard & ClassCard to clickable buttons
jest.mock('../../components/ProgramCard', () => ({ program, onClick }) => (
  <button onClick={() => onClick(program)}>{program.name}</button>
));

jest.mock('../../components/ClassCard', () => ({ classItem, onClassSelect }) => (
  <button onClick={() => onClassSelect(classItem)}>{classItem.class_code}</button>
));

// Auto-select room when modal opens
// Simulate user interaction for Room Selection
jest.mock('../../components/RoomSelectionModal', () => ({ isOpen, onSelectRoom }) => (
  isOpen ? <button onClick={() => onSelectRoom('R101')}>Select Room</button> : null
));

// Simulate user interaction for Mode Selection
jest.mock('../../components/ModeSelectionModal', () => ({ isOpen, onSelectMode }) => (
  isOpen ? <button onClick={() => onSelectMode('online')}>Confirm Online Mode</button> : null
));

const basePrograms = [
  {
    id: 'p1',
    name: 'Program Alpha',
    description: 'Alpha Desc',
    program_code: 'ALPHA',
    start_week: 1,
    end_week: 4,
    number_of_week: 2,
    period_per_week: 2,
    classes: [
      { id: 'c1', class_code: 'ALPHA-01', tutor_id: null, available: true },
      { id: 'c2', class_code: 'ALPHA-02', tutor_id: 'tutor-123', available: false }
    ]
  },
  {
    id: 'p2',
    name: 'Beta Program',
    description: 'Beta Desc',
    program_code: 'BETA',
    start_week: 1,
    end_week: 3,
    number_of_week: 1,
    period_per_week: 1,
    classes: [{ id: 'c3', class_code: 'BETA-01', tutor_id: null, available: true }]
  }
];

const loggedInUser = {
  details: { id: 'tutor-123' },
  full_name: 'Tutor User',
  email: 'tutor@example.com'
};

// Suppress act() warnings - these are expected for async state updates in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('An update to') &&
      args[0].includes('was not wrapped in act')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  jest.resetModules();
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(window, 'alert').mockImplementation(() => { });
  jest.spyOn(window, 'confirm').mockImplementation(() => true);
  programService.getProgramsWithClasses.mockResolvedValue(basePrograms);
  programService.getTakenSchedules.mockResolvedValue([]);
  mockUseUser.mockReturnValue({ user: loggedInUser, loading: false });
});

describe('TutorRegister', () => {
  test('shows user loading spinner when userLoading true', async () => {
    mockUseUser.mockReturnValue({ user: null, loading: true });
    render(<MemoryRouter><TutorRegister /></MemoryRouter>);
    expect(screen.getByText(/Loading user information/i)).toBeInTheDocument();
  });

  test('shows authentication required when no user', async () => {
    mockUseUser.mockReturnValue({ user: null, loading: false });
    render(<MemoryRouter><TutorRegister /></MemoryRouter>);
    expect(screen.getByText(/Authentication Required/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Go to Login/i })).toBeInTheDocument();
  });

  test('calls programService methods and renders programs', async () => {
    render(<MemoryRouter><TutorRegister /></MemoryRouter>);
    await waitFor(() => {
      expect(programService.getProgramsWithClasses).toHaveBeenCalled();
      expect(programService.getTakenSchedules).toHaveBeenCalled();
    });
    expect(await screen.findByRole('button', { name: /Program Alpha/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Beta Program/i })).toBeInTheDocument();
  });

  test('search filters programs list and shows found count', async () => {
    render(<MemoryRouter><TutorRegister /></MemoryRouter>);
    const search = await screen.findByPlaceholderText(/Search programs by name or code\.?/i);
    await userEvent.type(search, 'Beta');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Beta Program/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Program Alpha/i })).not.toBeInTheDocument();
    });
    expect(screen.getByText(/Found 1 program/i)).toBeInTheDocument();
  });

  test('shows No Programs Found when search yields zero', async () => {
    render(<MemoryRouter><TutorRegister /></MemoryRouter>);
    const search = await screen.findByPlaceholderText(/Search programs by name or code\.?/i);
    await userEvent.type(search, 'Gamma');
    await waitFor(() => {
      expect(screen.getByText(/No Programs Found/i)).toBeInTheDocument();
    });
  });

  test('selecting a program advances to step 2', async () => {
    render(<MemoryRouter><TutorRegister /></MemoryRouter>);
    const programBtn = await screen.findByRole('button', { name: /Program Alpha/i });
    await userEvent.click(programBtn);
    await waitFor(() => {
      expect(screen.getByText(/Select Class for Program Alpha/i)).toBeInTheDocument();
    });
  });

  test('selecting available class advances to step 3 (new assignment)', async () => {
    render(<MemoryRouter><TutorRegister /></MemoryRouter>);
    const programBtn = await screen.findByRole('button', { name: /Program Alpha/i });
    await userEvent.click(programBtn);
    const classBtn = await screen.findByRole('button', { name: /ALPHA-01/i });
    await userEvent.click(classBtn);
    await waitFor(() => {
      expect(screen.getByText(/Schedule Your Classes/i)).toBeInTheDocument();
      expect(screen.getByText(/Class:/i)).toBeInTheDocument();
    });
  });

  test('selecting assigned class shows modify schedule header', async () => {
    render(<MemoryRouter><TutorRegister /></MemoryRouter>);
    const programBtn = await screen.findByRole('button', { name: /Program Alpha/i });
    await userEvent.click(programBtn);
    const classBtn = await screen.findByRole('button', { name: /ALPHA-02/i });
    await userEvent.click(classBtn);
    await waitFor(() => {
      expect(screen.getByText(/Modify Your Class Schedule/i)).toBeInTheDocument();
    });
  });

  test('week selection displays selected count and prevents excess', async () => {
    render(<MemoryRouter><TutorRegister /></MemoryRouter>);
    const programBtn = await screen.findByRole('button', { name: /Program Alpha/i });
    await userEvent.click(programBtn);
    const classBtn = await screen.findByRole('button', { name: /ALPHA-01/i });
    await userEvent.click(classBtn);

    const week1 = await screen.findByRole('button', { name: /Week 1/i });
    const week2 = screen.getByRole('button', { name: /Week 2/i });
    const week3 = screen.getByRole('button', { name: /Week 3/i });

    await userEvent.click(week1);
    await userEvent.click(week2);
    await userEvent.click(week3); // should not be added (limit 2)

    await waitFor(() => {
      expect(screen.getByText(/Selected: 1, 2 \(2\/2 weeks\)/i)).toBeInTheDocument();
    });
  });

  test('configuring more periods than allowed triggers alert', async () => {
    render(<MemoryRouter><TutorRegister /></MemoryRouter>);
    const programBtn = await screen.findByRole('button', { name: /Program Alpha/i });
    await userEvent.click(programBtn);
    const classBtn = await screen.findByRole('button', { name: /ALPHA-01/i });
    await userEvent.click(classBtn);
    // Select required weeks
    await userEvent.click(screen.getByRole('button', { name: /Week 1/i }));
    await userEvent.click(screen.getByRole('button', { name: /Week 2/i }));

    // Click two different slots (day-period combos)
    const allSlotsInitial = screen.getAllByTitle(/Click to configure/i);
    await userEvent.click(allSlotsInitial[0]);
    await userEvent.click(screen.getByText('Confirm Online Mode'));

    const allSlotsAfterFirst = screen.getAllByTitle(/Click to configure/i);
    await userEvent.click(allSlotsAfterFirst[1]);
    await userEvent.click(screen.getByText('Confirm Online Mode'));

    const allSlotsAfterSecond = screen.getAllByTitle(/Click to configure/i);
    await userEvent.click(allSlotsAfterSecond[2]); // triggers alert (third period)
    await userEvent.click(screen.getByText('Confirm Online Mode'));

    await waitFor(() => {
      expect(screen.getByText(/Limit Reached/i)).toBeInTheDocument();
      expect(screen.getByText(/You can only have/i)).toBeInTheDocument();
    });
  });

  test('duplicate slot configuration triggers alert', async () => {
    render(<MemoryRouter><TutorRegister /></MemoryRouter>);
    const programBtn = await screen.findByRole('button', { name: /Program Alpha/i });
    await userEvent.click(programBtn);
    const classBtn = await screen.findByRole('button', { name: /ALPHA-01/i });
    await userEvent.click(classBtn);
    await userEvent.click(screen.getByRole('button', { name: /Week 1/i }));
    await userEvent.click(screen.getByRole('button', { name: /Week 2/i }));

    const [slot] = screen.getAllByTitle(/Click to configure/i);
    await userEvent.click(slot); // configure
    await userEvent.click(screen.getByText('Confirm Online Mode'));

    await userEvent.click(slot); // duplicate attempt triggers alert
    await userEvent.click(screen.getByText('Confirm Online Mode'));

    await waitFor(() => {
      expect(screen.getByText(/Slot Configured/i)).toBeInTheDocument();
      expect(screen.getByText(/This time slot is already configured/i)).toBeInTheDocument();
    });
  });

  test('submit disabled until weeks and periods configured then saves new assignment', async () => {
    render(<MemoryRouter><TutorRegister /></MemoryRouter>);
    const programBtn = await screen.findByRole('button', { name: /Program Alpha/i });
    await userEvent.click(programBtn);
    const classBtn = await screen.findByRole('button', { name: /ALPHA-01/i });
    await userEvent.click(classBtn);
    const submitBtn = await screen.findByRole('button', { name: /Complete Assignment/i });
    expect(submitBtn).toBeDisabled();

    // weeks
    await userEvent.click(screen.getByRole('button', { name: /Week 1/i }));
    await userEvent.click(screen.getByRole('button', { name: /Week 2/i }));

    // configure required periods
    const slots = screen.getAllByTitle(/Click to configure/i);
    await userEvent.click(slots[0]);
    await userEvent.click(screen.getByText('Confirm Online Mode'));

    await userEvent.click(slots[1]);
    await userEvent.click(screen.getByText('Confirm Online Mode'));

    await waitFor(() => {
      expect(submitBtn).toBeEnabled();
    });

    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(programService.saveSchedulesForClass).toHaveBeenCalledWith(
        'c1',
        expect.any(Object),
        expect.objectContaining({ id: 'tutor-123' })
      );
      expect(screen.getByText(/Tutor assignment successful/i)).toBeInTheDocument();
    });
  });

  test('modification path calls updateTutorAssignment', async () => {
    render(<MemoryRouter><TutorRegister /></MemoryRouter>);
    const programBtn = await screen.findByRole('button', { name: /Program Alpha/i });
    await userEvent.click(programBtn);
    const classBtn = await screen.findByRole('button', { name: /ALPHA-02/i });
    await userEvent.click(classBtn);
    const submitBtn = await screen.findByRole('button', { name: /Update Assignment/i });

    // weeks selection (existing schedules may auto-populate none since takenSchedules empty)
    await userEvent.click(screen.getByRole('button', { name: /Week 1/i }));
    await userEvent.click(screen.getByRole('button', { name: /Week 2/i }));

    // configure periods (2 required)
    const slots = screen.getAllByTitle(/Click to configure/i);
    await userEvent.click(slots[0]);
    await userEvent.click(screen.getByText('Confirm Online Mode'));

    await userEvent.click(slots[1]);
    await userEvent.click(screen.getByText('Confirm Online Mode'));

    await waitFor(() => {
      expect(submitBtn).toBeEnabled();
    });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(programService.updateTutorAssignment).toHaveBeenCalledWith(
        'c2',
        expect.any(Object),
        expect.objectContaining({ id: 'tutor-123' })
      );
      // updateTutorAssignment in component uses alert()
      expect(window.alert).toHaveBeenCalledWith('Tutor assignment updated successfully!');
    });
  });

  test('unregister from class triggers service call', async () => {
    render(<MemoryRouter><TutorRegister /></MemoryRouter>);
    const programBtn = await screen.findByRole('button', { name: /Program Alpha/i });
    await userEvent.click(programBtn);
    const classBtn = await screen.findByRole('button', { name: /ALPHA-02/i });
    await userEvent.click(classBtn);

    const unregisterBtn = await screen.findByRole('button', { name: /Unregister from Class/i });
    await userEvent.click(unregisterBtn);

    await waitFor(() => {
      expect(programService.unregisterTutorFromClass).toHaveBeenCalledWith('c2');
      expect(screen.getByText(/Successfully unregistered/i)).toBeInTheDocument();
    });
  });
});
