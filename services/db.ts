// 前端 API 調用服務

interface CheckInInput {
  nickname: string;
  day: number;
  countryCode: string;
  tags: string[];
}

interface CheckIn {
  id: string;
  nickname: string;
  day: number;
  countryCode: string;
  tags: string[];
  timestamp: number;
}

export const db = {
  async saveCheckIn(data: CheckInInput): Promise<void> {
    const res = await fetch('/api/checkins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || err.error || 'Failed to save check-in');
    }
  },

  async getAllCheckIns(): Promise<CheckIn[]> {
    const res = await fetch('/api/checkins');
    if (!res.ok) {
      throw new Error('Failed to fetch check-ins');
    }
    return res.json();
  },

  async seedData(): Promise<void> {
    const res = await fetch('/api/seed', { method: 'POST' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to seed data');
    }
  }
};
