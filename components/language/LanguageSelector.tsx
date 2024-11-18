'use client';

import { useState, useEffect } from 'react';
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
import { useLanguageStore } from '@/stores/language';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

interface Props {
  userId?: string;
  className?: string;
  forceDialog?: boolean;
  initialLanguageId?: string | null;
}

export default function LanguageSelector({ userId, className, forceDialog, initialLanguageId }: Props) {
  const [tempSelectedLanguage, setTempSelectedLanguage] = useState<string>('');
  const {
    languages,
    selectedLanguageId,
    showDialog,
    setShowDialog,
    loadLanguages,
    updateUserLanguage,
    setSelectedLanguageId
  } = useLanguageStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      await loadLanguages();
      
      // If initialLanguageId is provided and not null
      if (initialLanguageId) {
        setSelectedLanguageId(initialLanguageId);
        setTempSelectedLanguage(initialLanguageId);
      } else if (userId) {
        // If no initial language or it's null, fetch from user data
        const supabase = createClientComponentClient();
        const { data: userData, error: fetchError } = await supabase
          .from('users')
          .select('target_language_id')
          .eq('id', userId)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching user language:', fetchError);
          toast.error('Failed to load language preference');
        } else if (userData?.target_language_id) {
          setSelectedLanguageId(userData.target_language_id);
          setTempSelectedLanguage(userData.target_language_id);
        }
      }

      // Show dialog if no language is selected and forceDialog is true
      if (forceDialog && !initialLanguageId && !selectedLanguageId) {
        setShowDialog(true);
      }
      
      setIsLoading(false);
    }
    init();
  }, [userId, loadLanguages, forceDialog, initialLanguageId, setSelectedLanguageId, selectedLanguageId]);

  if (isLoading) return null;

  const currentLanguage = languages.find(l => l.id === selectedLanguageId);

  return (
    <>
      <Select
        value={selectedLanguageId || ''}
        onValueChange={(value) => {
          setTempSelectedLanguage(value);
          if (userId) {
            updateUserLanguage(userId, value);
          }
        }}
      >
        <SelectTrigger className={className}>
          <SelectValue placeholder="Select a learning language">
            {currentLanguage?.name}
          </SelectValue>
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
                <SelectValue placeholder="Select a learning language" />
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
                if (userId && tempSelectedLanguage) {
                  updateUserLanguage(userId, tempSelectedLanguage);
                }
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
