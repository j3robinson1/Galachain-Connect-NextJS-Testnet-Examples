import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const tokenData = req.body;
  const { id, collection } = tokenData || {};

  if (!id || !collection) {
    return res.status(400).json({ error: 'Missing id or collection parameter.' });
  }

  // Build the file path: public/metadata/<collection>/<id>.json
  const filePath = path.join(process.cwd(), 'public', 'metadata', collection, `${id}.json`);

  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    const jsonData = JSON.parse(fileContents);
    return res.status(200).json(jsonData);
  } catch (error) {
    console.error('Error reading metadata file:', error);
    return res.status(404).json({ error: 'Metadata file not found.' });
  }
}
