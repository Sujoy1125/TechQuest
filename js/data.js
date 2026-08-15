/**
 * TechQuest - Master Data Catalog
 * Module: js/data.js
 * 
 * Provides mock datasets for tech events, skill domains, categories, and gamification badges.
 */

export const SKILL_DOMAINS = Object.freeze({
  FRONTEND: 'frontend',
  BACKEND: 'backend',
  AI: 'ai',
  CLOUD: 'cloud',
  CYBERSECURITY: 'cybersecurity',
  MOBILE: 'mobile'
});

export const CATEGORIES = Object.freeze({
  HACKATHON: 'Hackathon',
  WORKSHOP: 'Workshop',
  BOOTCAMP: 'Bootcamp',
  SPEAKER_SESSION: 'Speaker Session'
});

export const DIFFICULTIES = Object.freeze({
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced'
});

export const EVENTS_DATA = Object.freeze([
  {
    id: 'event-1',
    title: 'NeuralForge: Generative AI Hackathon',
    description: 'Build production-grade multimodal AI applications using LLMs, diffusion models, and vector databases in a 36-hour sprint.',
    category: 'Hackathon',
    tags: ['AI', 'LLM', 'Python', 'VectorDB'],
    date: '2026-09-12',
    location: 'San Francisco, CA & Online',
    xpReward: 450,
    skillDomain: 'ai',
    difficulty: 'Intermediate',
    seatsLeft: 24
  },
  {
    id: 'event-2',
    title: 'Zero-to-Hero: Modern React & WebGL Bootcamp',
    description: 'Master modern reactive state management, canvas rendering, and 3D web shaders with WebGL and React Three Fiber.',
    category: 'Bootcamp',
    tags: ['Frontend', 'React', 'WebGL', 'ThreeJS'],
    date: '2026-09-18',
    location: 'Online (Interactive Stream)',
    xpReward: 350,
    skillDomain: 'frontend',
    difficulty: 'Beginner',
    seatsLeft: 45
  },
  {
    id: 'event-3',
    title: 'Distributed Systems & Rust Core Workshop',
    description: 'Hands-on architectural deep dive into building fault-tolerant, high-throughput microservices using Rust and Tokio async runtime.',
    category: 'Workshop',
    tags: ['Backend', 'Rust', 'Async', 'Microservices'],
    date: '2026-09-22',
    location: 'Austin, TX & Hybrid',
    xpReward: 400,
    skillDomain: 'backend',
    difficulty: 'Advanced',
    seatsLeft: 12
  },
  {
    id: 'event-4',
    title: 'Keynote: The Quantum Computing Frontier',
    description: 'Dr. Evelyn Vance breaks down topological qubits, quantum error mitigation, and practical quantum algorithm applications.',
    category: 'Speaker Session',
    tags: ['Quantum', 'Hardware', 'Research', 'Algorithms'],
    date: '2026-09-25',
    location: 'Seattle, WA & Live Stream',
    xpReward: 150,
    skillDomain: 'ai',
    difficulty: 'Beginner',
    seatsLeft: 120
  },
  {
    id: 'event-5',
    title: 'CyberShield: Red Team vs Blue Team CTF',
    description: 'Intense 24-hour Capture The Flag competition testing binary exploitation, web vulnerabilities, zero-day mitigation, and cryptography.',
    category: 'Hackathon',
    tags: ['Cybersecurity', 'CTF', 'Reverse Engineering', 'AppSec'],
    date: '2026-10-02',
    location: 'Chicago, IL & Virtual',
    xpReward: 500,
    skillDomain: 'cybersecurity',
    difficulty: 'Advanced',
    seatsLeft: 18
  },
  {
    id: 'event-6',
    title: 'Cloud Native Kubernetes & GitOps Masterclass',
    description: 'Architect and deploy auto-scaling Kubernetes clusters with ArgoCD, Terraform, Helm, and observability with Prometheus & Grafana.',
    category: 'Workshop',
    tags: ['Cloud', 'Kubernetes', 'DevOps', 'Terraform'],
    date: '2026-10-08',
    location: 'New York, NY & Hybrid',
    xpReward: 350,
    skillDomain: 'cloud',
    difficulty: 'Intermediate',
    seatsLeft: 30
  },
  {
    id: 'event-7',
    title: 'UI/UX & Design Systems Engineering Workshop',
    description: 'Craft accessible, themeable design systems with tokens, CSS custom properties, micro-interactions, and ARIA guidelines.',
    category: 'Workshop',
    tags: ['Frontend', 'CSS', 'Accessibility', 'Design Systems'],
    date: '2026-10-14',
    location: 'Online (Hands-on Lab)',
    xpReward: 250,
    skillDomain: 'frontend',
    difficulty: 'Beginner',
    seatsLeft: 50
  },
  {
    id: 'event-8',
    title: 'Cross-Platform Mobile Arc: Flutter & Swift Immersion',
    description: 'Build high-performance mobile apps with reactive state, offline-first SQLite sync, and native iOS Swift bridge integration.',
    category: 'Bootcamp',
    tags: ['Mobile', 'Flutter', 'Swift', 'Dart'],
    date: '2026-10-20',
    location: 'Boston, MA & Online',
    xpReward: 400,
    skillDomain: 'mobile',
    difficulty: 'Intermediate',
    seatsLeft: 20
  },
  {
    id: 'event-9',
    title: 'Next-Gen Database Internals: LSM Trees & Raft Consensus',
    description: 'Explore how modern distributed databases work under the hood by implementing custom Write-Ahead Logs, LSM Trees, and Raft consensus.',
    category: 'Speaker Session',
    tags: ['Backend', 'Databases', 'Distributed Systems', 'Storage'],
    date: '2026-10-28',
    location: 'Online Broadcast',
    xpReward: 200,
    skillDomain: 'backend',
    difficulty: 'Advanced',
    seatsLeft: 85
  },
  {
    id: 'event-10',
    title: 'Autonomous Agents & Graph RAG Challenge',
    description: 'Design autonomous agent swarms utilizing knowledge graph Retrieval-Augmented Generation, tool calling, and self-reflection loops.',
    category: 'Hackathon',
    tags: ['AI', 'Agents', 'LangChain', 'Knowledge Graphs'],
    date: '2026-11-05',
    location: 'Denver, CO & Virtual',
    xpReward: 450,
    skillDomain: 'ai',
    difficulty: 'Intermediate',
    seatsLeft: 15
  },
  {
    id: 'event-11',
    title: 'DevSecOps Pipeline Automation Bootcamp',
    description: 'Integrate static analysis (SAST), dynamic analysis (DAST), container image scanning, and automated compliance into CI/CD pipelines.',
    category: 'Bootcamp',
    tags: ['DevOps', 'Cybersecurity', 'CI/CD', 'Docker'],
    date: '2026-11-12',
    location: 'Online Intensive',
    xpReward: 350,
    skillDomain: 'cybersecurity',
    difficulty: 'Intermediate',
    seatsLeft: 28
  },
  {
    id: 'event-12',
    title: 'Serverless at Scale & Edge Computing Summit',
    description: 'Learn low-latency edge computing patterns, Cloudflare Workers, edge database caching, and globally distributed event routing.',
    category: 'Speaker Session',
    tags: ['Cloud', 'Serverless', 'Edge', 'NodeJS'],
    date: '2026-11-20',
    location: 'Seattle, WA & Global Stream',
    xpReward: 200,
    skillDomain: 'cloud',
    difficulty: 'Beginner',
    seatsLeft: 110
  }
]);

