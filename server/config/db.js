import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FALLBACK_DB_PATH = path.join(__dirname, '..', 'data', 'db_fallback.json');

// Ensure data directory exists
const dataDir = path.dirname(FALLBACK_DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial structure for fallback JSON database
const initialData = {
  users: [],
  events: [],
  tasks: [],
  applications: [],
  certificates: []
};

if (!fs.existsSync(FALLBACK_DB_PATH)) {
  fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
}

export const getFallbackDb = () => {
  try {
    const raw = fs.readFileSync(FALLBACK_DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading fallback database:', error);
    return initialData;
  }
};

export const saveFallbackDb = (data) => {
  try {
    fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing to fallback database:', error);
    return false;
  }
};

let isConnected = false;
let useMock = false;

export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.warn('\n⚠️ WARNING: MONGO_URI environment variable is not defined.');
    console.warn('⚡ FALLBACK ACTIVATED: Operating with a local file-based database (JSON) in the server/data folder.\n');
    useMock = true;
    isConnected = false;
    return;
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);
    isConnected = true;
    useMock = false;
  } catch (error) {
    console.error(`❌ Database connection error: ${error.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

export const checkUseMock = () => useMock;
export const checkIsConnected = () => isConnected;
