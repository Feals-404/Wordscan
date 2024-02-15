import type { NextApiRequest, NextApiResponse } from 'next';
import Wordlist from '@/models/Wordlist';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'GET') {
        try {
            const wordlist = await Wordlist.findOne();
            if (wordlist) {
                const plugins = wordlist.wordlists.plugins;
                res.status(200).json({ plugins });
            } else {
                res.status(404).json({ success: false, message: "Wordlist not found" });
            }
        } catch (error) {
            console.error('Error in fetching plugins:', error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    } else {
        res.status(405).json({ success: false, message: "Method Not Allowed" });
    }
}
