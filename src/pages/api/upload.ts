import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
  });

  form.parse(req, (err: any, fields: any, files: any) => {
    console.log('fields:', fields);
    console.log('files:', files);
    const file =
      files.file
        ? Array.isArray(files.file) ? files.file[0] : files.file
        : files.profilePicture
          ? Array.isArray(files.profilePicture) ? files.profilePicture[0] : files.profilePicture
          : null;
    if (!file) {
      console.error('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileUrl = `/uploads/${path.basename(file.filepath)}`;
    res.status(200).json({ url: fileUrl });
  });
}

// Client-side code (e.g., in a React component)
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('file', file); // must be 'file'
  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  // ...handle response...
};