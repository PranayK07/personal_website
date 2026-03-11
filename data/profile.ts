import { Profile, Provenance } from '@/lib/resume-advisor/types';

const websiteProvenance = (confidence = 0.98): Provenance => ({
  source: 'website',
  confidence,
});

export const profileData: Profile = {
  basics: {
    name: 'Pranay Kakkar',
    role: 'CS @ UConn',
    location: 'Connecticut',
    email: 'pranay.kakkar@outlook.com',
    phone: '(860)-593-8988',
    bio: "Hi, I'm Pranay Kakkar, a Computer Science major at UConn, passionate about applying data and machine learning to real-world problems. I've researched cryptography, ML, and physics while also enjoying soccer, astronomy, and side projects that help me learn new skills.",
    graduationDate: 'May 2027',
    gpa: '3.95 / 4.0',
    links: [
      {
        label: 'GitHub',
        url: 'https://github.com/PranayK07',
        provenance: websiteProvenance(),
      },
      {
        label: 'LinkedIn',
        url: 'https://linkedin.com/in/pranay-kakkar',
        provenance: websiteProvenance(),
      },
      {
        label: 'Twitter',
        url: 'https://twitter.com/pranay_kakkar',
        provenance: websiteProvenance(0.95),
      },
      {
        label: 'Portfolio',
        url: 'https://www.pranayk.dev',
        provenance: websiteProvenance(),
      },
    ],
    provenance: websiteProvenance(),
  },
  education: [
    {
      id: 'edu-uconn-bs-cs',
      school: 'University of Connecticut',
      degree: 'Bachelor of Science in Computer Science',
      location: 'Storrs, CT',
      graduationDate: 'May 2027',
      gpa: '3.95 / 4.0',
      coursework: [
        'Differential Equations',
        'Linear Algebra',
        'Data Structures & Algorithms',
        'Quantum Computers',
      ],
      honors: ['Honors', 'STEM Scholar (4-year scholarship)'],
      provenance: websiteProvenance(),
    },
  ],
  experience: [
    {
      id: 'exp-llm-security-research-2026',
      title: 'Researcher',
      company: 'LLM Agent-Tool Interaction & Security Research Group',
      location: 'Storrs, CT',
      date: 'Jan 2026 - Present',
      summary:
        'Conducted security research on agentic AI systems, synthesizing 10+ foundational papers into a unified threat model and red-teaming OpenClaw agents against prompt injection, memory poisoning, credential leakage, and unauthorized autonomous actions.',
      bullets: [
        'Synthesized 10+ papers into a practical agent security threat model covering prompt injection, memory poisoning, credential leakage, and unauthorized actions.',
        'Reproduced real-world OpenClaw failures, including Shellraiser-style incidents, and translated findings into actionable security test plans.',
      ],
      technologies: ['Python', 'LLM Agents', 'Red Teaming', 'Threat Modeling', 'AI Safety'],
      provenance: websiteProvenance(),
    },
    {
      id: 'exp-hillside-venture-analyst-2025',
      title: 'Analyst',
      company: 'Hillside Venture',
      location: 'Storrs, CT',
      date: 'Oct 2025 - Present',
      summary:
        'Conducted quantitative startup analysis for a student-run venture capital fund, evaluating 40+ early-stage companies and building financial models to support high-conviction investment decisions.',
      bullets: [
        'Sourced and evaluated 40+ early-stage fintech, AI, and SaaS startups through market research and competitive analysis.',
        'Built 3-statement financial models, unit economics, and DCF valuations for 10+ startups using KPI benchmarking and sensitivity analysis.',
      ],
      technologies: ['Financial Modeling', 'Market Research', 'DCF', 'KPI Benchmarking'],
      provenance: websiteProvenance(),
    },
    {
      id: 'exp-uconn-aiml-2024',
      title: 'AI/ML Researcher',
      company: 'University of Connecticut Undergraduate Research',
      location: 'Storrs, CT',
      date: 'May 2024 - Aug 2024',
      summary:
        'Conducted biometric cryptography research, co-developing face recognition privacy models at 92% accuracy and optimizing CUDA feature extraction workflows by 40%.',
      bullets: [
        'Co-developed face recognition privacy models (ResNet, DenseNet, SVM) achieving 92% accuracy.',
        'Engineered CUDA-accelerated feature extraction reducing runtime by 40% across 400K+ data samples.',
        'Documented model architecture evaluations (90-94% accuracy) to improve reproducibility and communication.',
      ],
      technologies: ['PyTorch', 'scikit-learn', 'CUDA', 'Python', 'Machine Learning', 'OpenCV', 'ETL', 'Git'],
      provenance: websiteProvenance(),
    },
    {
      id: 'exp-physics-lab-assistant-2023',
      title: 'Physics Lab Assistant',
      company: 'The McCarron Group, University of Connecticut',
      location: 'Storrs, CT',
      date: 'May 2023 - Sep 2023',
      summary:
        'Automated data collection and visualization for high-precision laser calibration, applying statistical regression to improve measurement accuracy and reporting.',
      bullets: [
        'Automated Python-based data collection and visualization workflows for high-precision experiments.',
        'Applied regression models to improve instrument control and measurement accuracy.',
        'Supported demonstrations and reports for 50+ researchers to improve team productivity.',
      ],
      technologies: ['Python', 'Matplotlib', 'Pandas', 'NumPy', 'Data Analysis', 'SciPy', 'SQL'],
      provenance: websiteProvenance(),
    },
    {
      id: 'exp-bobcat-programming-lead',
      title: 'Programming Lead',
      company: 'Bobcat Robotics - FRC Team 177',
      location: 'South Windsor, CT',
      date: '2023 - 2025',
      summary:
        'Engineered a modular robotics software library, translated requirements into control algorithms, and authored maintainable documentation for future teams.',
      bullets: [
        'Built modular robotics software with scalable architecture and intuitive interfaces.',
        'Collaborated across mechanical/electrical/software teams to convert requirements into control logic.',
      ],
      technologies: ['Java', 'Git', 'Python', 'JavaScript', 'Robotics', 'Motion Control', 'Team Leadership'],
      provenance: websiteProvenance(),
    },
  ],
  projects: [
    {
      id: 'proj-var-iquhack-2026',
      title: 'Value at Risk Estimation',
      role: 'Researcher & Developer',
      company: 'MIT iQuHack 2026 (3rd Place, State Street x Classiq Challenge)',
      date: 'Jan 2026',
      summary:
        'Developed a VaR estimation framework comparing classical Monte Carlo and quantum estimators, improving convergence for high-precision tail risk estimation.',
      bullets: [
        'Built a VaR framework comparing classical Monte Carlo against a quantum estimator for high-precision tail-risk estimation.',
        'Designed an optimized 95% quantile inversion pipeline reducing evaluation steps by 30-40%.',
        'Extended risk modeling to skewed/fat-tailed returns using CVaR and EVaR metrics.',
      ],
      technologies: ['Python', 'Quantum Computing', 'Quantitative Risk Modeling', 'Statistical Analysis', 'Optimization'],
      githubUrl: 'https://github.com/UConn-Quantum-Computing/MIT-iQuHack-2026-State-Street-Classiq',
      provenance: websiteProvenance(),
    },
    {
      id: 'proj-finmate-2025',
      title: 'FinMate',
      role: 'Backend Engineer',
      company: 'CodeLinc 10 Hackathon (2nd Place, $2,500 Award)',
      date: 'Oct 2025',
      summary:
        'Developed an AI-powered financial assistant using Claude Sonnet 4 via AWS Bedrock and a RAG-based backend for personalized benefits guidance.',
      bullets: [
        'Implemented a RAG-driven backend for personalized financial benefits guidance using Claude Sonnet 4 on AWS Bedrock.',
        'Built secure cloud infrastructure with Lambda, API Gateway, S3, RDS (MySQL), and EC2 for CRUD and retrieval workflows.',
      ],
      technologies: ['AWS Bedrock', 'Claude Sonnet 4', 'Lambda', 'API Gateway', 'RDS (MySQL)', 'S3', 'EC2', 'TypeScript'],
      githubUrl: 'https://github.com/SujayCh07/codelinc10',
      provenance: websiteProvenance(),
    },
    {
      id: 'proj-flowiq-2025',
      title: 'FlowIQ',
      role: 'Full Stack Developer',
      date: 'Oct 2025',
      summary:
        'Engineered an AI-enhanced analytics platform that automates data tracking, insight generation, and optimization across a scalable web stack.',
      bullets: [
        'Developed a React + TypeScript dashboard with Tailwind CSS, Recharts, and react-query for analytics visualization.',
        'Designed a modular analytics engine for MongoDB and future AWS/GCP integration.',
      ],
      technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Recharts', 'react-query', 'Vite', 'MongoDB', 'AWS'],
      githubUrl: 'https://github.com/PranayK07/FlowIQ',
      provenance: websiteProvenance(),
    },
    {
      id: 'proj-stationery-2025',
      title: 'Stationery',
      role: 'Mobile Developer',
      company: 'Congressional App Challenge',
      date: 'Jan 2025 - Mar 2025',
      summary:
        'Built a Kotlin + MongoDB career exploration app with personalized advising features, improving usability through user testing and iterative UX updates.',
      bullets: [
        'Built a Kotlin app with MongoDB-backed career advising features for personalized recommendations.',
        'Ran beta testing and UX iteration; received Special Recognition for Innovation.',
      ],
      technologies: ['Kotlin', 'MongoDB', 'Android Studio', 'NoSQL', 'Figma'],
      githubUrl: 'https://github.com/PranayK07/Stationery',
      provenance: websiteProvenance(),
    },
    {
      id: 'proj-bobcatlib-2024',
      title: 'BobcatLib',
      role: 'Software Engineer',
      company: 'Bobcat Robotics - FRC Team 177',
      date: 'May 2024',
      summary:
        'Developed a modular robotics software library with optimized control algorithms and maintainable team documentation.',
      bullets: [
        'Developed reusable robotics software modules with intuitive APIs for control subsystems.',
        'Created maintainable documentation and workflows to support long-term team usability.',
      ],
      technologies: ['Java', 'WPILib', 'Gradle', 'Git', 'FRC Robotics'],
      githubUrl: 'https://github.com/BobcatRobotics/BobcatLib',
      provenance: websiteProvenance(),
    },
    {
      id: 'proj-svm-face-2025',
      title: 'Face Classification with SVMs',
      role: 'Independent Project',
      date: 'Jun 2025',
      summary:
        'Built an LFW-based face recognition model using PCA and SVM kernels, with RBF delivering the best classification performance.',
      bullets: [
        'Built an LFW Deep Funneled pipeline with PCA dimensionality reduction and multiple SVM kernels.',
        'Benchmarked linear, polynomial, and RBF kernels; achieved best results with RBF.',
      ],
      technologies: ['Python', 'scikit-learn', 'PCA', 'SVM', 'OpenCV'],
      githubUrl: 'https://github.com/PranayK07/SVM_regressiontest',
      provenance: websiteProvenance(),
    },
  ],
  skills: [
    {
      id: 'skills-languages',
      label: 'Languages',
      skills: ['Python', 'TypeScript', 'JavaScript', 'Java', 'Kotlin', 'SQL', 'C/C++'],
      provenance: websiteProvenance(),
    },
    {
      id: 'skills-ml-ai',
      label: 'Machine Learning & AI',
      skills: ['PyTorch', 'scikit-learn', 'OpenCV', 'CUDA', 'RAG', 'LLM Agents'],
      provenance: websiteProvenance(),
    },
    {
      id: 'skills-cloud',
      label: 'Cloud & DevOps',
      skills: ['AWS', 'Azure', 'Docker', 'Lambda', 'API Gateway', 'EC2', 'S3', 'RDS'],
      provenance: websiteProvenance(),
    },
    {
      id: 'skills-tools',
      label: 'Tools',
      skills: ['Git', 'GitHub', 'React', 'Next.js', 'Tailwind CSS', 'MongoDB'],
      provenance: websiteProvenance(),
    },
  ],
  techStack: [
    {
      name: 'Python',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
      color: '#3776AB',
      provenance: websiteProvenance(),
    },
    {
      name: 'Git',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
      color: '#F05032',
      provenance: websiteProvenance(),
    },
    {
      name: 'TypeScript',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
      color: '#3178C6',
      provenance: websiteProvenance(),
    },
    {
      name: 'MongoDB',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
      color: '#47A248',
      provenance: websiteProvenance(),
    },
    {
      name: 'Java',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
      color: '#ED8B00',
      provenance: websiteProvenance(),
    },
    {
      name: 'AWS',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg',
      color: '#FF9900',
      provenance: websiteProvenance(),
    },
    {
      name: 'scikit-learn',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Scikit_learn_logo_small.svg',
      color: '#F7931E',
      provenance: websiteProvenance(),
    },
    {
      name: 'OpenCV',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/opencv/opencv-original.svg',
      color: '#5C3EE8',
      provenance: websiteProvenance(),
    },
    {
      name: 'React',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
      color: '#61DAFB',
      provenance: websiteProvenance(),
    },
    {
      name: 'JavaScript',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
      color: '#F7DF1E',
      provenance: websiteProvenance(),
    },
    {
      name: 'Azure',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg',
      color: '#0089D6',
      provenance: websiteProvenance(),
    },
    {
      name: 'Kotlin',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg',
      color: '#d500ae',
      provenance: websiteProvenance(),
    },
    {
      name: 'Docker',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
      color: '#2496ED',
      provenance: websiteProvenance(),
    },
    {
      name: 'CUDA',
      logo: 'https://www.vectorlogo.zone/logos/nvidia/nvidia-icon.svg',
      color: '#078912',
      provenance: websiteProvenance(),
    },
  ],
  overrides: [],
};
