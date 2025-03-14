// Types for the Patrol system
export type PatrolPoint = {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  radius: number;
  time: number;
  isCompleted?: boolean;
  radiusMeters: number;
  timeMinutes: number; // Time allowed for this specific point
  startTime?: string; // ISO string for point start time
};

export type LogEntry = {
  id: string;
  patrolId: string;
  pointId: string;
  pointName: string;
  timestamp: string;
  status: 'completed' | 'missed' | 'delayed';
  notes?: string;
};

export type PatrolSession = {
  id: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'completed' | 'cancelled';
  patrolPoints: PatrolPoint[];
  completedPoints: string[];
};

export type SmtpSettings = {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
};

export type ScheduleTime = {
  hour: number;
  minute: number;
  enabled: boolean;
};

export type Settings = {
  verificationMethod: 'gps' | 'qrcode' | 'manual';
  notificationsEnabled: boolean;
  proximityThreshold: number;
  patrolTimeMinutes: number; // Default time for all points
  notificationEmail?: string;
  telegramBotToken?: string;
  telegramChatId?: string;
  smtpSettings?: SmtpSettings;
  scheduledPatrols: ScheduleTime[]; // Расписание автоматических патрулей
  scheduleEnabled: boolean; // Включено ли расписание
};

export enum NotificationType {
  MISSED_POINT = 'MISSED_POINT',
  PATROL_STARTED = 'PATROL_STARTED',
  PATROL_COMPLETED = 'PATROL_COMPLETED',
}

export type PatrolNotification = {
  type: NotificationType;
  pointName?: string;
  message: string;
};

export type PatrolContextType = {
  patrolPoints: PatrolPoint[];
  addPatrolPoint: (point: Omit<PatrolPoint, 'id'>) => void;
  updatePatrolPoint: (id: string, point: Partial<PatrolPoint>) => void;
  deletePatrolPoint: (id: string) => void;
  activePatrol: PatrolSession | null;
  startPatrol: () => void;
  completePatrolPoint: (pointId: string) => void;
  endPatrol: () => void;
  logEntries: LogEntry[];
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  loading: boolean;
  toggleTestMode: () => void;
  testMode: boolean;
  sendNotification: (notification: PatrolNotification) => Promise<void>;
};

export const defaultSettings: Settings = {
  verificationMethod: 'gps',
  notificationsEnabled: true,
  proximityThreshold: 50,
  patrolTimeMinutes: 5,
  scheduledPatrols: [
    { hour: 16, minute: 0, enabled: false },
    { hour: 20, minute: 0, enabled: false }
  ],
  scheduleEnabled: false
};
