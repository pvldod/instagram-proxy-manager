import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Instagram, ArrowRight, Shield, MessageCircle, Users, Zap, ArrowDownToLine, Sparkles, Lock } from "lucide-react"
import Image from "next/image"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-white dark:bg-gray-950 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute left-1/4 top-1/4 w-64 h-64 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute right-1/4 bottom-1/4 w-64 h-64 bg-pink-200 dark:bg-pink-900/20 rounded-full blur-3xl opacity-30"></div>
        </div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-8">
            <div className="instagram-gradient-bg p-[2px] rounded-xl">
              <div className="bg-white dark:bg-gray-950 rounded-xl p-4">
                <div className="flex items-center justify-center space-x-3">
                  <Instagram className="h-10 w-10 instagram-gradient-text" />
                  <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                    <span className="inline-block relative">
                      <span className="relative z-10">Insta</span>
                      <span className="instagram-gradient-text">Flow</span>
                    </span>
                  </h1>
                </div>
              </div>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Manage your Instagram accounts efficiently with proxy support and automated messaging.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild className="hero-button hero-button-primary rounded-lg">
                <Link href="/signup" className="flex items-center justify-center">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild className="hero-button hero-button-secondary rounded-lg">
                <Link href="/login" className="flex items-center justify-center">
                  Log In
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Use InstaFlow</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Complete solution for Instagram account management with advanced features for maximum efficiency
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="instagram-card p-6 text-center">
              <div className="feature-icon-bg bg-purple-100 dark:bg-purple-900/30 mx-auto w-14 h-14 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 instagram-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Account Management</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Manage up to 5,000 Instagram accounts with dedicated proxies for maximum efficiency and security.
              </p>
            </div>
            <div className="instagram-card p-6 text-center">
              <div className="feature-icon-bg bg-pink-100 dark:bg-pink-900/30 mx-auto w-14 h-14 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 instagram-pink" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Proxy Integration</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Secure your accounts with dedicated HTTP proxies to prevent rate limiting and bans.
              </p>
            </div>
            <div className="instagram-card p-6 text-center">
              <div className="feature-icon-bg bg-blue-100 dark:bg-blue-900/30 mx-auto w-14 h-14 flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 instagram-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Automated Messaging</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Set up custom messages to be automatically sent to specific users when your accounts log in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-28 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Get started with InstaFlow in just a few simple steps
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full instagram-gradient-bg text-white mb-6">
                <ArrowDownToLine className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Sign Up</h3>
              <p className="text-center text-gray-600 dark:text-gray-400">
                Create your InstaFlow account to access all features and start managing your Instagram accounts.
              </p>
              <div className="absolute top-20 right-0 h-0.5 w-full md:w-1/2 bg-gradient-to-r from-transparent to-pink-500 hidden md:block"></div>
            </div>
            <div className="relative flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full instagram-gradient-bg text-white mb-6">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Add Accounts</h3>
              <p className="text-center text-gray-600 dark:text-gray-400">
                Import your Instagram accounts individually or in bulk with their associated proxy servers.
              </p>
              <div className="absolute top-20 right-0 h-0.5 w-full md:w-1/2 bg-gradient-to-r from-pink-500 to-purple-500 hidden md:block"></div>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full instagram-gradient-bg text-white mb-6">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Automate</h3>
              <p className="text-center text-gray-600 dark:text-gray-400">
                Set up automated messaging and let InstaFlow handle the rest while you focus on growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 instagram-gradient-bg text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
            <Zap className="h-10 w-10" />
            <h2 className="text-3xl md:text-4xl font-bold">Ready to get started?</h2>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl">
              Join thousands of users who are already streamlining their Instagram management with InstaFlow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button asChild className="transparent-dark-button rounded-lg">
                <Link href="/signup" className="flex items-center justify-center">
                  Sign Up Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild className="cta-button-secondary rounded-lg">
                <Link href="/login" className="flex items-center justify-center">
                  Log In
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Instagram className="h-6 w-6 instagram-gradient-text" />
                <span className="font-bold">InstaFlow</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Efficient Instagram account management with proxy support and automated messaging.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                © {new Date().getFullYear()} InstaFlow. All rights reserved.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-4">Products</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary">Account Management</Link></li>
                <li><Link href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary">Proxy Integration</Link></li>
                <li><Link href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary">Message Automation</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary">About Us</Link></li>
                <li><Link href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary">Contact</Link></li>
                <li><Link href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/terms" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary">Cookies</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
