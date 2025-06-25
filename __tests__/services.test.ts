import { describe, it, expect, vi, beforeEach } from "vitest"
import { getServices, getAvailableCaregivers, createBooking } from "@/lib/services"
import { supabase } from "@/lib/supabase"

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}))

describe("Services Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getServices", () => {
    it("should return list of services", async () => {
      const mockServices = [
        { id: "1", name: "Personal Care", description: "Bathing and dressing", base_price: 30 },
        { id: "2", name: "Companionship", description: "Social interaction", base_price: 25 },
      ]

      const mockQuery = {
        select: vi.fn(() => ({
          order: vi.fn(() => ({ data: mockServices, error: null })),
        })),
      }

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)

      const result = await getServices()

      expect(supabase.from).toHaveBeenCalledWith("services")
      expect(result).toEqual(mockServices)
    })

    it("should throw error if query fails", async () => {
      const mockError = new Error("Database error")
      const mockQuery = {
        select: vi.fn(() => ({
          order: vi.fn(() => ({ data: null, error: mockError })),
        })),
      }

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)

      await expect(getServices()).rejects.toThrow("Database error")
    })
  })

  describe("getAvailableCaregivers", () => {
    it("should return list of available caregivers", async () => {
      const mockCaregivers = [
        {
          id: "1",
          users: { first_name: "Alice", last_name: "Smith" },
          rating: 4.8,
          is_available: true,
          status: "approved",
        },
      ]

      const mockQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({ data: mockCaregivers, error: null })),
          })),
        })),
      }

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any)

      const result = await getAvailableCaregivers()

      expect(supabase.from).toHaveBeenCalledWith("caregiver_profiles")
      expect(result).toEqual(mockCaregivers)
    })
  })

  describe("createBooking", () => {
    it("should create booking successfully", async () => {
      const mockUser = { id: "user-123" }
      const mockClientProfile = { id: "client-123" }
      const mockBooking = { id: "booking-123" }

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockClientQuery = {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({ data: mockClientProfile, error: null })),
          })),
        })),
      }

      const mockBookingQuery = {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({ data: mockBooking, error: null })),
          })),
        })),
      }

      const mockServicesQuery = {
        insert: vi.fn(() => ({ error: null })),
      }

      vi.mocked(supabase.from)
        .mockReturnValueOnce(mockClientQuery as any)
        .mockReturnValueOnce(mockBookingQuery as any)
        .mockReturnValueOnce(mockServicesQuery as any)

      const bookingData = {
        caregiverId: "caregiver-123",
        serviceDate: "2024-01-15",
        startTime: "09:00",
        endTime: "11:00",
        durationHours: 2,
        totalAmount: 60,
        serviceAddress: "123 Main St",
        serviceIds: ["service-1"],
      }

      const result = await createBooking(bookingData)

      expect(result).toEqual(mockBooking)
    })

    it("should throw error if user not authenticated", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const bookingData = {
        caregiverId: "caregiver-123",
        serviceDate: "2024-01-15",
        startTime: "09:00",
        endTime: "11:00",
        durationHours: 2,
        totalAmount: 60,
        serviceAddress: "123 Main St",
        serviceIds: ["service-1"],
      }

      await expect(createBooking(bookingData)).rejects.toThrow("Not authenticated")
    })
  })
})
