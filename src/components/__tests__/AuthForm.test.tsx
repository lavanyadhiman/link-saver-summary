import { render, screen } from '@testing-library/react';
import AuthForm from '@/components/AuthForm';
import '@testing-library/jest-dom';

// We need to mock the useTheme hook from next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
}));

describe('AuthForm', () => {
  it('renders a login form with a "Log In" button', () => {
    render(
      <AuthForm
        formType="login"
        onSubmit={() => {}}
        error={null}
        isLoading={false}
      />
    );
    const button = screen.getByRole('button', { name: /Log In/i });
    expect(button).toBeInTheDocument();
  });

  it('renders a signup form with a "Sign Up" button', () => {
    render(
      <AuthForm
        formType="signup"
        onSubmit={() => {}}
        error={null}
        isLoading={false}
      />
    );
    const button = screen.getByRole('button', { name: /Sign Up/i });
    expect(button).toBeInTheDocument();
  });
});