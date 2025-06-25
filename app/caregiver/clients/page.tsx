"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, ArrowLeft, Search, Phone, MessageCircle, Calendar, MapPin } from "lucide-react"
import { getCaregiverBookings } from "@/lib/services"

export default function CaregiverClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [filteredClients, setFilteredClients] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadClients() {
      try {
        const bookings = await getCaregiverBookings()

        // Group bookings by client
        const clientMap = new Map()
        bookings.forEach((booking) => {
          const clientId = booking.client_profiles?.id
          if (!clientId) return

          if (!clientMap.has(clientId)) {
            clientMap.set(clientId, {
              id: clientId,
              user: booking.client_profiles.users,
              totalBookings: 0,
              completedBookings: 0,
              totalEarnings: 0,
              lastBooking: null,
              services: new Set(),
              rating: 0,
            })
          }

          const client = clientMap.get(clientId)
          client.totalBookings++
          if (booking.status === "completed") {
            client.completedBookings++
            client.totalEarnings += booking.total_amount
          }

          if (!client.lastBooking || new Date(booking.service_date) > new Date(client.lastBooking.service_date)) {
            client.lastBooking = booking
          }

          booking.booking_services?.forEach((bs: any) => {
            if (bs.services?.name) {
              client.services.add(bs.services.name)
            }
          })
        })

        const clientsArray = Array.from(clientMap.values()).map((client) => ({
          ...client,
          services: Array.from(client.services),
        }))

        setClients(clientsArray)
        setFilteredClients(clientsArray)
      } catch (error) {
        console.error("Error loading clients:", error)
      } finally {
        setLoading(false)
      }
    }

    loadClients()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = clients.filter((client) =>
        `${client.user?.first_name || ""} ${client.user?.last_name || ""}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      )
      setFilteredClients(filtered)
    } else {
      setFilteredClients(clients)
    }
  }, [searchQuery, clients])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your clients...</p>
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
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Clients</h1>
          <p className="text-gray-600">Manage your client relationships and care history</p>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid gap-6">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={client.user?.avatar_url || "/placeholder.svg?height=64&width=64"} />
                      <AvatarFallback>
                        {`${client.user?.first_name?.[0] || "C"}${client.user?.last_name?.[0] || "L"}`}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        {client.user?.first_name || "Client"} {client.user?.last_name || ""}
                      </h3>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Total Jobs</p>
                          <p className="font-semibold">{client.totalBookings}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Completed</p>
                          <p className="font-semibold text-green-600">{client.completedBookings}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Earned</p>
                          <p className="font-semibold text-green-600">${client.totalEarnings}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Last Service</p>
                          <p className="font-semibold">
                            {client.lastBooking
                              ? new Date(client.lastBooking.service_date).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Services Provided:</p>
                        <div className="flex flex-wrap gap-2">
                          {client.services.length > 0 ? (
                            client.services.map((service: string, index: number) => (
                              <Badge key={index} variant="secondary">
                                {service}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="secondary">No services recorded</Badge>
                          )}
                        </div>
                      </div>

                      {client.lastBooking && (
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Last: {new Date(client.lastBooking.service_date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {client.lastBooking.service_address}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? "No clients found" : "No clients yet"}
              </h3>
              <p className="text-gray-600">
                {searchQuery
                  ? "Try adjusting your search terms."
                  : "Your client relationships will appear here once you start providing care services."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
