"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Calendar, Clock, User, Plus, Bell, Settings, Star, MapPin, Phone, MessageCircle } from "lucide-react"
import { getClientBookings, getAvailableCaregivers } from "@/lib/services"
import { getCurrentUser } from "@/lib/auth"

export default function ClientDashboard() {
  const [user, setUser] = useState<any>(null)
  const [activeBookings, setActiveBookings] = useState<any[]>([])
  const [recentCaregivers, setRecentCaregivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)

        const [bookings, caregivers] = await Promise.all([getClientBookings(), getAvailableCaregivers()])

        setActiveBookings(bookings.filter((b) => b.status === "confirmed" || b.status === "pending"))
        setRecentCaregivers(caregivers.slice(0, 3))
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Elderly Care Connect</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.profile?.first_name || "there"}!
          </h1>
          <p className="text-gray-600">Here's what's happening with your care today.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/client/book-service">
                    <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                      <Plus className="h-6 w-6" />
                      <span className="text-sm">Book Service</span>
                    </Button>
                  </Link>
                  <Link href="/client/caregivers">
                    <Button
                      variant="outline"
                      className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    >
                      <User className="h-6 w-6" />
                      <span className="text-sm">Find Caregivers</span>
                    </Button>
                  </Link>
                  <Link href="/client/schedule">
                    <Button
                      variant="outline"
                      className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    >
                      <Calendar className="h-6 w-6" />
                      <span className="text-sm">My Schedule</span>
                    </Button>
                  </Link>
                  <Link href="/client/messages">
                    <Button
                      variant="outline"
                      className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    >
                      <MessageCircle className="h-6 w-6" />
                      <span className="text-sm">Messages</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Upcoming Appointments</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeBookings.length > 0 ? (
                    activeBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage
                              src={
                                booking.caregiver_profiles?.users?.avatar_url || "/placeholder.svg?height=40&width=40"
                              }
                            />
                            <AvatarFallback>
                              {`${booking.caregiver_profiles?.users?.first_name?.[0] || "C"}${booking.caregiver_profiles?.users?.last_name?.[0] || "G"}`}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">
                              {`${booking.caregiver_profiles?.users?.first_name || "Caregiver"} ${booking.caregiver_profiles?.users?.last_name || ""}`}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {booking.booking_services?.map((bs: any) => bs.services?.name).join(", ") ||
                                "Care Services"}
                            </p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-500 flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(booking.service_date).toLocaleDateString()}
                              </span>
                              <span className="text-sm text-gray-500 flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {booking.start_time} - {booking.end_time}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                            {booking.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming appointments</h3>
                      <p className="text-gray-600 mb-4">Schedule your first care service to get started.</p>
                      <Link href="/client/book-service">
                        <Button>Book a Service</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-100 rounded-full p-2">
                      <Calendar className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Appointment completed with Sarah Johnson</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <MessageCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">New message from Michael Chen</p>
                      <p className="text-xs text-gray-500">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-purple-100 rounded-full p-2">
                      <Star className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">You rated Emily Rodriguez 5 stars</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Available Caregivers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Available Caregivers</CardTitle>
                <CardDescription>Trusted professionals in your area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCaregivers.map((caregiver) => (
                    <div key={caregiver.id} className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={caregiver.users?.avatar_url || "/placeholder.svg?height=40&width=40"} />
                        <AvatarFallback>
                          {`${caregiver.users?.first_name?.[0] || "C"}${caregiver.users?.last_name?.[0] || "G"}`}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {caregiver.users?.first_name} {caregiver.users?.last_name}
                        </p>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-500">{caregiver.rating || "5.0"}</span>
                        </div>
                        <p className="text-xs text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {caregiver.service_radius || 10} miles radius
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Book
                      </Button>
                    </div>
                  ))}
                </div>
                <Link href="/client/caregivers">
                  <Button
                    variant="outline"
                    className="w-full mt-4 bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  >
                    View All Caregivers
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800">Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Emergency Line
                </Button>
                <p className="text-xs text-red-700 mt-2 text-center">Available 24/7 for urgent care needs</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
