import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  geminiApiKey: string | null;
  setGeminiApiKey: (key: string | null) => void;
  savedLessonPlans: any[];
  saveLessonPlan: (plan: any) => void;
  deleteLessonPlan: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      geminiApiKey: null,
      setGeminiApiKey: (key) => set({ geminiApiKey: key }),
      savedLessonPlans: [],
      saveLessonPlan: (plan) => set((state) => {
        const existing = state.savedLessonPlans.findIndex(p => p.id === plan.id);
        if (existing >= 0) {
          const newPlans = [...state.savedLessonPlans];
          newPlans[existing] = { ...newPlans[existing], ...plan, updatedAt: new Date().toISOString() };
          return { savedLessonPlans: newPlans };
        }
        return { 
          savedLessonPlans: [{ ...plan, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...state.savedLessonPlans] 
        };
      }),
      deleteLessonPlan: (id) => set((state) => ({
        savedLessonPlans: state.savedLessonPlans.filter(p => p.id !== id)
      })),
    }),
    {
      name: 'khbd-app-storage',
    }
  )
);
