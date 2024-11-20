import { HiClipboardDocument } from 'react-icons/hi2';
import { type InstructionsCardProps } from './types';

export const InstructionsCard = ({ instructions }: InstructionsCardProps) => (
  <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
    <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
      <HiClipboardDocument className="h-4 w-4 text-zinc-500" />
      Instructions
    </h3>
    <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
      {instructions.split('\n').map((instruction, index) => (
        <p key={index} className="leading-relaxed">{instruction}</p>
      ))}
    </div>
  </div>
);
