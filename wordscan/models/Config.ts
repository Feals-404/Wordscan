import mongoose, { Schema, Document } from 'mongoose';

export interface ConfigDocument extends Document {
  apiTokens: string[];
  user_agent: string;
  config: {
    user_agent: string;
    threads: number;
    ignore_code: string[];
    ignore_size: string[];
    apiTokens: string[];
  }
}

const ConfigSchema: Schema<ConfigDocument> = new mongoose.Schema({
  config: {
    user_agent: { type: String, required: true },
    threads: { type: Number, required: true },
    ignore_code: [{ type: String, required: true }],
    ignore_size: [{ type: String, required: true }],
    apiTokens: [{ type: String, required: true }],
  }
});

export default mongoose.models.Config || mongoose.model<ConfigDocument>('Config', ConfigSchema);