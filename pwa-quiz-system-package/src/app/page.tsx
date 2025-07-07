'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

// Type definition for beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export default function LandingPage() {
  const searchParams = useSearchParams()
  const ref = searchParams.get('ref')
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [installProgress, setInstallProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(1)

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handler as EventListener)

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setCurrentStep(3)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener)
  }, [])

  const handleGetLink = async () => {
    if (!deferredPrompt) return

    setCurrentStep(2)
    setInstallProgress(50)

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        setInstallProgress(100)
        setCurrentStep(3)
        setDeferredPrompt(null)
        setIsInstallable(false)
      } else {
        setInstallProgress(0)
        setCurrentStep(1)
      }
    } catch (error) {
      console.error('Error during app setup:', error)
      setInstallProgress(0)
      setCurrentStep(1)
    }
  }

  const handleContinue = () => {
    try {
      window.location.href = '/app'
    } catch (error) {
      console.error('Error navigating to app:', error)
    }
  }

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return {
          title: '🔗 Get URL From Here',
          description: 'Get enhanced access to unlock your content with improved features and performance.',
          bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50',
          textColor: 'text-gray-800'
        }
      case 2:
        return {
          title: '⚡ Setting Up Access...',
          description: 'Preparing your enhanced experience for optimal performance...',
          bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50',
          textColor: 'text-gray-800'
        }
      case 3:
        return {
          title: '🎉 Ready to Continue!',
          description: 'Setup complete! Click below to access your content and start the experience.',
          bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
          textColor: 'text-gray-800'
        }
      default:
        return {
          title: 'Welcome',
          description: 'Getting started...',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-800'
        }
    }
  }

  const stepContent = getStepContent()

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${stepContent.bgColor} transition-all duration-500`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/90 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center pb-4">
          <CardTitle className={`text-2xl font-bold ${stepContent.textColor} leading-tight`}>
            {stepContent.title}
          </CardTitle>
          <CardDescription className="text-base text-gray-600 mt-2 leading-relaxed">
            {stepContent.description}
          </CardDescription>
          {ref && (
            <p className="text-xs text-gray-500 mt-3 px-3 py-1 bg-gray-100 rounded-full inline-block">
              Referrer: {ref}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Indicator */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className={currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}>
                Get Link
              </span>
              <span className={currentStep >= 2 ? 'text-yellow-600' : 'text-gray-400'}>
                Setup
              </span>
              <span className={currentStep >= 3 ? 'text-green-600' : 'text-gray-400'}>
                Ready
              </span>
            </div>
            <Progress value={(currentStep / 3) * 100} className="h-2" />
          </div>

          {/* Setup Progress */}
          {installProgress > 0 && installProgress < 100 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Setting up enhanced access...</span>
                <span>{installProgress}%</span>
              </div>
              <Progress value={installProgress} className="h-2" />
            </div>
          )}

          {/* Step 1: Get Link */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔗</span>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    Why Get Enhanced Access?
                  </h3>
                  <ul className="text-sm text-blue-700 space-y-1 text-left">
                    <li>• Enhanced user experience</li>
                    <li>• Faster loading and performance</li>
                    <li>• Reliable content access</li>
                    <li>• Secure and optimized delivery</li>
                  </ul>
                </div>
              </div>

              {isInstallable && (
                <Button 
                  onClick={handleGetLink}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-3 text-lg font-semibold h-12 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  🔗 Get Link
                </Button>
              )}

              {!isInstallable && (
                <div className="text-center space-y-3">
                  <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    Enhanced features not available on this device/browser
                  </p>
                  <Button 
                    onClick={handleContinue}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 text-lg font-semibold h-12 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Continue to Content
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Setting Up */}
          {currentStep === 2 && (
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
              <p className="text-sm text-gray-600 font-medium">
                Setting up enhanced access...
              </p>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-xs text-yellow-800">
                  This will only take a moment
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Ready */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎉</span>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">
                    Access Ready!
                  </h3>
                  <p className="text-sm text-green-700">
                    Your enhanced access is set up and ready. Continue to your content now!
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={handleContinue}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-4 text-lg font-semibold h-14 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                🚀 Access Content Now
              </Button>
            </div>
          )}

          {/* Info Section */}
          <div className="text-center text-xs text-gray-500 border-t pt-4 mt-6">
            <p>Secure Content Access</p>
            <p className="mt-1">Enhanced Web Technology</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
