import { VideoMetadata, TranscriptSegment } from '../types';

export interface DemoLecture {
  metadata: VideoMetadata;
  transcript: TranscriptSegment[];
}

export const DEMO_LECTURES: Record<string, DemoLecture> = {
  python_masterclass: {
    metadata: {
      id: 'demo_python',
      videoId: 'rfscVS0vtbw',
      url: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
      title: 'Python for Beginners — Full Course [Complete Programming Mastery]',
      channel: 'freeCodeCamp.org',
      duration: 15420, // 4 hours 17 mins
      durationFormatted: '4h 17m',
      thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&q=80',
      description: 'Comprehensive guide to Python programming: variables, data types, loops, functions, OOP, exceptions, and practical building blocks.',
      category: 'Computer Science',
    },
    transcript: [
      { id: 'p1', startTime: 0, endTime: 185, startTimeFormatted: '00:00', text: 'Welcome to this complete comprehensive Python course. Python is an interpreted, high-level, dynamically typed language known for clean readability and massive ecosystem in data science, automation, web backends, and AI.' },
      { id: 'p2', startTime: 186, endTime: 480, startTimeFormatted: '03:06', text: 'Variables and Memory Management: In Python, variables are labels referencing objects in memory. You assign using the single equals sign. Dynamic typing means Python deduces the type at runtime without explicit type declarations. For example, x = 42 creates an integer object and binds x to it.' },
      { id: 'p3', startTime: 481, endTime: 890, startTimeFormatted: '08:01', text: 'Primitive Data Types: Python includes int for arbitrary-precision integers, float for IEEE 754 floating point numbers, str for Unicode strings, and bool for boolean True and False. Strings in Python are immutable; once created, characters cannot be mutated in place.' },
      { id: 'p4', startTime: 891, endTime: 1350, startTimeFormatted: '14:51', text: 'Control Flow and Conditionals: Python uses indentation instead of curly braces to define scope blocks. The if, elif, and else statements evaluate truthiness. Watch out: empty collections, 0, None, and empty strings evaluate to False in boolean context.' },
      { id: 'p5', startTime: 1351, endTime: 1890, startTimeFormatted: '22:31', text: 'Loops and Iteration: The while loop iterates while a predicate is true. The for-in loop uses Python iteration protocol, consuming iterables like lists, ranges, or generators. The break statement exits early, while continue skips to the next cycle. The else block on loops executes only if no break occurred.' },
      { id: 'p6', startTime: 1891, endTime: 2540, startTimeFormatted: '31:31', text: 'Functions and Scoping: Define functions with def. Python functions are first-class citizens. Parameters can have default arguments, but never use mutable defaults like empty lists or dictionaries, because they are evaluated once at function definition time! Use *args for positional variable arguments and **kwargs for keyword arguments.' },
      { id: 'p7', startTime: 2541, endTime: 3250, startTimeFormatted: '42:21', text: 'Data Structures - Lists and Tuples: Lists are mutable sequences written with brackets. They support indexing, slicing with start:stop:step, append, pop, and list comprehensions. Tuples are immutable sequences written with parentheses. Use tuples for fixed heterogenous records and dictionary keys.' },
      { id: 'p8', startTime: 3251, endTime: 4120, startTimeFormatted: '54:11', text: 'Dictionaries and Hash Maps: Dictionaries in Python store key-value mappings powered by an optimized hash table. Keys must be hashable objects. Average lookup, insertion, and deletion complexity is O(1). Sets store unique hashable items and provide mathematical union, intersection, and difference operations.' },
      { id: 'p9', startTime: 4121, endTime: 5180, startTimeFormatted: '1:08:41', text: 'Object-Oriented Programming: Python classes represent blueprints for objects. The __init__ method is the constructor initializing instance state. self explicitly references the current instance. Python supports multiple inheritance using C3 Superclass Linearization (Method Resolution Order, MRO).' },
      { id: 'p10', startTime: 5181, endTime: 6420, startTimeFormatted: '1:26:21', text: 'Exception Handling: Use try, except, else, and finally. Catch specific exceptions like ValueError or KeyError rather than bare except. The finally clause always executes, making it essential for resource cleanups like closing file descriptors or database connections.' },
      { id: 'p11', startTime: 6421, endTime: 7890, startTimeFormatted: '1:47:01', text: 'File I/O and Context Managers: Always use the with statement context manager when handling files. For example, with open("data.txt", "r") as f ensures the file is deterministically closed even if an exception occurs during reading.' },
      { id: 'p12', startTime: 7891, endTime: 9600, startTimeFormatted: '2:11:31', text: 'Modular Architecture and Packages: Understand __name__ == "__main__" idiom. Modules are single .py files, and packages are directories containing modules. Virtual environments using venv isolate dependencies cleanly between projects.' },
    ],
  },
  mit_physics: {
    metadata: {
      id: 'demo_physics',
      videoId: 'wWnfJ0-xXRE',
      url: 'https://www.youtube.com/watch?v=wWnfJ0-xXRE',
      title: 'Classical Mechanics & Newton’s Laws — MIT Lecture Series',
      channel: 'MIT OpenCourseWare',
      duration: 3600,
      durationFormatted: '1h 00m',
      thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80',
      description: 'Foundations of classical mechanics: Kinematics, Newton’s three laws, calculus-based derivations, momentum, and energy conservation.',
      category: 'Physics & STEM',
    },
    transcript: [
      { id: 'ph1', startTime: 0, endTime: 240, startTimeFormatted: '00:00', text: 'Welcome to Physics 8.01. Today we formulate Newtonian mechanics using calculus. Motion is defined relative to inertial reference frames where Newton’s first law of inertia strictly holds.' },
      { id: 'ph2', startTime: 241, endTime: 720, startTimeFormatted: '04:01', text: 'Kinematics and Derivatives: Position vector r(t), velocity is the first time derivative v(t) = dr/dt, and acceleration is the second time derivative a(t) = dv/dt = d²r/dt². For uniform acceleration, we integrate to derive the kinematic equations: v = v0 + at, and x = x0 + v0*t + 0.5*a*t².' },
      { id: 'ph3', startTime: 721, endTime: 1350, startTimeFormatted: '12:01', text: 'Newton’s Second Law: Force is the rate of change of linear momentum. Sum of F = dp/dt. When mass is constant, this simplifies to the foundational vector equation: Sum of F = m * a. Free body diagrams are mandatory: isolate the system, identify gravitational force W = mg, normal force N, tension T, and frictional forces.' },
      { id: 'ph4', startTime: 1351, endTime: 2040, startTimeFormatted: '22:31', text: 'Friction Mechanics: Static friction opposes incipient motion with maximum limit f_s <= mu_s * N. Once sliding begins, kinetic friction is constant: f_k = mu_k * N, where mu_k is typically less than mu_s.' },
      { id: 'ph5', startTime: 2041, endTime: 2790, startTimeFormatted: '34:01', text: 'Work-Energy Theorem: Work done by a force is the line integral of F dot dr from initial to final position. Net work equals change in kinetic energy: W_net = Delta K = 0.5*m*v_f² - 0.5*m*v_i². For conservative forces like gravity or Hooke’s spring law F = -k*x, potential energy U can be defined, and total mechanical energy E = K + U is conserved.' },
      { id: 'ph6', startTime: 2791, endTime: 3600, startTimeFormatted: '46:31', text: 'Conservation of Linear Momentum: In an isolated system with zero external net force, total momentum is strictly conserved: Sum of p_initial = Sum of p_final. In elastic collisions, both momentum and kinetic energy are conserved; in inelastic collisions, kinetic energy converts into thermal and internal deformation energy.' },
    ],
  },
  machine_learning: {
    metadata: {
      id: 'demo_ml',
      videoId: 'aircAruvnKk',
      url: 'https://www.youtube.com/watch?v=aircAruvnKk',
      title: 'Neural Networks and Deep Learning — Foundational Lecture',
      channel: '3Blue1Brown & DeepLearning.AI',
      duration: 4200,
      durationFormatted: '1h 10m',
      thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
      description: 'Mathematical intuition of deep neural networks, matrix multiplications, activation functions, cost surfaces, and backpropagation gradient descent.',
      category: 'Artificial Intelligence',
    },
    transcript: [
      { id: 'm1', startTime: 0, endTime: 360, startTimeFormatted: '00:00', text: 'What is a neural network at its mathematical heart? It is a parameterized non-linear function approximator mapping input vectors x in R^d to output vectors y in R^k.' },
      { id: 'm2', startTime: 361, endTime: 980, startTimeFormatted: '06:01', text: 'Forward Propagation and Affine Transforms: Each layer computes z = W*a + b, followed by non-linear activation function sigma(z). Without non-linear activations like ReLU(z) = max(0, z) or GELU, cascading linear layers collapse mathematically into a single matrix transform.' },
      { id: 'm3', startTime: 981, endTime: 1740, startTimeFormatted: '16:21', text: 'Loss Functions: For regression, Mean Squared Error (MSE) measures Euclidean distance. For multi-class classification, Softmax normalizes logits into probabilities, and Cross-Entropy Loss L = -sum(y_i * log(p_i)) penalizes incorrect confident predictions.' },
      { id: 'm4', startTime: 1741, endTime: 2780, startTimeFormatted: '29:01', text: 'Backpropagation and Vector Calculus: Backpropagation is an efficient algorithmic application of the multivariable calculus chain rule. We compute partial derivatives of the loss with respect to every weight and bias: dL/dW = (dL/dz) * a^(T).' },
      { id: 'm5', startTime: 2781, endTime: 3650, startTimeFormatted: '46:21', text: 'Gradient Descent Optimizers: Standard SGD updates parameters theta = theta - eta * grad(L). Modern optimizers like Adam use exponentially decaying moving averages of both past gradients (momentum) and squared gradients (adaptive learning rates).' },
      { id: 'm6', startTime: 3651, endTime: 4200, startTimeFormatted: '60:51', text: 'Overfitting and Regularization: High capacity models risk memorizing noise. Techniques include L2 regularization (weight decay), Dropout where neurons are randomly deactivated with probability p during training, and Batch Normalization.' },
    ],
  },
};
