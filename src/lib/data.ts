// Student data types
export interface Student {
  id: string;
  name: string;
  photo: string;
  class: string; // e.g., "II B.Tech - AI - Section A"
  batch: string; // e.g., "2023-2027"
  academicYear: '1st Year' | '2nd Year' | '3rd Year' | '4th Year';
  section: string;
  attendance: AttendanceRecord[];
  marks: MarksRecord[];
}

export interface AttendanceRecord {
  date: string;
  subject: string;
  period: number;
  status: 'Present' | 'Absent' | 'OD';
}

export interface AttendanceSummary {
  subject: string;
  totalClasses: number;
  present: number;
  percentage: number;
}

export interface MarksRecord {
  subject: string;
  isLab: boolean;
  mid1: {
    written: number;
    bitPaper: number;
    assignment: number;
    total: number;
  };
  mid2: {
    written: number;
    bitPaper: number;
    assignment: number;
    total: number;
  };
  external: number;
  internalMin: number;
  externalMin: number;
  credits: number;
}

export interface Faculty {
  id: string;
  name: string;
  role: 'HOD' | 'Faculty';
  subjects: string[];
}

// Mock data for demonstration
export const mockStudents: Student[] = [
  {
    id: '23A1AI01',
    name: 'John Smith',
    photo: '/api/placeholder/150/150',
    class: 'II B.Tech - AI - Section A',
    batch: '2023-2027',
    academicYear: '2nd Year',
    section: 'A',
    attendance: [],
    marks: []
  },
  {
    id: '23A1AI02',
    name: 'Emma Johnson',
    photo: '/api/placeholder/150/150',
    class: 'II B.Tech - AI - Section A',
    batch: '2023-2027',
    academicYear: '2nd Year',
    section: 'A',
    attendance: [],
    marks: []
  }
];

export const mockFaculty: Faculty[] = [
  {
    id: 'FAC001',
    name: 'Dr. Rajesh Kumar',
    role: 'HOD',
    subjects: ['All']
  },
  {
    id: 'FAC002',
    name: 'Prof. Sarah Devi',
    role: 'Faculty',
    subjects: ['AI', 'ML', 'Deep Learning']
  }
];

export const subjects = {
  '2nd Year': [
    { code: 'CS201', name: 'Data Structures', isLab: false },
    { code: 'CS202', name: 'Object Oriented Programming', isLab: false },
    { code: 'CS203', name: 'Database Management Systems', isLab: false },
    { code: 'CS204', name: 'Operating Systems', isLab: false },
    { code: 'CS205', name: 'AI Fundamentals', isLab: false },
    { code: 'CS206', name: 'Data Structures Lab', isLab: true },
    { code: 'CS207', name: 'OOP Lab', isLab: true }
  ],
  '1st Year': [
    { code: 'EN101', name: 'English', isLab: false },
    { code: 'MA101', name: 'Mathematics-I', isLab: false },
    { code: 'PH101', name: 'Physics', isLab: false },
    { code: 'CH101', name: 'Chemistry', isLab: false },
    { code: 'CS101', name: 'Programming for Problem Solving', isLab: false },
    { code: 'EN102', name: 'English Lab', isLab: true }
  ],
  '3rd Year': [
    { code: 'CS301', name: 'Machine Learning', isLab: false },
    { code: 'CS302', name: 'Computer Networks', isLab: false },
    { code: 'CS303', name: 'Software Engineering', isLab: false },
    { code: 'CS304', name: 'Web Technologies', isLab: false },
    { code: 'CS305', name: 'ML Lab', isLab: true },
    { code: 'CS306', name: 'Web Technologies Lab', isLab: true }
  ],
  '4th Year': [
    { code: 'CS401', name: 'Deep Learning', isLab: false },
    { code: 'CS402', name: 'Cloud Computing', isLab: false },
    { code: 'CS403', name: 'Big Data Analytics', isLab: false },
    { code: 'CS404', name: 'DevOps', isLab: false },
    { code: 'CS405', name: 'Project Work', isLab: false }
  ]
};
