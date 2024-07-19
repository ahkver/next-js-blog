//// ./components/CreateBlog.js

'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from 'next/image';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading Editor...</p>,
});

const categories = [
  "Technology", "Travel", "Food", "Lifestyle", "Fashion",
  "Sports", "Health", "Education", "Business", "Entertainment",
];

export default function CreateBlog({ onBlogCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [tags, setTags] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append('title', title);
  formData.append('content', content);
  formData.append('categories', JSON.stringify(selectedCategories));
  formData.append('tags', tags);
  formData.append('status', 'draft');
  if (coverImage) {
    formData.append('coverImage', coverImage);
  }

  try {
    console.log('Submitting blog post...', Object.fromEntries(formData));
    const response = await fetch('/api/blogs', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    console.log('Server response:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create blog post');
    }

    setTitle('');
    setContent('');
    setSelectedCategories([]);
    setTags('');
    setCoverImage(null);
    setCoverImagePreview(null);
    toast({
      title: "Success",
      description: "Blog post created successfully!",
    });
    if (onBlogCreated) onBlogCreated();
  } catch (error) {
    console.error('Failed to create blog post:', error);
    toast({
      title: "Error",
      description: error.message || "Failed to create blog post. Please try again.",
      variant: "destructive",
    });
  }
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

  if (!mounted) {
    return <p>Loading...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="text"
        placeholder="Blog Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <div>
        <Label htmlFor="coverImage">Cover Image</Label>
        <Input
          id="coverImage"
          type="file"
          onChange={handleCoverImageChange}
          accept="image/*"
        />
        {coverImagePreview && (
          <div className="mt-2">
            <Image src={coverImagePreview} alt="Cover image preview" width={200} height={200} objectFit="cover" />
          </div>
        )}
      </div>
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
        placeholder="Tags (comma-separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />
      <div style={{ height: '400px' }}>
        <ReactQuill 
          theme="snow"
          value={content}
          onChange={setContent}
          modules={quillModules}
          style={{ height: '90%' }}
        />
      </div>
      <Button type="submit" className="w-full mt-4">Create Blog Post</Button>
    </form>
  );
}


