import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-green-700">FootballGPT</div>
          <Link
            href="/auth/login"
            className="px-4 py-2 text-green-700 hover:text-green-800 font-medium"
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            FootballGPT - Independent Football Coaching Intelligence
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Your AI coaching assistant that helps football coaches at all levels
            with verified, evidence-based guidance. From grassroots to professional,
            get the support you need to develop players and improve performance.
          </p>
          <div className="mt-10">
            <Link
              href="/app"
              className="inline-block px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-green-700 transition-colors"
            >
              Start now
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Evidence-Based</h3>
            <p className="mt-2 text-gray-600">
              All guidance is grounded in verified coaching research and best practices.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">All Levels</h3>
            <p className="mt-2 text-gray-600">
              Whether you coach youth teams or professionals, get relevant advice for your context.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Chat Interface</h3>
            <p className="mt-2 text-gray-600">
              Natural conversation with an AI that understands football coaching.
            </p>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="mt-32 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Start free, upgrade when you need more
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Free</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-500">/month</span>
              </div>
              <p className="mt-4 text-gray-600">Perfect for trying out FootballGPT</p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">5 messages per day</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Fast AI model</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Evidence-based coaching advice</span>
                </li>
              </ul>
              <Link
                href="/auth/login"
                className="mt-8 block w-full py-3 text-center text-green-600 font-semibold border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-green-600 p-8 rounded-xl shadow-lg border-2 border-green-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-700 text-white text-xs font-semibold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
              <h3 className="text-xl font-semibold text-white">Pro</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">$14.99</span>
                <span className="text-green-200">/month</span>
              </div>
              <p className="mt-4 text-green-100">Everything you need to excel</p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-300 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">Unlimited messages</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-300 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">Smart AI routing (fast + powerful models)</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-300 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">Chat history saved</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-300 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">Priority support</span>
                </li>
              </ul>
              <Link
                href="/auth/login"
                className="mt-8 block w-full py-3 text-center text-green-600 font-semibold bg-white rounded-lg hover:bg-green-50 transition-colors"
              >
                Start Pro Trial
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 mt-16 border-t border-gray-100">
        <div className="text-center text-gray-500 text-sm">
          FootballGPT - Independent Football Coaching Intelligence
        </div>
      </footer>
    </div>
  )
}
