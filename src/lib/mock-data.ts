import {
  StudyTask,
  StudyMaterial,
  Quiz,
  ChatMessage,
  UserStats,
  ActivityItem,
  SubjectMastery,
} from "@/types";

export const DEMO_USER = {
  name: "Alex Chen",
  email: "alex.chen@student.edu",
  major: "High School & College Prep",
  university: "Student Academy",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
};

export const INITIAL_DEMO_TASKS: StudyTask[] = [
  {
    id: "task-1",
    title: "Review Glycolysis & Krebs Cycle pathway diagrams",
    subject: "Biology",
    dueDate: "2026-10-30",
    priority: "high",
    completed: false,
    estimatedMinutes: 45,
    notes: "Focus on ATP yield per glucose molecule and regulatory enzymes (PFK-1).",
    createdAt: "2026-10-26T10:00:00Z",
  },
  {
    id: "task-2",
    title: "Complete Dynamic Programming practice problem set",
    subject: "Computer Science",
    dueDate: "2026-10-31",
    priority: "high",
    completed: false,
    estimatedMinutes: 60,
    notes: "Memoization vs Tabulation for 0/1 Knapsack problem.",
    createdAt: "2026-10-26T11:30:00Z",
  },
  {
    id: "task-3",
    title: "Summarize SN1 vs SN2 reaction mechanisms and stereochemistry",
    subject: "Chemistry",
    dueDate: "2026-11-02",
    priority: "medium",
    completed: false,
    estimatedMinutes: 40,
    notes: "Pay attention to solvent polarity effects and carbocation rearrangement.",
    createdAt: "2026-10-27T09:15:00Z",
  },
  {
    id: "task-4",
    title: "Read Chapter 5: Eigenvalues & Matrix Diagonalization",
    subject: "Mathematics",
    dueDate: "2026-11-04",
    priority: "low",
    completed: true,
    estimatedMinutes: 50,
    notes: "Prepared notes on characteristic polynomials.",
    createdAt: "2026-10-25T14:00:00Z",
  },
  {
    id: "task-5",
    title: "Generate quick review flashcards for Physics Lab 4",
    subject: "Physics",
    dueDate: "2026-11-05",
    priority: "medium",
    completed: true,
    estimatedMinutes: 30,
    notes: "Optics and diffraction grating formulas.",
    createdAt: "2026-10-25T16:20:00Z",
  },
];

