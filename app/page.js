//// ./app/page.js

import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]/route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function Home() {
  const session = await getServerSession(authOptions)

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Welcome to MyBlog</CardTitle>
      </CardHeader>
      <CardContent>
        {session ? (
          <p>Welcome, {session.user.name || session.user.email}! Visit the Blogs page to start writing.</p>
        ) : (
          <p>Please sign in to create and manage blogs.</p>
        )}
      </CardContent>
    </Card>
  )
}

//npm install next-auth