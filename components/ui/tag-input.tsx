import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from './input';
import { Button } from './button';

interface TagInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  className?: string;
}

export function TagInput({ tags = [], onTagsChange, className, ...props }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  // Generate a random color for each tag
  const getTagColor = (index: number) => {
    const colors = [
      'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
      'bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300',
      'bg-purple-50 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
      'bg-pink-50 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300',
      'bg-orange-50 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
    ];
    return colors[index % colors.length];
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!tags.includes(inputValue.trim())) {
        onTagsChange([...tags, inputValue.trim()]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onTagsChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className={cn(
      "flex flex-wrap gap-1.5 p-2 rounded-lg min-h-[2.75rem] bg-zinc-50/50 dark:bg-zinc-900/50 focus-within:ring-1 focus-within:ring-zinc-200 dark:focus-within:ring-zinc-800 transition-shadow duration-200",
      className
    )}>
      {tags.map((tag, index) => (
        <span
          key={index}
          className={cn(
            "flex items-center gap-1 px-2.5 py-1 text-sm rounded-md transition-colors duration-200",
            getTagColor(index)
          )}
        >
          {tag}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 opacity-60 hover:opacity-100 transition-opacity"
            onClick={() => removeTag(tag)}
          >
            <X className="h-3 w-3" />
          </Button>
        </span>
      ))}
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 min-w-[120px] border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-7 text-sm placeholder:text-zinc-400"
        {...props}
      />
    </div>
  );
}
