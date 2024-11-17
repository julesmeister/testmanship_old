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

        // If user is logged in, fetch language preference
        if (userId) {
          const { data: userData, error: fetchError } = await supabase
            .from('users')
            .select('target_language_id, full_name')
            .eq('id', userId)
            .single();

          if (fetchError) {
            console.error('Error fetching user language:', fetchError);
            // Don't try to create user here, just show dialog
            setShowDialog(true);
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
    if (!userId) {
      console.error('No userId available for language update');
      return;
    }

    console.log('Attempting to update language to:', value, 'for user:', userId);

    try {
      // First verify the language exists
      const { data: langCheck, error: langError } = await supabase
        .from('supported_languages')
        .select('id, name')
        .eq('id', value)
        .single();

      if (langError || !langCheck) {
        console.error('Invalid language ID:', value, 'Error:', langError);
        toast.error("Invalid language selection");
        return;
      }

      console.log('Language verified:', langCheck);

      // Update the user's language preference with RLS bypass
      const { data: response, error: rpcError } = await supabase.rpc(
        'update_user_language',
        { 
          user_id: userId,
          language_id: value
        }
      );

      console.log('Update response:', { response, error: rpcError });

      if (rpcError) {
        console.error('RPC error updating language:', rpcError);
        toast.error("Failed to save language preference");
        return;
      }

      if (!response?.success) {
        console.error('Update failed:', response?.error || 'Unknown error');
        toast.error(response?.error || "Failed to save language preference");
        return;
      }

      setSelectedLanguage(value);
      setShowDialog(false);
      toast.success(`Language set to ${langCheck.name}!`);
      
      console.log('Language preference successfully updated:', response.data);
    } catch (error) {
      console.error('Error saving language:', error);
      toast.error("Failed to save language preference");
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
