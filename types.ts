
export interface BookingData {
  date: string;
  guests: number;
  time: string;
  fullName: string;
  email: string;
  phone: string;
  specialRequests: string;
}

export type BookingStep = 'home' | 'select-time' | 'guest-details' | 'confirmation';
