import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { collection, id, metadata } = req.body;

  if (!collection || !id || !metadata) {
    return res.status(400).json({ error: 'Missing required fields: collection, id, metadata' });
  }

  try {
    // Construct the path to the collection folder in "public/metadata/[collection]"
    const metadataDir = path.join(process.cwd(), 'public', 'metadata', collection);

    // Create the folder if it doesn't exist
    if (!fs.existsSync(metadataDir)) {
      fs.mkdirSync(metadataDir, { recursive: true });
    }

    // Construct the file path for the given id
    const filePath = path.join(metadataDir, `${id}.json`);

    // Write the metadata to "[id].json" with pretty formatting
    fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2), 'utf8');

    // Return success response
    return res.status(200).json({ success: true, message: `Wrote file: ${collection}/${id}.json` });
  } catch (err) {
    console.error('Error writing metadata file:', err);
    return res.status(500).json({ error: 'Failed to write metadata file' });
  }
}
