import { 
  User, Person, Company, Course, CourseCategory, Registration, 
  Payment, Expense, Attendance, Exam, Question, ExamResult,
  Announcement, Communication, SystemSettings, AuditLog,
  UserRole, Gender, CourseStatus, RegistrationStatus, PaymentStatus,
  PaymentMethod, AttendanceStatus, QuestionType, AnnouncementType,
  Priority, CommunicationType, CommunicationStatus
} from '@prisma/client'

// Re-export Prisma types
export type {
  User, Person, Company, Course, CourseCategory, Registration,
  Payment, Expense, Attendance, Exam, Question, ExamResult,
  Announcement, Communication, SystemSettings, AuditLog,
  UserRole, Gender, CourseStatus, RegistrationStatus, PaymentStatus,
  PaymentMethod, AttendanceStatus, QuestionType, AnnouncementType,
  Priority, CommunicationType, CommunicationStatus
}

// Extended types with relations
export type PersonWithRelations = Person & {
  company?: Company | null
  registrations?: Registration[]
}

export type CompanyWithRelations = Company & {
  persons?: Person[]
  registrations?: Registration[]
}

export type CourseWithRelations = Course & {
  category?: CourseCategory | null
  registrations?: Registration[]
}

export type RegistrationWithRelations = Registration & {
  person: Person
  course: Course
  company?: Company | null
  payments?: Payment[]
}

// Form data types
export type PersonFormData = {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  identityNumber?: string
  birthDate?: Date | string
  gender?: Gender
  address?: string
  city?: string
  district?: string
  postalCode?: string
  notes?: string
  source?: string
  tags?: string[]
  companyId?: string
}

export type CompanyFormData = {
  name: string
  taxNumber?: string
  taxOffice?: string
  email?: string
  phone?: string
  website?: string
  address?: string
  city?: string
  district?: string
  sector?: string
  employeeCount?: number
  notes?: string
}

export type CourseFormData = {
  name: string
  code: string
  description?: string
  categoryId?: string
  duration: number
  capacity: number
  price: number | string
  startDate: Date | string
  endDate: Date | string
  schedule?: string
  instructor?: string
  location?: string
  status?: CourseStatus
}

export type RegistrationFormData = {
  personId: string
  courseId: string
  companyId?: string
  status?: RegistrationStatus
  totalAmount: number | string
  discount?: number | string
  notes?: string
}

// API Response types
export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// Dashboard statistics
export type DashboardStats = {
  totalStudents: number
  activeCourses: number
  monthlyRevenue: number
  pendingRegistrations: number
  studentGrowth: number
  courseGrowth: number
  revenueGrowth: number
  registrationGrowth: number
}

// Filter types
export type PersonFilters = {
  search?: string
  companyId?: string
  city?: string
  tags?: string[]
  isActive?: boolean
}

export type CourseFilters = {
  search?: string
  categoryId?: string
  status?: CourseStatus
  startDate?: string
  endDate?: string
}
