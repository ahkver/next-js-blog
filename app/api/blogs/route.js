//// ./app/api/blogs/route.js

import { NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request) {
  console.log('Received POST request to /api/blogs');
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('No authenticated session found');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    console.log('Connected to database');

    const formData = await request.formData();
    console.log('Received form data:', Object.fromEntries(formData));

    let coverImagePath = null;
    if (formData.has('coverImage')) {
      const file = formData.get('coverImage');
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${file.name}`;
      const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
      await fs.writeFile(filepath, buffer);
      coverImagePath = `/uploads/${filename}`;
      console.log('Cover image saved:', coverImagePath);
    }

    const blogPost = {
      title: formData.get('title'),
      content: formData.get('content'),
      categories: JSON.parse(formData.get('categories')),
      tags: formData.get('tags').split(',').map(tag => tag.trim()),
      status: formData.get('status'),
      coverImage: coverImagePath,
      author: { id: session.user.id, name: session.user.name },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('Inserting blog post:', blogPost);
    const result = await db.collection("blogs").insertOne(blogPost);
    console.log('Insert result:', result);

    return NextResponse.json({ message: 'Blog post created successfully', postId: result.insertedId });
  } catch (e) {
    console.error('Error in POST /api/blogs:', e);
    return NextResponse.json({ error: 'Failed to create blog post', details: e.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const blogs = await db.collection("blogs").find({}).toArray();
    return NextResponse.json({ blogs });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}