export const BADGE_DEFINITIONS = Object.freeze([
  {
    id: 'first-quest',
    name: 'First Quest Complete',
    description: 'Conquered your very first TechQuest event.',
    icon: '🎯',
    tier: 'Bronze'
  },
  {
    id: 'hackathon-veteran',
    name: 'Hackathon Veteran',
    description: 'Completed at least one grueling hackathon sprint.',
    icon: '⚡',
    tier: 'Silver'
  },
  {
    id: 'ai-pioneer',
    name: 'AI Pioneer',
    description: 'Earned 400+ XP in Artificial Intelligence quests.',
    icon: '🤖',
    tier: 'Gold'
  },
  {
    id: 'frontend-artisan',
    name: 'Frontend Artisan',
    description: 'Earned 400+ XP crafting modern web interfaces.',
    icon: '🎨',
    tier: 'Gold'
  },
  {
    id: 'backend-architect',
    name: 'Backend Architect',
    description: 'Earned 400+ XP engineering distributed backend systems.',
    icon: '🛡️',
    tier: 'Gold'
  },
  {
    id: 'security-sentinel',
    name: 'Security Sentinel',
    description: 'Earned 400+ XP in Cybersecurity challenges.',
    icon: '🔒',
    tier: 'Gold'
  },
  {
    id: 'cloud-navigator',
    name: 'Cloud Navigator',
    description: 'Earned 400+ XP deploying cloud-native architectures.',
    icon: '☁️',
    tier: 'Gold'
  },
  {
    id: 'quest-master',
    name: 'Quest Master',
    description: 'Successfully completed 5 or more tech events.',
    icon: '👑',
    tier: 'Diamond'
  },
  {
    id: 'xp-titan',
    name: 'XP Titan',
    description: 'Attained Level 3 or higher on the global leaderboard.',
    icon: '🏆',
    tier: 'Legendary'
  }
]);
