import { describe, it, expect, vi, beforeEach } from "vitest"
import { signUp, signIn, signOut, getCurrentUser } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ error: null })),
      select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => ({ data: null, error: null })) })) })),
    })),
  },
}))

describe("Auth Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("signUp", () => {
    it("should create user account and profile successfully", async () => {
      const mockUser = { id: "user-123", email: "test@example.com" }
      const mockAuthData = { user: mockUser }

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: mockAuthData,
        error: null,
      })

      const userData = {
        firstName: "John",
        lastName: "Doe",
        phone: "555-1234",
        role: "client" as const,
      }

      const result = await signUp("test@example.com", "password123", userData)

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      })

      expect(result).toEqual(mockAuthData)
    })

    it("should throw error if auth signup fails", async () => {
      const mockError = new Error("Signup failed")
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      })

      await expect(
        signUp("test@example.com", "password123", {
          firstName: "John",
          lastName: "Doe",
          phone: "555-1234",
          role: "client",
        }),
      ).rejects.toThrow("Signup failed")
    })
  })

  describe("signIn", () => {
    it("should sign in user successfully", async () => {
      const mockData = { user: { id: "user-123" }, session: {} }
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: mockData,
        error: null,
      })

      const result = await signIn("test@example.com", "password123")

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      })

      expect(result).toEqual(mockData)
    })

    it("should throw error if signin fails", async () => {
      const mockError = new Error("Invalid credentials")
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      })

      await expect(signIn("test@example.com", "wrongpassword")).rejects.toThrow("Invalid credentials")
    })
  })

  describe("signOut", () => {
    it("should sign out user successfully", async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null })

      await signOut()

      expect(supabase.auth.signOut).toHaveBeenCalled()
    })

    it("should throw error if signout fails", async () => {
      const mockError = new Error("Signout failed")
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: mockError })

      await expect(signOut()).rejects.toThrow("Signout failed")
    })
  })

  describe("getCurrentUser", () => {
    it("should return user with profile", async () => {
      const mockUser = { id: "user-123", email: "test@example.com" }
      const mockProfile = { id: "user-123", first_name: "John", last_name: "Doe", role: "client" }

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({ data: mockProfile, error: null })),
          })),
        })),
      } as any)

      const result = await getCurrentUser()

      expect(result).toEqual({ ...mockUser, profile: mockProfile })
    })

    it("should return null if no user", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await getCurrentUser()

      expect(result).toBeNull()
    })
  })
})
