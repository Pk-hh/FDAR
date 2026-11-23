export interface CourseOutcome {
  code: string;
  description: string;
}

export interface SubjectSyllabus {
  subjectCode: string;
  subjectName: string;
  departmentId: string;
  totalUnits: number;
  courseOutcomes: CourseOutcome[];
  units: {
    unitNumber: number;
    title: string;
    topicsCount: number;
    coveredCount: number;
  }[];
}

export const INITIAL_SYLLABUS_DATA: SubjectSyllabus[] = [
  {
    subjectCode: 'CS301PC',
    subjectName: 'Database Management Systems',
    departmentId: 'dept_cse',
    totalUnits: 5,
    courseOutcomes: [
      { code: 'CO1', description: 'Understand fundamental concepts of Database Management Systems and Entity-Relationship modeling.' },
      { code: 'CO2', description: 'Formulate relational algebra and SQL queries for data definition and manipulation.' },
      { code: 'CO3', description: 'Design database schema using functional dependencies and normalization techniques (1NF, 2NF, 3NF, BCNF).' },
      { code: 'CO4', description: 'Analyze transaction processing, ACID properties, concurrency control, and recovery methods.' },
      { code: 'CO5', description: 'Evaluate file indexing techniques, B/B+ trees, and query optimization strategies.' },
    ],
    units: [
      { unitNumber: 1, title: 'Introduction to DBMS & ER Modeling', topicsCount: 8, coveredCount: 8 },
      { unitNumber: 2, title: 'Relational Model & Advanced SQL', topicsCount: 10, coveredCount: 10 },
      { unitNumber: 3, title: 'Schema Refinement & Normalization (1NF-BCNF)', topicsCount: 9, coveredCount: 7 },
      { unitNumber: 4, title: 'Transaction Management & Concurrency Control', topicsCount: 8, coveredCount: 3 },
      { unitNumber: 5, title: 'Indexing, Hashing & Query Optimization', topicsCount: 7, coveredCount: 0 },
    ],
  },
  {
    subjectCode: 'CS302PC',
    subjectName: 'Operating Systems',
    departmentId: 'dept_cse',
    totalUnits: 5,
    courseOutcomes: [
      { code: 'CO1', description: 'Examine OS structure, system calls, and computer system architecture.' },
      { code: 'CO2', description: 'Evaluate CPU scheduling algorithms, process synchronization, and deadlock prevention.' },
      { code: 'CO3', description: 'Analyze memory management, paging, segmentation, and virtual memory page replacement.' },
      { code: 'CO4', description: 'Understand mass storage structure, disk scheduling, and file system interface.' },
      { code: 'CO5', description: 'Assess OS security, protection mechanisms, and distributed OS principles.' },
    ],
    units: [
      { unitNumber: 1, title: 'OS Architecture & Process Management', topicsCount: 8, coveredCount: 8 },
      { unitNumber: 2, title: 'CPU Scheduling & Process Synchronization', topicsCount: 10, coveredCount: 8 },
      { unitNumber: 3, title: 'Deadlocks & Memory Management', topicsCount: 9, coveredCount: 4 },
      { unitNumber: 4, title: 'Virtual Memory & File Systems', topicsCount: 8, coveredCount: 0 },
      { unitNumber: 5, title: 'Disk Management, Protection & Security', topicsCount: 7, coveredCount: 0 },
    ],
  },
  {
    subjectCode: 'CS305PC',
    subjectName: 'Web Development Lab',
    departmentId: 'dept_cse',
    totalUnits: 5,
    courseOutcomes: [
      { code: 'CO1', description: 'Design responsive static user interfaces with HTML5 and modern CSS3.' },
      { code: 'CO2', description: 'Implement dynamic DOM manipulation and asynchronous data fetching with JavaScript.' },
      { code: 'CO3', description: 'Develop single page web applications using React.js and modern state management.' },
      { code: 'CO4', description: 'Integrate cloud authentication and NoSQL cloud databases using Firebase.' },
      { code: 'CO5', description: 'Deploy and evaluate production-ready web apps with PWA offline caching.' },
    ],
    units: [
      { unitNumber: 1, title: 'HTML5, Responsive CSS Grid & Flexbox', topicsCount: 6, coveredCount: 6 },
      { unitNumber: 2, title: 'Modern JavaScript ES6+ & Fetch API', topicsCount: 6, coveredCount: 6 },
      { unitNumber: 3, title: 'React Hooks, Props & Component Lifecycle', topicsCount: 8, coveredCount: 6 },
      { unitNumber: 4, title: 'Firebase Authentication & Cloud Firestore', topicsCount: 6, coveredCount: 3 },
      { unitNumber: 5, title: 'Full Stack Integration, PWA & Cloud Deployment', topicsCount: 6, coveredCount: 1 },
    ],
  },
  {
    subjectCode: 'EC301PC',
    subjectName: 'Analog Circuits',
    departmentId: 'dept_ece',
    totalUnits: 5,
    courseOutcomes: [
      { code: 'CO1', description: 'Analyze small-signal low-frequency models of BJT and FET amplifiers.' },
      { code: 'CO2', description: 'Design multistage amplifiers and feedback amplifiers with stability criteria.' },
      { code: 'CO3', description: 'Evaluate operational amplifier circuits, filters, and multivibrators.' },
      { code: 'CO4', description: 'Design tuned amplifiers and voltage regulators.' },
      { code: 'CO5', description: 'Analyze power amplifiers and distortion parameters.' },
    ],
    units: [
      { unitNumber: 1, title: 'Transistor Amplifiers Analysis', topicsCount: 8, coveredCount: 8 },
      { unitNumber: 2, title: 'Feedback Amplifiers & Oscillators', topicsCount: 8, coveredCount: 7 },
      { unitNumber: 3, title: 'Operational Amplifiers & Linear Applications', topicsCount: 8, coveredCount: 5 },
      { unitNumber: 4, title: 'Active Filters & Multivibrators', topicsCount: 7, coveredCount: 2 },
      { unitNumber: 5, title: 'Large Signal / Power Amplifiers', topicsCount: 6, coveredCount: 0 },
    ],
  },
];
