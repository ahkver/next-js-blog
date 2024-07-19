//// ./app/blog/create/page.js

import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CreateBlog = dynamic(() => import('@/components/CreateBlog'), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export default function CreateBlogPage() {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create Blog</CardTitle>
      </CardHeader>
      <CardContent>
        <CreateBlog />
      </CardContent>
    </Card>
  );
}

