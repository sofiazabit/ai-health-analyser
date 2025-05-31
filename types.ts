
export interface HealthFormData {
  height: string;
  weight: string;
  age: string;
  bloodPressureSystolic: string;
  bloodPressureDiastolic: string;
  temperature: string;
  oxygenSaturation: string;
  pulseRate: string;
  stepsToday: string;
  caloriesBurned: string;
  physicalComplaints: string;
  bloodSugar?: string;
  cholesterol?: string;
  uricAcid?: string;
  mood: string;
  customMood: string;
  feelingsToday: string;
}

export enum MoodOption {
  SENANG = "Senang",
  SEDIH = "Sedih",
  CEMAS = "Cemas",
  TENANG = "Tenang",
  BERSEMANGAT = "Bersemangat",
  LELAH = "Lelah",
  STRES = "Stres",
  LAINNYA = "Lainnya..."
}
