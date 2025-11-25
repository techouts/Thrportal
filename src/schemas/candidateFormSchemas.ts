import { z } from 'zod';

export const experienceSchema = z.object({
  company: z.string().min(1, 'Company is required').max(200, 'Company name too long'),
  designation: z.string().min(1, 'Designation is required').max(200, 'Designation too long'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().optional(),
  skills: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
  ctc: z.preprocess(
    (val) => (val === '' || val === null || val === undefined || isNaN(Number(val))) ? undefined : Number(val),
    z.number().min(0, 'CTC must be positive').optional()
  ),
}).refine(data => {
  if (!data.isCurrent && !data.endDate) {
    return false;
  }
  return true;
}, {
  message: "End date is required if not current position",
  path: ["endDate"],
});

export const educationSchema = z.object({
  type: z.enum(['Degree', 'Certification', 'Course']),
  degree: z.string().min(1, 'Degree/Certification name is required').max(200, 'Name too long'),
  field: z.string().min(1, 'Field is required').max(200, 'Field too long'),
  institution: z.string().min(1, 'Institution is required').max(200, 'Institution name too long'),
  startYear: z.number().min(1950, 'Invalid year').max(new Date().getFullYear(), 'Year cannot be in the future'),
  endYear: z.number().min(1950, 'Invalid year').max(new Date().getFullYear() + 10, 'Invalid year').optional(),
  grade: z.string().max(50, 'Grade too long').optional(),
}).refine(data => {
  if (data.endYear && data.endYear < data.startYear) {
    return false;
  }
  return true;
}, {
  message: "End year must be after start year",
  path: ["endYear"],
});

export const documentUploadSchema = z.object({
  type: z.enum(['Resume', 'Cover Letter', 'Certificate', 'Portfolio', 'ID Proof', 'Address Proof', 'Salary Slip', 'Offer Letter']),
  name: z.string().min(1, 'Document name is required').max(200, 'Name too long'),
});

export type ExperienceFormData = z.infer<typeof experienceSchema>;
export type EducationFormData = z.infer<typeof educationSchema>;
export type DocumentUploadFormData = z.infer<typeof documentUploadSchema>;
