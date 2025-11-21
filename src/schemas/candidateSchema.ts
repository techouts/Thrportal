import { z } from 'zod';

export const candidateSchemaPhase1 = z.object({
  // Basic Information
  name: z.string().optional(),
  email: z.string().email('Invalid email address').max(255, 'Email must be less than 255 characters'),
  phone: z.string().optional().refine((val) => !val || /^\+?[\d\s\-()]+$/.test(val), {
    message: 'Invalid phone number format'
  }),
  location: z.string().min(1, 'Location is required'),
  linkedinUrl: z.string().url('Invalid URL').optional().or(z.literal('')),

  // Professional Details
  source: z.enum(['LinkedIn', 'Job Board', 'Referral', 'Internal Pool', 'Direct Application']),
  experience: z.number().min(0, 'Experience must be 0 or greater').max(50, 'Experience seems too high'),
  skills: z.array(z.string()).default([]),
  currentCtc: z.preprocess(
    (val) => (val === '' || val === null || val === undefined || isNaN(Number(val))) ? undefined : Number(val),
    z.number().min(0, 'CTC must be positive').optional()
  ),
  expectedCtc: z.preprocess(
    (val) => (val === '' || val === null || val === undefined || isNaN(Number(val))) ? undefined : Number(val),
    z.number().min(0, 'CTC must be positive').optional()
  ),
  noticePeriod: z.number().optional(),
  status: z.string().default('New'),
  recruiterOwner: z.string().optional(),

  // Compliance
  consent: z.boolean().default(true),
  gdprCompliant: z.boolean().default(true),
  
  // Pool Tag
  poolTag: z.enum([
    'Frontend Engineer',
    'Backend Engineer',
    'Full Stack Engineer',
    'DevOps Engineer',
    'Data Engineer',
    'QA Engineer',
    'Product Manager',
    'UI/UX Designer'
  ]).default('Frontend Engineer'),
});

export const candidateSchemaPhase2 = candidateSchemaPhase1.extend({
  // Name breakdown
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),

  // Personal Details
  dateOfBirth: z.string().optional(),
  maritalStatus: z.enum(['Unmarried', 'Married']).optional(),
  languagesKnown: z.array(z.string()).default([]),

  // Identity Documents
  panCardNumber: z.string().optional().refine((val) => !val || /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(val), {
    message: 'Invalid PAN format (e.g., ABCDE1234F)'
  }),
  aadhaarCardNumber: z.string().optional().refine((val) => !val || /^\d{12}$/.test(val), {
    message: 'Aadhaar must be 12 digits'
  }),
  passportNumber: z.string().optional(),

  // Extended Location
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  pincode: z.string().optional(),
  willingToRelocate: z.boolean().default(false),

  // Extended Professional
  githubUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  alternateEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  jobType: z.enum(['Permanent', 'Part Time']).optional(),
  preferredShift: z.enum(['Day', 'Night', 'Flexible']).optional(),
  expectedCtcType: z.enum(['Monthly', 'Annual']).optional(),
  statusExtended: z.enum(['Available', 'Not Available', 'Do Not Call', 'Blacklist', 'Inactive', 'Placed']).optional(),
});

export type CandidateFormDataPhase1 = z.infer<typeof candidateSchemaPhase1>;
export type CandidateFormDataPhase2 = z.infer<typeof candidateSchemaPhase2>;
