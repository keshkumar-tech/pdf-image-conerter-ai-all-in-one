import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import type { Course } from "@/services/types";

export const STUDENT_CLASSES = [
  "CLASS 10th",
  "CLASS 9th",
  "CLASS 11th",
  "CLASS 12th",
] as const;

export type StudentClass = (typeof STUDENT_CLASSES)[number];

const CLASS_TAG: Record<StudentClass, string> = {
  "CLASS 9th": "class-9",
  "CLASS 10th": "class-10",
  "CLASS 11th": "class-11",
  "CLASS 12th": "class-12",
};

interface StudentClassState {
  selectedClass: StudentClass;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setClass: (studentClass: StudentClass) => Promise<void>;
}

export const useStudentClassStore = create<StudentClassState>((set) => ({
  selectedClass: "CLASS 10th",
  isHydrated: false,

  hydrate: async () => {
    const saved = await AsyncStorage.getItem("cbc_selected_class");
    if (saved && (STUDENT_CLASSES as readonly string[]).includes(saved)) {
      set({ selectedClass: saved as StudentClass, isHydrated: true });
    } else {
      set({ isHydrated: true });
    }
  },

  setClass: async (studentClass) => {
    await AsyncStorage.setItem("cbc_selected_class", studentClass);
    set({ selectedClass: studentClass });
  },
}));

/** Filter courses by selected class tag. Courses without tags are always shown. */
export function filterCoursesByClass(courses: Course[], selectedClass: StudentClass): Course[] {
  const tag = CLASS_TAG[selectedClass];
  return courses.filter((c) => {
    if (!c.tags || c.tags.length === 0) return true; // no tags → show for every class
    return c.tags.some((t) => {
      const lower = t.toLowerCase();
      return lower === tag || lower.includes(tag.replace("class-", ""));
    });
  });
}
