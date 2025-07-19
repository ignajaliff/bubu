
export interface Project {
  id: string;
  name: string;
  client: string;
  phase: string;
  progress: number;
  team: string[];
  deadline: string;
  status: 'active' | 'paused' | 'completed' | 'delayed';
  type: 'residential' | 'commercial' | 'industrial' | 'urban';
  description?: string;
  startDate: string;
  budget?: number;
  clientData?: ClientData;
  plans?: ProjectPlan[];
  tasks: Task[];
  chatMessages: ChatMessage[];
}

export interface ClientData {
  name: string;
  email: string;
  phone: string;
  address: string;
  company?: string;
  notes?: string;
}

export interface ProjectPlan {
  id: string;
  name: string;
  type: 'architectural' | 'structural' | 'electrical' | 'plumbing';
  url?: string;
  uploadDate: string;
  version: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  isParentTask: boolean;
  parentTaskId?: string;
  completed: boolean;
  assignedTo: string[];
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  progressWeight: number; // Para tareas padre, peso en el progreso total (ej: 25 para 25%)
  createdAt: string;
  completedAt?: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  type: 'text' | 'file' | 'system';
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  joinDate: string;
  skills: string[];
}
