import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '../Login';

// Mock navigate function with proper naming convention
const mockNavigate = jest.fn();

// Mock react-router-dom's useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock authService
jest.mock('../../services/authService', () => {
  return {
    authService: {
      signIn: jest.fn(),
      getUserProfile: jest.fn(),
    },
  };
});

describe('Login', () => {
  const { authService } = require('../../services/authService');

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('appends @hcmut.edu.vn and calls signIn', async () => {
    authService.signIn.mockResolvedValue({});
    authService.getUserProfile.mockResolvedValue({ role: 'student' });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText('Username'), 'john.doe');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'secret');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(authService.signIn).toHaveBeenCalledWith('john.doe@hcmut.edu.vn', 'secret');
    });
  });

  it('navigates student to /student-home', async () => {
    authService.signIn.mockResolvedValue({});
    authService.getUserProfile.mockResolvedValue({ role: 'student' });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText('Username'), 'alice');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'pw');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/student-home');
    });
  });

  it('navigates tutor to /tutor-home', async () => {
    authService.signIn.mockResolvedValue({});
    authService.getUserProfile.mockResolvedValue({ role: 'tutor' });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText('Username'), 'bob');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'pw');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/tutor-home');
    });
  });

  it('shows alert on sign-in error and does not navigate', async () => {
    const error = new Error('Invalid credentials');
    authService.signIn.mockRejectedValue(error);

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText('Username'), 'eve');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'bad');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('handles getUserProfile error after successful signIn', async () => {
    authService.signIn.mockResolvedValue({});
    authService.getUserProfile.mockRejectedValue(new Error('Profile fetch failed'));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText('Username'), 'user');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'pass');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(authService.signIn).toHaveBeenCalled();
      expect(authService.getUserProfile).toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Profile fetch failed'));
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('calls getUserProfile after successful signIn', async () => {
    authService.signIn.mockResolvedValue({});
    authService.getUserProfile.mockResolvedValue({ role: 'student' });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText('Username'), 'test');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'test123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(authService.signIn).toHaveBeenCalledTimes(1);
      expect(authService.getUserProfile).toHaveBeenCalledTimes(1);
    });
  });

  it('handles empty username input', async () => {
    authService.signIn.mockResolvedValue({});
    authService.getUserProfile.mockResolvedValue({ role: 'student' });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText('Password'), 'password');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(authService.signIn).toHaveBeenCalledWith('@hcmut.edu.vn', 'password');
    });
  });

  it('handles empty password input', async () => {
    authService.signIn.mockResolvedValue({});
    authService.getUserProfile.mockResolvedValue({ role: 'student' });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText('Username'), 'username');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(authService.signIn).toHaveBeenCalledWith('username@hcmut.edu.vn', '');
    });
  });

  it('navigates non-student role to /tutor-home by default', async () => {
    authService.signIn.mockResolvedValue({});
    authService.getUserProfile.mockResolvedValue({ role: 'admin' });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText('Username'), 'admin');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'admin123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/tutor-home');
    });
  });

  it('renders login form elements correctly', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/Central Authentication Service/i)).toBeInTheDocument();
  });
});
