import { RegisterUserDto } from '@gala-chain/api';
import { NextApiRequest, NextApiResponse } from 'next';

// Replace this with your actual admin private key
const ADMIN_PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!ADMIN_PRIVATE_KEY) {
  throw new Error('ADMIN_PRIVATE_KEY is not defined in the environment variables');
}

const handler = async (req = NextApiRequest, res = NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { publicKey, user } = req.body;

    if (!publicKey || !user) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // Create the DTO and sign it
    const dto = new RegisterUserDto();
    dto.publicKey = publicKey;
    dto.user = user;
    dto.sign(ADMIN_PRIVATE_KEY);

    // Return the serialized and signed DTO
    return res.status(200).json({ signature: dto.signature, payload: dto.serialize() });
  } catch (error) {
    console.error('Error generating admin signature:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default handler;
