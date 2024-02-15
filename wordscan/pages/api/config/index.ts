import type { NextApiRequest, NextApiResponse } from 'next';
import Config from '@/models/Config';
import connectDB from '@/utils/DBConfig';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  switch (req.method) {
    case 'GET':
      try {
        const config = await Config.findOne();
        const { _id, __v, ...configData } = config.toObject();
        res.status(200).json(configData);
      } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
      }
      break;
    case 'PUT':
      try {
        const { user_agent, threads, ignore_code, ignore_size, apiTokens } = req.body.config;
        await Config.findOneAndUpdate({}, { config: { user_agent, threads, ignore_code, ignore_size, apiTokens } });
        res.status(200).json({ success: true, message: 'Config updated successfully' });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
      }
      break;
    default:
      res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
}

