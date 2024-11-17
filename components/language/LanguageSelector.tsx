'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/hooks/useLanguage';

interface Props {
  userId?: string;
  className?: string;
}

export default function LanguageSelector({ userId, className }: Props) {
  const [tempSelectedLanguage, setTempSelectedLanguage] = useState<string>('');
  const {
    languages,
    selectedLanguage,
    showDialog,
    isLoading,
    setShowDialog,
    handleLanguageChange
  } = useLanguage(userId);

  if (isLoading) return null;

  return (
    <>
      <Select
        value={tempSelectedLanguage}
        onValueChange={(value) => setTempSelectedLanguage(value)}
      >
        <SelectTrigger className={className}>
          <SelectValue placeholder="Select a language" />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-zinc-950">
          {languages.map((language) => (
            <SelectItem 
              key={language.id} 
              value={language.id}
              className="text-zinc-950 dark:text-white cursor-pointer"
            >
              {language.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Your Learning Language</DialogTitle>
            <DialogDescription>
              Select the language you want to learn. This will help us personalize your learning experience.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select
              value={tempSelectedLanguage}
              onValueChange={(value) => setTempSelectedLanguage(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-950">
                {languages.map((language) => (
                  <SelectItem 
                    key={language.id} 
                    value={language.id}
                    className="text-zinc-950 dark:text-white cursor-pointer"
                  >
                    {language.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              className="w-full"
              onClick={() => {
                handleLanguageChange(tempSelectedLanguage);
                setTempSelectedLanguage(selectedLanguage);
              }}
              disabled={!tempSelectedLanguage}
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
