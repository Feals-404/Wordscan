import type { NextApiRequest, NextApiResponse } from 'next';  
import ScanResult from '@/models/ScanResult';  
import connectDB from '@/utils/DBConfig';  
  
export default async function handler(req: NextApiRequest, res: NextApiResponse) {  
  const { id } = req.query;  
  
  await connectDB();  
  
  try {  
    const scanResult = await ScanResult.findOne({ scan_id: id }).select('-_id -__v');  
  
    if (!scanResult) {  
        return res.status(404).json({ success: false, message: 'Scan result not found' });  
    }  
    const fileName = `scan_result_${scanResult.scan_id}.json`;  
    const jsonData = JSON.stringify(scanResult);  
  
    res.setHeader('Content-Type', 'application/json');  
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);  
    res.send(jsonData);  
  
  } catch (error) {  
    console.error('Error retrieving scan result:', error);  
    res.status(500).json({ success: false, message: 'Error retrieving scan result' });  
  }  
}  