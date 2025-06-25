import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import BookServicePage from "@/app/client/book-service/page"
import { getServices, createBooking } from "@/lib/services"
import { getCurrentUser } from "@/lib/auth"

vi.mock("@/lib/services")
vi.mock("@/lib/auth")
vi.mock("next/navigation")

describe("Booking Flow Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "user-123",
      profile: { first_name: "John", role: "client" },
    })
  })

  it("should complete full booking flow", async () => {
    const mockServices = [
      { id: "service-1", name: "Personal Care", description: "Bathing and dressing", base_price: 30 },
      { id: "service-2", name: "Companionship", description: "Social interaction", base_price: 25 },
    ]

    vi.mocked(getServices).mockResolvedValue(mockServices)
    vi.mocked(createBooking).mockResolvedValue({ id: "booking-123" })

    render(<BookServicePage />)

    // Wait for services to load
    await waitFor(() => {
      expect(screen.getByText("Personal Care")).toBeInTheDocument()
    })

    // Step 1: Select services
    const personalCareCheckbox = screen.getByLabelText("Personal Care")
    fireEvent.click(personalCareCheckbox)

    const continueButton = screen.getByText("Continue to Scheduling")
    fireEvent.click(continueButton)

    // Step 2: Select date and time
    await waitFor(() => {
      expect(screen.getByText("Schedule Your Service")).toBeInTheDocument()
    })

    // Select date (mock date picker)
    const dateButton = screen.getByText("Pick a date")
    fireEvent.click(dateButton)

    // Select time
    const timeSlot = screen.getByText("9:00 AM")
    fireEvent.click(timeSlot)

    const continueToCaregiver = screen.getByText("Continue to Caregiver Selection")
    fireEvent.click(continueToCaregiver)

    // Step 3: Caregiver selection (simplified)
    await waitFor(() => {
      const continueToDetails = screen.getByText("Continue to Details")
      fireEvent.click(continueToDetails)
    })

    // Step 4: Additional details
    await waitFor(() => {
      expect(screen.getByText("Additional Details")).toBeInTheDocument()
    })

    const addressInput = screen.getByPlaceholderText("Enter the address where service is needed")
    fireEvent.change(addressInput, { target: { value: "123 Test St" } })

    const confirmButton = screen.getByText("Confirm Booking")
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(createBooking).toHaveBeenCalled()
    })
  })
})
