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
  updateUserLanguage: (userId: string, languageId: string) => Promise<boolean>;
}

// Use a singleton pattern for the Supabase client
let supabaseInstance: ReturnType<typeof createClientComponentClient> | null = null;

const getSupabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient();
  }
  return supabaseInstance;
};

export const useLanguageStore = create<LanguageState>((set, get) => ({
  selectedLanguageId: null,
  showDialog: false,
  languages: [],
  setSelectedLanguageId: (id) => {
    set({ selectedLanguageId: id });
    // Force a store update to notify subscribers
    set(state => ({ ...state }));
  },
  setShowDialog: (show) => set({ showDialog: show }),
  setLanguages: (languages) => set({ languages }),
  loadLanguages: async () => {
    try {
      const supabase = getSupabase();
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
      const supabase = getSupabase();
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
        return false;
      }

      if (!response?.success) {
        console.error('Update failed:', response?.error || 'Unknown error');
        toast.error(response?.error || "Failed to save language preference");
        return false;
      }

      // Update the state and force a store update
      set({ selectedLanguageId: languageId });
      set(state => ({ ...state }));
      set({ showDialog: false });
      
      const language = get().languages.find(l => l.id === languageId);
      if (language) {
        toast.success(`Learning language set to ${language.name}!`);
      }
      return true;
    } catch (error) {
      console.error('Error saving language:', error);
      toast.error("Failed to save language preference");
      return false;
    }
  }
}));
