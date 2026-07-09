import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import coreReducer from '../../data/coreSlice';
import { AUTH_TOKEN_KEY } from '../../data/constants';
import Login from './Login';
import * as ajax from '../../utils/ajax';

vi.mock('../../utils/ajax', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../utils/ajax')>();
  return { ...actual, post: vi.fn() };
});

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockPost = vi.mocked(ajax.post);

const makeStore = () =>
  configureStore({ reducer: { core: coreReducer } });

const renderLogin = (store = makeStore()) =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </Provider>,
  );

beforeEach(() => {
  mockPost.mockClear();
  mockNavigate.mockClear();
  localStorage.clear();
});

// ─── rendering ───────────────────────────────────────────────────────────────

describe('Login rendering', () => {
  it('renders username and password fields', () => {
    renderLogin();
    expect(screen.getByLabelText(/username or email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  });

  it('renders the Sign in button', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders Forgot Password link', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /forgot password/i })).toBeInTheDocument();
  });

  it('renders Sign up link', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('does not show an error alert on initial render', () => {
    renderLogin();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

// ─── password visibility toggle ───────────────────────────────────────────────

describe('password visibility toggle', () => {
  it('password field is hidden by default', () => {
    renderLogin();
    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('type', 'password');
  });

  it('reveals password when toggle is clicked', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: /show password/i }));

    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('type', 'text');
  });

  it('hides password again when toggle is clicked a second time', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: /show password/i }));
    await user.click(screen.getByRole('button', { name: /hide password/i }));

    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('type', 'password');
  });
});

// ─── form submission ─────────────────────────────────────────────────────────

describe('form submission', () => {
  it('calls post with username and password on submit', async () => {
    const user = userEvent.setup();
    mockPost.mockImplementation(() => undefined as any);
    renderLogin();

    await user.type(screen.getByLabelText(/username or email/i), 'alice');
    await user.type(screen.getByLabelText(/^password$/i), 'secret');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(mockPost).toHaveBeenCalledOnce();
    const [, payload] = mockPost.mock.calls[0];
    expect(payload).toMatchObject({ username: 'alice', password: 'secret' });
  });

  it('shows loading spinner while request is in flight', async () => {
    const user = userEvent.setup();
    // post never calls any callback → loading stays true
    mockPost.mockImplementation(() => undefined as any);
    renderLogin();

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // When loading, the button replaces its text with a spinner (no accessible name)
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-node-access
    expect(document.querySelector('button[type="submit"]')).toBeDisabled();
  });

  it('shows error alert when login fails', async () => {
    const user = userEvent.setup();
    mockPost.mockImplementation((_url, _data, _onSuccess, onError) => {
      onError?.(new Error('401'));
      return undefined as any;
    });
    renderLogin();

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        /login failed.*check your credentials/i,
      ),
    );
  });

  it('re-enables the button after a failed login', async () => {
    const user = userEvent.setup();
    mockPost.mockImplementation((_url, _data, _onSuccess, onError) => {
      onError?.(new Error('401'));
      return undefined as any;
    });
    renderLogin();

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /sign in/i })).not.toBeDisabled(),
    );
  });

  it('dispatches login action and stores token on success', async () => {
    const user = userEvent.setup();
    const store = makeStore();
    const fakeToken = 'fake-jwt-token';
    const fakeUser = { id: '1', username: 'alice', email: 'alice@example.com' };

    mockPost.mockImplementation((_url, _data, onSuccess) => {
      onSuccess?.({ token: fakeToken, user: fakeUser });
      return undefined as any;
    });

    renderLogin(store);
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      const state = store.getState().core;
      expect(state.user).toMatchObject({ username: 'alice' });
      expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe(fakeToken);
    });
  });
});

// ─── navigation links ─────────────────────────────────────────────────────────

describe('navigation links', () => {
  it('navigates to forgot-password route when link is clicked', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: /forgot password/i }));

    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('forgot'));
  });

  it('navigates to register route when Sign up is clicked', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: /sign up/i }));

    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('register'));
  });
});
