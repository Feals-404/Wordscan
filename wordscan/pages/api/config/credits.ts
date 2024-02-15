import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/utils/DBConfig';
import Config from '@/models/Config';
import WPScanAPI from '@/utils/WPScanApi';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  switch (req.method) {
    case 'GET':
      try {
        const config = await Config.findOne();
        if (!config || !config.config || config.config.apiTokens == "0000000000000000000000000000") {
          throw new Error('missing apiTokens');
        }
        let WPScanQuery = new WPScanAPI(config.config.apiTokens);
        const totalCredits = await WPScanQuery.getTotalCredits();
        res.json({ success: true, "wpscan_credit_remaining": totalCredits });
       
      } catch (error) {
        res.status(200).json({ success: false, "wpscan_credit_remaining": "0" });
      }
      break;
    default:
      res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
}