
import { CheckIn } from '../types';

const API_BASE = '/api';

export const db = {
  async saveCheckIn(checkIn: Omit<CheckIn, 'id' | 'timestamp'>): Promise<CheckIn> {
    const response = await fetch(`${API_BASE}/checkins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkIn),
    });
    
    if (!response.ok) {
      let errorMsg = 'Failed to save check-in';
      try {
        const errorData = await response.json();
        errorMsg = errorData.details || errorData.error || errorMsg;
      } catch (e) {
        // Fallback if not JSON
      }
      throw new Error(errorMsg);
    }
    return response.json();
  },

  async getAllCheckIns(): Promise<CheckIn[]> {
    try {
      const response = await fetch(`${API_BASE}/checkins`);
      if (!response.ok) return [];
      return response.json();
    } catch (err) {
      console.error('Fetch error:', err);
      return [];
    }
  },

  async seedData(): Promise<{count: number}> {
    const response = await fetch(`${API_BASE}/seed`, {
      method: 'POST',
    });
    if (!response.ok) {
      let errorMsg = 'Seeding failed';
      try {
        const errorData = await response.json();
        errorMsg = errorData.details || errorData.error || errorMsg;
      } catch (e) {}
      throw new Error(errorMsg);
    }
    return response.json();
  },

  async clearAll(): Promise<void> {
    console.warn('Clear all not implemented on server for safety');
  }
};
