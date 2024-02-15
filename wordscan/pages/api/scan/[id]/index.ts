import type { NextApiRequest, NextApiResponse } from 'next';
import ScanResult from '@/models/ScanResult';
import connectDB from '@/utils/DBConfig';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  await connectDB();

  switch (req.method) {
    case 'GET':
      try {
        const scanResult = await ScanResult.findOne({ scan_id: id }).select('-_id -__v');

        if (!scanResult) {
          return res.status(404).json({ success: false, message: 'Scan result not found' });
        }

        res.status(200).json({ success: true, scan_result: scanResult });
      } catch (error) {
        console.error('Error retrieving scan result:', error);
        res.status(500).json({ success: false, message: 'Error retrieving scan result' });
      }
      break;
    case 'DELETE':
      try {
        const deletedScanResult = await ScanResult.findOneAndDelete({ scan_id: id });

        if (!deletedScanResult) {
          return res.status(404).json({ success: false, message: 'Scan result not found' });
        }

        return res.status(200).json({ success: true, message: 'Scan result deleted' });
      } catch (error) {
        console.error('Error deleting scan result:', error);
        return res.status(500).json({ success: false, message: 'Error deleting scan result' });
      }
      break;
    default:
      res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
}  