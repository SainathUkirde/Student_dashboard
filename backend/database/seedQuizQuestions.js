/**
 * Quiz Question Bank Seed
 * Subjects: Full Stack, DAA, Agentic AI, Deep Learning, MDM
 * These are sample/demo academic questions for demonstration purposes only.
 * NOT official university examination questions.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env.example') });
const { getDb } = require('./db');

const db = getDb();

// Clear existing quiz questions only
db.exec('DELETE FROM quiz_answers; DELETE FROM quiz_attempts; DELETE FROM quiz_questions;');

const insertQ = db.prepare(`
  INSERT INTO quiz_questions (subject_id, topic, difficulty, question, option_a, option_b, option_c, option_d, correct_answer, explanation)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Get course IDs
const courses = {};
db.prepare('SELECT id, abbreviation FROM courses').all().forEach(c => { courses[c.abbreviation] = c.id; });

console.log('Course IDs:', courses);

const questions = [

  // ──────────── FULL STACK ────────────
  // Easy
  { abbr: 'FS', topic: 'HTML/CSS', diff: 'easy', q: 'Which HTML tag is used to create a hyperlink?', a: '<link>', b: '<a>', c: '<href>', d: '<url>', ans: 'B', exp: 'The <a> (anchor) tag is used to create hyperlinks in HTML.' },
  { abbr: 'FS', topic: 'HTML/CSS', diff: 'easy', q: 'Which CSS property is used to change the background color?', a: 'color', b: 'background-color', c: 'bg-color', d: 'fill', ans: 'B', exp: 'The background-color CSS property sets the background color of an element.' },
  { abbr: 'FS', topic: 'JavaScript', diff: 'easy', q: 'Which keyword is used to declare a variable in modern JavaScript?', a: 'var', b: 'dim', c: 'let', d: 'define', ans: 'C', exp: '"let" is the modern ES6 way to declare block-scoped variables. "var" is the older approach.' },
  { abbr: 'FS', topic: 'HTML/CSS', diff: 'easy', q: 'What does HTML stand for?', a: 'Hyper Text Markup Language', b: 'High Tech Modern Language', c: 'Hyper Transfer Method Language', d: 'Home Tool Markup Language', ans: 'A', exp: 'HTML stands for HyperText Markup Language — the standard language for creating web pages.' },
  { abbr: 'FS', topic: 'JavaScript', diff: 'easy', q: 'Which method is used to add an element to the end of a JavaScript array?', a: 'push()', b: 'append()', c: 'insert()', d: 'add()', ans: 'A', exp: 'Array.push() appends one or more elements to the end of an array.' },
  { abbr: 'FS', topic: 'HTTP', diff: 'easy', q: 'Which HTTP method is used to submit form data to a server?', a: 'GET', b: 'PUT', c: 'POST', d: 'DELETE', ans: 'C', exp: 'POST is used to submit data to a server to create/update a resource.' },

  // Medium
  { abbr: 'FS', topic: 'React', diff: 'medium', q: 'What is the purpose of React\'s useEffect hook?', a: 'To manage component state', b: 'To perform side effects in function components', c: 'To create reusable styles', d: 'To handle routing', ans: 'B', exp: 'useEffect is used for side effects like data fetching, subscriptions, or DOM manipulations after rendering.' },
  { abbr: 'FS', topic: 'React', diff: 'medium', q: 'In React, what does JSX stand for?', a: 'JavaScript XML', b: 'Java Syntax Extension', c: 'JSON XML', d: 'JavaScript Cross', ans: 'A', exp: 'JSX stands for JavaScript XML. It allows writing HTML-like code inside JavaScript.' },
  { abbr: 'FS', topic: 'Node.js', diff: 'medium', q: 'Which module is used to create an HTTP server in Node.js?', a: 'fs', b: 'http', c: 'server', d: 'net', ans: 'B', exp: 'The built-in "http" module in Node.js is used to create HTTP servers.' },
  { abbr: 'FS', topic: 'REST API', diff: 'medium', q: 'Which HTTP status code indicates a resource was successfully created?', a: '200', b: '201', c: '204', d: '301', ans: 'B', exp: '201 Created is returned when a POST request successfully creates a new resource.' },
  { abbr: 'FS', topic: 'CSS', diff: 'medium', q: 'Which CSS display value is used to make elements sit side by side and control width/height?', a: 'block', b: 'inline', c: 'inline-block', d: 'flex', ans: 'C', exp: 'inline-block elements sit side by side but also respect width and height properties.' },
  { abbr: 'FS', topic: 'Database', diff: 'medium', q: 'What does SQL\'s JOIN operation do?', a: 'Merges two databases', b: 'Combines rows from two or more tables based on a related column', c: 'Creates a new table', d: 'Deletes duplicate rows', ans: 'B', exp: 'JOIN combines rows from multiple tables based on a matching column relationship.' },

  // Hard
  { abbr: 'FS', topic: 'React', diff: 'hard', q: 'What problem does React.memo solve?', a: 'Memory leaks in hooks', b: 'Unnecessary re-renders of functional components', c: 'Asynchronous state updates', d: 'Context API performance', ans: 'B', exp: 'React.memo memoizes the output of a component and prevents re-renders if props haven\'t changed.' },
  { abbr: 'FS', topic: 'Node.js', diff: 'hard', q: 'What is the event loop in Node.js?', a: 'A loop for iterating arrays', b: 'A mechanism that handles asynchronous callbacks in a non-blocking manner', c: 'A built-in HTTP request loop', d: 'A recursive function pattern', ans: 'B', exp: 'The event loop allows Node.js to perform non-blocking I/O operations by offloading operations to the system kernel.' },
  { abbr: 'FS', topic: 'REST API', diff: 'hard', q: 'What is the difference between PUT and PATCH HTTP methods?', a: 'PUT is for creation, PATCH is for deletion', b: 'PUT replaces the entire resource; PATCH applies partial updates', c: 'They are identical', d: 'PUT is secure, PATCH is not', ans: 'B', exp: 'PUT replaces the entire resource with the request body. PATCH applies a partial modification to the resource.' },
  { abbr: 'FS', topic: 'Authentication', diff: 'hard', q: 'What is JWT (JSON Web Token) used for?', a: 'Database connection pooling', b: 'Securely transmitting information as a JSON object between parties', c: 'CSS styling tokens', d: 'Server-side rendering', ans: 'B', exp: 'JWT is a compact, URL-safe token used for securely transmitting claims between parties. Used heavily in authentication.' },

  // ──────────── DAA ────────────
  // Easy
  { abbr: 'DAA', topic: 'Sorting', diff: 'easy', q: 'What is the time complexity of Bubble Sort in the worst case?', a: 'O(n)', b: 'O(n log n)', c: 'O(n²)', d: 'O(log n)', ans: 'C', exp: 'Bubble Sort makes n-1 passes and performs up to n comparisons per pass, giving O(n²) in the worst case.' },
  { abbr: 'DAA', topic: 'Searching', diff: 'easy', q: 'What is the time complexity of Binary Search?', a: 'O(n)', b: 'O(log n)', c: 'O(n²)', d: 'O(n log n)', ans: 'B', exp: 'Binary Search halves the search space each iteration, giving O(log n) time complexity.' },
  { abbr: 'DAA', topic: 'Data Structures', diff: 'easy', q: 'Which data structure is primarily used for implementing recursion?', a: 'Queue', b: 'Stack', c: 'Linked List', d: 'Graph', ans: 'B', exp: 'Recursion uses the call stack — function calls are pushed onto and popped off a stack.' },
  { abbr: 'DAA', topic: 'Sorting', diff: 'easy', q: 'Which sorting algorithm is considered the most efficient for large datasets on average?', a: 'Bubble Sort', b: 'Selection Sort', c: 'Quick Sort', d: 'Insertion Sort', ans: 'C', exp: 'Quick Sort has an average time complexity of O(n log n) and performs well in practice due to good cache behavior.' },
  { abbr: 'DAA', topic: 'Complexity', diff: 'easy', q: 'What does Big O notation represent?', a: 'Exact runtime of an algorithm', b: 'Upper bound on the growth rate of an algorithm', c: 'Memory usage of an algorithm', d: 'Best-case complexity', ans: 'B', exp: 'Big O notation describes the upper bound (worst-case) growth rate of an algorithm\'s resource usage.' },

  // Medium
  { abbr: 'DAA', topic: 'Divide and Conquer', diff: 'medium', q: 'Which algorithm uses the divide and conquer strategy?', a: 'Bubble Sort', b: 'Merge Sort', c: 'Linear Search', d: 'Prim\'s Algorithm', ans: 'B', exp: 'Merge Sort divides the array into halves, recursively sorts them, and merges the sorted results.' },
  { abbr: 'DAA', topic: 'Graph Algorithms', diff: 'medium', q: 'Which algorithm finds the shortest path from a single source in a weighted graph?', a: 'Prim\'s', b: 'Kruskal\'s', c: 'Dijkstra\'s', d: 'Floyd-Warshall', ans: 'C', exp: 'Dijkstra\'s algorithm finds the shortest paths from a single source to all vertices in a non-negative weighted graph.' },
  { abbr: 'DAA', topic: 'Dynamic Programming', diff: 'medium', q: 'What is the key principle of Dynamic Programming?', a: 'Divide into independent subproblems', b: 'Use greedy choices at each step', c: 'Store and reuse solutions to overlapping subproblems', d: 'Exhaustive search of all possibilities', ans: 'C', exp: 'DP stores results of overlapping subproblems (memoization/tabulation) to avoid redundant computations.' },
  { abbr: 'DAA', topic: 'Greedy', diff: 'medium', q: 'Which problem is best solved using a greedy algorithm?', a: '0/1 Knapsack', b: 'Longest Common Subsequence', c: 'Fractional Knapsack', d: 'Matrix Chain Multiplication', ans: 'C', exp: 'Fractional Knapsack can be solved greedily by taking items with the best value-to-weight ratio first.' },
  { abbr: 'DAA', topic: 'Trees', diff: 'medium', q: 'What is the time complexity of searching in a balanced BST?', a: 'O(n)', b: 'O(n²)', c: 'O(log n)', d: 'O(1)', ans: 'C', exp: 'In a balanced BST, each comparison eliminates half the remaining nodes, giving O(log n).' },
  { abbr: 'DAA', topic: 'Sorting', diff: 'medium', q: 'What is the space complexity of Merge Sort?', a: 'O(1)', b: 'O(log n)', c: 'O(n)', d: 'O(n²)', ans: 'C', exp: 'Merge Sort requires O(n) auxiliary space for the temporary arrays used during merging.' },

  // Hard
  { abbr: 'DAA', topic: 'Dynamic Programming', diff: 'hard', q: 'What is the time complexity of the standard dynamic programming solution for the 0/1 Knapsack problem?', a: 'O(n log n)', b: 'O(nW)', c: 'O(n²)', d: 'O(2ⁿ)', ans: 'B', exp: 'The DP approach builds a table of size n × W (items × capacity), giving O(nW) time and space.' },
  { abbr: 'DAA', topic: 'Graph Algorithms', diff: 'hard', q: 'What is the time complexity of Bellman-Ford algorithm?', a: 'O(V log V)', b: 'O(E log V)', c: 'O(VE)', d: 'O(V²)', ans: 'C', exp: 'Bellman-Ford relaxes all V-1 edges E times, giving O(VE) time complexity. It handles negative edge weights.' },
  { abbr: 'DAA', topic: 'Complexity Classes', diff: 'hard', q: 'If P ≠ NP, which statement is true about NP-complete problems?', a: 'They can be solved in polynomial time', b: 'They cannot be solved in polynomial time', c: 'They have no known polynomial-time algorithm but can be verified in polynomial time', d: 'They are harder than NP problems', ans: 'C', exp: 'NP-complete problems can be verified in polynomial time but no polynomial-time algorithm is known to solve them (assuming P≠NP).' },
  { abbr: 'DAA', topic: 'Graph Algorithms', diff: 'hard', q: 'What is the main difference between Prim\'s and Kruskal\'s algorithms?', a: 'Prim\'s works on directed graphs; Kruskal\'s on undirected', b: 'Prim\'s grows a spanning tree from a vertex; Kruskal\'s sorts edges by weight', c: 'Prim\'s is O(V²); Kruskal\'s is O(V log V)', d: 'They produce different MSTs', ans: 'B', exp: 'Prim\'s grows the MST by adding the nearest vertex. Kruskal\'s sorts all edges and adds them if they don\'t form a cycle.' },

  // ──────────── AGENTIC AI ────────────
  // Easy
  { abbr: 'AgAI', topic: 'AI Basics', diff: 'easy', q: 'What is an AI agent?', a: 'A database management system', b: 'An entity that perceives its environment and takes actions to achieve goals', c: 'A type of neural network', d: 'A programming language', ans: 'B', exp: 'An AI agent perceives its environment through sensors and acts upon it through actuators to achieve its goals.' },
  { abbr: 'AgAI', topic: 'AI Basics', diff: 'easy', q: 'What does LLM stand for?', a: 'Low Level Machine', b: 'Large Language Model', c: 'Layered Learning Module', d: 'Linear Learning Method', ans: 'B', exp: 'LLM stands for Large Language Model — AI models trained on vast text data to understand and generate language.' },
  { abbr: 'AgAI', topic: 'AI Basics', diff: 'easy', q: 'Which of the following is an example of an LLM?', a: 'MySQL', b: 'React', c: 'GPT-4', d: 'Docker', ans: 'C', exp: 'GPT-4 by OpenAI is a large language model capable of generating human-like text.' },
  { abbr: 'AgAI', topic: 'Prompt Engineering', diff: 'easy', q: 'What is prompt engineering?', a: 'Building physical engineering prompts', b: 'The practice of designing inputs to guide AI model outputs effectively', c: 'A type of database schema', d: 'Compiling machine code', ans: 'B', exp: 'Prompt engineering involves crafting effective inputs (prompts) to get desired and accurate outputs from AI models.' },

  // Medium
  { abbr: 'AgAI', topic: 'Agent Types', diff: 'medium', q: 'What differentiates a reactive agent from a deliberative agent?', a: 'Reactive agents use neural networks; deliberative agents do not', b: 'Reactive agents respond to stimuli without an internal model; deliberative agents reason with internal models', c: 'Reactive agents are faster in all cases', d: 'There is no significant difference', ans: 'B', exp: 'Reactive agents act based on current perceptions without internal state. Deliberative agents reason about goals using an internal world model.' },
  { abbr: 'AgAI', topic: 'RAG', diff: 'medium', q: 'What is RAG in the context of Agentic AI?', a: 'Random Action Generator', b: 'Retrieval-Augmented Generation', c: 'Recursive Algorithm Graph', d: 'Reinforcement Agent Guide', ans: 'B', exp: 'RAG (Retrieval-Augmented Generation) combines retrieval of relevant documents with LLM generation to produce grounded, accurate answers.' },
  { abbr: 'AgAI', topic: 'Multi-Agent', diff: 'medium', q: 'What is a multi-agent system?', a: 'A single AI with multiple objectives', b: 'Multiple autonomous agents that interact in a shared environment', c: 'An AI with multiple training datasets', d: 'A distributed database system', ans: 'B', exp: 'A multi-agent system consists of multiple interacting autonomous agents, each with their own goals, potentially cooperating or competing.' },
  { abbr: 'AgAI', topic: 'Tools', diff: 'medium', q: 'What is the role of "tools" in an agentic AI framework?', a: 'UI components for visualizing data', b: 'Functions or APIs the agent can call to take actions in the world', c: 'Training datasets', d: 'Database connectors', ans: 'B', exp: 'Tools are external functions (search, code execution, APIs) that agents can invoke to interact with their environment.' },
  { abbr: 'AgAI', topic: 'Memory', diff: 'medium', q: 'What is the difference between short-term and long-term memory in AI agents?', a: 'Short-term memory is faster in CPU cycles', b: 'Short-term memory is the in-context window; long-term is external storage like a database', c: 'They refer to RAM vs disk in a computer', d: 'Long-term memory is only for images', ans: 'B', exp: 'Short-term (in-context) memory is the current conversation/context window. Long-term memory uses external stores like vector databases.' },

  // Hard
  { abbr: 'AgAI', topic: 'Planning', diff: 'hard', q: 'What is the ReAct framework in agentic AI?', a: 'A React.js-based AI framework', b: 'A pattern combining Reasoning and Acting in interleaved thought-action steps', c: 'A reinforcement learning architecture', d: 'A REST API design pattern', ans: 'B', exp: 'ReAct (Reasoning + Acting) is an LLM prompting framework where the model generates reasoning traces and actions interleaved, enabling dynamic planning.' },
  { abbr: 'AgAI', topic: 'LLM Orchestration', diff: 'hard', q: 'What problem does LangGraph solve compared to simple LangChain chains?', a: 'It provides better NLP tokenization', b: 'It enables stateful, cyclical workflows with conditional branching for complex agent loops', c: 'It replaces the need for vector databases', d: 'It provides faster inference', ans: 'B', exp: 'LangGraph enables building stateful, multi-step agent workflows as directed graphs with cycles, enabling complex agentic behavior beyond simple linear chains.' },
  { abbr: 'AgAI', topic: 'Multi-Agent', diff: 'hard', q: 'In a multi-agent orchestration system, what is the role of an orchestrator agent?', a: 'It stores all agent memories', b: 'It coordinates and delegates tasks to sub-agents and aggregates results', c: 'It provides the user interface', d: 'It trains the underlying LLM', ans: 'B', exp: 'An orchestrator agent manages the overall workflow, assigns tasks to specialized sub-agents, and synthesizes their outputs to complete complex goals.' },

  // ──────────── DEEP LEARNING ────────────
  // Easy
  { abbr: 'DL', topic: 'Neural Networks', diff: 'easy', q: 'What is a neural network inspired by?', a: 'The structure of DNA', b: 'The biological neurons in the human brain', c: 'Graph theory', d: 'Linear algebra matrices', ans: 'B', exp: 'Artificial neural networks are loosely inspired by biological neural networks in animal brains.' },
  { abbr: 'DL', topic: 'Activation Functions', diff: 'easy', q: 'What is the output range of the Sigmoid activation function?', a: '(-∞, +∞)', b: '(0, 1)', c: '(-1, 1)', d: '(0, ∞)', ans: 'B', exp: 'The sigmoid function maps any input to a value between 0 and 1, making it useful for binary classification outputs.' },
  { abbr: 'DL', topic: 'Neural Networks', diff: 'easy', q: 'What is overfitting in machine learning?', a: 'When a model performs poorly on training data', b: 'When a model learns training data too well and performs poorly on new data', c: 'When the model has too few parameters', d: 'When batch size is too large', ans: 'B', exp: 'Overfitting occurs when a model learns the noise in training data and fails to generalize to unseen data.' },
  { abbr: 'DL', topic: 'CNN', diff: 'easy', q: 'What type of deep learning architecture is primarily used for image recognition?', a: 'RNN', b: 'Transformer', c: 'CNN', d: 'Autoencoder', ans: 'C', exp: 'Convolutional Neural Networks (CNNs) are specially designed for processing grid-like data such as images.' },

  // Medium
  { abbr: 'DL', topic: 'Training', diff: 'medium', q: 'What is the purpose of backpropagation in neural networks?', a: 'Forward pass data through the network', b: 'Calculate and propagate gradients backward to update weights', c: 'Initialize model weights', d: 'Normalize input features', ans: 'B', exp: 'Backpropagation computes gradients of the loss with respect to each weight using the chain rule, allowing gradient descent to update weights.' },
  { abbr: 'DL', topic: 'Optimization', diff: 'medium', q: 'What problem does the Adam optimizer solve compared to plain SGD?', a: 'It eliminates the need for backpropagation', b: 'It adaptively adjusts learning rates for each parameter and includes momentum', c: 'It removes the need for activation functions', d: 'It guarantees finding global optima', ans: 'B', exp: 'Adam (Adaptive Moment Estimation) combines momentum and adaptive learning rates, leading to faster convergence than plain SGD.' },
  { abbr: 'DL', topic: 'Regularization', diff: 'medium', q: 'What does Dropout do in a neural network?', a: 'Removes neurons permanently from the architecture', b: 'Randomly deactivates a fraction of neurons during training to reduce overfitting', c: 'Increases the learning rate during training', d: 'Normalizes the output layer', ans: 'B', exp: 'Dropout randomly zeros out neurons during each training step, acting as a regularization technique to prevent overfitting.' },
  { abbr: 'DL', topic: 'RNN', diff: 'medium', q: 'What problem do LSTMs (Long Short-Term Memory) solve?', a: 'Slow training speed in CNNs', b: 'The vanishing gradient problem in standard RNNs', c: 'Overfitting in dense layers', d: 'High memory usage in transformers', ans: 'B', exp: 'LSTMs introduce gating mechanisms (input, forget, output gates) that preserve long-range dependencies and mitigate vanishing gradients in RNNs.' },
  { abbr: 'DL', topic: 'Transformers', diff: 'medium', q: 'What is the self-attention mechanism in Transformers?', a: 'A mechanism that focuses on a single token at a time', b: 'A mechanism that relates different positions of a sequence to compute representations', c: 'A weight initialization strategy', d: 'A type of activation function', ans: 'B', exp: 'Self-attention allows each token to attend to all other tokens in the sequence simultaneously, capturing long-range dependencies.' },

  // Hard
  { abbr: 'DL', topic: 'Transformers', diff: 'hard', q: 'What is the computational complexity of the self-attention mechanism with respect to sequence length n?', a: 'O(n)', b: 'O(n log n)', c: 'O(n²)', d: 'O(n³)', ans: 'C', exp: 'Standard self-attention computes attention scores for all pairs of tokens, resulting in O(n²) complexity in both time and memory.' },
  { abbr: 'DL', topic: 'Training', diff: 'hard', q: 'What is gradient clipping used for in deep learning?', a: 'Speeding up forward propagation', b: 'Preventing exploding gradients by capping their magnitude', c: 'Reducing model parameters', d: 'Normalizing batch data', ans: 'B', exp: 'Gradient clipping limits the gradient norm during backpropagation to prevent the exploding gradient problem common in deep or recurrent networks.' },
  { abbr: 'DL', topic: 'LLM', diff: 'hard', q: 'What is "fine-tuning" a pre-trained LLM?', a: 'Training an LLM from scratch on a specific dataset', b: 'Adjusting a pre-trained model\'s weights on a smaller task-specific dataset', c: 'Quantizing the model for edge deployment', d: 'Adding new layers to the frozen model', ans: 'B', exp: 'Fine-tuning adapts a pre-trained model to a specific downstream task by continuing training on labeled task-specific data, requiring less compute than training from scratch.' },

  // ──────────── MDM ────────────
  // Easy
  { abbr: 'MDM', topic: 'MDM Basics', diff: 'easy', q: 'What does MDM stand for in enterprise IT?', a: 'Mobile Device Management', b: 'Multi-Domain Management', c: 'Master Data Module', d: 'Mobile Data Monitoring', ans: 'A', exp: 'MDM (Mobile Device Management) is a type of security software used by IT departments to monitor, manage, and secure mobile devices.' },
  { abbr: 'MDM', topic: 'MDM Basics', diff: 'easy', q: 'Which of the following is a primary function of an MDM solution?', a: 'Video conferencing', b: 'Enforcing security policies on mobile devices', c: 'Cloud storage management', d: 'Network hardware configuration', ans: 'B', exp: 'MDM solutions allow organizations to enforce security policies, manage configurations, and remotely wipe corporate data on mobile devices.' },
  { abbr: 'MDM', topic: 'BYOD', diff: 'easy', q: 'What does BYOD stand for?', a: 'Bring Your Own Database', b: 'Build Your Own Device', c: 'Bring Your Own Device', d: 'Backup Your Organizational Data', ans: 'C', exp: 'BYOD (Bring Your Own Device) refers to the policy of permitting employees to use personally owned devices to access company data and systems.' },
  { abbr: 'MDM', topic: 'Security', diff: 'easy', q: 'What is remote wipe in MDM?', a: 'Deleting server logs', b: 'Remotely erasing all data from a lost or compromised device', c: 'Backing up device data to the cloud', d: 'Wiping malware from email servers', ans: 'B', exp: 'Remote wipe allows IT administrators to erase all data from a device over the network if it is lost, stolen, or compromised.' },

  // Medium
  { abbr: 'MDM', topic: 'Enrollment', diff: 'medium', q: 'What is the purpose of device enrollment in MDM?', a: 'Creating new employee accounts', b: 'Registering a device with the MDM server to apply policies and enable management', c: 'Backing up application data', d: 'Installing operating system updates', ans: 'B', exp: 'Enrollment establishes a management relationship between a device and the MDM server, enabling policy deployment, app management, and monitoring.' },
  { abbr: 'MDM', topic: 'Containerization', diff: 'medium', q: 'What is containerization in the context of MDM?', a: 'Using Docker for mobile apps', b: 'Separating personal and corporate data on a device using isolated containers', c: 'Encrypting entire device storage', d: 'Deploying apps via containers to servers', ans: 'B', exp: 'Containerization in MDM creates a secure, isolated workspace for corporate apps and data, separate from the user\'s personal data.' },
  { abbr: 'MDM', topic: 'Compliance', diff: 'medium', q: 'What is compliance monitoring in MDM?', a: 'Ensuring devices meet organizational security policies and standards', b: 'Legal compliance for app store submissions', c: 'Monitoring internet bandwidth usage', d: 'Auditing user passwords', ans: 'A', exp: 'Compliance monitoring checks whether enrolled devices adhere to defined security policies (OS version, encryption, passcode requirements) and flags violations.' },
  { abbr: 'MDM', topic: 'App Management', diff: 'medium', q: 'What does MAM (Mobile Application Management) specifically manage?', a: 'Device hardware settings', b: 'Mobile applications and their data rather than the entire device', c: 'Network firewall rules for mobile devices', d: 'SIM card configurations', ans: 'B', exp: 'MAM focuses on managing and securing mobile applications and their data, providing granular control without full device management.' },

  // Hard
  { abbr: 'MDM', topic: 'Architecture', diff: 'hard', q: 'What is the difference between on-premises and cloud-based MDM solutions?', a: 'Cloud MDM is always more secure than on-premises', b: 'On-premises MDM gives full infrastructure control while cloud MDM reduces IT overhead and scales easily', c: 'On-premises MDM cannot manage iOS devices', d: 'Cloud MDM requires physical server installation at the office', ans: 'B', exp: 'On-premises MDM runs on company-owned servers giving full control but requiring IT maintenance. Cloud MDM is hosted by the vendor, reducing infrastructure overhead and enabling easy scaling.' },
  { abbr: 'MDM', topic: 'Zero Trust', diff: 'hard', q: 'How does MDM support a Zero Trust security architecture?', a: 'By blocking all mobile devices from the network', b: 'By continuously verifying device compliance, identity, and health before granting network access', c: 'By replacing firewalls with mobile policies', d: 'By encrypting all network traffic at the DNS level', ans: 'B', exp: 'In Zero Trust, no device or user is inherently trusted. MDM enables continuous compliance verification — checking device health, OS version, and policies before granting access to resources.' },
  { abbr: 'MDM', topic: 'Enterprise Integration', diff: 'hard', q: 'What is the role of an MDM profile in iOS device management?', a: 'A user profile similar to a social media account', b: 'A signed XML configuration file that installs settings, restrictions, and certificates on an iOS device', c: 'An app that manages other apps on the device', d: 'A VPN configuration specifically for iOS', ans: 'B', exp: 'MDM profiles are XML-based configuration payloads signed with a certificate. When installed, they apply settings, restrictions, Wi-Fi configs, certificates, and MDM enrollment to iOS devices.' },
];

const seedMany = db.transaction((qs) => {
  let count = 0;
  qs.forEach(q => {
    const subjectId = courses[q.abbr];
    if (!subjectId) {
      console.warn(`⚠️  Subject abbreviation "${q.abbr}" not found in courses table. Skipping.`);
      return;
    }
    insertQ.run(subjectId, q.topic, q.diff, q.q, q.a, q.b, q.c, q.d, q.ans, q.exp);
    count++;
  });
  return count;
});

const inserted = seedMany(questions);
console.log(`✅ ${inserted} quiz questions seeded (sample/demo academic questions)`);
console.log('ℹ️  Note: These are DEMO questions for testing the Quiz & Practice feature.');
console.log('   NOT official university examination questions.\n');
