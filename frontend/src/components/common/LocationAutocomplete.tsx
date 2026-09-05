import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin } from 'lucide-react';
import { searchLocations } from '../../services/api';
import { LocationItem } from '../../types';

interface LocationAutocompleteProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (val: string, locationObj?: LocationItem) => void;
  required?: boolean;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  label,
  placeholder = 'Type road name or area...',
  value,
  onChange,
  required = false
}) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = async (text: string) => {
    setQuery(text);
    onChange(text);

    if (text.trim().length >= 1) {
      setLoading(true);
      try {
        const results = await searchLocations(text);
        setSuggestions(results || []);
        setIsOpen(true);
      } catch (err) {
        console.error('Location search error:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleSelect = (item: LocationItem) => {
    setQuery(item.name);
    onChange(item.name, item);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {label && <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">{label}</label>}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          required={required}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
            else handleInputChange(query);
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 bg-navy-800 border border-navy-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
        {loading && <div className="absolute right-3 top-3 w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>}
      </div>

      {/* Solid Opaque Dropdown Suggestions Panel */}
      {isOpen && suggestions.length > 0 && (
        <ul
          style={{ backgroundColor: '#0f172a', zIndex: 99999, opacity: 1 }}
          className="absolute left-0 right-0 top-full mt-1 border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-slate-800"
        >
          {suggestions.map((item, idx) => (
            <li
              key={`loc-${idx}`}
              onClick={() => handleSelect(item)}
              style={{ backgroundColor: '#0f172a' }}
              className="p-3 hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-white block">{item.name}</span>
                  <span className="text-[10px] text-slate-400">{item.area} ({item.type.toUpperCase()})</span>
                </div>
              </div>
              <span className="text-[9px] text-slate-500 font-mono">
                {item.latitude.toFixed(3)}, {item.longitude.toFixed(3)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
