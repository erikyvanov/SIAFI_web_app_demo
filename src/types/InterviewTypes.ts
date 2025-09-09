// Tipos para la funcionalidad de agendamiento de entrevistas

export interface ScheduleBlock {
  id: number;
  start_time: string;
  end_time: string;
}

export interface WeeklySchedule {
  monday: ScheduleBlock[];
  tuesday: ScheduleBlock[];
  wednesday: ScheduleBlock[];
  thursday: ScheduleBlock[];
  friday: ScheduleBlock[];
  saturday: ScheduleBlock[];
  sunday: ScheduleBlock[];
}

export interface UserApplication {
  id: number;
  name: string;
  lastname: string;
  email: string;
  phone_number: string;
  major: string;
  semester: number;
}

export interface RecruitmentEvent {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  description?: string;
}

export interface InterviewAppointment {
  id: number;
  society_application_id: number;
  date_and_time: string;
  created_at: string;
}

export interface ScheduleAppointmentRequest {
  schedule_catalog_id: number;
  date: string;
}

export interface ScheduleAppointmentResponse {
  id: number;
  society_application_id: number;
  date_and_time: string;
  created_at: string;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface CalendarDay {
  date: Date;
  dayOfWeek: DayOfWeek;
  hasAvailability: boolean;
  schedules: ScheduleBlock[];
}
