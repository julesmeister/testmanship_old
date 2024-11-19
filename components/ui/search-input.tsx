'use client';

import { Search, X } from 'lucide-react';
import { Input } from './input';
import { useState } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange(localValue);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <form onSubmit={handleSubmit} className={`relative group ${className}`}>
      <div className="relative flex-1">
        <div className="relative flex items-center">
          <Input
            placeholder={placeholder}
            className="pl-11 pr-11 bg-white dark:bg-zinc-900 h-11 text-base transition-shadow duration-200 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500 focus-visible:border-blue-500"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
          />
          <div className="absolute left-0 inset-y-0 w-11 flex items-center justify-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors duration-200" />
          </div>
          {localValue && (
            <div className="absolute right-0 inset-y-0 w-11 flex items-center justify-center">
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors duration-200"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </button>
            </div>
          )}
        </div>
        <div className="absolute inset-0 -z-10 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-gradient-x blur-xl" />
        </div>
      </div>
    </form>
  );
}
