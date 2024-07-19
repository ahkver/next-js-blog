//// ./app/blog/[id]/page.js

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function BlogView({ params }) {
  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchBlog();
  }, []);

  const fetchBlog = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/blogs/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch blog');
      }
      const data = await response.json();
      setBlog(data.blog);
    } catch (error) {
      console.error('Failed to fetch blog:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <p>Loading blog post...</p>;
  if (!blog) return <p>Blog post not found.</p>;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{blog.title}</CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          {Array.isArray(blog.categories) && blog.categories.map((category) => (
            <Badge key={category} variant="secondary">{category}</Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-4">
          Published on {new Date(blog.createdAt).toLocaleDateString()} by {blog.author ? blog.author.name : 'Unknown'}
        </p>
        <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        <div className="mt-6">
          <Button onClick={() => router.push('/blogs')}>Back to Blogs</Button>
        </div>
      </CardContent>
    </Card>
  );
}


