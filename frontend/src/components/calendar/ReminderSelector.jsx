import React, { useState } from 'react';
import { Bell, Plus, X, Clock } from 'lucide-react';

const PRESETS = [
  { label: '5 minutes before', value: 5, unit: 'minutes' },
  { label: '10 minutes before', value: 10, unit: 'minutes' },
  { label: '1 hour before', value: 1, unit: 'hours' },
];

const ReminderSelector = ({ reminders, onChange }) => {
  const [showCustom, setShowCustom] = useState(false);
  const [customValue, setCustomValue] = useState(15);
  const [customUnit, setCustomUnit] = useState('minutes');

  const addReminder = (preset) => {
    if (reminders.some(r => r.offsetValue === preset.value && r.offsetUnit === preset.unit)) return;
    onChange([...reminders, { 
      offsetValue: preset.value, 
      offsetUnit: preset.unit, 
      type: 'both' 
    }]);
  };

  const removeReminder = (index) => {
    onChange(reminders.filter((_, i) => i !== index));
  };

  const handleAddCustom = () => {
    addReminder({ value: parseInt(customValue), unit: customUnit });
    setShowCustom(false);
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
        <Bell size={14} /> Reminders
      </label>

      <div className="flex flex-wrap gap-2">
        {reminders.map((r, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase">
            <span>{r.offsetValue} {r.offsetUnit} before</span>
            <button type="button" onClick={() => removeReminder(i)} className="hover:text-indigo-800 transition-colors">
              <X size={12} />
            </button>
          </div>
        ))}
        
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCustom(!showCustom)}
            className="flex items-center gap-1 px-3 py-1.5 border border-dashed border-slate-200 text-slate-400 rounded-xl text-[10px] font-black uppercase hover:border-indigo-300 hover:text-indigo-400 transition-all"
          >
            <Plus size={12} /> Add
          </button>

          {showCustom && (
            <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 w-64 animate-in zoom-in-95 duration-200">
              <div className="space-y-3">
                <p className="text-[9px] font-black text-slate-400 uppercase">Select Preset</p>
                <div className="grid grid-cols-1 gap-1">
                  {PRESETS.map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => { addReminder(p); setShowCustom(false); }}
                      className="text-left px-3 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                
                <div className="pt-2 border-t border-slate-50">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Custom</p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      className="w-16 px-2 py-1 bg-slate-50 border-none rounded-lg text-xs font-bold outline-none"
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                    />
                    <select
                      className="flex-1 px-2 py-1 bg-slate-50 border-none rounded-lg text-xs font-bold outline-none"
                      value={customUnit}
                      onChange={(e) => setCustomUnit(e.target.value)}
                    >
                      <option value="minutes">Mins</option>
                      <option value="hours">Hours</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCustom}
                    className="w-full mt-3 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100"
                  >
                    Add Custom
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReminderSelector;
