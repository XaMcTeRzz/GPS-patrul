
// Types for the Patrol system
export type PatrolPoint = {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
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
  username: string;
  password: string;
  from: string;
};

export type Settings = {
  verificationMethod: 'gps' | 'qrcode' | 'manual';
  notificationsEnabled: boolean;
  proximityThreshold: number;
  patrolTimeMinutes: number;
  notificationEmail?: string;
  telegramBotToken?: string;
  telegramChatId?: string;
  smtpSettings?: SmtpSettings;
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
};

export const defaultSettings: Settings = {
  verificationMethod: 'gps',
  notificationsEnabled: true,
  proximityThreshold: 50,
  patrolTimeMinutes: 5,
};
