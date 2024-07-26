import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import Login from './Login';

vi.mock('axios');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('Login Component', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    axios.post.mockClear();
    mockLogin.mockClear();
    mockNavigate.mockClear();
  });

  const renderComponent = () => {
    render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <Login />
      </AuthContext.Provider>
    );
  };

  it('renders the login form correctly', () => {
    renderComponent();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '登入' })).toBeInTheDocument();
  });

  it('displays an error when email and password are not provided', async () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: '登入' }));

    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
      expect(screen.getByText('登入失敗，請檢查您的電子郵件和密碼。')).toBeInTheDocument();
    });
  });

  it('displays a success message when login is successful', async () => {
    mockLogin.mockResolvedValue({});
    renderComponent();

    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: '登入' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password');
      expect(mockNavigate).toHaveBeenCalledWith('/spot-trading');
      expect(screen.getByText('登入成功')).toBeInTheDocument();
    });
  });

  it('displays an error message when login fails with known error', async () => {
    const errorMessage = 'Invalid email or password';
    mockLogin.mockRejectedValue({ response: { data: { message: errorMessage } } });
    renderComponent();

    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: '登入' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'wrongpassword');
      expect(screen.getByText('無效的電子郵件或密碼')).toBeInTheDocument();
    });
  });

  it('displays an error message when login fails with unknown error', async () => {
    mockLogin.mockRejectedValue(new Error('Network Error'));
    renderComponent();

    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: '登入' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password');
      expect(screen.getByText('登入失敗，請檢查您的電子郵件和密碼。')).toBeInTheDocument();
    });
  });

  it('handles mock login correctly', async () => {
    mockLogin.mockResolvedValue({});
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: '登入 (面試官用)' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@gmail.com', 'adminadmin');
      expect(mockNavigate).toHaveBeenCalledWith('/spot-trading');
      expect(screen.getByText('登入成功')).toBeInTheDocument();
    });
  });
});