export const INITIAL_DEMO_MATERIALS: StudyMaterial[] = [
  {
    id: "mat-1",
    title: "Molecular Biology & Cellular Respiration.pdf",
    subject: "Biology",
    fileType: "pdf",
    fileSize: 3420000, // ~3.4 MB
    pageCount: 28,
    uploadedAt: "2026-10-26T08:30:00Z",
    status: "ready",
    summaryPreview:
      "Comprehensive breakdown of mitochondrial oxidative phosphorylation, electron transport chains, and chemiosmotic ATP synthesis.",
    keyTopics: ["Glycolysis", "Citric Acid Cycle", "ATP Synthase", "Electron Transport Chain"],
    isDemo: true,
    sampleContent: `CHAPTER: CELLULAR RESPIRATION & MOLECULAR BIOENERGETICS
Course: BIO 101 - General & Molecular Biology

1. OVERVIEW & FUNDAMENTAL PRINCIPLES
Cellular respiration is the biochemical metabolic process by which cells break down glucose to produce Adenosine Triphosphate (ATP), the primary energy currency of biological life. The process takes place across the cytoplasm and mitochondria.

2. FOUR KEY STAGES OF CELLULAR RESPIRATION
- Glycolysis: Occurs in the cytoplasm without oxygen (anaerobic). Converts one 6-carbon Glucose into two 3-carbon Pyruvate molecules, producing net 2 ATP and 2 NADH. Key regulatory enzyme: Phosphofructokinase-1 (PFK-1).
- Pyruvate Oxidation: Pyruvate transitions into the mitochondrial matrix and is converted into Acetyl-CoA, releasing CO2 and producing 1 NADH per pyruvate.
- Citric Acid Cycle (Krebs Cycle): In the mitochondrial matrix. Acetyl-CoA combines with Oxaloacetate to form Citrate. Yields 2 ATP/GTP, 6 NADH, 2 FADH2, and 4 CO2 per original glucose molecule.
- Oxidative Phosphorylation & Electron Transport Chain (ETC): In the inner mitochondrial membrane (cristae). High-energy electrons donated by NADH and FADH2 pass through complexes I through IV, pumping protons into the intermembrane space to create an electrochemical proton gradient. Protons return through ATP Synthase to generate ~26 to 28 ATP. Oxygen is the final electron acceptor, forming water.

3. KEY DEFINITIONS
- ATP Synthase: Rotary motor enzyme that catalyzes ATP synthesis from ADP and inorganic phosphate using the proton-motive force.
- Chemiosmosis: Movement of hydrogen ions down their electrochemical gradient across the membrane to generate ATP.
- Glycolysis: The initial 10-step enzymatic breakdown of glucose in the cytoplasm.
- Mitochondria: The double-membrane powerhouse organelle where the Krebs cycle and oxidative phosphorylation take place.

4. EXAM TAKEAWAYS
- Theoretical maximum yield per glucose is ~30-32 ATP.
- If oxygen is absent, cells perform fermentation (lactic acid or ethanol) to regenerate NAD+ for glycolysis.
- Phosphofructokinase-1 (PFK-1) is allosterically inhibited by ATP and Citrate, and stimulated by AMP.`,
  },
  {
    id: "mat-2",
    title: "Algorithms & Complexity: Graph Traversals.pdf",
    subject: "Computer Science",
    fileType: "pdf",
    fileSize: 1850000, // ~1.85 MB
    pageCount: 19,
    uploadedAt: "2026-10-25T15:45:00Z",
    status: "ready",
    summaryPreview:
      "Detailed analysis of BFS, DFS, Dijkstra's algorithm, and A* search with asymptotic runtime guarantees and pseudocode.",
    keyTopics: ["BFS/DFS", "Dijkstra", "Shortest Path", "Time Complexity", "Priority Queues"],
    isDemo: true,
    sampleContent: `CHAPTER: GRAPH TRAVERSALS & SHORTEST PATH ALGORITHMS
Course: CS 210 - Algorithms & Data Structures

1. GRAPH REPRESENTATION & TRAVERSALS
Graphs G = (V, E) consist of vertices and edges.
- Breadth-First Search (BFS): Explores graph level by level using a Queue (FIFO). Computes shortest path on unweighted graphs in O(V + E) time.
- Depth-First Search (DFS): Explores deepest paths first using a Stack or recursion. Used for cycle detection, topological sorting, and strongly connected components in O(V + E) time.

2. SHORTEST PATH ALGORITHMS
- Dijkstra's Algorithm: Computes single-source shortest paths on graphs with non-negative edge weights using a min-priority queue (Binary Heap). Time complexity: O((V + E) log V).
- Why Dijkstra Fails with Negative Weights: Dijkstra assumes that once a node is marked visited, its distance is finalized and cannot be decreased. Negative edges violate this greedy property by potentially creating cheaper paths after a node has been visited.
- Bellman-Ford Algorithm: Handles graphs with negative edge weights and detects negative weight cycles in O(V * E) time.
- A* Search: Goal-directed shortest path algorithm using a heuristic function f(n) = g(n) + h(n). If h(n) is admissible and consistent, A* is guaranteed optimal.

3. KEY DEFINITIONS
- Admissible Heuristic: A heuristic h(n) that never overestimates the true cost to reach the goal.
- Greedy Property: Selecting locally optimal choices at each stage in the hope of finding a global optimum.
- Priority Queue: Abstract data type where each element has a priority, implemented via binary min-heaps.

4. EXAM TAKEAWAYS
- Use BFS for unweighted shortest paths.
- Use Dijkstra for non-negative weighted shortest paths.
- Use Bellman-Ford when negative edges are possible.`,
  },
  {
    id: "mat-3",
    title: "Organic Chemistry: Nucleophilic Substitution.pdf",
    subject: "Chemistry",
    fileType: "pdf",
    fileSize: 980000, // ~980 KB
    pageCount: 12,
    uploadedAt: "2026-10-27T12:10:00Z",
    status: "ready",
    summaryPreview:
      "Reaction kinetics, nucleophile strength, leaving group ability, and inversion of configuration in SN2 versus racemization in SN1.",
    keyTopics: ["SN1 vs SN2", "Steric Hindrance", "Carbocations", "Walden Inversion"],
    isDemo: true,
    sampleContent: `CHAPTER: NUCLEOPHILIC SUBSTITUTION REACTIONS (SN1 VS SN2)
Course: CHEM 220 - Organic Chemistry I

1. REACTION MECHANISMS
- SN1 Mechanism: A two-step unimolecular substitution. The leaving group leaves first to form a planar carbocation intermediate. The nucleophile then attacks from either the top or bottom face, resulting in racemization.
- SN2 Mechanism: A one-step concerted bimolecular substitution. The nucleophile attacks the electrophilic carbon from the backside simultaneously as the leaving group departs, leading to 100% Walden inversion of stereochemistry.

2. RATE LAWS & KINETICS
- SN1 Rate Law: Rate = k[Substrate] (First order). Nucleophile concentration has no effect on the rate.
- SN2 Rate Law: Rate = k[Substrate][Nucleophile] (Second order). Doubling nucleophile concentration doubles the rate.

3. SUBSTRATE AND SOLVENT EFFECTS
- Substrate order for SN1: 3° > 2° >> 1° > Methyl (due to carbocation hyperconjugation stability).
- Substrate order for SN2: Methyl > 1° > 2° >>> 3° (due to steric hindrance blocking backside attack).
- Solvents for SN1: Polar protic solvents (H2O, MeOH) stabilize the carbocation and leaving group.
- Solvents for SN2: Polar aprotic solvents (Acetone, DMSO, DMF) maximize nucleophile reactivity without solvating anions.

4. KEY DEFINITIONS
- Carbocation: Positively charged trivalent carbon intermediate with sp2 hybridization.
- Walden Inversion: Complete stereochemical inversion of configuration during an SN2 backside attack.
- Leaving Group: An atom or group that departs with a pair of electrons; weak bases are the best leaving groups (I- > Br- > Cl- >> F-).`,
  },
  {
    id: "mat-4",
    title: "Calculus III: Vector Fields & Green's Theorem.pdf",
    subject: "Mathematics",
    fileType: "pdf",
    fileSize: 2200000, // ~2.2 MB
    pageCount: 16,
    uploadedAt: "2026-10-24T18:00:00Z",
    status: "ready",
    summaryPreview:
      "Line integrals over scalar and vector fields, conservative vector fields, curl, divergence, and applications of Green's theorem.",
    keyTopics: ["Line Integrals", "Green's Theorem", "Curl & Divergence", "Conservative Fields"],
    isDemo: true,
    sampleContent: `CHAPTER: VECTOR FIELDS & GREEN'S THEOREM
Course: MATH 240 - Multivariable Calculus

1. VECTOR FIELDS & CONSERVATIVE FIELDS
A vector field F(x, y) = P(x, y)i + Q(x, y)j assigns a vector to every point in the plane.
- A vector field is conservative if F = grad(f) for some scalar potential function f.
- In simply connected domains, F is conservative if and only if dP/dy = dQ/dx (curl is zero).
- Fundamental Theorem of Line Integrals: If F is conservative, the line integral along curve C from A to B depends only on endpoints: integral_C F . dr = f(B) - f(A) (path independence).

2. GREEN'S THEOREM
Let C be a positively oriented, piecewise smooth, simple closed curve in the plane, enclosing region D. If P and Q have continuous partial derivatives on an open region containing D, then:
  line_integral_C (P dx + Q dy) = double_integral_D (dQ/dx - dP/dy) dA.

3. CURL AND DIVERGENCE
- Curl: Measures the rotational tendency of a vector field (curl F = dQ/dx - dP/dy).
- Divergence: Measures the net outward flux per unit area (div F = dP/dx + dQ/dy).

4. EXAM TAKEAWAYS
- If curve C is closed and F is conservative, line_integral_C F . dr = 0.
- Green's theorem converts difficult line integrals around closed curves into double integrals over the interior area.`,
  },
  {
    id: "mat-5",
    title: "Python Quick Reference & Data Structures.txt",
    subject: "Computer Science",
    fileType: "txt",
    fileSize: 45000, // ~45 KB
    pageCount: 3,
    uploadedAt: "2026-10-27T16:20:00Z",
    status: "ready",
    summaryPreview:
      "Core Python syntax, list comprehensions, dictionary operations, time complexity cheat sheet, and recursion fundamentals.",
    keyTopics: ["Lists & Dicts", "Time Complexity", "Decorators", "Recursion"],
    isDemo: true,
    sampleContent: `=====================================================
PYTHON QUICK REFERENCE & ALGORITHM CHEAT SHEET
Course: CS 201 - Data Structures & Algorithms
Author: Alex Chen (Study Notes)
Date: October 2026
=====================================================

1. BUILT-IN DATA STRUCTURES & TIME COMPLEXITY
-----------------------------------------------------
* Lists (Dynamic Arrays):
  - Index access [i]: O(1)
  - Append to end: O(1) amortized
  - Insert / Delete at index: O(n)
  - Search: O(n)

* Dictionaries (Hash Maps) & Sets:
  - Key lookup / insertion: O(1) average
  - Key deletion: O(1) average
  - Iteration: O(n)

* Deque (collections.deque):
  - Pop left / append left: O(1)
  - Ideal for Breadth-First Search (BFS) queues.

2. LIST COMPREHENSIONS & FUNCTIONAL IDIOMS
-----------------------------------------------------
# Basic filtering and transformation:
squares = [x**2 for x in range(10) if x % 2 == 0]

# Dictionary comprehension:
word_counts = {w: len(w) for w in ["biology", "algorithm", "calculus"]}

3. RECURSION & MEMOIZATION PATTERN
-----------------------------------------------------
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n: int) -> int:
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

4. ESSENTIAL GRAPH REPRESENTATION (Adjacency List)
-----------------------------------------------------
graph = {
    'A': ['B', 'C'],
    'B': ['A', 'D', 'E'],
    'C': ['A', 'F'],
    'D': ['B'],
    'E': ['B', 'F'],
    'F': ['C', 'E']
}
=====================================================
(End of preview notes)`,
  },
  {
    id: "mat-6",
    title: "Web Design & Frontend Architecture: HTML5, CSS3, Responsive UI/UX.pdf",
    subject: "Computer Science",
    fileType: "pdf",
    fileSize: 2450000, // ~2.45 MB
    pageCount: 22,
    uploadedAt: "2026-10-28T14:20:00Z",
    status: "ready",
    summaryPreview:
      "Comprehensive guide to modern Web Design, HTML5 semantic structure, CSS3 responsive layouts (Flexbox & Grid), UI/UX design heuristics, and web accessibility standards.",
    keyTopics: ["Web Design Principles", "HTML5 Semantics", "CSS3 Flexbox & Grid", "Responsive Web Design", "UI vs UX", "Accessibility (WCAG)"],
    isDemo: true,
    sampleContent: `CHAPTER: WEB DESIGN & MODERN FRONTEND ARCHITECTURE
Course: CS 160 - Web Design & Frontend Engineering

1. OVERVIEW & FUNDAMENTALS OF WEB DESIGN
Web design is the holistic process of conceptualizing, planning, and creating digital interfaces and experiences for the World Wide Web. It bridges visual aesthetics (UI), human-centered usability (UX), and technical implementation across diverse screen sizes and devices.

2. THE THREE FOUNDATIONAL PILLARS
- HTML5 (Structure & Semantics): Defines document meaning and hierarchy using semantic tags (<header>, <nav>, <main>, <article>, <section>, <aside>, <footer>) rather than generic <div> elements. Improves accessibility for screen readers and search engine indexability (SEO).
- CSS3 (Visual Presentation & Layout):
  * Box Model: Every element is a rectangular box composed of Content, Padding, Border, and Margin (box-sizing: border-box is standard practice).
  * Flexbox (Flexible Box Layout): One-dimensional layout system ideal for distributing space and aligning items along a single axis (row or column).
  * CSS Grid: Two-dimensional layout system enabling complex row-and-column modular architectures.
  * Responsive Web Design (RWD): Utilizes fluid grid systems, CSS Media Queries (@media (max-width: 768px)), relative units (rem, em, %, clamp(), vh/vw), and the viewport meta tag to adapt seamlessly from smartphones to 4K displays.
- JavaScript (Interactivity & Client State): Manipulates the Document Object Model (DOM), handles asynchronous events (Event Listeners, Promises, Fetch API), and manages dynamic user interactions.

3. UI VS UX DESIGN PRINCIPLES
- UI (User Interface Design): The sensory and visual layer — visual hierarchy, color theory, typography pairings, whitespace, micro-interactions, and component consistency.
- UX (User Experience Design): The cognitive and functional layer — user journeys, information architecture, wireframing, cognitive load reduction, usability testing, and WCAG accessibility standards (contrast ratios, keyboard navigability).

4. KEY DEFINITIONS
- Responsive Web Design (RWD): Design methodology ensuring web content renders fluidly across all devices using CSS media queries and flexible layouts.
- Flexbox: A 1D CSS layout module designed for alignment, space distribution, and directional flow of elements.
- CSS Grid: A 2D CSS layout engine providing grid tracks, rows, and areas for complex page templates.
- DOM (Document Object Model): Tree-like object representation of the HTML document created by the browser, accessible via JavaScript.
- Semantic HTML: Markup that conveys the meaning of its content to machines and humans, not just its visual appearance.

5. EXAM & INTERVIEW TAKEAWAYS
- Mobile-First Design: Designing for mobile viewports first and progressively enhancing for larger viewports produces cleaner, more performant CSS.
- Flexbox is for 1-dimensional layouts (a row OR a column); CSS Grid is for 2-dimensional layouts (rows AND columns simultaneously).
- Always set <meta name="viewport" content="width=device-width, initial-scale=1.0"> in HTML headers.
- Use rem for scalable typography and accessibility, rather than rigid px.`,
  },
];

