
import { Country, Tag } from './types';

export const COUNTRIES: Country[] = [
  { code: 'VN', name: '越南' },
  { code: 'TH', name: '泰國' },
  { code: 'ID', name: '印尼' },
  { code: 'FR', name: '法國' },
  { code: 'GB', name: '英國' },
  { code: 'KR', name: '韓國' },
  { code: 'JP', name: '日本' },
];

export const TAGS: Tag[] = [
  { id: 'authentic', label: '味道超道地', icon: '🔥' },
  { id: 'wanna_more', label: '吃了還想吃', icon: '😋' },
  { id: 'beautiful', label: '看起來超美', icon: '📸' },
  { id: 'value', label: 'CP值無敵強', icon: '💰' },
  { id: 'stall', label: '攤位超漂亮', icon: '🏮' },
  { id: 'service', label: '服務超熱情', icon: '💖' },
];

export const DAYS = [1, 2, 3];

// SQL Schema for reference when deploying to real PostgreSQL
export const SQL_SCHEMA = `
CREATE TABLE check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nickname TEXT NOT NULL,
    day INTEGER NOT NULL,
    country_code TEXT NOT NULL,
    tags TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;
