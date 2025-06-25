import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import CaregiverOnboarding from "@/app/caregiver/onboarding/page"
import { getCurrentUser } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

vi.mock("@/lib/auth")
vi.mock("@/lib/supabase")
vi.mock("next/navigation")

const mockPush = vi.fn()

describe("CaregiverOnboarding Component", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any)
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "user-123",
      profile: { first_name: "John", last_name: "Doe" },
    })
  })

  it("should render step 1 - service selection", () => {
    render(<CaregiverOnboarding />)

    expect(screen.getByText("Select Your Services")).toBeInTheDocument()
    expect(screen.getByText("Personal Care")).toBeInTheDocument()
    expect(screen.getByText("Companionship")).toBeInTheDocument()
  })

  it("should progress through steps when services are selected", async () => {
    render(<CaregiverOnboarding />)

    // Select a service
    const personalCareCheckbox = screen.getByLabelText("Personal Care")
    fireEvent.click(personalCareCheckbox)

    // Click continue
    const continueButton = screen.getByText("Continue")
    fireEvent.click(continueButton)

    await waitFor(() => {
      expect(screen.getByText("Your Experience")).toBeInTheDocument()
    })
  })

  it("should not allow progression without selecting services", () => {
    render(<CaregiverOnboarding />)

    const continueButton = screen.getByText("Continue")
    expect(continueButton).toBeDisabled()
  })

  it("should save data to Supabase on completion", async () => {
    const mockUpdate = vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) }))
    const mockInsert = vi.fn(() => ({ error: null }))
    const mockSelect = vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => ({ data: { id: "caregiver-123" }, error: null })),
      })),
    }))

    vi.mocked(supabase.from).mockImplementation((table) => {
      if (table === "caregiver_profiles") {
        return {
          update: mockUpdate,
          select: mockSelect,
        } as any
      }
      if (table === "services" || table === "certifications") {
        return { select: vi.fn(() => ({ data: [], error: null })) } as any
      }
      return { insert: mockInsert } as any
    })

    render(<CaregiverOnboarding />)

    // Go through all steps quickly
    const personalCareCheckbox = screen.getByLabelText("Personal Care")
    fireEvent.click(personalCareCheckbox)
    fireEvent.click(screen.getByText("Continue"))

    await waitFor(() => {
      const experienceRadio = screen.getByLabelText("1-3 years")
      fireEvent.click(experienceRadio)

      const bioTextarea = screen.getByPlaceholderText(/Describe your experience/)
      fireEvent.change(bioTextarea, { target: { value: "Experienced caregiver" } })

      fireEvent.click(screen.getByText("Continue"))
    })

    await waitFor(() => {
      fireEvent.click(screen.getByText("Continue"))
    })

    await waitFor(() => {
      const zipCodeInput = screen.getByPlaceholderText("Enter your ZIP code")
      fireEvent.change(zipCodeInput, { target: { value: "12345" } })

      const completeButton = screen.getByText("Complete Setup")
      fireEvent.click(completeButton)
    })

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled()
    })
  })
})
