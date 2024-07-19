//// ./app/api/upload/route.js

import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  const data = await request.formData();
  const file = data.get('file');

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // With the file data in the buffer, you can do whatever you want with it.
  // For this example, we'll just write it to the filesystem in a new location
  const filename = file.name.replace(/\s/g, '-');
  const publicPath = path.join(process.cwd(), 'public', 'uploads');
  const filePath = path.join(publicPath, filename);

  try {
    await writeFile(filePath, buffer);
    console.log(`Uploaded file saved at ${filePath}`);
    return NextResponse.json({ 
      message: "File uploaded successfully", 
      url: `/uploads/${filename}` 
    });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ error: "Error uploading file" }, { status: 500 });
  }
}

