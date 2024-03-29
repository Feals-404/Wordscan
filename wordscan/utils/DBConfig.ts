import mongoose from 'mongoose';

async function connectDB() {
    if (mongoose.connections[0].readyState) return;
    await mongoose.connect('mongodb://wordscan_mongodb:27017/wordscan');
}

export default connectDB;