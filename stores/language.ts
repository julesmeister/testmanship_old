import { create } from 'zustand';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from "sonner";

interface Language {
  id: string;
  code: string;
  name: string;
}

interface LanguageState {
  selectedLanguageId: string | null;
  showDialog: boolean;
  setSelectedLanguageId: (id: string) => void;
  setShowDialog: (show: boolean) => void;
  languages: Language[];
  setLanguages: (languages: Language[]) => void;
  loadLanguages: () => Promise<void>;
  updateUserLanguage: (userId: string, languageId: string) => Promise<void>;
}

const supabase = createClientComponentClient();

export const useLanguageStore = create<LanguageState>((set) => ({
  selectedLanguageId: null,
  showDialog: false,
  languages: [],
  setSelectedLanguageId: (id) => set({ selectedLanguageId: id }),
  setShowDialog: (show) => set({ showDialog: show }),
  setLanguages: (languages) => set({ languages }),
  loadLanguages: async () => {
    try {
      const { data: languagesData, error: languagesError } = await supabase
        .from('supported_languages')
        .select('*')
        .order('name');

      if (languagesError) {
        console.error('Error fetching supported languages:', languagesError);
        toast.error('Failed to load supported languages');
        return;
      }

      if (languagesData) {
        set({ languages: languagesData });
      }
    } catch (error) {
      console.error('Error loading languages:', error);
      toast.error("Failed to load languages");
    }
  },
  updateUserLanguage: async (userId: string, languageId: string) => {
    try {
      const { data: response, error: rpcError } = await supabase.rpc(
        'update_user_language',
        { 
          user_id: userId,
          language_id: languageId
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

      set({ selectedLanguageId: languageId });
      set({ showDialog: false });
      const language = useLanguageStore.getState().languages.find(l => l.id === languageId);
      if (language) {
        toast.success(`Learning language set to ${language.name}!`);
      }
    } catch (error) {
      console.error('Error saving language:', error);
      toast.error("Failed to save language preference");
    }
  }
}));
