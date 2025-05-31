import React, { useState, useMemo } from 'react';
import TabButton from './TabButton';
import AnalysisDisplay from './AnalysisDisplay'; // Reused for recommendations tab

interface AnalysisResultPageProps {
  analysisText: string;
  onGoBack: () => void;
}

type AnalysisTabName = 'interpretasi' | 'penyebab' | 'rekomendasi';

interface ParsedAnalysisSections {
  interpretation: string;
  causes: string;
  recommendations: string;
}

const parseAnalysisText = (text: string): ParsedAnalysisSections => {
  const sections: ParsedAnalysisSections = {
    interpretation: "Tidak ada data interpretasi yang ditemukan.",
    causes: "Tidak ada data kemungkinan penyebab yang ditemukan.",
    recommendations: "Tidak ada data rekomendasi yang ditemukan."
  };

  // Regex to capture content between section titles or until the end of the string
  // Section 1: Interpretasi
  const interpretationMatch = text.match(/1\.\s*\*\*Interpretasi Kondisi Saat Ini:\*\*\s*([\s\S]*?)(?=\n2\.\s*\*\*|$)/);
  if (interpretationMatch && interpretationMatch[1]) {
    sections.interpretation = interpretationMatch[1].trim();
  }

  // Section 2: Kemungkinan Penyebab
  const causesMatch = text.match(/2\.\s*\*\*Kemungkinan Penyebab:\*\*\s*([\s\S]*?)(?=\n3\.\s*\*\*|$)/);
  if (causesMatch && causesMatch[1]) {
    sections.causes = causesMatch[1].trim();
  }

  // Section 3: Rekomendasi Praktis
  // We capture the entire section including its title because AnalysisDisplay expects it
  const recommendationsMatch = text.match(/(3\.\s*\*\*Rekomendasi Praktis Hari Ini:\*\*\s*[\s\S]*)/);
   if (recommendationsMatch && recommendationsMatch[1]) {
    sections.recommendations = recommendationsMatch[1].trim();
  } else {
     // Fallback for slight variations if the main title isn't exactly "Rekomendasi Praktis Hari Ini"
     const genericRecMatch = text.match(/(3\.\s*\*\*(?:.*?):\*\*\s*[\s\S]*)/);
     if (genericRecMatch && genericRecMatch[1]) {
        sections.recommendations = genericRecMatch[1].trim();
     }
  }
  
  // If recommendations are still empty, try a broader catch for anything starting with "3."
  // This is a less specific fallback.
  if (!sections.recommendations.startsWith("3.")) {
    const broaderRecMatch = text.split(/\n(?=\d\.\s*\*\*)/).find(s => s.startsWith("3."));
    if (broaderRecMatch) {
        sections.recommendations = broaderRecMatch.trim();
    }
  }


  return sections;
};


const AnalysisResultPage: React.FC<AnalysisResultPageProps> = ({ analysisText, onGoBack }) => {
  const [activeTab, setActiveTab] = useState<AnalysisTabName>('interpretasi');

  const parsedSections = useMemo(() => parseAnalysisText(analysisText), [analysisText]);

  return (
    <main className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg p-6 sm:p-8">
      <h2 className="text-3xl font-bold text-primary mb-6 text-center">Hasil Analisa Kesehatan AI</h2>
      
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto" aria-label="Analysis Tabs">
          <TabButton
            label="Interpretasi"
            isActive={activeTab === 'interpretasi'}
            onClick={() => setActiveTab('interpretasi')}
            ariaControls="interpretasi-panel"
          />
          <TabButton
            label="Kemungkinan Penyebab"
            isActive={activeTab === 'penyebab'}
            onClick={() => setActiveTab('penyebab')}
            ariaControls="penyebab-panel"
          />
          <TabButton
            label="Rekomendasi Praktis"
            isActive={activeTab === 'rekomendasi'}
            onClick={() => setActiveTab('rekomendasi')}
            ariaControls="rekomendasi-panel"
          />
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'interpretasi' && (
          <section id="interpretasi-panel" role="tabpanel" aria-labelledby="tab-interpretasi" className="prose max-w-none">
            <h3 className="text-xl font-semibold text-secondary mb-3">Interpretasi Kondisi Saat Ini</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{parsedSections.interpretation}</p>
          </section>
        )}
        {activeTab === 'penyebab' && (
          <section id="penyebab-panel" role="tabpanel" aria-labelledby="tab-penyebab" className="prose max-w-none">
             <h3 className="text-xl font-semibold text-secondary mb-3">Kemungkinan Penyebab</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{parsedSections.causes}</p>
          </section>
        )}
        {activeTab === 'rekomendasi' && (
          <section id="rekomendasi-panel" role="tabpanel" aria-labelledby="tab-rekomendasi">
            {/* AnalysisDisplay expects the full text for the section it's displaying, including its title */}
            <AnalysisDisplay analysis={parsedSections.recommendations} />
          </section>
        )}
      </div>

      <button
        onClick={onGoBack}
        className="mt-8 w-full flex justify-center items-center py-3 px-4 border border-primary rounded-md shadow-sm text-lg font-medium text-primary bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
      >
        Analisa Data Baru
      </button>
    </main>
  );
};

export default AnalysisResultPage;
