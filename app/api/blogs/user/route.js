//// ./app/api/blogs/user/route.js

import { NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const blogs = await db.collection("blogs")
      .find({ "author.id": session.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ blogs });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch user blogs' }, { status: 500 });
  }
}

