import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Chatbot from '../components/Chatbot'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Toyota Vehicle Finder',
  description: 'Find your perfect Toyota vehicle',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="border-b bg-white">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center">
              <a href="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
                <h1 className="text-2xl font-bold text-toyota-red">TOYOTA</h1>
                <span className="text-sm text-gray-600">Vehicle Finder</span>
              </a>
              <nav className="ml-auto flex space-x-6">
                <a href="/" className="text-sm font-medium hover:text-toyota-red">
                  Search
                </a>
                <a href="/compare" className="text-sm font-medium hover:text-toyota-red">
                  Compare
                </a>
                <a href="/finance" className="text-sm font-medium hover:text-toyota-red">
                  Finance
                </a>
                <a href="/favorites" className="text-sm font-medium hover:text-toyota-red">
                  Favorites
                </a>
              </nav>
            </div>
          </div>
        </nav>
        {children}
        <Chatbot />
      </body>
    </html>
  )
}
