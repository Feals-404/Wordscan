import type { NextApiRequest, NextApiResponse } from 'next';  
import { v4 as uuidv4 } from 'uuid';  
import validUrl from 'valid-url';  
import Config from '@/models/Config';  
import Wordlist from '@/models/Wordlist';  
import ScanResult from '@/models/ScanResult';  
import WPUtils from '@/utils/WPUtils';  
import connectDB from '@/utils/DBConfig';  
  
export default async function handler(req: NextApiRequest, res: NextApiResponse) {  
  await connectDB();  
  
  switch (req.method) {  
    case 'GET':  
      try {  
        const allScanResults = await ScanResult.find({});  
        allScanResults.sort((a, b) => b.scan_date - a.scan_date);  
        const scanResults = allScanResults.map(scanResult => ({  
          id: scanResult.scan_id,  
          scan_date: scanResult.scan_date,  
          status: scanResult.statut,  
          url: scanResult.url,  
        }));  
        res.status(200).json({ scan_results: scanResults });  
      } catch (error) {  
        console.error('Error retrieving scan results:', error);  
        res.status(500).json({ success: false, message: 'Error retrieving scan results' });  
      }  
      break;  
    case 'POST':  
      const { url } = req.body;  
      if (!validUrl.isUri(url)) {  
        return res.status(200).json({ success: false, message: 'URL is not valid' });  
      }  
      try {  
        const config= await Config.findOne();  
        const apiTokens = config.config.apiTokens;  
        const wordlist = await Wordlist.findOne();   
        const scanner = new WPUtils(config, wordlist);   
        const baseUrl = new URL(url).origin;  
        const isWordPress = await scanner.isWordPress(baseUrl);  
        if (isWordPress) {  
            const scanId = uuidv4();  
            scanner.handleScan(baseUrl, scanId);  
            res.status(200).json({ success: true, message: 'Scan started', scan_id: scanId });  
        } else {  
            return res.status(200).json({ success: false, message: 'Target is not a Wordpress' });  
        }  
      } catch (error) {  
        console.error('Error starting scan:', error);  
        res.status(500).json({ success: false, message: 'Error starting scan' });  
      }  
      break;  
    default:  
      res.status(405).json({ success: false, message: 'Method Not Allowed' });  
  }  
}  
