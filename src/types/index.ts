export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  location?: string;
  farm_size?: number;
  created_at?: string;
}

export interface Crop {
  id: string;
  farmer_id: string;
  name: string;
  crop_type: string;
  planting_date: string;
  area_size: number;
  location: string;
  irrigation_schedule?: IrrigationSchedule;
  fertilization_schedule?: FertilizationSchedule;
  status: 'planted' | 'growing' | 'harvesting' | 'harvested';
  created_at?: string;
  updated_at?: string;
}

export interface CropType {
  id: string;
  name: string;
  name_ar: string;
  growing_period_days: number;
  water_requirements: string;
  fertilizer_requirements: string;
  irrigation_frequency_days: number;
  fertilization_frequency_days: number;
  season: string;
}

export interface IrrigationSchedule {
  frequency_days: number;
  amount_per_session: string;
  time_of_day: string;
  next_irrigation: string;
}

export interface FertilizationSchedule {
  frequency_days: number;
  fertilizer_type: string;
  amount_per_area: string;
  next_fertilization: string;
}

export interface Notification {
  id: string;
  farmer_id: string;
  title: string;
  message: string;
  type: 'weather' | 'irrigation' | 'fertilization' | 'pest' | 'general';
  is_read: boolean;
  created_at: string;
}

export interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  type: 'temperature' | 'humidity' | 'rain' | 'wind';
  created_at: string;
}