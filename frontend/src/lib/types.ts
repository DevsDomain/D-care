/**
 * D-care Platform Types
 * TypeScript definitions for the elderly care platform
 */

export interface TimeSlot {
  start: string; // ISO time string like "09:00"
  end: string; // ISO time string like "17:00"
  day:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
}

export interface Caregiver {
  id: string;
  name: string;
  photo: string;
  verified: boolean;
  crmCorem?: string; // CRM/COREM professional registration number
  rating: number; // 0-5 stars
  reviewCount: number;
  distanceKm: number;
  skills: string[]; // e.g., ["Elderly Care", "Medical Administration", "Mobility Assistance"]
  experience: string; // e.g., "5+ years"
  priceRange: string; // e.g., "R$ 25-35/hora"
  emergency: boolean; // Available for emergency calls
  availability: TimeSlot[];
  bio: string;
  phone: string;
  languages: string[];
  specializations: string[]; // e.g., ["Alzheimer", "Diabetes", "Post-surgery"]
  verificationBadges: (
    | "CRM"
    | "COREM"
    | "Background Check"
    | "First Aid Certified"
  )[];
}

export interface Elder {
  id: string;
  name: string;
  birthDate: Date;
  photo?: string;
  avatarFile: File | null;
  conditions: string[]; // Health conditions like ["Diabetes", "Hypertension"]
  medications: string[];
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    number: string;
  };
  preferences: {
    gender?: "male" | "female" | "any";
    language?: string[];
    specialNeeds?: string[];
  };
  createdAt: string;
}

export type BookingStatus =
  | "requested"
  | "accepted"
  | "in-progress"
  | "completed"
  | "canceled"
  | "expired";

export interface Booking {
  id: string;
  caregiverId: string;
  caregiver?: Caregiver; // Populated for display
  elderId: string;
  elder?: Elder; // Populated for display
  dateISO: string; // ISO date-time string
  duration: number; // Duration in hours
  status: BookingStatus;
  emergency: boolean;
  notes?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  services: string[]; // e.g., ["Personal Care", "Medication Management"]
}

export interface Review {
  id: string;
  bookingId: string;
  caregiverId: string;
  elderName: string; // For caregiver to see who reviewed
  rating: number; // 1-5 stars
  comment: string;
  createdAt: string;
  helpfulCount: number;
  services: string[]; // Which services were reviewed
}

export type IvcfCategory = "independent" | "at-risk" | "frail";

export interface IvcfResult {
  id: string;
  elderId: string;
  score: number; // 0-20 total score
  category: IvcfCategory;
  tips: string[];
  recommendations: string[];
  answers: Record<string, number>; // Question ID -> Answer value
  completedAt: string;
  validUntil: string; // Results expire after 6 months
}

export interface IvcfQuestion {
  id: string;
  category: "instrumental" | "cognitive" | "social";
  question: string;
  description?: string;
  options: {
    value: number; // 0, 1, or 2 points
    label: string;
    description?: string;
  }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "family" | "caregiver";
  photo?: string;
  createdAt: string;
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    emergencyAlerts: boolean;
  };
  // Family-specific fields
  elders?: Elder[];
  // Caregiver-specific fields
  caregiverProfile?: Caregiver;
}

export interface SearchFilters {
  distanceKm?: number;
  availability?: {
    date: string;
    startTime: string;
    endTime: string;
  };
  emergency?: boolean;
  verified?: boolean;
  skills?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number; // Minimum rating
  specializations?: string[];
}

export interface NotificationMessage {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "booking" | "review" | "system" | "emergency";
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
