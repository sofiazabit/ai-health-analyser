import React from 'react';

interface AnalysisDisplayProps {
  analysis: string;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis }) => {
  // Split the analysis by sections based on the Gemini prompt structure
  // If `analysis` prop contains only one section (e.g., only recommendations),
  // this will result in `sections` array with one element.
  const sections = analysis.split(/\n(?=\d\.\s*\*\*)/);

  return (
    <div className="mt-2 bg-white rounded-lg">
      {sections.map((section, index) => {
        const cleanedSection = section.trim();
        if (!cleanedSection) return null;

        // Try to match title like "3. **Rekomendasi Praktis Hari Ini:**"
        // or a more generic "X. **Title:**"
        const titleMatch = cleanedSection.match(/^(\d\.\s*\*\*(.*?)\*\*):/);
        
        let title = `Bagian Analisa ${index + 1}`;
        let content = cleanedSection;

        if (titleMatch && titleMatch[2]) {
          title = titleMatch[2]; // Extracted title, e.g., "Rekomendasi Praktis Hari Ini"
          content = cleanedSection.substring(titleMatch[0].length).trim();
        } else {
          // If no title format like "1. **...**:" is found, treat the whole section as content.
          // This might happen if AnalysisDisplay is used for simpler text blocks in the future.
        }
        
        // Further split content by sub-points like food, activity if present
        const subPoints = content.split(/\n\s*[-\*]\s*/).map(sp => sp.trim()).filter(sp => sp.length > 0);


        return (
          <div key={index} className="mb-4 last:mb-0">
            {titleMatch && <h3 className="text-xl font-semibold text-secondary mb-3">{title}</h3>}
            
            {subPoints.length > 1 && content.includes('* ') ? ( // Check if content likely contains markdown list
              <ul className="list-disc list-inside pl-1 space-y-1 text-gray-700">
                {subPoints.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">{content}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AnalysisDisplay;
