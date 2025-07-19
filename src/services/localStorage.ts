
import { Project, TeamMember } from '@/types/project';

const PROJECTS_KEY = 'bubuagency_clients';
const TEAM_MEMBERS_KEY = 'bubuagency_team_members';

// Clientes
export const getProjects = (): Project[] => {
  const stored = localStorage.getItem(PROJECTS_KEY);
  if (!stored) {
    const initialProjects = getInitialProjects();
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(initialProjects));
    return initialProjects;
  }
  return JSON.parse(stored);
};

export const getProject = (id: string): Project | null => {
  const projects = getProjects();
  return projects.find(p => p.id === id) || null;
};

export const saveProject = (project: Project): void => {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === project.id);
  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.push(project);
  }
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
};

export const updateProjectProgress = (projectId: string): void => {
  const project = getProject(projectId);
  if (!project) return;

  const parentTasks = project.tasks.filter(t => t.isParentTask);
  const completedWeight = parentTasks
    .filter(t => t.completed)
    .reduce((sum, t) => sum + t.progressWeight, 0);
  
  project.progress = Math.min(100, completedWeight);
  saveProject(project);
};

// Miembros del equipo
export const getTeamMembers = (): TeamMember[] => {
  const stored = localStorage.getItem(TEAM_MEMBERS_KEY);
  if (!stored) {
    const initialMembers = getInitialTeamMembers();
    localStorage.setItem(TEAM_MEMBERS_KEY, JSON.stringify(initialMembers));
    return initialMembers;
  }
  return JSON.parse(stored);
};

export const saveTeamMember = (member: TeamMember): void => {
  const members = getTeamMembers();
  const index = members.findIndex(m => m.id === member.id);
  if (index >= 0) {
    members[index] = member;
  } else {
    members.push(member);
  }
  localStorage.setItem(TEAM_MEMBERS_KEY, JSON.stringify(members));
};

