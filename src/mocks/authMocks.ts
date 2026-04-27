// src/mocks/authMocks.ts
//
// Hardcoded users + mock auth handlers for local frontend development only.
// This module is only imported when VITE_USE_MOCK=true AND the build is in
// dev mode. See src/api/authApi.ts for the switch.
//
// Every exported `mock*` function returns a promise that resolves/rejects
// in the exact shape axios would produce against the real backend. That
// keeps the slice code in usersSlice.ts identical whether mock is on or off.

export interface MockUser {
  _id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  active: boolean;
  library: never[];
  quizzes: never[];
  createdAt: string;
  updatedAt?: string;
}

/**
 * Test credentials — documented here so the team knows what to type in the login form.
 *
 *   Active user   → email: user@test.com    username: user    password: password123
 *   Active user   → email: admin@test.com   username: admin   password: admin123
 *   Inactive user → email: inactive@test.com                  password: password123
 */
export const MOCK_USERS: MockUser[] = [
  {
    _id: "mock-user-001",
    name: "Test User",
    username: "user",
    email: "user@test.com",
    password: "password123",
    active: true,
    library: [],
    quizzes: [],
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z",
  },
  {
    _id: "mock-user-002",
    name: "Admin User",
    username: "admin",
    email: "admin@test.com",
    password: "admin123",
    active: true,
    library: [],
    quizzes: [],
    createdAt: "2023-06-20T08:30:00.000Z",
    updatedAt: "2023-06-20T08:30:00.000Z",
  },
  {
    _id: "mock-user-003",
    name: "Inactive User",
    username: "inactive",
    email: "inactive@test.com",
    password: "password123",
    active: false,
    library: [],
    quizzes: [],
    createdAt: "2025-03-10T14:20:00.000Z",
    updatedAt: "2025-03-10T14:20:00.000Z",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────

import {
  delay,
  axiosError,
  writeMockSession,
  clearMockSession,
  currentUserId,
} from "./mockStore";

// Strip the password field from a mock user before returning to the client.
const stripPassword = (u: MockUser): Omit<MockUser, "password"> => {
  const { password: _omit, ...safe } = u;
  return safe;
};

// Read the currently logged-in mock user. The mock session is a single
// user-id string stored under the `mock:currentUserId` key; this stands in
// for what a real backend would read from an auth cookie. Returns null
// if no one is logged in (or the stored id no longer matches a user, e.g.
// after a mock-account deletion).
function readCurrentUser(): MockUser | null {
  const id = currentUserId();
  if (!id) return null;
  return MOCK_USERS.find((u) => u._id === id) ?? null;
}

// ─── Auth handlers ────────────────────────────────────────────────────────

export async function mockLogin(payload: {
  email?: string;
  username?: string;
  password: string;
}) {
  await delay();
  const { email, username, password } = payload;

  const user = MOCK_USERS.find(
    (u) =>
      (!!email && u.email.toLowerCase() === email.toLowerCase()) ||
      (!!username && u.username.toLowerCase() === username.toLowerCase())
  );

  if (!user) throw axiosError("User not found", 404);
  if (user.password !== password)
    throw axiosError("Invalid credentials", 401);
  if (!user.active) throw axiosError("Account is not activated", 403);

  // Stand in for the real backend's auth cookie. Without this the next
  // authenticated mock call would have no way to identify the user.
  writeMockSession(user._id);

  // Mirror the real backend's response shape: response.data = { message, data: user }
  return {
    data: {
      message: "Login successful (mock)",
      data: stripPassword(user),
    },
  };
}

export async function mockLogout() {
  await delay(200);
  clearMockSession();
  return { data: { message: "Logged out (mock)" } };
}

export async function mockRegister(payload: {
  name: string;
  username: string;
  email?: string;
  password: string;
}) {
  await delay();
  const { name, username, email, password } = payload;

  if (!password || password.length < 6) {
    throw axiosError("Password must be at least 6 characters", 400);
  }
  if (!username) {
    throw axiosError("Username is required", 400);
  }

  // Enforce uniqueness against the seed users
  const trimmedEmail = email?.trim();
  if (
    trimmedEmail &&
    MOCK_USERS.some(
      (u) => !!u.email && u.email.toLowerCase() === trimmedEmail.toLowerCase()
    )
  ) {
    throw axiosError("Email is already registered", 409);
  }
  if (
    MOCK_USERS.some((u) => u.username.toLowerCase() === username.toLowerCase())
  ) {
    throw axiosError("Username is already taken", 409);
  }

  const newUser: MockUser = {
    _id: `mock-user-${Date.now().toString(36)}`,
    name,
    username,
    email: trimmedEmail || "",
    password,
    // Newly registered users are inactive until they click the activation
    // link — matches the real backend's flow.
    active: false,
    library: [],
    quizzes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Add to in-memory list so subsequent mockLogin calls can find them
  MOCK_USERS.push(newUser);

  return {
    data: {
      message: "Registration successful (mock). Please activate your account.",
      data: stripPassword(newUser),
    },
  };
}

export async function mockActivate(token: string) {
  await delay();
  if (!token) throw axiosError("Activation token is required", 400);

  // In mock mode we don't actually verify tokens — we flip the most recently
  // registered inactive user to active. This matches the dev UX: register,
  // click the activation link, done.
  const target = [...MOCK_USERS].reverse().find((u) => !u.active);
  if (!target) {
    throw axiosError("No pending account to activate", 404);
  }
  target.active = true;
  target.updatedAt = new Date().toISOString();

  return {
    data: {
      message: "Account activated (mock)",
      data: stripPassword(target),
    },
  };
}

export async function mockForgetPassword(email: string) {
  await delay();
  if (!email) throw axiosError("Email is required", 400);
  // Real backends typically respond 200 whether or not the email exists
  // (to avoid leaking which emails are registered). Mirror that here.
  return {
    data: {
      message: "If the email exists, a reset link has been sent (mock)",
    },
  };
}

export async function mockResetPassword(token: string, password: string) {
  await delay();
  if (!token) throw axiosError("Reset token is required", 400);
  if (!password || password.length < 6) {
    throw axiosError("Password must be at least 6 characters", 400);
  }
  // In mock mode we don't actually verify tokens — just pretend it worked.
  return { data: { message: "Password reset successful (mock)" } };
}

export async function mockUpdateUser(updates: {
  name?: string;
  username?: string;
  email?: string;
}) {
  await delay();
  const current = readCurrentUser();
  if (!current) throw axiosError("Not authenticated", 401);

  if (updates.name !== undefined) current.name = updates.name;
  if (updates.username !== undefined) current.username = updates.username;
  if (updates.email !== undefined) current.email = updates.email;
  current.updatedAt = new Date().toISOString();

  return {
    data: {
      message: "Profile updated (mock)",
      data: stripPassword(current),
    },
  };
}

export async function mockResendActivation(email: string) {
  await delay();
  if (!email) throw axiosError("Email is required", 400);
  const user = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  if (!user) throw axiosError("No account found for that email", 404);
  if (user.active) {
    throw axiosError("Account is already active", 400);
  }
  return { data: { message: "Activation email resent (mock)" } };
}

export async function mockDeleteAccount() {
  await delay();
  const current = readCurrentUser();
  if (!current) throw axiosError("Not authenticated", 401);

  // Remove from the in-memory list so subsequent logins fail
  const idx = MOCK_USERS.findIndex((u) => u._id === current._id);
  if (idx !== -1) MOCK_USERS.splice(idx, 1);

  clearMockSession();
  return { data: { message: "Account deleted (mock)" } };
}

export async function mockGetUserData() {
  await delay(150);
  const current = readCurrentUser();
  if (!current) throw axiosError("Not authenticated", 401);

  return {
    data: {
      message: "User fetched (mock)",
      data: stripPassword(current),
    },
  };
}