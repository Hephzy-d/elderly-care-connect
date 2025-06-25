import { supabase } from "./supabase"
import type { Database } from "./supabase"

type Service = Database["public"]["Tables"]["services"]["Row"]
type Booking = Database["public"]["Tables"]["bookings"]["Row"]
type CaregiverProfile = Database["public"]["Tables"]["caregiver_profiles"]["Row"]

export async function getServices(): Promise<Service[]> {
  const { data, error } = await supabase.from("services").select("*").order("name")

  if (error) throw error
  return data || []
}

export async function getAvailableCaregivers(serviceIds?: string[]): Promise<any[]> {
  const query = supabase
    .from("caregiver_profiles")
    .select(`
      *,
      users!caregiver_profiles_user_id_fkey(first_name, last_name, avatar_url),
      caregiver_services(
        service_id,
        custom_rate,
        services(name)
      )
    `)

  const { data, error } = await query
  console.log(data);

  if (error) throw error

  // Filter by services if provided
  if (serviceIds && serviceIds.length > 0) {
    return (data || []).filter((caregiver) =>
      caregiver.caregiver_services?.some((cs: any) => serviceIds.includes(cs.service_id)),
    )
  }

  return data || []
}

export async function createBooking(bookingData: {
  caregiverId: string
  serviceDate: string
  startTime: string
  endTime: string
  durationHours: number
  totalAmount: number
  serviceAddress: string
  specialInstructions?: string
  serviceIds: string[]
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Get client profile
  const { data: clientProfile, error: clientError } = await supabase
    .from("client_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (clientError) throw clientError

  // Create booking
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      client_id: clientProfile.id,
      caregiver_id: bookingData.caregiverId,
      service_date: bookingData.serviceDate,
      start_time: bookingData.startTime,
      end_time: bookingData.endTime,
      duration_hours: bookingData.durationHours,
      total_amount: bookingData.totalAmount,
      service_address: bookingData.serviceAddress,
      special_instructions: bookingData.specialInstructions,
    })
    .select()
    .single()

  if (bookingError) throw bookingError

  // Add booking services
  const bookingServices = bookingData.serviceIds.map((serviceId) => ({
    booking_id: booking.id,
    service_id: serviceId,
    rate: bookingData.totalAmount / bookingData.durationHours / bookingData.serviceIds.length,
  }))

  const { error: servicesError } = await supabase.from("booking_services").insert(bookingServices)

  if (servicesError) throw servicesError

  return booking
}

export async function getClientBookings(): Promise<any[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // First get client profile
  const { data: clientProfile, error: clientError } = await supabase
    .from("client_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (clientError) throw clientError

  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      caregiver_profiles!bookings_caregiver_id_fkey(
        id,
        users!caregiver_profiles_user_id_fkey(first_name, last_name, avatar_url)
      ),
      booking_services(
        services(name)
      )
    `)
    .eq("client_id", clientProfile.id)
    .order("service_date", { ascending: true })

  if (error) throw error
  return data || []
}

export async function getCaregiverBookings(): Promise<any[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // First get caregiver profile
  const { data: caregiverProfile, error: caregiverError } = await supabase
    .from("caregiver_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (caregiverError) throw caregiverError

  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      client_profiles!bookings_client_id_fkey(
        id,
        users!client_profiles_user_id_fkey(first_name, last_name, avatar_url)
      ),
      booking_services(
        services(name)
      )
    `)
    .eq("caregiver_id", caregiverProfile.id)
    .order("service_date", { ascending: true })

  if (error) throw error
  return data || []
}

export async function updateCaregiverAvailability(isAvailable: boolean) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("caregiver_profiles")
    .update({ is_available: isAvailable })
    .eq("user_id", user.id)

  if (error) throw error
}

export async function updateBookingStatus(bookingId: string, status: string) {
  const { error } = await supabase.from("bookings").update({ status }).eq("id", bookingId)

  if (error) throw error
}

export async function getCaregiverJobRequests(): Promise<any[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // First get caregiver profile
  const { data: caregiverProfile, error: caregiverError } = await supabase
    .from("caregiver_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (caregiverError) throw caregiverError

  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      client_profiles!bookings_client_id_fkey(
        users!client_profiles_user_id_fkey(first_name, last_name, avatar_url)
      ),
      booking_services(
        services(name)
      )
    `)
    .eq("caregiver_id", caregiverProfile.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}
