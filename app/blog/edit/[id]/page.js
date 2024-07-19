//// ./app/blog/edit/[id]/page.js

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from "@/components/ui/use-toast";
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading Editor...</p>,
});

const categories = [
  "Technology", "Travel", "Food", "Lifestyle", "Fashion",
  "Sports", "Health", "Education", "Business", "Entertainment",
];

export default function EditBlog({ params }) {
   const [blog, setBlog] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [tags, setTags] = useState('');
  const [isEditorReady, setIsEditorReady] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    } else if (status === 'authenticated') {
      fetchBlog();
    }
  }, [status]);

  useEffect(() => {
    setIsEditorReady(true);
  }, []);

const fetchBlog = async () => {
    try {
      const response = await fetch(`/api/blogs/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch blog');
      }
      const data = await response.json();
      setBlog(data.blog);
      setTitle(data.blog.title);
      setContent(data.blog.content);
      setSelectedCategories(data.blog.categories || []);
      setTags(data.blog.tags ? data.blog.tags.join(', ') : '');
    } catch (error) {
      console.error('Failed to fetch blog:', error);
      toast({
        title: "Error",
        description: "Failed to fetch blog post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  };


  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), []);

  function imageHandler() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        const quill = this.quill;
        const range = quill.getSelection();
        quill.insertEmbed(range.index, 'image', data.url);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "Failed to upload image. Please try again.",
          variant: "destructive",
        });
      }
    };
  }

 const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/blogs/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          categories: selectedCategories,
          tags: tags.split(',').map(tag => tag.trim()),
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to update blog post');
      }
      toast({
        title: "Success",
        description: "Blog post updated successfully!",
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to update blog post:', error);
      toast({
        title: "Error",
        description: "Failed to update blog post. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!blog) return <p>Loading blog post...</p>;


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Blog Title"
        required
      />
      <div>
        <Label>Categories</Label>
        <ScrollArea className="h-[200px] w-full border rounded-md p-4">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2 mb-2">
              <Checkbox
                id={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => handleCategoryChange(category)}
              />
              <Label htmlFor={category}>{category}</Label>
            </div>
          ))}
        </ScrollArea>
      </div>
      <div>
        Selected categories: {selectedCategories.join(', ')}
      </div>
      <Input
        type="text"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags (comma-separated)"
      />
      {isEditorReady && (
        <div style={{ height: '400px' }}>
          <ReactQuill 
            theme="snow"
            value={content}
            onChange={setContent}
            modules={quillModules}
            style={{ height: '90%' }}
          />
        </div>
      )}
      <Button type="submit">Update Blog Post</Button>
    </form>
  );
}

