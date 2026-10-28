import { VideoMetadata, TranscriptSegment, ProcessingJob, NoteDocument, ChatMessage, UserHighlight, UserNote, AuthUser } from '../../src/types';
import { DEMO_LECTURES } from '../../src/utils/demoData';

export interface StoredUser extends AuthUser {
  passwordHash?: string;
}

class InMemoryDatabase {
  users: Map<string, StoredUser> = new Map(); // id -> user
  usersByEmail: Map<string, string> = new Map(); // lowercase email -> id
  videos: Map<string, VideoMetadata> = new Map();
  transcripts: Map<string, TranscriptSegment[]> = new Map();
  jobs: Map<string, ProcessingJob> = new Map();
  notes: Map<string, NoteDocument> = new Map();
  chats: Map<string, ChatMessage[]> = new Map();
  bookmarks: Map<string, string[]> = new Map(); // videoId -> sectionIds
  highlights: Map<string, UserHighlight[]> = new Map(); // sectionId -> highlights
  userNotes: Map<string, UserNote[]> = new Map(); // sectionId -> notes
  pdfExports: Map<string, any> = new Map();
  systemLogs: { timestamp: string; level: 'info' | 'warn' | 'error'; message: string; details?: any }[] = [];

  constructor() {
    this.seedDemoData();
  }

  log(level: 'info' | 'warn' | 'error', message: string, details?: any) {
    this.systemLogs.unshift({
      timestamp: new Date().toISOString(),
      level,
      message,
      details,
    });
    if (this.systemLogs.length > 500) {
      this.systemLogs.pop();
    }
  }

