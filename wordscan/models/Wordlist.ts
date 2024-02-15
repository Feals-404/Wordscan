import mongoose, { Document, Schema } from 'mongoose';

export interface WordlistDocument extends Document {
  wordlists: {
    plugins: string[];
    themes: string[];
    last_sync_date: Date;
  };
}

const wSchema: Schema<WordlistDocument> = new mongoose.Schema({
  wordlists: {
    plugins: [String],
    themes: [String],
    last_sync_date: { type: Date, default: Date.now }
  }
});

const Wordlist = mongoose.models.Wordlist || mongoose.model<WordlistDocument>('Wordlist', wSchema);

export default Wordlist;