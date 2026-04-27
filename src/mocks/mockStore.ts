// src/mocks/mockStore.ts
//
// Central in-memory + localStorage-backed store for all mock data.
// Persisting to localStorage means created quizzes, scores, and library
// additions survive page refreshes — mirroring the real backend's behaviour.
//
// The store is seeded once on first boot with a few sample public quizzes
// owned by the existing mock users (see authMocks.ts) so the Public Exams
// page isn't empty before anything is created.

import { QuizType } from "../types/QuizType";
import { QuestionType } from "../types/QuestionType";
import { ScoreType } from "../types/ScoreType";
import { UserType } from "../types/UserType";
import { MOCK_USERS } from "@/mocks/authMocks";

const STORAGE_KEY = "mock:store:v1";

// ─── Types ────────────────────────────────────────────────────────────────

// Stored quiz holds only the owner ID and question IDs — we hydrate
// `quiz.user` and `quiz.questions` on read so quizzes always reflect the
// latest state of the user and the question list.
interface StoredQuiz extends Omit<QuizType, "user" | "questions"> {
  userId: string;
  questionIds: string[];
}

interface StoredLibraryEntry {
  userId: string;
  quizId: string;
}

interface StoredShareToken {
  token: string;
  quizId: string;
  createdAt: string;
}

interface MockDB {
  quizzes: StoredQuiz[];
  questions: QuestionType[];
  library: StoredLibraryEntry[];
  scores: ScoreType[];
  shareTokens: StoredShareToken[];
}

// ─── Utilities ────────────────────────────────────────────────────────────

const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const nowISO = () => new Date().toISOString();

function getUserById(userId: string): UserType {
  const u = MOCK_USERS.find((m) => m._id === userId);
  if (u) {
    const { password: _, ...safe } = u;
    return safe as unknown as UserType;
  }
  // Unknown user fallback — keeps UI stable if a quiz references a user we deleted
  return {
    _id: userId,
    name: "Unknown User",
    username: "unknown",
    role: "User",
    active: true,
    library: [],
    quizzes: [],
  } as unknown as UserType;
}

// ─── Persistence ──────────────────────────────────────────────────────────

function load(): MockDB | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MockDB;
  } catch {
    return null;
  }
}

function save(db: MockDB) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

// ─── Seed data ────────────────────────────────────────────────────────────

function seed(): MockDB {
  const [userAccount, adminAccount] = MOCK_USERS;

  // Quiz 1 — JavaScript Fundamentals (English, owned by admin)
  const q1Questions: QuestionType[] = [
    {
      _id: uid("question"),
      question: "What does 'const' do in JavaScript?",
      options: [
        "Declares a block-scoped variable that cannot be reassigned",
        "Declares a global variable",
        "Declares a function",
        "Declares an array",
      ],
      correctOption: 0,
      quiz: [],
    },
    {
      _id: uid("question"),
      question: "Which method adds an element to the end of an array?",
      options: ["unshift()", "push()", "shift()", "pop()"],
      correctOption: 1,
      quiz: [],
    },
    {
      _id: uid("question"),
      question: "What is the result of typeof null?",
      options: ["'null'", "'undefined'", "'object'", "'boolean'"],
      correctOption: 2,
      quiz: [],
    },
    {
      _id: uid("question"),
      question: "Which keyword creates an asynchronous function?",
      options: ["async", "await", "promise", "defer"],
      correctOption: 0,
      quiz: [],
    },
    {
      _id: uid("question"),
      question: "What does '===' check for?",
      options: [
        "Value only",
        "Value and type",
        "Reference only",
        "Nothing — it is invalid syntax",
      ],
      correctOption: 1,
      quiz: [],
    },
  ];

  // Quiz 2 — أساسيات البرمجة (Arabic, owned by the regular user)
  const q2Questions: QuestionType[] = [
    {
      _id: uid("question"),
      question: "ما هي لغة البرمجة التي تُستخدم في تطوير الواجهات الأمامية؟",
      options: ["Python", "JavaScript", "C++", "Ruby"],
      correctOption: 1,
      quiz: [],
    },
    {
      _id: uid("question"),
      question: "ما وظيفة HTML؟",
      options: [
        "تنسيق الصفحة",
        "بناء هيكل الصفحة",
        "جعل الصفحة تفاعلية",
        "تخزين البيانات",
      ],
      correctOption: 1,
      quiz: [],
    },
    {
      _id: uid("question"),
      question: "ما الفرق بين let و const؟",
      options: [
        "لا يوجد فرق",
        "const لا يمكن إعادة تعيينه",
        "let قديم و const حديث",
        "const أسرع في الأداء",
      ],
      correctOption: 1,
      quiz: [],
    },
    {
      _id: uid("question"),
      question: "أي مما يلي ليس إطار عمل JavaScript؟",
      options: ["React", "Vue", "Django", "Angular"],
      correctOption: 2,
      quiz: [],
    },
  ];

  // Quiz 3 — World Geography (English, owned by admin)
  const q3Questions: QuestionType[] = [
    {
      _id: uid("question"),
      question: "What is the largest country in the world by area?",
      options: ["Canada", "China", "Russia", "United States"],
      correctOption: 2,
      quiz: [],
    },
    {
      _id: uid("question"),
      question: "Which river is the longest in the world?",
      options: ["Amazon", "Nile", "Yangtze", "Mississippi"],
      correctOption: 1,
      quiz: [],
    },
    {
      _id: uid("question"),
      question: "Mount Everest is located in which mountain range?",
      options: ["Andes", "Rockies", "Alps", "Himalayas"],
      correctOption: 3,
      quiz: [],
    },
    {
      _id: uid("question"),
      question: "Which desert is the largest hot desert in the world?",
      options: ["Gobi", "Sahara", "Kalahari", "Arabian"],
      correctOption: 1,
      quiz: [],
    },
    {
      _id: uid("question"),
      question: "What is the capital of Australia?",
      options: ["Sydney", "Melbourne", "Canberra", "Perth"],
      correctOption: 2,
      quiz: [],
    },
  ];

  const quiz1: StoredQuiz = {
    _id: uid("quiz"),
    title: "JavaScript Fundamentals",
    description:
      "Test your knowledge of core JavaScript concepts — variables, types, and async basics.",
    time: 10,
    visibility: "public",
    userId: adminAccount._id,
    questionIds: q1Questions.map((q) => q._id),
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };

  const quiz2: StoredQuiz = {
    _id: uid("quiz"),
    title: "أساسيات البرمجة",
    description:
      "اختبار قصير لمفاهيم البرمجة الأساسية وتطوير الويب باللغة العربية.",
    time: 8,
    visibility: "public",
    userId: userAccount._id,
    questionIds: q2Questions.map((q) => q._id),
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };

  const quiz3: StoredQuiz = {
    _id: uid("quiz"),
    title: "World Geography Quiz",
    description:
      "Countries, rivers, mountains and more. A light geography warm-up.",
    time: 10,
    visibility: "public",
    userId: adminAccount._id,
    questionIds: q3Questions.map((q) => q._id),
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };

  return {
    quizzes: [quiz1, quiz2, quiz3],
    questions: [...q1Questions, ...q2Questions, ...q3Questions],
    library: [],
    scores: [],
    shareTokens: [],
  };
}