// Datos iniciales de clientes de agencia
const getInitialProjects = (): Project[] => [
  {
    id: "1",
    name: "TechCorp Solutions",
    client: "Empresa de Software B2B",
    phase: "Campaña Performance",
    progress: 75,
    team: ["ana-garcia", "luis-martin", "sara-lopez"],
    deadline: "15 Ene 2025",
    status: "active",
    type: "commercial",
    description: "Estrategia integral de marketing digital para empresa de tecnología B2B con enfoque en generación de leads y posicionamiento de marca.",
    startDate: "01 Mar 2024",
    budget: 45000,
    clientData: {
      name: "TechCorp Solutions S.L.",
      email: "marketing@techcorp-solutions.com",
      phone: "+34 912 345 678",
      address: "Av. Castellana 200, 28046 Madrid",
      company: "Grupo TechCorp Internacional",
      notes: "Cliente VIP, requiere actualizaciones semanales del progreso. Muy enfocados en métricas de ROI."
    },
    plans: [
      {
        id: "plan1",
        name: "Estrategia de Marketing Digital",
        type: "architectural",
        uploadDate: "2024-03-15",
        version: "v2.1"
      },
      {
        id: "plan2", 
        name: "Manual de Identidad Corporativa",
        type: "structural",
        uploadDate: "2024-04-02",
        version: "v1.3"
      }
    ],
    tasks: [
      {
        id: "task1",
        title: "Estrategia de Marketing Digital",
        description: "Desarrollo de estrategia completa de marketing digital y definición de buyer personas",
        isParentTask: true,
        completed: true,
        assignedTo: ["ana-garcia"],
        dueDate: "2024-05-15",
        priority: "high",
        progressWeight: 25,
        createdAt: "2024-03-01T10:00:00Z",
        completedAt: "2024-05-10T14:30:00Z"
      },
      {
        id: "task2",
        title: "Campaña Google Ads",
        description: "Configuración y lanzamiento de campañas de Google Ads para generación de leads",
        isParentTask: true,
        completed: true,
        assignedTo: ["luis-martin"],
        dueDate: "2024-07-30",
        priority: "high",
        progressWeight: 25,
        createdAt: "2024-03-01T10:00:00Z",
        completedAt: "2024-07-25T16:45:00Z"
      },
      {
        id: "task3",
        title: "Content Marketing",
        description: "Creación de blog corporativo y estrategia de contenidos",
        isParentTask: true,
        completed: true,
        assignedTo: ["sara-lopez"],
        dueDate: "2024-09-15",
        priority: "medium",
        progressWeight: 25,
        createdAt: "2024-03-01T10:00:00Z",
        completedAt: "2024-09-10T12:00:00Z"
      },
      {
        id: "task4",
        title: "Optimización y Reporting",
        description: "Optimización de campañas y setup de reporting automatizado",
        isParentTask: true,
        completed: false,
        assignedTo: ["ana-garcia", "luis-martin"],
        dueDate: "2025-01-15",
        priority: "high",
        progressWeight: 25,
        createdAt: "2024-03-01T10:00:00Z"
      }
    ],
    chatMessages: [
      {
        id: "msg1",
        userId: "ana-garcia",
        userName: "Ana García",
        message: "Buenos días equipo, ¿cómo van las métricas de la campaña de esta semana?",
        timestamp: "2024-12-20T09:00:00Z",
        type: "text"
      },
      {
        id: "msg2",
        userId: "luis-martin",
        userName: "Luis Martín",
        message: "Hola Ana, el CTR ha mejorado un 15% esta semana. Los ajustes en las keywords funcionan.",
        timestamp: "2024-12-20T09:15:00Z",
        type: "text"
      },
      {
        id: "msg3",
        userId: "sara-lopez",
        userName: "Sara López",
        message: "Perfecto Luis! El último artículo del blog está generando buen engagement orgánico.",
        timestamp: "2024-12-20T10:30:00Z",
        type: "text"
      }
    ]
  },
  {
    id: "2",
    name: "FashionForward Store",
    client: "E-commerce de Moda",
    phase: "Community Management",
    progress: 45,
    team: ["carlos-ruiz", "maria-santos"],
    deadline: "28 Feb 2025",
    status: "active",
    type: "commercial",
    description: "Gestión integral de redes sociales y community management para e-commerce de moda femenina.",
    startDate: "15 Jun 2024",
    budget: 25000,
    clientData: {
      name: "FashionForward Store S.L.",
      email: "social@fashionforward.es",
      phone: "+34 915 987 654",
      address: "C/ Serrano 89, 28006 Madrid",
      company: "Fashion Group España"
    },
    plans: [],
    tasks: [
      {
        id: "task5",
        title: "Auditoría de Redes Sociales",
        description: "Análisis completo de presencia actual en redes sociales",
        isParentTask: true,
        completed: true,
        assignedTo: ["carlos-ruiz"],
        dueDate: "2024-08-15",
        priority: "high",
        progressWeight: 30,
        createdAt: "2024-06-15T10:00:00Z",
        completedAt: "2024-08-10T14:00:00Z"
      },
      {
        id: "task6",
        title: "Estrategia de Contenido",
        description: "Desarrollo de calendario editorial y pilares de contenido",
        isParentTask: true,
        completed: true,
        assignedTo: ["maria-santos"],
        dueDate: "2024-10-30",
        priority: "high",
        progressWeight: 15,
        createdAt: "2024-06-15T10:00:00Z",
        completedAt: "2024-10-25T16:30:00Z"
      },
      {
        id: "task7",
        title: "Producción de Contenido",
        description: "Creación de contenido visual y copywriting para redes",
        isParentTask: true,
        completed: false,
        assignedTo: ["maria-santos", "carlos-ruiz"],
        dueDate: "2025-01-31",
        priority: "high",
        progressWeight: 35,
        createdAt: "2024-06-15T10:00:00Z"
      },
      {
        id: "task8",
        title: "Community Management",
        description: "Gestión diaria de comunidades y engagement",
        isParentTask: true,
        completed: false,
        assignedTo: ["carlos-ruiz"],
        dueDate: "2025-02-28",
        priority: "medium",
        progressWeight: 20,
        createdAt: "2024-06-15T10:00:00Z"
      }
    ],
    chatMessages: [
      {
        id: "msg4",
        userId: "carlos-ruiz",
        userName: "Carlos Ruiz",
        message: "María, ¿tienes listo el contenido para la campaña de Navidad?",
        timestamp: "2024-12-19T15:30:00Z",
        type: "text"
      },
      {
        id: "msg5",
        userId: "maria-santos",
        userName: "María Santos",
        message: "Sí Carlos, subo las piezas en un momento. Solo falta la aprobación del cliente.",
        timestamp: "2024-12-19T15:45:00Z",
        type: "text"
      }
    ]
  }
];

const getInitialTeamMembers = (): TeamMember[] => [
  {
    id: "ana-garcia",
    name: "Ana García",
    email: "ana.garcia@bubuagency.com",
    role: "Marketing Director",
    joinDate: "2023-01-15",
    skills: ["Marketing Digital", "Google Ads", "Analytics", "Estrategia"]
  },
  {
    id: "luis-martin",
    name: "Luis Martín",
    email: "luis.martin@bubuagency.com",
    role: "Performance Marketing Specialist",
    joinDate: "2023-03-20",
    skills: ["Google Ads", "Facebook Ads", "PPC", "Growth Marketing"]
  },
  {
    id: "sara-lopez",
    name: "Sara López",
    email: "sara.lopez@bubuagency.com",
    role: "Content Marketing Manager",
    joinDate: "2023-06-10",
    skills: ["Content Marketing", "SEO", "Copywriting", "Blog Management"]
  },
  {
    id: "carlos-ruiz",
    name: "Carlos Ruiz",
    email: "carlos.ruiz@bubuagency.com",
    role: "Community Manager",
    joinDate: "2023-09-05",
    skills: ["Social Media", "Community Management", "Design", "Video Editing"]
  },
  {
    id: "maria-santos",
    name: "María Santos",
    email: "maria.santos@bubuagency.com",
    role: "Creative Designer",
    joinDate: "2023-11-12",
    skills: ["Graphic Design", "Brand Design", "Adobe Creative Suite", "UI/UX"]
  }
];
