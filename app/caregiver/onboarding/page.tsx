"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { Heart, ArrowLeft, Upload, CheckCircle } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export default function CaregiverOnboarding() {
  const [step, setStep] = useState(1)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([])
  const [experience, setExperience] = useState("")
  const [bio, setBio] = useState("")
  const [specialties, setSpecialties] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [serviceRadius, setServiceRadius] = useState("10")
  const [serviceRates, setServiceRates] = useState<{ [key: string]: string }>({})
  const [availability, setAvailability] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  const services = [
    { id: "personal-care", name: "Personal Care", description: "Bathing, dressing, grooming assistance" },
    { id: "companionship", name: "Companionship", description: "Social interaction and emotional support" },
    { id: "medication", name: "Medication Management", description: "Medication reminders and organization" },
    { id: "errands", name: "Running Errands", description: "Shopping, appointments, transportation" },
    { id: "household", name: "Household Chores", description: "Cleaning, laundry, meal preparation" },
  ]

  const certifications = [
    "CPR Certification",
    "First Aid Certification",
    "CNA (Certified Nursing Assistant)",
    "HHA (Home Health Aide)",
    "Alzheimer's/Dementia Care Training",
    "Medication Administration Training",
  ]

  const availabilityOptions = [
    "weekday-morning",
    "weekday-afternoon",
    "weekday-evening",
    "saturday-morning",
    "saturday-afternoon",
    "sunday-morning",
  ]

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
    )
  }

  const handleCertificationToggle = (certification: string) => {
    setSelectedCertifications((prev) =>
      prev.includes(certification) ? prev.filter((cert) => cert !== certification) : [...prev, certification],
    )
  }

  const handleAvailabilityToggle = (option: string) => {
    setAvailability((prev) => (prev.includes(option) ? prev.filter((opt) => opt !== option) : [...prev, option]))
  }

  const handleRateChange = (serviceId: string, rate: string) => {
    setServiceRates((prev) => ({ ...prev, [serviceId]: rate }))
  }

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      const user = await getCurrentUser()
      if (!user) throw new Error("Not authenticated")

      // Get all services from database
      const { data: allServices } = await supabase.from("services").select("*")

      // Get all certifications from database
      const { data: allCertifications } = await supabase.from("certifications").select("*")

      // Update caregiver profile
      const { error: profileError } = await supabase
        .from("caregiver_profiles")
        .update({
          bio,
          experience_years: Number.parseInt(experience.split("-")[0]) || 0,
          zip_code: zipCode,
          service_radius: Number.parseInt(serviceRadius),
          hourly_rate: Math.min(...Object.values(serviceRates).map((rate) => Number.parseFloat(rate) || 25)),
        })
        .eq("user_id", user.id)

      if (profileError) throw profileError

      // Get caregiver profile ID
      const { data: caregiverProfile } = await supabase
        .from("caregiver_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (!caregiverProfile) throw new Error("Caregiver profile not found")

      // Add caregiver services
      const caregiverServices = selectedServices
        .map((serviceName) => {
          const service = allServices?.find((s) => s.name.toLowerCase().includes(serviceName.split("-")[0]))
          return {
            caregiver_id: caregiverProfile.id,
            service_id: service?.id,
            custom_rate: Number.parseFloat(serviceRates[serviceName]) || service?.base_price || 25,
          }
        })
        .filter((cs) => cs.service_id)

      if (caregiverServices.length > 0) {
        const { error: servicesError } = await supabase.from("caregiver_services").insert(caregiverServices)

        if (servicesError) throw servicesError
      }

      // Add caregiver certifications
      const caregiverCertifications = selectedCertifications
        .map((certName) => {
          const certification = allCertifications?.find((c) => c.name === certName)
          return {
            caregiver_id: caregiverProfile.id,
            certification_id: certification?.id,
            verified: false,
          }
        })
        .filter((cc) => cc.certification_id)

      if (caregiverCertifications.length > 0) {
        const { error: certificationsError } = await supabase
          .from("caregiver_certifications")
          .insert(caregiverCertifications)

        if (certificationsError) throw certificationsError
      }

      // Add availability (simplified - you might want a more complex schedule system)
      const availabilityRecords = availability.map((avail) => {
        const [day, time] = avail.split("-")
        let dayOfWeek = 0
        let startTime = "09:00"
        let endTime = "17:00"

        if (day === "weekday")
          dayOfWeek = 1 // Monday
        else if (day === "saturday") dayOfWeek = 6
        else if (day === "sunday") dayOfWeek = 0

        if (time === "morning") {
          startTime = "06:00"
          endTime = "12:00"
        } else if (time === "afternoon") {
          startTime = "12:00"
          endTime = "18:00"
        } else if (time === "evening") {
          startTime = "18:00"
          endTime = "22:00"
        }

        return {
          caregiver_id: caregiverProfile.id,
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
        }
      })

      if (availabilityRecords.length > 0) {
        const { error: availabilityError } = await supabase.from("caregiver_availability").insert(availabilityRecords)

        if (availabilityError) throw availabilityError
      }

      setTimeout(() => {
        router.push("/caregiver/dashboard")
      }, 2000)
    } catch (error) {
      console.error("Error completing onboarding:", error)
      alert("Failed to complete onboarding. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/signup">
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
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
              <span className="text-sm text-gray-600">
                Step {step} of {totalSteps}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step 1: Services */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Select Your Services</CardTitle>
                <CardDescription>Choose the care services you're qualified and comfortable providing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {services.map((service) => (
                  <div key={service.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
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
                    </div>
                  </div>
                ))}
                <Button onClick={() => setStep(2)} className="w-full mt-6" disabled={selectedServices.length === 0}>
                  Continue
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Experience */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Experience</CardTitle>
                <CardDescription>Tell us about your caregiving background and experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Years of Experience</Label>
                  <RadioGroup value={experience} onValueChange={setExperience}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="0-1" id="exp1" />
                      <Label htmlFor="exp1">Less than 1 year</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1-3" id="exp2" />
                      <Label htmlFor="exp2">1-3 years</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="3-5" id="exp3" />
                      <Label htmlFor="exp3">3-5 years</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="5-10" id="exp4" />
                      <Label htmlFor="exp4">5-10 years</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="10+" id="exp5" />
                      <Label htmlFor="exp5">More than 10 years</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Describe your experience, approach to care, and what makes you a great caregiver..."
                    rows={5}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialties">Special Skills or Specialties</Label>
                  <Textarea
                    id="specialties"
                    placeholder="e.g., Alzheimer's care, physical therapy assistance, bilingual communication..."
                    rows={3}
                    value={specialties}
                    onChange={(e) => setSpecialties(e.target.value)}
                  />
                </div>

                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  >
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)} className="flex-1" disabled={!experience || !bio}>
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Certifications */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Certifications & Documents</CardTitle>
                <CardDescription>
                  Select your certifications and upload required documents for verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Select Your Certifications</h3>
                  {certifications.map((cert, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cert-${index}`}
                        checked={selectedCertifications.includes(cert)}
                        onCheckedChange={() => handleCertificationToggle(cert)}
                      />
                      <Label htmlFor={`cert-${index}`}>{cert}</Label>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Required Documents</h3>

                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Background Check Report</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      >
                        Upload File
                      </Button>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Professional References (3)</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      >
                        Upload Files
                      </Button>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Government ID</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      >
                        Upload File
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1 bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  >
                    Back
                  </Button>
                  <Button onClick={() => setStep(4)} className="flex-1">
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Availability & Rates */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Availability & Rates</CardTitle>
                <CardDescription>Set your availability and hourly rates for different services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Service Area</h3>
                  <div className="space-y-2">
                    <Label htmlFor="zipcode">Primary ZIP Code</Label>
                    <Input
                      id="zipcode"
                      placeholder="Enter your ZIP code"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="radius">Service Radius (miles)</Label>
                    <Input
                      id="radius"
                      type="number"
                      placeholder="10"
                      value={serviceRadius}
                      onChange={(e) => setServiceRadius(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Hourly Rates</h3>
                  {selectedServices.map((serviceId) => {
                    const service = services.find((s) => s.id === serviceId)
                    return (
                      <div key={serviceId} className="flex items-center justify-between">
                        <Label>{service?.name}</Label>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">$</span>
                          <Input
                            type="number"
                            placeholder="25"
                            className="w-20"
                            value={serviceRates[serviceId] || ""}
                            onChange={(e) => handleRateChange(serviceId, e.target.value)}
                          />
                          <span className="text-sm text-gray-600">/hour</span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">General Availability</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Weekdays</Label>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="weekday-morning"
                            checked={availability.includes("weekday-morning")}
                            onCheckedChange={() => handleAvailabilityToggle("weekday-morning")}
                          />
                          <Label htmlFor="weekday-morning" className="text-sm">
                            Morning (6 AM - 12 PM)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="weekday-afternoon"
                            checked={availability.includes("weekday-afternoon")}
                            onCheckedChange={() => handleAvailabilityToggle("weekday-afternoon")}
                          />
                          <Label htmlFor="weekday-afternoon" className="text-sm">
                            Afternoon (12 PM - 6 PM)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="weekday-evening"
                            checked={availability.includes("weekday-evening")}
                            onCheckedChange={() => handleAvailabilityToggle("weekday-evening")}
                          />
                          <Label htmlFor="weekday-evening" className="text-sm">
                            Evening (6 PM - 10 PM)
                          </Label>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Weekends</Label>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="saturday-morning"
                            checked={availability.includes("saturday-morning")}
                            onCheckedChange={() => handleAvailabilityToggle("saturday-morning")}
                          />
                          <Label htmlFor="saturday-morning" className="text-sm">
                            Saturday Morning
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="saturday-afternoon"
                            checked={availability.includes("saturday-afternoon")}
                            onCheckedChange={() => handleAvailabilityToggle("saturday-afternoon")}
                          />
                          <Label htmlFor="saturday-afternoon" className="text-sm">
                            Saturday Afternoon
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="sunday-morning"
                            checked={availability.includes("sunday-morning")}
                            onCheckedChange={() => handleAvailabilityToggle("sunday-morning")}
                          />
                          <Label htmlFor="sunday-morning" className="text-sm">
                            Sunday Morning
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(3)}
                    className="flex-1 bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  >
                    Back
                  </Button>
                  <Button onClick={handleComplete} className="flex-1" disabled={isLoading || !zipCode}>
                    {isLoading ? "Setting up your profile..." : "Complete Setup"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completion Message */}
          {isLoading && (
            <Card className="mt-6 border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">Setting up your caregiver profile...</h3>
                <p className="text-green-700">
                  We're saving your information and will redirect you to your dashboard shortly.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
