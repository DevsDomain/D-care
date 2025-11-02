export interface CaregiverInput {
  crm_coren?: string;
  bio?: string;
  userId?: string;
  // Campos adicionais aceitos na criação/atualização:
  [key: string]: unknown;
}

export type CaregiverRaw = {
  id: string;
  userId: string;
  name: string;
  crm_coren: string | null;
  avatarPath: string | null;
  validated: boolean;
  bio: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  experience: string | null;
  price_range: string | null;
  availability: boolean;
  emergency: boolean;
  skills: string[] | null;
  languages: string[] | null;
  specializations: string[] | null;
  distance_meters: number;
  location_wkt: string;
  rating: number;
  review_count?: number;
};
