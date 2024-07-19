//// ./app/dashboard/page.js

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Dashboard() {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, blogId: null });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    } else if (status === 'authenticated') {
      fetchUserBlogs();
    }
  }, [status, router]);

  const fetchUserBlogs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/blogs/user');
      if (!response.ok) {
        throw new Error('Failed to fetch user blogs');
      }
      const data = await response.json();
      setBlogs(data.blogs || []);
    } catch (error) {
      console.error('Failed to fetch user blogs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your blog posts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (blogId) => {
    setDeleteConfirm({ isOpen: true, blogId });
  };

  const handleDelete = async () => {
    try {
      console.log('Attempting to delete blog:', deleteConfirm.blogId);
      const response = await fetch(`/api/blogs/${deleteConfirm.blogId}`, {
        method: 'DELETE',
      });
      console.log('Delete response status:', response.status);
      const data = await response.json();
      console.log('Delete response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to delete blog post');
      }
      
      toast({
        title: "Success",
        description: "Blog post deleted successfully!",
      });
      fetchUserBlogs();
    } catch (error) {
      console.error('Failed to delete blog post:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete blog post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirm({ isOpen: false, blogId: null });
    }
  };

  if (isLoading) return <p>Loading your blog posts...</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Your Blog Posts</h1>
      {blogs.length === 0 ? (
        <p>You haven't created any blog posts yet.</p>
      ) : (
        blogs.map((blog) => (
          <Card key={blog._id}>
            <CardHeader>
              <CardTitle>{blog.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                {Array.isArray(blog.categories) && blog.categories.map((category) => (
                  <Badge key={category} variant="secondary">{category}</Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <p>Status: {blog.status || 'N/A'}</p>
              <p>Created: {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : 'N/A'}</p>
              <p>Last Updated: {blog.updatedAt ? new Date(blog.updatedAt).toLocaleDateString() : 'N/A'}</p>
              <div className="flex gap-2 mt-4">
                <Button onClick={() => router.push(`/blog/edit/${blog._id}`)}>Edit</Button>
                <Button variant="destructive" onClick={() => handleDeleteClick(blog._id)}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <AlertDialog open={deleteConfirm.isOpen} onOpenChange={(isOpen) => setDeleteConfirm(prev => ({ ...prev, isOpen }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this blog post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your blog post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirm({ isOpen: false, blogId: null })}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

