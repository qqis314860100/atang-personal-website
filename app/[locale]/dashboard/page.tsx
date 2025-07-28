'use client'

import { Suspense } from 'react'
import Loading from '../blog/loading'

const DashboardPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          Dashboard Page
        </h1>
        <div className="bg-gray-100 p-4 rounded-lg shadow-md">
          <p className="text-gray-800">
            This is a test to check if Tailwind CSS styles are working
            correctly.
          </p>
          <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Test Button
          </button>
        </div>
      </div>
    </Suspense>
  )
}

export default DashboardPage
