"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import {
  Heart,
  Calendar,
  Clock,
  DollarSign,
  Bell,
  Settings,
  Star,
  MapPin,
  Phone,
  MessageCircle,
  TrendingUp,
  Users,
  CheckCircle,
} from "lucide-react"
import {
  getCaregiverBookings,
  updateCaregiverAvailability,
  updateBookingStatus,
  getCaregiverJobRequests,
} from "@/lib/services"
import { getCurrentUser } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export default function CaregiverDashboard() {
  const [user, setUser] = useState<any>(null)
  const [isAvailable, setIsAvailable] = useState(true)
  const [upcomingJobs, setUpcomingJobs] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalEarnings: 0,
    completedJobs: 0,
    rating: 0,
    responseRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const [jobRequests, setJobRequests] = useState<any[]>([])

  async function loadData() {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      // Get caregiver profile
      const { data: caregiverProfile } = await supabase
        .from("caregiver_profiles")
        .select("*")
        .eq("user_id", currentUser?.id)
        .single()

      if (caregiverProfile) {
        setIsAvailable(caregiverProfile.is_available)
        setStats({
          totalEarnings: caregiverProfile.total_jobs_completed * 50, // Estimate
          completedJobs: caregiverProfile.total_jobs_completed,
          rating: caregiverProfile.rating,
          responseRate: 98, // This would be calculated
        })
      }

      const [bookings, requests] = await Promise.all([getCaregiverBookings(), getCaregiverJobRequests()])

      setUpcomingJobs(bookings.filter((b) => b.status === "confirmed" || b.status === "pending"))
      setJobRequests(requests)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAvailabilityChange = async (available: boolean) => {
    try {
      await updateCaregiverAvailability(available)
      setIsAvailable(available)
    } catch (error) {
      console.error("Error updating availability:", error)
    }
  }

  const handleAcceptJob = async (bookingId: string) => {
    try {
      await updateBookingStatus(bookingId, "confirmed")
      loadData()
    } catch (error) {
      console.error("Error accepting job:", error)
    }
  }

  const handleDeclineJob = async (bookingId: string) => {
    try {
      await updateBookingStatus(bookingId, "cancelled")
      loadData()
    } catch (error) {
      console.error("Error declining job:", error)
    }
  }

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
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Available</span>
              <Switch checked={isAvailable} onCheckedChange={handleAvailabilityChange} />
            </div>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>SJ</AvatarFallback>
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
          <p className="text-gray-600">Here's your caregiving activity for today.</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-600">${stats.totalEarnings}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed Jobs</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.completedJobs}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <div className="flex items-center space-x-1">
                    <p className="text-2xl font-bold text-yellow-600">{stats.rating}</p>
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  </div>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Response Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.responseRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Availability Status */}
            <Card className={isAvailable ? "border-green-200 bg-green-50" : "border-gray-200"}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${isAvailable ? "bg-green-500" : "bg-gray-400"}`} />
                    <div>
                      <h3 className="font-semibold">
                        {isAvailable ? "You're Available for New Jobs" : "You're Currently Unavailable"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {isAvailable
                          ? "Clients can see and book your services"
                          : "Turn on availability to receive new job requests"}
                      </p>
                    </div>
                  </div>
                  <Switch checked={isAvailable} onCheckedChange={handleAvailabilityChange} />
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Jobs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Upcoming Jobs</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingJobs.length > 0 ? (
                    upcomingJobs.map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage
                              src={job.client_profiles?.users?.avatar_url || "/placeholder.svg?height=40&width=40"}
                            />
                            <AvatarFallback>
                              {`${job.client_profiles?.users?.first_name?.[0] || "C"}${job.client_profiles?.users?.last_name?.[0] || "L"}`}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">
                              {`${job.client_profiles?.users?.first_name || "Client"} ${job.client_profiles?.users?.last_name || ""}`}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {job.booking_services?.map((bs: any) => bs.services?.name).join(", ") || "Care Services"}
                            </p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-500 flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(job.service_date).toLocaleDateString()}
                              </span>
                              <span className="text-sm text-gray-500 flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {job.start_time} - {job.end_time}
                              </span>
                              <span className="text-sm text-gray-500 flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {job.service_address}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="font-semibold text-green-600">${job.total_amount}</p>
                            <Badge variant={job.status === "confirmed" ? "default" : "secondary"}>{job.status}</Badge>
                          </div>
                          <Button variant="outline" size="sm">
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming jobs</h3>
                      <p className="text-gray-600">Your schedule is clear. New job requests will appear here.</p>
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
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Completed job with Margaret Smith</p>
                      <p className="text-xs text-gray-500">2 hours ago • Earned $70</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <MessageCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">New message from Robert Johnson</p>
                      <p className="text-xs text-gray-500">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-yellow-100 rounded-full p-2">
                      <Star className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Received 5-star rating from Eleanor Davis</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* New Job Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">New Job Requests</CardTitle>
                <CardDescription>Respond quickly to increase your booking rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobRequests.length > 0 ? (
                    jobRequests.map((request) => (
                      <div key={request.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">
                            {request.client_profiles?.users?.first_name} {request.client_profiles?.users?.last_name}
                          </h4>
                          <span className="text-sm font-semibold text-green-600">${request.total_amount}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {request.booking_services?.map((bs: any) => bs.services?.name).join(", ") || "Care Services"}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(request.service_date).toLocaleDateString()} • {request.start_time} -{" "}
                            {request.end_time}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {request.service_address}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" className="flex-1" onClick={() => handleAcceptJob(request.id)}>
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            onClick={() => handleDeclineJob(request.id)}
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-600">No new job requests</p>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  View All Requests
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/caregiver/schedule">
                    <Button className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      View Schedule
                    </Button>
                  </Link>
                  <Link href="/caregiver/clients">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      My Clients
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Earnings Report
                  </Button>
                  <Link href="/caregiver/messages">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Messages
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Performance Tips */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800">Performance Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-blue-700">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                    <p>Respond to requests within 1 hour to improve your response rate</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                    <p>Complete your profile to attract more clients</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                    <p>Ask clients for reviews after successful jobs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
