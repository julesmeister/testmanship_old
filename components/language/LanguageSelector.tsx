'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
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
import { toast } from "sonner";

interface Language {
  id: string;
  code: string;
  name: string;
}

interface Props {
  userId?: string;
  className?: string;
}

export default function LanguageSelector({ userId, className }: Props) {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function loadLanguages() {
      try {
        // Fetch supported languages
        const { data: languagesData } = await supabase
          .from('supported_languages')
          .select('*')
          .order('name');

        if (languagesData) {
          setLanguages(languagesData);
        }

        // If user is logged in, check/create user record and fetch language preference
        if (userId) {
          // First check if user record exists
          const { data: userData, error: fetchError } = await supabase
            .from('users')
            .select('target_language_id')
            .eq('id', userId)
            .single();

          if (fetchError && fetchError.code === 'PGRST116') {
            // User record doesn't exist, create it
            const { error: insertError } = await supabase
              .from('users')
              .insert([
                { 
                  id: userId,
                  credits: 0,
                  trial_credits: 3
                }
              ]);

            if (insertError) {
              console.error('Error creating user record:', insertError);
              toast.error("Failed to initialize user profile");
            } else {
              console.log('Created new user record');
            }
          } else if (userData?.target_language_id) {
            setSelectedLanguage(userData.target_language_id);
          } else {
            setShowDialog(true);
          }
        }
      } catch (error) {
        console.error('Error loading languages:', error);
        toast.error("Failed to load language preferences");
      } finally {
        setIsLoading(false);
      }
    }

    loadLanguages();
  }, [userId, supabase]);

  const handleLanguageChange = async (value: string) => {
    if (!userId) return;

    setSelectedLanguage(value);
    setShowDialog(false);

    try {
      // First ensure user record exists
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        // User record doesn't exist, create it with the selected language
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            { 
              id: userId,
              target_language_id: value,
              credits: 0,
              trial_credits: 3
            }
          ]);

        if (insertError) throw insertError;
      } else {
        // User exists, update language preference
        const { error: updateError } = await supabase
          .from('users')
          .update({ target_language_id: value })
          .eq('id', userId);

        if (updateError) throw updateError;
      }

      toast.success("Language preference saved successfully!");
    } catch (error) {
      console.error('Error updating language preference:', error);
      toast.error("Failed to save language preference. Please try again.");
      
      // Revert the selection if save failed
      const { data: userData } = await supabase
        .from('users')
        .select('target_language_id')
        .eq('id', userId)
        .single();
      
      if (userData?.target_language_id) {
        setSelectedLanguage(userData.target_language_id);
      }
    }
  };

  if (isLoading) return null;

  return (
    <>
      <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger className={className}>
          <SelectValue placeholder="Select Language" />
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
            <DialogTitle>Choose Your Target Language</DialogTitle>
            <DialogDescription>
              Select the language you want to learn. This will help us personalize your learning experience.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Language" />
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
              onClick={() => handleLanguageChange(selectedLanguage)}
              disabled={!selectedLanguage}
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
