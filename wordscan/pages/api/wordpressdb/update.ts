import { NextApiRequest, NextApiResponse } from 'next';
import axios, { AxiosResponse } from 'axios';

import Wordlist, { WordlistDocument } from '@/models/Wordlist';

const axiosInstance = axios.create({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
    }
});

const getLatestList = async (): Promise<{ success: boolean; message?: string }> => {
    try {
        const wordlist: WordlistDocument | null = await Wordlist.findOne();
        const oneDayAgo: Date = new Date(Date.now() - 24 * 60 * 60 * 1000);

        if (wordlist && wordlist.wordlists.last_sync_date >= oneDayAgo) {
            return { success: false, message: 'Last sync performed less than 1 day ago.' };
        }

        const updatedWordlist: WordlistDocument = wordlist ?? new Wordlist();
        updatedWordlist.wordlists.plugins = [];
        updatedWordlist.wordlists.themes = [];

        const urls = ['https://plugins.svn.wordpress.org/', 'https://themes.svn.wordpress.org/'];

        for (const urlString of urls) {
            const response: AxiosResponse = await axiosInstance.get(urlString);
            const text: string = parseResponse(response);

            if (urlString.includes('plugins')) {
                updatedWordlist.wordlists.plugins = text.split('\n');
            } else if (urlString.includes('themes')) {
                updatedWordlist.wordlists.themes = text.split('\n');
            }
        }

        updatedWordlist.wordlists.last_sync_date = new Date();
        await updatedWordlist.save();

        return { success: true };
      } catch (error) {
        if (error instanceof Error) {
            console.error('Error in getLatestList:', error);
            return { success: false, message: error.message };
        } else {
            console.error('Unknown error in getLatestList:', error);
            return { success: false, message: 'Unknown error occurred.' };
        }
    }
};

const parseResponse = (response: AxiosResponse): string => {
  const cleanedText = response.data
      .replace(/<\/?[^>]+(>|$)/gm, '')
      .replace(/\//g, '')
      .replace(/ \+/g, '')
      .replace(/ - Revision\s*\d+:/g, '')
      .replace(/Powered by Apache .*$/gm, '')
      .replace(/^\s+/gm, '')
      .replace(/^\s*[\r\n]/gm, '');

  return cleanedText;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method === 'GET') {
        try {
            const result = await getLatestList();
            if (result.success) {
                res.status(200).json({ success: true, message: 'Latest list retrieved successfully.' });
            } else {
                res.status(200).json({ success: false, message: result.message });
            }
        } catch (error) {
            console.error('Error in handler:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    } else {
        res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }
}