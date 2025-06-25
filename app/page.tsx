import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Shield, Clock, Users, CheckCircle, Star } from "lucide-react"
import { AuthHeader } from "@/components/auth-header"

export default function HomePage() {
  const services = [
    {
      icon: <Heart className="h-8 w-8 text-blue-600" />,
      title: "Personal Care",
      description: "Assistance with bathing, dressing, and daily personal needs",
    },
    {
      icon: <Shield className="h-8 w-8 text-green-600" />,
      title: "Medication Management",
      description: "Ensuring proper medication schedules and dosages",
    },
    {
      icon: <Clock className="h-8 w-8 text-purple-600" />,
      title: "Running Errands",
      description: "Grocery shopping, prescription pickup, and appointments",
    },
    {
      icon: <Users className="h-8 w-8 text-orange-600" />,
      title: "Companionship",
      description: "Social interaction and emotional support",
    },
  ]

  const features = [
    "Background-checked caregivers",
    "Flexible scheduling",
    "Secure payment processing",
    "24/7 customer support",
    "Personalized care plans",
    "Family updates and reports",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <AuthHeader />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">Compassionate Care for Your Loved Ones</h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Connect with qualified, background-checked caregivers who provide personalized assistance for daily living,
            companionship, and peace of mind for families.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup?role=client">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                Find a Caregiver
              </Button>
            </Link>
            <Link href="/signup?role=caregiver">
              <Button
                size="lg"
                variant="outline"
                className="bg-white text-blue-600 border-blue-600 hover:bg-blue-50 text-lg px-8 py-4"
              >
                Become a Caregiver
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Care Services</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive support tailored to meet the unique needs of each individual
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">{service.icon}</div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{service.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to get the care you need</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Your Profile</h3>
              <p className="text-gray-600">Tell us about your care needs and preferences</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Find Your Caregiver</h3>
              <p className="text-gray-600">Browse qualified caregivers and book services</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Receive Quality Care</h3>
              <p className="text-gray-600">Enjoy personalized care and regular updates</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Choose Elderly Care Connect?</h2>
              <p className="text-lg text-gray-600 mb-8">
                We're committed to providing the highest quality care services with complete transparency and trust.
              </p>
              <div className="grid gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <span className="text-lg text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-lg text-gray-600 italic mb-4">
                  "The caregiver we found through this platform has been amazing. My mother feels comfortable and
                  well-cared for."
                </p>
                <p className="font-semibold text-gray-900">- Sarah M., Daughter</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of families who trust us with their loved ones' care
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup?role=client">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4">
                Find Care Now
              </Button>
            </Link>
            <Link href="/signup?role=caregiver">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4"
              >
                Start Caregiving
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold">Elderly Care Connect</span>
              </div>
              <p className="text-gray-400">Connecting families with compassionate, qualified caregivers.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Personal Care</li>
                <li>Companionship</li>
                <li>Medication Management</li>
                <li>Household Support</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Safety Guidelines</li>
                <li>Insurance</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Careers</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Elderly Care Connect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
