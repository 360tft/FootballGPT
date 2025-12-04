import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Authentication Error</h1>
          <p className="mt-4 text-gray-600">
            Something went wrong during authentication. Please try again.
          </p>
        </div>
        <div className="space-x-4">
          <Link
            href="/auth/login"
            className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Back to login
          </Link>
          <Link
            href="/"
            className="inline-block px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
