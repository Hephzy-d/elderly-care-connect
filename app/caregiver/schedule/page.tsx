"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import { Heart, ArrowLeft, CalendarIcon, Clock, MapPin, Phone, MessageCircle } from "lucide-react"
import { getCaregiverBookings, updateCaregiverAvailability } from "@/lib/services"
import { format, isSameDay, parseISO } from "date-fns"

export default function CaregiverSchedulePage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isAvailable, setIsAvailable] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBookings() {
      try {
        const bookingsData = await getCaregiverBookings()
        setBookings(bookingsData)
      } catch (error) {
        console.error("Error loading bookings:", error)
      } finally {
        setLoading(false)
      }
    }

    loadBookings()
  }, [])

  const selectedDateBookings = bookings.filter((booking) => isSameDay(parseISO(booking.service_date), selectedDate))

  const upcomingBookings = bookings
    .filter((booking) => new Date(booking.service_date) >= new Date())
    .sort((a, b) => new Date(a.service_date).getTime() - new Date(b.service_date).getTime())
    .slice(0, 5)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleAvailabilityChange = async (available: boolean) => {
    try {
      await updateCaregiverAvailability(available)
      setIsAvailable(available)
    } catch (error) {
      console.error("Error updating availability:", error)
    }
  }

  const totalEarnings = bookings.filter((b) => b.status === "completed").reduce((sum, b) => sum + b.total_amount, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your schedule...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/caregiver/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Elderly Care Connect</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Available</span>
            <Switch checked={isAvailable} onCheckedChange={handleAvailabilityChange} />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Schedule</h1>
          <p className="text-gray-600">Manage your appointments and availability</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar & Stats */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>Select a date to view appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                  modifiers={{
                    booked: bookings.map((booking) => parseISO(booking.service_date)),
                  }}
                  modifiersStyles={{
                    booked: { backgroundColor: "#dbeafe", color: "#1e40af" },
                  }}
                />
                <div className="mt-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-100 rounded"></div>
                    <span>Days with appointments</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Earnings Summary */}
            <Card>
              <CardHeader>
                <CardTitle>This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Earnings</span>
                    <span className="font-semibold text-green-600">${totalEarnings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Jobs</span>
                    <span className="font-semibold">{bookings.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-semibold text-green-600">
                      {bookings.filter((b) => b.status === "completed").length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Upcoming</span>
                    <span className="font-semibold text-blue-600">
                      {bookings.filter((b) => new Date(b.service_date) >= new Date()).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Availability Status */}
            <Card className={isAvailable ? "border-green-200 bg-green-50" : "border-gray-200"}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${isAvailable ? "bg-green-500" : "bg-gray-400"}`} />
                    <div>
                      <h3 className="font-semibold">{isAvailable ? "Available for Jobs" : "Currently Unavailable"}</h3>
                      <p className="text-sm text-gray-600">
                        {isAvailable ? "Clients can book your services" : "You won't receive new requests"}
                      </p>
                    </div>
                  </div>
                  <Switch checked={isAvailable} onCheckedChange={handleAvailabilityChange} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Appointments */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selected Date Appointments */}
            <Card>
              <CardHeader>
                <CardTitle>Appointments for {format(selectedDate, "EEEE, MMMM d, yyyy")}</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDateBookings.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDateBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={booking.client_profiles?.users?.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback>
                              {`${booking.client_profiles?.users?.first_name?.[0] || ""}${booking.client_profiles?.users?.last_name?.[0] || ""}`}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">
                              {`${booking.client_profiles?.users?.first_name || ""} ${booking.client_profiles?.users?.last_name || ""}`}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {booking.booking_services?.map((bs: any) => bs.services.name).join(", ")}
                            </p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-500 flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {booking.start_time} - {booking.end_time}
                              </span>
                              <span className="text-sm text-gray-500 flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {booking.service_address}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="font-semibold text-green-600">${booking.total_amount}</p>
                            <Badge className={getStatusColor(booking.status)}>{booking.status.replace("_", " ")}</Badge>
                          </div>
                          <div className="flex space-x-1">
                            <Button variant="outline" size="sm">
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments</h3>
                    <p className="text-gray-600">You don't have any appointments scheduled for this date.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Jobs</CardTitle>
                <CardDescription>Your scheduled care appointments</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingBookings.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={booking.client_profiles?.users?.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback>
                              {`${booking.client_profiles?.users?.first_name?.[0] || ""}${booking.client_profiles?.users?.last_name?.[0] || ""}`}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">
                              {`${booking.client_profiles?.users?.first_name || ""} ${booking.client_profiles?.users?.last_name || ""}`}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {booking.booking_services?.map((bs: any) => bs.services.name).join(", ")}
                            </p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-500 flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {format(parseISO(booking.service_date), "MMM d, yyyy")}
                              </span>
                              <span className="text-sm text-gray-500 flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {booking.start_time} - {booking.end_time}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="font-semibold text-green-600">${booking.total_amount}</p>
                            <Badge className={getStatusColor(booking.status)}>{booking.status.replace("_", " ")}</Badge>
                          </div>
                          <div className="flex space-x-1">
                            <Button variant="outline" size="sm">
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming jobs</h3>
                    <p className="text-gray-600">Your schedule is clear. New job requests will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
