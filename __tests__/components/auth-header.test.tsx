import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { AuthHeader } from "@/components/auth-header"
import { getCurrentUser, signOut } from "@/lib/auth"
import { useRouter } from "next/navigation"

vi.mock("@/lib/auth")
vi.mock("next/navigation")

const mockPush = vi.fn()

describe("AuthHeader Component", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any)
  })

  it("should render sign in and get started buttons when not authenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null)

    render(<AuthHeader />)

    await waitFor(() => {
      expect(screen.getByText("Sign In")).toBeInTheDocument()
      expect(screen.getByText("Get Started")).toBeInTheDocument()
    })
  })

  it("should render user menu when authenticated", async () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      profile: {
        first_name: "John",
        last_name: "Doe",
        role: "client",
      },
    }

    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    render(<AuthHeader />)

    await waitFor(() => {
      expect(screen.getByText("JD")).toBeInTheDocument()
    })
  })

  it("should handle sign out", async () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      profile: {
        first_name: "John",
        last_name: "Doe",
        role: "client",
      },
    }

    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(signOut).mockResolvedValue()

    render(<AuthHeader />)

    await waitFor(() => {
      const avatarButton = screen.getByRole("button")
      fireEvent.click(avatarButton)
    })

    const signOutButton = screen.getByText("Sign out")
    fireEvent.click(signOutButton)

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith("/")
    })
  })
})
