//// ./app/layout.js

import { Toaster } from "@/components/ui/toaster"
import Toolbar from '@/components/Toolbar'
import './globals.css'
import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]/route"
import SessionProvider from "@/components/SessionProvider"

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          <Toolbar />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </main>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  )
}