export const DEMO_QUIZZES: Quiz[] = [
  {
    id: "quiz-bio-1",
    title: "Cellular Bioenergetics & Respiration",
    subject: "Biology",
    description:
      "Test your understanding of glycolysis, the citric acid cycle, and oxidative phosphorylation. Curated for mid-term university revision.",
    timeLimitMinutes: 10,
    createdAt: "2026-10-26T14:00:00Z",
    isDemo: true,
    questions: [
      {
        id: "q1",
        question:
          "Which enzyme is considered the primary committed, rate-limiting step of glycolysis?",
        options: [
          "Hexokinase",
          "Phosphofructokinase-1 (PFK-1)",
          "Pyruvate kinase",
          "Aldolase",
        ],
        correctAnswerIndex: 1,
        explanation:
          "Phosphofructokinase-1 (PFK-1) catalyzes the irreversible conversion of fructose-6-phosphate to fructose-1,6-bisphosphate and is tightly regulated by ATP and AMP levels.",
        topic: "Glycolysis Regulation",
      },
      {
        id: "q2",
        question:
          "During the electron transport chain, protons are pumped from where to where in eukaryotic cells?",
        options: [
          "From the intermembrane space into the mitochondrial matrix",
          "From the mitochondrial matrix into the intermembrane space",
          "From the cytoplasm directly into the inner membrane",
          "From the outer membrane into the cytoplasm",
        ],
        correctAnswerIndex: 1,
        explanation:
          "Complexes I, III, and IV pump protons from the mitochondrial matrix outward into the intermembrane space, creating the proton-motive force.",
        topic: "Oxidative Phosphorylation",
      },
      {
        id: "q3",
        question:
          "What is the ultimate terminal electron acceptor in aerobic respiration?",
        options: [
          "NAD+",
          "Cytochrome c",
          "Molecular oxygen (O2)",
          "Water (H2O)",
        ],
        correctAnswerIndex: 2,
        explanation:
          "Molecular oxygen (O2) serves as the final electron acceptor in Complex IV, where it is reduced to form water.",
        topic: "Electron Transport Chain",
      },
      {
        id: "q4",
        question:
          "Approximately how many moles of ATP are produced per mole of glucose under full aerobic respiration in eukaryotic cells?",
        options: ["2 ATP", "12-14 ATP", "30-32 ATP", "64 ATP"],
        correctAnswerIndex: 2,
        explanation:
          "Modern biochemical accounting estimates an average yield of 30 to 32 ATP molecules per glucose molecule, accounting for transport costs and NADH shuttle mechanisms.",
        topic: "ATP Stoichiometry",
      },
      {
        id: "q5",
        question:
          "Which intermediate of the Krebs cycle condenses with acetyl-CoA in the first reaction catalyzed by citrate synthase?",
        options: [
          "Oxaloacetate",
          "Alpha-ketoglutarate",
          "Succinate",
          "Fumarate",
        ],
        correctAnswerIndex: 0,
        explanation:
          "Oxaloacetate (4 carbons) condenses with acetyl-CoA (2 carbons) to produce citrate (6 carbons).",
        topic: "Citric Acid Cycle",
      },
    ],
  },
  {
    id: "quiz-cs-1",
    title: "Graph Traversal & Shortest Path Algorithms",
    subject: "Computer Science",
    description:
      "Assess your knowledge of BFS, DFS, Dijkstra's algorithm, and time complexities on standard graph representations.",
    timeLimitMinutes: 10,
    createdAt: "2026-10-27T10:00:00Z",
    isDemo: true,
    questions: [
      {
        id: "q-cs-1",
        question:
          "What is the time complexity of Dijkstra's algorithm implemented with a min-priority queue (binary heap) on a graph with V vertices and E edges?",
        options: ["O(V^2)", "O(E * log V)", "O(V + E)", "O(E^2)"],
        correctAnswerIndex: 1,
        explanation:
          "Using a binary heap, extracting min takes O(log V) for V vertices and decreasing keys takes O(log V) for up to E edges, yielding O((V + E) log V) or O(E log V) for connected graphs.",
        topic: "Dijkstra Complexity",
      },
      {
        id: "q-cs-2",
        question:
          "Which condition causes Dijkstra's algorithm to fail to produce correct shortest paths?",
        options: [
          "Directed acyclic graphs (DAGs)",
          "Graphs with dense cycles",
          "Graphs containing edges with negative weights",
          "Graphs with disconnected components",
        ],
        correctAnswerIndex: 2,
        explanation:
          "Dijkstra assumes that once a vertex is extracted from the priority queue, its distance is finalized (greedy property). Negative edge weights violate this assumption.",
        topic: "Shortest Path Correctness",
      },
      {
        id: "q-cs-3",
        question:
          "Which data structure is fundamentally utilized by Breadth-First Search (BFS)?",
        options: ["Stack (LIFO)", "Queue (FIFO)", "Max Heap", "Binary Search Tree"],
        correctAnswerIndex: 1,
        explanation:
          "BFS processes vertices in increasing order of distance from the source, using a First-In-First-Out (FIFO) queue.",
        topic: "BFS Traversal",
      },
    ],
  },
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    role: "assistant",
    content:
      "Hello Alex! How can I help with your studies today? You can ask a concept breakdown, request a summary of your materials, or test your recall with practice drills.",
    timestamp: "10:30 AM",
    suggestedFollowUps: [
      "Explain the difference between SN1 and SN2 reactions",
      "Summarize oxidative phosphorylation in mitochondria",
      "Why does Dijkstra fail with negative edge weights?",
    ],
    isDemo: true,
  },
];

