"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Heart, ArrowLeft, Star, MapPin, Clock, Filter, Search } from "lucide-react"
import { getAvailableCaregivers, getServices } from "@/lib/services"

export default function CaregiversPage() {
  const [caregivers, setCaregivers] = useState<any[]>([])
  const [filteredCaregivers, setFilteredCaregivers] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 100])
  const [minRating, setMinRating] = useState(0)
  const [experienceLevel, setExperienceLevel] = useState("")
  const [availability, setAvailability] = useState("")

  useEffect(() => {
    async function loadData() {
      try {
        const [caregiversData, servicesData] = await Promise.all([getAvailableCaregivers(), getServices()])

        setCaregivers(caregiversData)
        setFilteredCaregivers(caregiversData)
        setServices(servicesData)
      } catch (error) {
        console.error("Error loading caregivers:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    let filtered = caregivers

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (caregiver) =>
          `${caregiver.users.first_name} ${caregiver.users.last_name}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) || caregiver.bio?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Service filter
    if (selectedServices.length > 0) {
      filtered = filtered.filter((caregiver) =>
        caregiver.caregiver_services.some((cs: any) => selectedServices.includes(cs.service_id)),
      )
    }

    // Price filter
    filtered = filtered.filter(
      (caregiver) => caregiver.hourly_rate >= priceRange[0] && caregiver.hourly_rate <= priceRange[1],
    )

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter((caregiver) => caregiver.rating >= minRating)
    }

    // Experience filter
    if (experienceLevel) {
      const expMap: { [key: string]: [number, number] } = {
        "0-2": [0, 2],
        "3-5": [3, 5],
        "5+": [5, 100],
      }
      const [min, max] = expMap[experienceLevel] || [0, 100]
      filtered = filtered.filter((caregiver) => caregiver.experience_years >= min && caregiver.experience_years <= max)
    }

    setFilteredCaregivers(filtered)
  }, [caregivers, searchQuery, selectedServices, priceRange, minRating, experienceLevel])

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading caregivers...</p>
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
            <Link href="/client/dashboard">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Caregivers</h1>
          <p className="text-gray-600">Browse qualified caregivers in your area</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search caregivers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Services */}
                <div className="space-y-2">
                  <Label>Services Needed</Label>
                  <div className="space-y-2">
                    {services.map((service) => (
                      <div key={service.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={service.id}
                          checked={selectedServices.includes(service.id)}
                          onCheckedChange={() => handleServiceToggle(service.id)}
                        />
                        <Label htmlFor={service.id} className="text-sm">
                          {service.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <Label>
                    Hourly Rate: ${priceRange[0]} - ${priceRange[1]}
                  </Label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Rating */}
                <div className="space-y-2">
                  <Label>Minimum Rating</Label>
                  <Select value={minRating.toString()} onValueChange={(value) => setMinRating(Number(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any rating</SelectItem>
                      <SelectItem value="3">3+ stars</SelectItem>
                      <SelectItem value="4">4+ stars</SelectItem>
                      <SelectItem value="4.5">4.5+ stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <Label>Experience Level</Label>
                  <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any experience</SelectItem>
                      <SelectItem value="0-2">0-2 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="5+">5+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedServices([])
                    setPriceRange([0, 100])
                    setMinRating(0)
                    setExperienceLevel("")
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Caregivers List */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600">{filteredCaregivers.length} caregivers found</p>
              <Select defaultValue="rating">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="experience">Most Experienced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-6">
              {filteredCaregivers.map((caregiver) => (
                <Card key={caregiver.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={caregiver.users.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>
                          {`${caregiver.users.first_name[0]}${caregiver.users.last_name[0]}`}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold">
                              {caregiver.users.first_name} {caregiver.users.last_name}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-sm font-medium ml-1">{caregiver.rating}</span>
                                <span className="text-sm text-gray-500 ml-1">({caregiver.total_reviews} reviews)</span>
                              </div>
                              <span className="text-gray-300">•</span>
                              <span className="text-sm text-gray-600">
                                {caregiver.experience_years} years experience
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">${caregiver.hourly_rate}/hr</div>
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin className="h-4 w-4 mr-1" />
                              {caregiver.service_radius} miles radius
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-600 mt-3 line-clamp-2">{caregiver.bio}</p>

                        <div className="flex flex-wrap gap-2 mt-3">
                          {caregiver.caregiver_services.map((cs: any) => (
                            <Badge key={cs.service_id} variant="secondary">
                              {cs.services.name}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              Available today
                            </span>
                            <span>{caregiver.total_jobs_completed} jobs completed</span>
                          </div>

                          <div className="flex space-x-2">
                            <Button variant="outline">View Profile</Button>
                            <Link href={`/client/book-service?caregiver=${caregiver.id}`}>
                              <Button>Book Now</Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCaregivers.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <Search className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No caregivers found</h3>
                  <p className="text-gray-600">Try adjusting your filters to see more results.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
