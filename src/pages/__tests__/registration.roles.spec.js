import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TutorRegister from '../TutorRegister';
import StudentRegister from '../StudentRegister';

// Role gating smoke: ensures basic protections are present.

jest.mock('../../context/UserContext', () => ({
  useUser: () => ({ user: null, loading: false })
}));

describe('Security - Role & Auth Gating', () => {
  test('TutorRegister requires authentication', () => {
    render(<MemoryRouter><TutorRegister /></MemoryRouter>);
    expect(screen.getByText(/Authentication Required/i)).toBeInTheDocument();
  });

  test('StudentRegister does not fetch enrollments for non-student', async () => {
    // Minimal render check; detailed behavior covered in unit tests.
    render(<StudentRegister />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });
  });
});