  getUserById(id: string): StoredUser | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): StoredUser | undefined {
    const id = this.usersByEmail.get(email.toLowerCase().trim());
    if (!id) return undefined;
    return this.users.get(id);
  }

  saveUser(user: StoredUser): StoredUser {
    this.users.set(user.id, user);
    this.usersByEmail.set(user.email.toLowerCase().trim(), user.id);
    return user;
  }

  private seedDemoData() {
    for (const key of Object.keys(DEMO_LECTURES)) {
      const demo = DEMO_LECTURES[key];
      this.videos.set(demo.metadata.videoId, demo.metadata);
      this.transcripts.set(demo.metadata.videoId, demo.transcript);
    }

    // Seed comprehensive ready-to-study document for MIT Physics lecture
    const physicsVideo = this.videos.get('wWnfJ0-xXRE');
    if (physicsVideo) {
      const samplePhysicsNotes: NoteDocument = {
        id: 'doc_wWnfJ0-xXRE',
        videoId: 'wWnfJ0-xXRE',
        title: physicsVideo.title,
        executiveOverview: 'This rigorous foundational lecture establishes Newtonian mechanics from first principles using differential and integral calculus. It systematically derives kinematic equations under uniform acceleration, formulates Newton’s Second Law in terms of momentum flow (dp/dt), examines static and kinetic friction regimes, demonstrates the Work-Energy Theorem via line integrals, and proves the conservation of linear momentum in isolated systems.',
        depth: 'complete',
        language: 'en',
        pdfTheme: 'academic',
        totalTopics: 5,
        sections: [
          {
            id: 'sec_ph_1',
            topicNumber: 1,
            title: 'Calculus-Based Kinematics & Motion Derivations',
            timestampFormatted: '04:01',
            timestampSeconds: 241,
            introduction: 'Formulation of position, instantaneous velocity, and acceleration vectors as calculus derivatives over time.',
            detailedExplanation: 'Kinematics describes motion without regard to the forces causing it. In a 3-dimensional Cartesian coordinate system, instantaneous velocity v(t) is the first time derivative of the position vector r(t). Acceleration a(t) is the second derivative. When acceleration is invariant across time, integrating a(t) = a_0 yields the classic velocity and displacement functions.',
            keyConcepts: [
              'Velocity as the limit of Delta r / Delta t as Delta t approaches zero',
              'Acceleration as the time rate of change of the velocity vector',
              'Integration with initial boundary conditions r(0) = r_0 and v(0) = v_0',
            ],
            importantDefinitions: [
              { term: 'Inertial Reference Frame', definition: 'A coordinate frame in which Newton’s First Law holds: an object with zero net external force remains at rest or moves with constant velocity.' },
              { term: 'Instantaneous Acceleration', definition: 'The second derivative of displacement with respect to time: a = d²r/dt².' }
            ],
            formulas: [
              {
                id: 'f_kinematics_1',
                title: 'Instantaneous Velocity Vector',
                latex: '\\vec{v}(t) = \\lim_{\\Delta t \\to 0} \\frac{\\Delta \\vec{r}}{\\Delta t} = \\frac{d\\vec{r}}{dt}',
                explanation: 'Calculus definition of instantaneous velocity as the derivative of position.',
                timestamp: '04:25',
                timestampSeconds: 265,
                variables: [
                  { name: '\\vec{v}', description: 'Velocity vector (m/s)' },
                  { name: '\\vec{r}', description: 'Position displacement vector (m)' },
                  { name: 't', description: 'Time (s)' }
                ]
              },
              {
                id: 'f_kinematics_2',
                title: 'Displacement under Constant Acceleration',
                latex: 'x(t) = x_0 + v_0 t + \\frac{1}{2} a t^2',
                explanation: 'Second kinematic equation obtained by double integration of constant acceleration.',
                timestamp: '06:12',
                timestampSeconds: 372,
                variables: [
                  { name: 'x_0', description: 'Initial position coordinate (m)' },
                  { name: 'v_0', description: 'Initial velocity (m/s)' },
                  { name: 'a', description: 'Constant acceleration (m/s²)' }
                ]
              }
            ],
            examples: [
              {
                id: 'ex_kin_1',
                title: 'Free Fall Deceleration Under Gravitational Field',
                problem: 'A projectile is launched vertically upward with v_0 = 29.4 m/s. Calculate maximum height attained (g = 9.8 m/s²).',
                solution: 'At maximum height, v = 0. Using v² = v_0² - 2g(y - y_0): 0 = (29.4)² - 2(9.8)(h) -> h = 864.36 / 19.6 = 44.1 meters.',
                explanation: 'Demonstrates application of kinematic energy-invariant relationships without explicitly evaluating flight time.'
              }
            ],
            stepByStepProcedures: [
              { step: 1, title: 'Define Coordinate System', description: 'Assign an origin point and specify positive vertical and horizontal axes.' },
              { step: 2, title: 'List Known Variables', description: 'Identify initial position x_0, initial velocity v_0, and acceleration a.' },
              { step: 3, title: 'Select Kinematic Equation', description: 'Match parameters against the four standard kinematic relations.' }
            ],
            commonMistakes: [
              {
                mistake: 'Using constant-acceleration formulas when acceleration is a function of time a(t) or position a(x).',
                correction: 'Perform explicit indefinite or definite calculus integrals: v(t) = \\int a(t) dt.',
                why: 'Kinematic formulas are derived strictly assuming da/dt = 0.'
              }
            ],
            importantNotes: [
              'Vector components along perpendicular axes (e.g. horizontal x and vertical y in projectile motion) are strictly independent.'
            ],
            visualAids: [
              {
                type: 'whiteboard',
                title: 'Parabolic Trajectory & Velocity Vector Tangents',
                description: 'Instructor board diagram showing vector decomposition at apex.',
                timestamp: '05:40',
                isDetectedFromSource: true
              }
            ]
          },
          {
            id: 'sec_ph_2',
            topicNumber: 2,
            title: 'Newton’s Second Law & Free Body Vector Analysis',
            timestampFormatted: '12:01',
            timestampSeconds: 721,
            introduction: 'Rigorous statement of force as momentum derivative and free-body diagram equilibrium analysis.',
            detailedExplanation: 'Newton’s Second Law establishes that the net external force vector acting on a body equals the time rate of change of its linear momentum. In non-relativistic mechanics where rest mass m is invariant, this reduces to Sigma F = m*a. Free body diagrams isolate the object, replacing every interaction (gravitation, surface contact, tension) with oriented vector arrows.',
            keyConcepts: [
              'Force as rate of momentum transfer: F = dp/dt',
              'Principle of superposition of forces',
              'Internal forces between sub-particles cancel in pairs by Newton’s Third Law'
            ],
            importantDefinitions: [
              { term: 'Free Body Diagram (FBD)', definition: 'A graphical sketch showing all external forces applied to a designated mechanical body, with all surrounding environment objects removed.' }
            ],
            formulas: [
              {
                id: 'f_newton_2',
                title: 'Newton’s Second Law of Motion',
                latex: '\\sum \\vec{F} = \\frac{d\\vec{p}}{dt} = m \\frac{d\\vec{v}}{dt} = m \\vec{a}',
                explanation: 'Vector relationship connecting net external force to momentum rate of change.',
                timestamp: '13:10',
                timestampSeconds: 790,
                variables: [
                  { name: '\\sum \\vec{F}', description: 'Net resultant force vector (N)' },
                  { name: '\\vec{p}', description: 'Linear momentum vector (kg·m/s)' },
                  { name: 'm', description: 'Inertial mass (kg)' },
                  { name: '\\vec{a}', description: 'Acceleration vector (m/s²)' }
                ]
              }
            ],
            examples: [],
            stepByStepProcedures: [
              { step: 1, title: 'Isolate Mechanical System', description: 'Draw a dotted boundary around the object of interest.' },
              { step: 2, title: 'Identify All Interactions', description: 'Include field forces (weight mg) and contact forces (normal N, friction f, tension T).' },
              { step: 3, title: 'Resolve Vectors into Component Equations', description: 'Set \\sum F_x = m a_x and \\sum F_y = m a_y.' }
            ],
            commonMistakes: [
              {
                mistake: 'Including action-reaction paired forces on the same free-body diagram.',
                correction: 'Only draw forces acting ON the chosen body, never forces exerted BY the body.',
                why: 'Action and reaction act on two distinctly different bodies.'
              }
            ],
            importantNotes: [
              'Normal force is NOT automatically equal to mg; it depends on incline angles and vertical accelerations.'
            ],
            visualAids: []
          },
          {
            id: 'sec_ph_3',
            topicNumber: 3,
            title: 'Tribology: Static & Kinetic Friction Invariants',
            timestampFormatted: '22:31',
            timestampSeconds: 1351,
            introduction: 'Microscopic and macroscopic physics of frictional contact resistance.',
            detailedExplanation: 'Frictional forces arise from electromagnetic interactions between surface asperities. Static friction adjusts dynamically to counter applied tangent forces until reaching the critical threshold f_s,max = mu_s * N. Once relative slippage initiates, kinetic friction takes over at a constant magnitude f_k = mu_k * N, which is independent of relative velocity over moderate ranges.',
            keyConcepts: [
              'Static friction acts as a self-adjusting reaction inequality: 0 <= f_s <= mu_s * N',
              'Transition from static to kinetic friction upon overcoming stiction',
              'Dependence on normal contact force rather than nominal contact surface area'
            ],
            importantDefinitions: [
              { term: 'Coefficient of Static Friction (\\mu_s)', definition: 'Dimensionless ratio of maximum tangential static resistance force to the perpendicular normal clamping force.' }
            ],
            formulas: [
              {
                id: 'f_fric_1',
                title: 'Coulomb Friction Laws',
                latex: 'f_s \\le \\mu_s N, \\quad f_k = \\mu_k N \\quad (\\mu_k < \\mu_s)',
                explanation: 'Static inequality boundary and kinetic friction equality.',
                timestamp: '24:15',
                timestampSeconds: 1455,
                variables: [
                  { name: 'f_s', description: 'Static friction force (N)' },
                  { name: 'f_k', description: 'Kinetic friction force (N)' },
                  { name: 'N', description: 'Normal force perpendicular to interface (N)' },
                  { name: '\\mu_s, \\mu_k', description: 'Friction coefficients' }
                ]
              }
            ],
            examples: [],
            stepByStepProcedures: [],
            commonMistakes: [
              {
                mistake: 'Assuming static friction is always equal to mu_s * N.',
                correction: 'Static friction only equals mu_s * N at the imminent threshold of slipping.',
                why: 'Below threshold, f_s simply balances the applied parallel force.'
              }
            ],
            importantNotes: [],
            visualAids: []
          },
          {
            id: 'sec_ph_4',
            topicNumber: 4,
            title: 'Work-Energy Theorem & Conservation Principles',
            timestampFormatted: '34:01',
            timestampSeconds: 2041,
            introduction: 'Formulation of mechanical work via path integrals and conservative potential fields.',
            detailedExplanation: 'Mechanical work performed by a variable force vector is the line integral of F dot dr along the trajectory. By applying Newton’s Second Law and integrating, the net work is shown to equal exactly the variation in kinetic energy (1/2 m v²). For conservative force fields like gravity, work is path-independent, allowing definition of scalar potential energy U.',
            keyConcepts: [
              'Work as scalar product of force and infinitesimal displacement',
              'Work-Kinetic Energy Theorem: W_net = Delta K',
              'Conservative forces satisfy curl(F) = 0 and allow total mechanical energy conservation E = K + U'
            ],
            importantDefinitions: [
              { term: 'Conservative Force', definition: 'A force for which the total work done on a particle moving between two points is strictly independent of the trajectory path taken.' }
            ],
            formulas: [
              {
                id: 'f_work_1',
                title: 'Work-Energy Theorem',
                latex: 'W_{\\text{net}} = \\int_{\\vec{r}_1}^{\\vec{r}_2} \\vec{F} \\cdot d\\vec{r} = \\Delta K = \\frac{1}{2}m v_f^2 - \\frac{1}{2}m v_i^2',
                explanation: 'Equivalence between path integral of net force and kinetic energy variation.',
                timestamp: '36:18',
                timestampSeconds: 2178,
                variables: [
                  { name: 'W_{\\text{net}}', description: 'Net mechanical work (Joules)' },
                  { name: 'K', description: 'Kinetic energy (Joules)' },
                  { name: 'd\\vec{r}', description: 'Differential displacement vector (m)' }
                ]
              }
            ],
            examples: [],
            stepByStepProcedures: [],
            commonMistakes: [],
            importantNotes: [],
            visualAids: []
          },
          {
            id: 'sec_ph_5',
            topicNumber: 5,
            title: 'Conservation of Linear Momentum & Inelastic Collisions',
            timestampFormatted: '46:31',
            timestampSeconds: 2791,
            introduction: 'System dynamics, impulse integrals, and conservation laws during particle collisions.',
            detailedExplanation: 'When external net forces on a multi-body system equal zero, the time derivative of total system momentum vanishes: dP_total/dt = 0. Consequently, total momentum before collision equals total momentum after collision. In completely inelastic collisions, colliding bodies stick together, conserving momentum while maximizing kinetic energy dissipation into thermal/internal modes.',
            keyConcepts: [
              'Total momentum is invariant under internal interactions',
              'Distinction between elastic collisions (both p and K conserved) and inelastic collisions',
              'Impulse J = \\int F dt equals change in linear momentum Delta p'
            ],
            importantDefinitions: [
              { term: 'Linear Momentum', definition: 'Vector quantity representing product of mass and velocity: p = m * v.' },
              { term: 'Impulse', definition: 'Time integral of force acting over an interaction duration: J = \\int F dt.' }
            ],
            formulas: [
              {
                id: 'f_mom_1',
                title: 'Conservation of Total Momentum',
                latex: '\\sum_{i} m_i \\vec{v}_{i,\\text{initial}} = \\sum_{i} m_i \\vec{v}_{i,\\text{final}}',
                explanation: 'Vector conservation equation for isolated collision systems.',
                timestamp: '48:10',
                timestampSeconds: 2890,
                variables: [
                  { name: 'm_i', description: 'Mass of particle i (kg)' },
                  { name: '\\vec{v}_i', description: 'Velocity of particle i (m/s)' }
                ]
              }
            ],
            examples: [],
            stepByStepProcedures: [],
            commonMistakes: [],
            importantNotes: [],
            visualAids: []
          }
        ],
        quickRevisionPoints: [
          'Kinematics derives position, velocity, and acceleration as calculus derivatives: v = dr/dt, a = dv/dt.',
          'Under uniform acceleration, x(t) = x_0 + v_0*t + 1/2*a*t² describes quadratic displacement.',
          'Newton’s Second Law in fundamental form is F = dp/dt; when mass is constant, F = m*a.',
          'Always construct a Free Body Diagram (FBD) containing strictly external contact and field forces.',
          'Static friction is an inequality: f_s <= mu_s * N; it equals mu_s * N only at threshold of impending slip.',
          'Kinetic friction f_k = mu_k * N is constant and directed opposite to relative surface velocity.',
          'Work-Kinetic Energy theorem proves net work done by all forces equals Delta K = 1/2*m*v_f² - 1/2*m*v_i².',
          'For conservative forces, total mechanical energy E = K + U is invariant across time.',
          'In isolated systems (Sigma F_ext = 0), linear momentum is strictly conserved during all collisions.'
        ],
        glossary: [
          { term: 'Inertial Reference Frame', definition: 'A reference frame moving at constant velocity where Newton’s first law holds.', category: 'Kinematics' },
          { term: 'Normal Force', definition: 'Perpendicular contact force exerted by a supporting surface to prevent interpenetration.', category: 'Dynamics' },
          { term: 'Conservative Force', definition: 'A force where work done between two points is path-independent (e.g. gravity, ideal springs).', category: 'Energy' },
          { term: 'Impulse', definition: 'Integral of force with respect to time: J = \\int F dt = Delta p.', category: 'Momentum' }
        ],
        importantQuestions: [
          {
            question: 'Why is static friction represented as an inequality rather than a fixed value?',
            answer: 'Because static friction is a self-adjusting reactive force that only exerts what is required to prevent relative tangential motion, up to its physical threshold mu_s * N.',
            type: 'conceptual'
          },
          {
            question: 'Under what physical condition is kinetic energy conserved during a collision?',
            answer: 'Only in an idealized perfectly elastic collision where no energy is converted into sound, thermal dissipation, or permanent structural deformation.',
            type: 'exam'
          }
        ],
        finalTakeaways: [
          'Mastering vector decomposition and free-body diagram isolation guarantees reliable mechanics analysis.',
          'Always verify energy conservation versus momentum conservation based on system boundary conditions.',
          'All derivations are mapped to clickable timestamp moments in the verified MIT lecture video.'
        ],
        coverageStats: {
          totalChunks: 6,
          processedChunks: 6,
          coverageScore: 100,
          coverageStatus: 'complete',
          verificationNotes: 'All 6 transcript chunks verified with zero missing concepts.'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.notes.set('wWnfJ0-xXRE', samplePhysicsNotes);
      this.log('info', 'Pre-seeded comprehensive academic study document for MIT Classical Mechanics lecture.');
    }
  }
}

export const db = new InMemoryDatabase();
