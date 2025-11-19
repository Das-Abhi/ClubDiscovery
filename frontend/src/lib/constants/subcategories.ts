import { ClubCategory } from '../types/club'

export interface Subcategory {
  value: string
  label: string
  category: ClubCategory
}

export const SUBCATEGORIES: Subcategory[] = [
  // Co-curricular subcategories
  { value: 'technical', label: 'Technical', category: 'cocurricular' },
  { value: 'robotics', label: 'Robotics', category: 'cocurricular' },
  { value: 'ai_ml', label: 'AI/ML', category: 'cocurricular' },
  { value: 'research', label: 'Research', category: 'cocurricular' },
  { value: 'innovation', label: 'Innovation', category: 'cocurricular' },
  { value: 'aerospace', label: 'Aerospace', category: 'cocurricular' },
  { value: 'coding', label: 'Coding', category: 'cocurricular' },

  // Extra-curricular subcategories
  { value: 'cultural', label: 'Cultural', category: 'extracurricular' },
  { value: 'social', label: 'Social', category: 'extracurricular' },
  { value: 'sports', label: 'Sports', category: 'extracurricular' },
  { value: 'arts', label: 'Arts', category: 'extracurricular' },
  { value: 'music', label: 'Music', category: 'extracurricular' },
  { value: 'dance', label: 'Dance', category: 'extracurricular' },
  { value: 'drama', label: 'Drama', category: 'extracurricular' },
  { value: 'literature', label: 'Literature', category: 'extracurricular' },

  // Department subcategories
  { value: 'cse', label: 'CSE', category: 'department' },
  { value: 'ise', label: 'ISE', category: 'department' },
  { value: 'ece', label: 'ECE', category: 'department' },
  { value: 'mechanical', label: 'Mechanical', category: 'department' },
  { value: 'civil', label: 'Civil', category: 'department' },
  { value: 'eee', label: 'EEE', category: 'department' },
  { value: 'aerospace_dept', label: 'Aerospace', category: 'department' },
  { value: 'other', label: 'Other', category: 'department' },
]

/**
 * Get subcategories for a specific category
 */
export function getSubcategoriesForCategory(category: ClubCategory): Subcategory[] {
  return SUBCATEGORIES.filter((sub) => sub.category === category)
}
