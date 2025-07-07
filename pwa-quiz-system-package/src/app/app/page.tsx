'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, ArrowRight, Settings, ExternalLink, ArrowLeft } from 'lucide-react'

// Configuration - Admin can change these URLs
const QUIZ_CONFIG = {
  defaultQuizUrl: 'https://quiz.surmahalmusic.com',
  defaultQuizId: '6',
  allowUrlChange: true // Set to false to hide admin settings
}

export default function AppPage() {
  const searchParams = useSearchParams()
  const slug = searchParams.get('slug') || ''
  const [currentStep, setCurrentStep] = useState(1)
  const [isCompleted, setIsCompleted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isStandalone, setIsStandalone] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [quizUrl, setQuizUrl] = useState(QUIZ_CONFIG.defaultQuizUrl)
  const [quizId, setQuizId] = useState(QUIZ_CONFIG.defaultQuizId)
  const [showManualComplete, setShowManualComplete] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)

  useEffect(() => {
    // Check if running as PWA
    if (typeof window !== 'undefined') {
      setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
      
      // Load saved quiz URL from localStorage (admin settings)
      const savedQuizUrl = localStorage.getItem('pwa-quiz-url')
      const savedQuizId = localStorage.getItem('pwa-quiz-id')
      if (savedQuizUrl) setQuizUrl(savedQuizUrl)
      if (savedQuizId) setQuizId(savedQuizId)
    }
  }, [])

  // Listen for message from quiz iframe about completion
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      try {
        // Accept messages from the configured quiz domain
        const quizDomain = new URL(quizUrl).origin
        if (event.origin === quizDomain) {
          if (event.data === 'quizCompleted' || event.data.type === 'quizCompleted') {
            handleQuizCompletion()
          }
        }
      } catch (error) {
        console.error('Error handling quiz message:', error)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [quizUrl])

  const handleStartQuiz = () => {
    try {
      setCurrentStep(2)
      setProgress(33)
      
      // Show quiz in iframe
      setTimeout(() => {
        setCurrentStep(3)
        setProgress(66)
        
        // Start timer for manual completion button (150 seconds)
        const timer = setInterval(() => {
          setTimeElapsed(prev => {
            const newTime = prev + 1
            if (newTime >= 150) {
              setShowManualComplete(true)
              clearInterval(timer)
            }
            return newTime
          })
        }, 1000)
        
        // Store timer reference for cleanup
        return () => clearInterval(timer)
      }, 1000)
    } catch (error) {
      console.error('Error starting quiz:', error)
    }
  }

  const handleQuizCompletion = () => {
    try {
      setCurrentStep(4)
      setProgress(100)
      setIsCompleted(true)
      
      // Redirect back to the original slug URL after completion
      setTimeout(() => {
        if (slug) {
          // This redirects back to your URL shortener with the slug
          window.location.href = `/${slug}?completed=true`
        } else {
          // If no slug, go back to home
          window.location.href = '/'
        }
      }, 3000)
    } catch (error) {
      console.error('Error completing quiz:', error)
    }
  }

  const handleManualComplete = () => {
    // Manual completion for testing or if iframe messaging doesn't work
    handleQuizCompletion()
  }

  const saveQuizSettings = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('pwa-quiz-url', quizUrl)
        localStorage.setItem('pwa-quiz-id', quizId)
      }
      setShowSettings(false)
    } catch (error) {
      console.error('Error saving quiz settings:', error)
    }
  }

  const getQuizIframeUrl = () => {
    return `${quizUrl}/?url=${slug}&id=${quizId}`
  }

  const handleBackToHome = () => {
    try {
      window.location.href = '/'
    } catch (error) {
      console.error('Error navigating to home:', error)
    }
  }

  const getStepInfo = () => {
    switch (currentStep) {
      case 1:
        return {
          title: 'Content Access Ready',
          description: slug ? `Processing URL: ${slug}` : 'Click the button below to start',
          bgColor: 'bg-blue-50',
          cardColor: 'border-blue-200'
        }
      case 2:
        return {
          title: 'Loading Content',
          description: 'Preparing your experience...',
          bgColor: 'bg-yellow-50',
          cardColor: 'border-yellow-200'
        }
      case 3:
        return {
          title: 'Interactive Content',
          description: 'Complete the activity below to continue...',
          bgColor: 'bg-orange-50',
          cardColor: 'border-orange-200'
        }
      case 4:
        return {
          title: 'Content Unlocked!',
          description: 'Redirecting to your content...',
          bgColor: 'bg-green-50',
          cardColor: 'border-green-200'
        }
      default:
        return {
          title: 'Welcome',
          description: 'Getting started...',
          bgColor: 'bg-gray-50',
          cardColor: 'border-gray-200'
        }
    }
  }

  const stepInfo = getStepInfo()

  return (
    <div className={`min-h-screen ${stepInfo.bgColor} transition-all duration-500`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToHome}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-xl font-bold text-gray-800">
              Content Access System
            </h1>
            {slug && (
              <p className="text-sm text-gray-600 mt-1">
                URL: {slug}
              </p>
            )}
          </div>
          {QUIZ_CONFIG.allowUrlChange && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="ml-4"
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Admin Settings Panel */}
      {showSettings && QUIZ_CONFIG.allowUrlChange && (
        <div className="bg-gray-100 border-b p-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold mb-4">🔧 Admin Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quiz-url">Content Website URL</Label>
                <Input
                  id="quiz-url"
                  value={quizUrl}
                  onChange={(e) => setQuizUrl(e.target.value)}
                  placeholder="https://quiz.surmahalmusic.com"
                />
              </div>
              <div>
                <Label htmlFor="quiz-id">Content ID</Label>
                <Input
                  id="quiz-id"
                  value={quizId}
                  onChange={(e) => setQuizId(e.target.value)}
                  placeholder="6"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={saveQuizSettings}>Save Settings</Button>
              <Button variant="outline" onClick={() => setShowSettings(false)}>Cancel</Button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Current URL: {getQuizIframeUrl()}
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`${currentStep === 3 ? 'max-w-6xl' : 'max-w-md'} mx-auto p-4 pt-8 transition-all duration-500`}>
        <Card className={`shadow-lg ${stepInfo.cardColor} border-2`}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              {stepInfo.title}
            </CardTitle>
            <CardDescription className="text-lg">
              {stepInfo.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Indicator */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm font-medium">
                <span className={currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}>
                  Ready
                </span>
                <span className={currentStep >= 2 ? 'text-yellow-600' : 'text-gray-400'}>
                  Loading
                </span>
                <span className={currentStep >= 3 ? 'text-orange-600' : 'text-gray-400'}>
                  Activity
                </span>
                <span className={currentStep >= 4 ? 'text-green-600' : 'text-gray-400'}>
                  Complete
                </span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            {/* Step Content */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="bg-blue-100 p-6 rounded-lg text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ArrowRight className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">
                    Ready to Access Content
                  </h3>
                  <p className="text-blue-600 text-sm">
                    Interactive content will load in the next step
                  </p>
                </div>
                <Button 
                  onClick={handleStartQuiz}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 text-lg font-semibold"
                >
                  🚀 Start Experience
                </Button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
                <p className="text-yellow-700 font-medium">
                  Loading interactive content...
                </p>
                <div className="bg-yellow-100 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Content will appear in the next step
                  </p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-orange-700 font-medium">
                    Complete the activity below to proceed
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{quizUrl}</span>
                  </div>
                </div>
                
                {/* Quiz WebView/iframe */}
                <div className="bg-white rounded-lg border-2 border-orange-200 overflow-hidden">
                  <iframe
                    src={getQuizIframeUrl()}
                    className="w-full h-[600px] border-0"
                    title="Interactive Content"
                    allow="fullscreen"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
                  />
                </div>

                {/* Manual completion button - shows after 150 seconds */}
                {showManualComplete && (
                  <div className="text-center pt-4 border-t">
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mb-4">
                      <p className="text-sm text-orange-800 font-medium mb-2">
                        🕐 Having trouble with the content?
                      </p>
                      <p className="text-xs text-orange-700">
                        You can now manually complete and continue to your destination.
                      </p>
                    </div>
                    <Button 
                      onClick={handleManualComplete}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      ✅ Complete & Continue
                    </Button>
                  </div>
                )}

                {/* Timer display - shows countdown until manual completion */}
                {!showManualComplete && (
                  <div className="text-center pt-4 border-t">
                    <p className="text-xs text-gray-500">
                      Manual completion available in: {Math.max(0, 150 - timeElapsed)}s
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                      <div 
                        className="bg-blue-500 h-1 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, (timeElapsed / 150) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 4 && isCompleted && (
              <div className="space-y-4">
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Activity Completed Successfully!
                  </h3>
                  <p className="text-green-600 text-sm">
                    Redirecting to your content in 3 seconds...
                  </p>
                </div>
                
                <div className="bg-green-100 p-6 rounded-lg text-center">
                  <div className="animate-pulse">
                    <div className="flex items-center justify-center mb-4">
                      <ArrowRight className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-green-800 font-medium">
                      Returning to: /{slug || 'home'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Status Information */}
            <div className="border-t pt-4 text-center">
              <p className="text-xs text-gray-500">
                Access Status: {isStandalone ? 'Enhanced' : 'Standard'} | Content: {quizUrl}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Flow Diagram */}
        <div className="mt-8 bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">
            Content Access Process
          </h3>
          <div className="flex items-center justify-between text-xs">
            <div className={`flex flex-col items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-3 h-3 rounded-full ${currentStep >= 1 ? 'bg-blue-500' : 'bg-gray-300'} mb-1`}></div>
              <span>Ready</span>
            </div>
            <div className={`flex-1 h-px ${currentStep >= 2 ? 'bg-yellow-500' : 'bg-gray-300'} mx-2`}></div>
            <div className={`flex flex-col items-center ${currentStep >= 2 ? 'text-yellow-600' : 'text-gray-400'}`}>
              <div className={`w-3 h-3 rounded-full ${currentStep >= 2 ? 'bg-yellow-500' : 'bg-gray-300'} mb-1`}></div>
              <span>Loading</span>
            </div>
            <div className={`flex-1 h-px ${currentStep >= 3 ? 'bg-orange-500' : 'bg-gray-300'} mx-2`}></div>
            <div className={`flex flex-col items-center ${currentStep >= 3 ? 'text-orange-600' : 'text-gray-400'}`}>
              <div className={`w-3 h-3 rounded-full ${currentStep >= 3 ? 'bg-orange-500' : 'bg-gray-300'} mb-1`}></div>
              <span>Activity</span>
            </div>
            <div className={`flex-1 h-px ${currentStep >= 4 ? 'bg-green-500' : 'bg-gray-300'} mx-2`}></div>
            <div className={`flex flex-col items-center ${currentStep >= 4 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-3 h-3 rounded-full ${currentStep >= 4 ? 'bg-green-500' : 'bg-gray-300'} mb-1`}></div>
              <span>Complete</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
