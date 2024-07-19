//// ./app/blog/page.js

'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import 'react-quill/dist/quill.snow.css';
import '@/styles/quill.css';

const CreateBlog = dynamic(() => import('@/components/CreateBlog'), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

const BlogList = dynamic(() => import('@/components/BlogList'), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export default function BlogPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    redirect("/signin");
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Blog Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <CreateBlog />
          <BlogList />
        </div>
      </CardContent>
    </Card>
  );
}



