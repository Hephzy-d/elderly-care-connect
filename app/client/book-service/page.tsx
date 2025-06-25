"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Heart, ArrowLeft, CalendarIcon, Clock, DollarSign, Star } from "lucide-react"
import { format } from "date-fns"
import { getServices, createBooking, getAvailableCaregivers } from "@/lib/services"
import { useSearchParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function BookServicePage() {
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState("")
  const [duration, setDuration] = useState("2")
  const [step, setStep] = useState(1)
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const searchParams = useSearchParams()
  const [selectedCaregiver, setSelectedCaregiver] = useState<any>(null)
  const [availableCaregivers, setAvailableCaregivers] = useState<any[]>([])

  useEffect(() => {
    const caregiverId = searchParams.get("caregiver")
    if (caregiverId && services.length > 0) {
      // Load specific caregiver if coming from caregiver page
      loadCaregiver(caregiverId)
    }
  }, [searchParams, services])

  const loadCaregiver = async (caregiverId: string) => {
    try {
      const caregivers = await getAvailableCaregivers()
      const caregiver = caregivers.find((c) => c.id === caregiverId)
      if (caregiver) {
        setSelectedCaregiver(caregiver)
      }
    } catch (error) {
      console.error("Error loading caregiver:", error)
    }
  }

  useEffect(() => {
    async function loadServices() {
      try {
        const servicesData = await getServices()
        setServices(servicesData)
      } catch (error) {
        console.error("Error loading services:", error)
      } finally {
        setLoading(false)
      }
    }

    loadServices()
  }, [])

  const timeSlots = [
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
    "7:00 PM",
  ]

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
    )
  }

  const calculateTotal = () => {
    const selectedServicePrices = services
      .filter((service) => selectedServices.includes(service.id))
      .reduce((total, service) => total + service.base_price, 0)
    return selectedServicePrices * Number.parseInt(duration)
  }

  const handleBooking = async () => {
    try {
      if (!selectedDate || !selectedTime || !selectedCaregiver) return

      const startTime = selectedTime
      const endTime = new Date(`2000-01-01 ${selectedTime}`)
      endTime.setHours(endTime.getHours() + Number.parseInt(duration))

      await createBooking({
        caregiverId: selectedCaregiver.id,
        serviceDate: selectedDate.toISOString().split("T")[0],
        startTime: startTime,
        endTime: endTime.toTimeString().split(" ")[0],
        durationHours: Number.parseInt(duration),
        totalAmount: calculateTotal(),
        serviceAddress: "123 Main St", // This would come from the form
        specialInstructions: "",
        serviceIds: selectedServices,
      })

      alert("Service booked successfully! You'll receive a confirmation email shortly.")
    } catch (error) {
      console.error("Booking error:", error)
      alert("Failed to book service. Please try again.")
    }
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Book a Service</h1>
            <p className="text-gray-600">Select the care services you need and schedule your appointment.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              {step === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Select Services</CardTitle>
                    <CardDescription>Choose the care services you need</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <Checkbox
                          id={service.id}
                          checked={selectedServices.includes(service.id)}
                          onCheckedChange={() => handleServiceToggle(service.id)}
                        />
                        <div className="flex-1">
                          <Label htmlFor={service.id} className="text-base font-medium cursor-pointer">
                            {service.name}
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-600">${service.base_price} per hour</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button onClick={() => setStep(2)} className="w-full mt-6" disabled={selectedServices.length === 0}>
                      Continue to Scheduling
                    </Button>
                  </CardContent>
                </Card>
              )}

              {step === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Schedule Your Service</CardTitle>
                    <CardDescription>Choose your preferred date and time</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Date Selection */}
                    <div className="space-y-2">
                      <Label>Select Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Time Selection */}
                    <div className="space-y-2">
                      <Label>Select Time</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {timeSlots.map((time) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTime(time)}
                            className={
                              selectedTime !== time ? "bg-white text-gray-700 border-gray-300 hover:bg-gray-50" : ""
                            }
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <RadioGroup value={duration} onValueChange={setDuration}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="1" id="1hour" />
                          <Label htmlFor="1hour">1 hour</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="2" id="2hours" />
                          <Label htmlFor="2hours">2 hours</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="3" id="3hours" />
                          <Label htmlFor="3hours">3 hours</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="4" id="4hours" />
                          <Label htmlFor="4hours">4 hours</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="flex space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1 bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      >
                        Back
                      </Button>
                      <Button onClick={() => setStep(2.5)} className="flex-1" disabled={!selectedDate || !selectedTime}>
                        Continue to Caregiver Selection
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 2.5 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Select Your Caregiver</CardTitle>
                    <CardDescription>Choose from available caregivers for your selected time</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedCaregiver ? (
                      <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={selectedCaregiver.users?.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback>
                              {`${selectedCaregiver.users?.first_name?.[0] || ""}${selectedCaregiver.users?.last_name?.[0] || ""}`}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold">
                              {selectedCaregiver.users?.first_name} {selectedCaregiver.users?.last_name}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm">{selectedCaregiver.rating}</span>
                              <span className="text-sm text-gray-500">({selectedCaregiver.total_reviews} reviews)</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{selectedCaregiver.bio}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-green-600">${selectedCaregiver.hourly_rate}/hr</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">Loading available caregivers...</p>
                      </div>
                    )}

                    <div className="flex space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => setStep(2)}
                        className="flex-1 bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      >
                        Back
                      </Button>
                      <Button onClick={() => setStep(3)} className="flex-1" disabled={!selectedCaregiver}>
                        Continue to Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Details</CardTitle>
                    <CardDescription>Provide any special instructions or requirements</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Service Address</Label>
                      <Input
                        id="address"
                        placeholder="Enter the address where service is needed"
                        defaultValue="123 Main St, Anytown, ST 12345"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergency">Emergency Contact</Label>
                      <Input id="emergency" placeholder="Emergency contact name and phone number" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="instructions">Special Instructions</Label>
                      <Textarea
                        id="instructions"
                        placeholder="Any specific needs, preferences, or important information for the caregiver..."
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Caregiver Preferences</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="female" />
                          <Label htmlFor="female">Prefer female caregiver</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="experienced" />
                          <Label htmlFor="experienced">Must have 5+ years experience</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="certified" />
                          <Label htmlFor="certified">Must be certified in CPR/First Aid</Label>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => setStep(2.5)}
                        className="flex-1 bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      >
                        Back
                      </Button>
                      <Button onClick={handleBooking} className="flex-1">
                        Confirm Booking
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Booking Summary */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedServices.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Selected Services:</h4>
                      <div className="space-y-2">
                        {services
                          .filter((service) => selectedServices.includes(service.id))
                          .map((service) => (
                            <div key={service.id} className="flex justify-between text-sm">
                              <span>{service.name}</span>
                              <span>${service.base_price}/hr</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {selectedDate && (
                    <div className="flex items-center space-x-2 text-sm">
                      <CalendarIcon className="h-4 w-4 text-gray-500" />
                      <span>{format(selectedDate, "PPP")}</span>
                    </div>
                  )}

                  {selectedTime && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>
                        {selectedTime} ({duration} hours)
                      </span>
                    </div>
                  )}

                  {selectedCaregiver && (
                    <div className="flex items-center space-x-2 text-sm">
                      <span>
                        Caregiver: {selectedCaregiver.users?.first_name} {selectedCaregiver.users?.last_name}
                      </span>
                    </div>
                  )}

                  {selectedServices.length > 0 && (
                    <div className="border-t pt-4">
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>${calculateTotal()}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Final price may vary based on caregiver selection</p>
                    </div>
                  )}

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-1">What happens next?</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• We'll match you with qualified caregivers</li>
                      <li>• You'll receive caregiver profiles to review</li>
                      <li>• Confirm your choice and finalize booking</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