// ─── Public API ───────────────────────────────────────────────────────────

let dbCache: MockDB | null = null;

export function getDB(): MockDB {
  if (dbCache) return dbCache;
  const loaded = load();
  dbCache = loaded ?? seed();
  if (!loaded) save(dbCache);
  return dbCache;
}

export function commit() {
  if (dbCache) save(dbCache);
}

export function resetDB() {
  localStorage.removeItem(STORAGE_KEY);
  dbCache = null;
}

// ─── Shape converters (stored → API response) ─────────────────────────────

export function hydrateQuiz(q: StoredQuiz, db: MockDB): QuizType {
  const questions = db.questions.filter((x) => q.questionIds.includes(x._id));
  const user = getUserById(q.userId);
  return {
    _id: q._id,
    title: q.title,
    description: q.description,
    time: q.time,
    visibility: q.visibility,
    questions,
    user,
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
  };
}

// ─── Mock session (dev-only, mock-only) ──────────────────────────────────
//
// Real-mode auth is tracked by an httpOnly cookie the server sets. The
// mock layer has no server, so we need a client-side stand-in: a tiny
// dev-only marker holding just the current user's id. This is NOT the
// same key as the real-mode login flag in usersSlice — it only exists
// when USE_MOCK is on, and it only holds an id (not a full user object).

const MOCK_SESSION_KEY = "mock:currentUserId";

export function writeMockSession(userId: string): void {
  try {
    localStorage.setItem(MOCK_SESSION_KEY, userId);
  } catch {
    /* storage unavailable */
  }
}

export function clearMockSession(): void {
  try {
    localStorage.removeItem(MOCK_SESSION_KEY);
  } catch {
    /* storage unavailable */
  }
}

export function currentUserId(): string | null {
  try {
    return localStorage.getItem(MOCK_SESSION_KEY);
  } catch {
    return null;
  }
}

export { uid, nowISO, getUserById };
export type { StoredQuiz, MockDB };

// ─── Shared helpers for mock handlers ────────────────────────────────────
//
// Every mock handler simulates two things: a small network latency and
// the possibility of an error-shaped response. These helpers used to be
// duplicated across every mock file; kept here so there's one source of
// truth for both.

/**
 * Simulate a network round-trip so components render their loading states
 * in dev. Callers can pass a custom duration for endpoints that should
 * feel snappier (list reads) or slower (auth).
 */
export const delay = (ms = 300) =>
  new Promise<void>((r) => setTimeout(r, ms));

/**
 * Build an error object that looks like an axios error so the slice-level
 * error reader (`readError` in @/lib/readError.ts) can narrow it the same
 * way as a real backend failure. The `response.data.message` shape is
 * what the slices look at first.
 */
export function axiosError(message: string, status = 400): Error {
  const err = new Error(message) as Error & {
    isAxiosError: boolean;
    response: { data: { message: string }; status: number };
  };
  err.isAxiosError = true;
  err.response = { data: { message }, status };
  return err;
}