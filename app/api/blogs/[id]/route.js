//// ./app/api/blogs/[id]/route.js

import { NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const blogId = new ObjectId(params.id);
    const blog = await db.collection("blogs").findOne({ _id: blogId });

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json({ blog });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  console.log('Update request received for blog ID:', params.id);
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', JSON.stringify(session, null, 2));
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const blogId = new ObjectId(params.id);
    const { title, content, categories, tags } = await request.json();
    console.log('Update data:', { title, content, categories, tags });

    const blog = await db.collection("blogs").findOne({ _id: blogId });
    console.log('Found blog:', JSON.stringify(blog, null, 2));

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Check if the user is the author of the blog post
    console.log('Blog author:', blog.author);
    console.log('Session user:', session.user);
    if (!blog.author || blog.author.id !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to update this blog' }, { status: 403 });
    }

    const result = await db.collection("blogs").updateOne(
      { _id: blogId },
      {
        $set: {
          title,
          content,
          categories: Array.isArray(categories) ? categories : [],
          tags: Array.isArray(tags) ? tags : [],
          updatedAt: new Date()
        }
      }
    );

    console.log('Update result:', result);

    if (result.modifiedCount === 1) {
      return NextResponse.json({ message: 'Blog updated successfully' });
    } else {
      return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
    }
  } catch (e) {
    console.error('Error in PUT route:', e);
    return NextResponse.json({ error: 'Failed to update blog', details: e.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  console.log('Delete request received for blog ID:', params.id);
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', JSON.stringify(session, null, 2));
    if (!session) {
      console.log('No session found');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    console.log('Connected to database');

    const blogId = new ObjectId(params.id);
    console.log('Attempting to delete blog:', blogId);

    const blog = await db.collection("blogs").findOne({ _id: blogId });
    console.log('Found blog:', JSON.stringify(blog, null, 2));

    if (!blog) {
      console.log('Blog not found:', blogId);
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    console.log('Blog author:', JSON.stringify(blog.author, null, 2));
    console.log('Session user:', JSON.stringify(session.user, null, 2));

    if (!blog.author || blog.author.id !== session.user.id) {
      console.log('User not authorized to delete this blog');
      return NextResponse.json({ error: 'Not authorized to delete this blog' }, { status: 403 });
    }

    const result = await db.collection("blogs").deleteOne({ _id: blogId });

    console.log('Delete result:', result);

    if (result.deletedCount === 1) {
      return NextResponse.json({ message: 'Blog deleted successfully' });
    } else {
      return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
    }
  } catch (e) {
    console.error('Error in DELETE route:', e);
    return NextResponse.json({ error: 'Failed to delete blog', details: e.message }, { status: 500 });
  }
}

// Helper function to check if a user is an admin
async function checkIfUserIsAdmin(userId, db) {
  // Implement your admin check logic here
  // For example:
  // const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
  // return user && user.role === 'admin';
  
  // For now, we'll return true to allow deletion
  return true;
}


