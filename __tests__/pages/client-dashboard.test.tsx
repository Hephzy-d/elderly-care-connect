import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import ClientDashboard from "@/app/client/dashboard/page"
import { getCurrentUser } from "@/lib/auth"
import { getClientBookings, getAvailableCaregivers } from "@/lib/services"

vi.mock("@/lib/auth")
vi.mock("@/lib/services")

describe("ClientDashboard Page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render loading state initially", () => {
    vi.mocked(getCurrentUser).mockImplementation(() => new Promise(() => {}))
    vi.mocked(getClientBookings).mockImplementation(() => new Promise(() => {}))
    vi.mocked(getAvailableCaregivers).mockImplementation(() => new Promise(() => {}))

    render(<ClientDashboard />)

    expect(screen.getByText("Loading your dashboard...")).toBeInTheDocument()
  })

  it("should render dashboard with user data", async () => {
    const mockUser = {
      id: "user-123",
      profile: { first_name: "John", last_name: "Doe", role: "client" },
    }

    const mockBookings = [
      {
        id: "booking-1",
        status: "confirmed",
        service_date: "2024-01-15",
        start_time: "09:00",
        end_time: "11:00",
        caregiver_profiles: {
          users: { first_name: "Alice", last_name: "Smith" },
        },
        booking_services: [{ services: { name: "Personal Care" } }],
      },
    ]

    const mockCaregivers = [
      {
        id: "caregiver-1",
        users: { first_name: "Bob", last_name: "Johnson" },
        rating: 4.5,
        service_radius: 10,
      },
    ]

    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(getClientBookings).mockResolvedValue(mockBookings)
    vi.mocked(getAvailableCaregivers).mockResolvedValue(mockCaregivers)

    render(<ClientDashboard />)

    await waitFor(() => {
      expect(screen.getByText("Welcome back, John!")).toBeInTheDocument()
      expect(screen.getByText("Quick Actions")).toBeInTheDocument()
      expect(screen.getByText("Upcoming Appointments")).toBeInTheDocument()
    })
  })

  it("should show no appointments message when no bookings", async () => {
    const mockUser = {
      id: "user-123",
      profile: { first_name: "John", last_name: "Doe", role: "client" },
    }

    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(getClientBookings).mockResolvedValue([])
    vi.mocked(getAvailableCaregivers).mockResolvedValue([])

    render(<ClientDashboard />)

    await waitFor(() => {
      expect(screen.getByText("No upcoming appointments")).toBeInTheDocument()
      expect(screen.getByText("Schedule your first care service to get started.")).toBeInTheDocument()
    })
  })
})