export const DEMO_USER_STATS: UserStats = {
  totalHoursStudied: 24.5,
  materialsCount: 4,
  quizzesCompleted: 12,
  retentionRate: 89,
  studyStreakDays: 6,
};

export const DEMO_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    type: "quiz",
    title: "Completed Quiz: Cellular Bioenergetics",
    description: "Scored 5/5 (100%) in 4 minutes",
    timestamp: "2 hours ago",
    badge: "100%",
  },
  {
    id: "act-2",
    type: "material",
    title: "Uploaded 'Organic Chemistry: Nucleophilic Substitution'",
    description: "Extracted 12 pages, indexed 4 key topics",
    timestamp: "Yesterday",
    badge: "Indexed",
  },
  {
    id: "act-3",
    type: "task",
    title: "Completed Study Task",
    description: "Read Chapter 5: Eigenvalues & Matrix Diagonalization",
    timestamp: "2 days ago",
    badge: "Done",
  },
  {
    id: "act-4",
    type: "chat",
    title: "AI Study Session",
    description: "Explored PFK-1 allosteric regulation and ATP inhibition",
    timestamp: "3 days ago",
    badge: "Chat",
  },
];

export const DEMO_SUBJECT_MASTERY: SubjectMastery[] = [
  {
    subject: "Biology",
    progress: 92,
    tasksCompleted: 8,
    quizzesPassed: 6,
    color: "#10B981", // emerald
  },
  {
    subject: "Computer Science",
    progress: 84,
    tasksCompleted: 11,
    quizzesPassed: 4,
    color: "#6366F1", // indigo
  },
  {
    subject: "Chemistry",
    progress: 76,
    tasksCompleted: 5,
    quizzesPassed: 2,
    color: "#F59E0B", // amber
  },
  {
    subject: "Mathematics",
    progress: 88,
    tasksCompleted: 7,
    quizzesPassed: 3,
    color: "#8B5CF6", // violet
  },
];

export const WEEKLY_STUDY_HOURS = [
  { day: "Mon", hours: 3.5 },
  { day: "Tue", hours: 4.2 },
  { day: "Wed", hours: 2.8 },
  { day: "Thu", hours: 5.0 },
  { day: "Fri", hours: 3.8 },
  { day: "Sat", hours: 4.6 },
  { day: "Sun", hours: 2.1 },
];
