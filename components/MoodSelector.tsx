
import React from 'react';
import { MoodOption } from '../types'; // Ensure MoodOption is exported from types.ts

interface MoodSelectorProps {
  selectedMood: string;
  customMood: string;
  onMoodChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onCustomMoodChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  customMood,
  onMoodChange,
  onCustomMoodChange,
}) => {
  const moodOptions = Object.values(MoodOption);

  return (
    <div>
      <label htmlFor="mood" className="block text-sm font-medium text-gray-700">
        Mood Hari Ini <span className="text-red-500">*</span>
      </label>
      <select
        id="mood"
        name="mood"
        value={selectedMood}
        onChange={onMoodChange}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
        required
      >
        {moodOptions.map((mood) => (
          <option key={mood} value={mood}>
            {mood}
          </option>
        ))}
      </select>
      {selectedMood === MoodOption.LAINNYA && (
        <div className="mt-2">
          <input
            type="text"
            id="customMood"
            name="customMood"
            value={customMood}
            onChange={onCustomMoodChange}
            placeholder="Masukkan mood Anda..."
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            required={selectedMood === MoodOption.LAINNYA}
          />
        </div>
      )}
    </div>
  );
};

export default MoodSelector;
