import React, { useState, useEffect, useCallback } from 'react';
import FormField from './components/FormField';
import MoodSelector from './components/MoodSelector';
import AnalysisDisplay from './components/AnalysisDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import TabButton from './components/TabButton';
import AnalysisResultPage from './components/AnalysisResultPage'; // New component
import { HealthFormData, MoodOption } from './types';
import { getHealthAnalysis } from './services/geminiService';

const initialFormData: HealthFormData = {
  height: '',
  weight: '',
  age: '',
  bloodPressureSystolic: '',
  bloodPressureDiastolic: '',
  temperature: '',
  oxygenSaturation: '',
  pulseRate: '',
  stepsToday: '',
  caloriesBurned: '',
  physicalComplaints: '',
  bloodSugar: '',
  cholesterol: '',
  uricAcid: '',
  mood: MoodOption.SENANG,
  customMood: '',
  feelingsToday: '',
};

// Helper: BMI Icon
const BmiIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2 text-primary">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
  </svg>
);

type TabName = 'fisik' | 'medis' | 'psikis';
type AppView = 'form' | 'analysis';

const App: React.FC = () => {
  const [formData, setFormData] = useState<HealthFormData>(initialFormData);
  const [bmi, setBmi] = useState<string>('N/A');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<TabName>('fisik');
  const [currentView, setCurrentView] = useState<AppView>('form');

  const calculateBmi = useCallback((heightCm: string, weightKg: string) => {
    const height = parseFloat(heightCm);
    const weight = parseFloat(weightKg);
    if (height > 0 && weight > 0) {
      const heightM = height / 100;
      const bmiValue = weight / (heightM * heightM);
      setBmi(bmiValue.toFixed(2));
    } else {
      setBmi('N/A');
    }
  }, []);

  useEffect(() => {
    calculateBmi(formData.height, formData.weight);
  }, [formData.height, formData.weight, calculateBmi]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  
  const handleMoodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, mood: e.target.value, customMood: e.target.value === MoodOption.LAINNYA ? prev.customMood : '' }));
  };

  const handleCustomMoodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, customMood: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    if (!process.env.API_KEY) {
        setError("API Kunci Gemini tidak dikonfigurasi. Silakan cek environment variable.");
        setIsLoading(false);
        return;
    }

    try {
      const result = await getHealthAnalysis(formData);
      setAnalysisResult(result);
      setCurrentView('analysis'); // Switch to analysis view
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Terjadi kesalahan yang tidak diketahui.');
      }
      setCurrentView('form'); // Stay on form view if error
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBackToForm = () => {
    setCurrentView('form');
    setAnalysisResult(null);
    setError(null);
    setFormData(initialFormData); // Reset form data
    setActiveFormTab('fisik'); // Optionally reset to the first tab
  };

  const isFormValid = () => {
    const fisikValid = formData.height && formData.weight && formData.age;
    const psikisValid = (formData.mood !== MoodOption.LAINNYA || (formData.mood === MoodOption.LAINNYA && formData.customMood.trim() !== '')) &&
                       formData.feelingsToday.trim() !== '';
    return fisikValid && psikisValid;
  };


  return (
    <div className="min-h-screen bg-lightBg p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary">AI Health Analyser</h1>
        <p className="text-lg text-gray-600 mt-2">
          {currentView === 'form' 
            ? 'Dapatkan interpretasi dan rekomendasi kesehatan personal dari AI.'
            : 'Hasil Analisa Kesehatan AI Anda.'}
        </p>
      </header>

      {currentView === 'form' && (
        <main className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg p-6 sm:p-8">
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto" aria-label="Tabs">
              <TabButton
                label="Data Fisik"
                isActive={activeFormTab === 'fisik'}
                onClick={() => setActiveFormTab('fisik')}
                ariaControls="data-fisik-panel"
              />
              <TabButton
                label="Data Medis (Ops.)"
                isActive={activeFormTab === 'medis'}
                onClick={() => setActiveFormTab('medis')}
                ariaControls="data-medis-panel"
              />
              <TabButton
                label="Data Psikis"
                isActive={activeFormTab === 'psikis'}
                onClick={() => setActiveFormTab('psikis')}
                ariaControls="data-psikis-panel"
              />
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {activeFormTab === 'fisik' && (
              <section id="data-fisik-panel" role="tabpanel" aria-labelledby="tab-fisik">
                <h2 className="text-xl sm:text-2xl font-semibold text-secondary mb-4">Data Fisik</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Tinggi Badan" id="height" type="number" value={formData.height} onChange={handleChange} unit="cm" placeholder="Contoh: 170" required />
                  <FormField label="Berat Badan" id="weight" type="number" value={formData.weight} onChange={handleChange} unit="kg" placeholder="Contoh: 65" required />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Body Mass Index (BMI)</label>
                    <div className="mt-1 flex items-center p-3 bg-gray-100 border border-gray-300 rounded-md text-gray-700" aria-live="polite">
                      <BmiIcon/> {bmi}
                    </div>
                  </div>
                  <FormField label="Usia" id="age" type="number" value={formData.age} onChange={handleChange} unit="tahun" placeholder="Contoh: 30" required />
                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField label="Tekanan Darah Sistolik" id="bloodPressureSystolic" type="number" value={formData.bloodPressureSystolic} onChange={handleChange} unit="mmHg" placeholder="Contoh: 120" />
                    <FormField label="Tekanan Darah Diastolik" id="bloodPressureDiastolic" type="number" value={formData.bloodPressureDiastolic} onChange={handleChange} unit="mmHg" placeholder="Contoh: 80" />
                  </div>
                  <FormField label="Suhu Tubuh" id="temperature" type="number" value={formData.temperature} onChange={handleChange} unit="°C" placeholder="Contoh: 36.5" step="0.1" />
                  <FormField label="Saturasi Oksigen (SpO2)" id="oxygenSaturation" type="number" value={formData.oxygenSaturation} onChange={handleChange} unit="%" placeholder="Contoh: 98" />
                  <FormField label="Denyut Nadi" id="pulseRate" type="number" value={formData.pulseRate} onChange={handleChange} unit="BPM" placeholder="Contoh: 70" />
                  <FormField label="Langkah Hari Ini" id="stepsToday" type="number" value={formData.stepsToday} onChange={handleChange} unit="langkah" placeholder="Contoh: 5000" />
                  <FormField label="Kalori Terbakar Hari Ini" id="caloriesBurned" type="number" value={formData.caloriesBurned} onChange={handleChange} unit="kcal" placeholder="Contoh: 300" />
                  <div className="md:col-span-2">
                    <FormField label="Keluhan Fisik yang Dirasakan" id="physicalComplaints" type="textarea" value={formData.physicalComplaints} onChange={handleChange} placeholder="Jelaskan keluhan fisik Anda..." />
                  </div>
                </div>
              </section>
            )}

            {activeFormTab === 'medis' && (
              <section id="data-medis-panel" role="tabpanel" aria-labelledby="tab-medis">
                <h2 className="text-xl sm:text-2xl font-semibold text-secondary mb-4">Data Medis Tambahan (Opsional)</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField label="Gula Darah" id="bloodSugar" type="number" value={formData.bloodSugar || ''} onChange={handleChange} unit="mg/dL" placeholder="Contoh: 90" />
                  <FormField label="Kolesterol Total" id="cholesterol" type="number" value={formData.cholesterol || ''} onChange={handleChange} unit="mg/dL" placeholder="Contoh: 180" />
                  <FormField label="Asam Urat" id="uricAcid" type="number" value={formData.uricAcid || ''} onChange={handleChange} unit="mg/dL" placeholder="Contoh: 5.0" step="0.1"/>
                </div>
              </section>
            )}

            {activeFormTab === 'psikis' && (
               <section id="data-psikis-panel" role="tabpanel" aria-labelledby="tab-psikis">
                <h2 className="text-xl sm:text-2xl font-semibold text-secondary mb-4">Data Psikis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <MoodSelector selectedMood={formData.mood} customMood={formData.customMood} onMoodChange={handleMoodChange} onCustomMoodChange={handleCustomMoodChange} />
                  <div className="md:col-span-2">
                     <FormField label="Perasaan Hari Ini" id="feelingsToday" type="textarea" value={formData.feelingsToday} onChange={handleChange} placeholder="Ceritakan bagaimana perasaan Anda hari ini..." required />
                  </div>
                </div>
              </section>
            )}
            
            <button 
              type="submit" 
              disabled={isLoading || !isFormValid()}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:bg-gray-400 disabled:cursor-not-allowed"
              aria-live="polite"
            >
              {isLoading ? <LoadingSpinner /> : 'Analisa Sekarang'}
            </button>
          </form>

          {error && !isLoading && (
            <div role="alert" className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}
        </main>
      )}

      {currentView === 'analysis' && analysisResult && !isLoading && (
        <AnalysisResultPage analysisText={analysisResult} onGoBack={handleGoBackToForm} />
      )}
       {currentView === 'analysis' && error && !isLoading && ( // Show error on analysis page if API call failed during analysis view
          <main className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg p-6 sm:p-8">
            <div role="alert" className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                <p className="font-semibold">Error:</p>
                <p>{error}</p>
            </div>
            <button 
                onClick={handleGoBackToForm}
                className="mt-6 w-full flex justify-center items-center py-3 px-4 border border-primary rounded-md shadow-sm text-lg font-medium text-primary bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
            >
                Kembali ke Form
            </button>
          </main>
        )}


      <footer className="text-center mt-12 py-4 text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} AI Health Analyser. Didukung oleh Gemini AI.</p>
      </footer>
    </div>
  );
};

export default App;
