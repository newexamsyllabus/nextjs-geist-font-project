'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function SlugPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  useEffect(() => {
    // Redirect to the app page with the slug parameter
    if (slug) {
      router.push(`/app?slug=${slug}`)
    }
  }, [slug, router])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Loading PWA...
        </h2>
        <p className="text-gray-600">
          Processing slug: {slug}
        </p>
      </div>
    </div>
  )
}
