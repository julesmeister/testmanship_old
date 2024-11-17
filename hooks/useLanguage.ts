import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from "sonner";

interface Language {
  id: string;
  code: string;
  name: string;
}

export function useLanguage(userId?: string) {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function loadLanguages() {
      try {
        const { data: languagesData } = await supabase
          .from('supported_languages')
          .select('*')
          .order('name');

        if (languagesData) {
          setLanguages(languagesData);
        }

        if (userId) {
          const { data: userData, error: fetchError } = await supabase
            .from('users')
            .select('target_language_id, full_name')
            .eq('id', userId)
            .single();

          if (fetchError) {
            console.error('Error fetching user language:', fetchError);
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

    try {
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

      const { data: response, error: rpcError } = await supabase.rpc(
        'update_user_language',
        { 
          user_id: userId,
          language_id: value
        }
      );

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
    } catch (error) {
      console.error('Error saving language:', error);
      toast.error("Failed to save language preference");
    }
  };

  return {
    languages,
    selectedLanguage,
    showDialog,
    isLoading,
    setShowDialog,
    handleLanguageChange
  };
}
