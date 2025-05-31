
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { HealthFormData } from '../types';

// IMPORTANT: API Key must be set as an environment variable `process.env.API_KEY`
// DO NOT hardcode the API key here.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("Gemini API key not found. Please set process.env.API_KEY.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "MISSING_API_KEY" }); // Fallback to prevent crash if key is missing during init
const model = 'gemini-2.5-flash-preview-04-17';

const calculateBMI = (heightCm: string, weightKg: string): string => {
  const height = parseFloat(heightCm);
  const weight = parseFloat(weightKg);
  if (height > 0 && weight > 0) {
    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    return bmi.toFixed(2);
  }
  return "N/A";
};

export const getHealthAnalysis = async (data: HealthFormData): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API Kunci Gemini tidak ditemukan. Mohon periksa konfigurasi environment variable.");
  }

  const bmi = calculateBMI(data.height, data.weight);
  const finalMood = data.mood === "Lainnya..." ? data.customMood : data.mood;

  let prompt = `Anda adalah asisten kesehatan AI yang suportif dan ramah. Berdasarkan data berikut, berikan analisis kesehatan dalam Bahasa Indonesia:

Data Fisik:
- Tinggi Badan: ${data.height || 'Tidak diisi'} cm
- Berat Badan: ${data.weight || 'Tidak diisi'} kg
- Body Mass Index (BMI): ${bmi}
- Usia: ${data.age || 'Tidak diisi'} tahun
- Tekanan Darah: ${data.bloodPressureSystolic || 'N/A'}/${data.bloodPressureDiastolic || 'N/A'} mmHg
- Suhu Tubuh: ${data.temperature || 'Tidak diisi'} °C
- Saturasi Oksigen: ${data.oxygenSaturation || 'Tidak diisi'} %
- Denyut Nadi: ${data.pulseRate || 'Tidak diisi'} BPM
- Langkah Hari Ini: ${data.stepsToday || 'Tidak diisi'} langkah
- Kalori Terbakar Hari Ini: ${data.caloriesBurned || 'Tidak diisi'} kcal
- Keluhan Fisik: ${data.physicalComplaints || 'Tidak ada'}
`;

  const optionalMedicalData = [];
  if (data.bloodSugar) optionalMedicalData.push(`- Gula Darah: ${data.bloodSugar} mg/dL`);
  if (data.cholesterol) optionalMedicalData.push(`- Kolesterol Total: ${data.cholesterol} mg/dL`);
  if (data.uricAcid) optionalMedicalData.push(`- Asam Urat: ${data.uricAcid} mg/dL`);

  if (optionalMedicalData.length > 0) {
    prompt += `\nData Medis Tambahan:\n${optionalMedicalData.join('\n')}\n`;
  }

  prompt += `
Data Psikis:
- Mood: ${finalMood || 'Tidak diisi'}
- Perasaan Hari Ini: ${data.feelingsToday || 'Tidak ada'}

Mohon berikan analisis dalam format berikut:
1. **Interpretasi Kondisi Saat Ini:** (Jelaskan kondisi fisik dan psikis berdasarkan data yang ada)
2. **Kemungkinan Penyebab:** (Sebutkan beberapa kemungkinan penyebab kondisi tersebut secara ringan dan edukatif. Fokus pada faktor gaya hidup jika memungkinkan.)
3. **Rekomendasi Praktis Hari Ini:** (Berikan 2-3 rekomendasi spesifik dan actionable untuk hari ini, meliputi:
    * Makanan: [Sebutkan contoh makanan/minuman dan alasannya secara singkat]
    * Aktivitas Fisik: [Sebutkan contoh aktivitas fisik ringan/sedang dan manfaatnya]
    * Aktivitas Mental: [Sebutkan contoh aktivitas untuk relaksasi/peningkatan mood dan tujuannya])

Gunakan gaya bahasa yang suportif, ringan, dan mudah dipahami. Hindari diagnosa medis definitif. Fokus pada saran gaya hidup sehat.
Pastikan setiap poin rekomendasi (Makanan, Aktivitas Fisik, Aktivitas Mental) dimulai dengan tanda bintang (*).
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      // No thinkingConfig, use default for higher quality
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        // Check for specific API related error messages if available
        if (error.message.includes('API key not valid')) {
             throw new Error("API Kunci Gemini tidak valid. Mohon periksa kembali kunci Anda.");
        }
         throw new Error(`Gagal mendapatkan analisa dari AI: ${error.message}`);
    }
    throw new Error("Gagal mendapatkan analisa dari AI: Terjadi kesalahan tidak diketahui.");
  }
};
