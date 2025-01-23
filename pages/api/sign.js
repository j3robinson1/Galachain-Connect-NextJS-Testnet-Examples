import { NextApiRequest, NextApiResponse } from 'next';
import { RegisterEthUserDto } from '@gala-chain/api';

const ADMIN_PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!ADMIN_PRIVATE_KEY) {
  throw new Error('ADMIN_PRIVATE_KEY is not defined in the environment variables');
}

const dtoMap = {
  'RegisterEthUser': RegisterEthUserDto,
};

const handler = async (req = NextApiRequest, res = NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { dtoType, publicKey, user } = req.body;

  if (!dtoType || !publicKey || !user) {
    return res.status(400).json({ error: 'Missing required fields: dtoType, publicKey or user' });
  }

  const DtoClass = dtoMap[dtoType];
  if (!DtoClass) {
    return res.status(400).json({ error: 'Invalid dtoType provided' });
  }

  try {
    const dto = new DtoClass();
    dto.publicKey = publicKey;
    dto.user = user;

    dto.sign(ADMIN_PRIVATE_KEY);

    return res.status(200).json({ signature: dto.signature, payload: dto.serialize() });
  } catch (error) {
    console.error('Error generating admin signature:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default handler;
