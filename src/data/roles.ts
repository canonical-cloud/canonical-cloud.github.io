export interface RolePage {
  slug: string;
  label: string;
  audience: string;
  eyebrow: string;
  headline: string;
  summary: string;
  trigger: string;
  problem: string;
  priorities: { title: string; detail: string }[];
  cloud: { headline: string; summary: string; bullets: string[] };
  plus: { headline: string; summary: string; bullets: string[] };
  steps: { title: string; detail: string }[];
  question: string;
  answer: string;
}

export const roles: RolePage[] = [
  {
    slug: 'ceo',
    label: 'CEO / Founder',
    audience: 'Founders and CEOs',
    eyebrow: 'For CEOs and founders',
    headline: 'Build enterprise confidence without slowing your startup.',
    summary: 'Your next customer, investor, or partner wants evidence that your company can operate securely and reliably. Give the team a practical path forward without creating a full compliance department.',
    trigger: 'A strategic customer is asking about security, or the company has just raised funding.',
    problem: 'You need commercial credibility, accountable ownership, and an execution plan—not a new pile of dashboards.',
    priorities: [
      { title: 'Protect the sales conversation', detail: 'Know what you can substantiate today, what remains unverified, and who will answer difficult buyer questions.' },
      { title: 'Make ownership visible', detail: 'Assign infrastructure, control, and evidence responsibilities before they turn into founder escalations.' },
      { title: 'Invest in the next milestone', detail: 'Sequence operational improvements against the deal, fundraising, or review that matters most.' }
    ],
    cloud: {
      headline: 'See the operational picture.',
      summary: 'Canonical Cloud connects infrastructure context, service evidence, and ownership so leadership has an intelligible view of technical readiness.',
      bullets: ['Cloud, DNS, CI, and service context', 'Responsibilities and operational follow-through', 'A reviewable trail of implementation evidence']
    },
    plus: {
      headline: 'Make enterprise readiness actionable.',
      summary: 'Canonical Plus scopes the relevant requirements, identifies gaps, and gives your team a remediation and evidence plan for independent review.',
      bullets: ['Customer-driven SOC 2 or ISO 27001 readiness planning', 'Prioritized gaps with named owners', 'Independent-assessor handoff preparation']
    },
    steps: [
      { title: 'Start with the business trigger', detail: 'Identify the buyer request, target market, and decision date before choosing a framework.' },
      { title: 'Map what is true today', detail: 'Define systems, data, owners, controls, and evidence without inventing a readiness score.' },
      { title: 'Fund an executable roadmap', detail: 'Prioritize the work that reduces material risk and improves your ability to answer stakeholders.' }
    ],
    question: 'Will this make us SOC 2 certified?',
    answer: 'No. Canonical Plus can help prepare scope, controls, remediation, and evidence. A qualified independent auditor or certification body makes formal assurance decisions.'
  },
  {
    slug: 'coo',
    label: 'COO / Operations',
    audience: 'COOs and operations leaders',
    eyebrow: 'For COOs and heads of operations',
    headline: 'Turn fragmented readiness work into a repeatable operating rhythm.',
    summary: 'Policies, vendor responsibilities, control owners, and evidence requests should not depend on one person remembering where everything lives.',
    trigger: 'The company is growing faster than its operating processes, or a customer review is approaching.',
    problem: 'You are accountable for coordination across teams, but the evidence and decisions are scattered.',
    priorities: [
      { title: 'Put an owner on every task', detail: 'Make control responsibility, blockers, exceptions, and due dates visible across operations and engineering.' },
      { title: 'Stop rebuilding the same package', detail: 'Establish repeatable evidence sources and freshness expectations for the next review.' },
      { title: 'Keep handoffs explicit', detail: 'Turn meeting outcomes into documented decisions and follow-up work rather than institutional memory.' }
    ],
    cloud: {
      headline: 'Connect the people to the systems.',
      summary: 'Canonical Cloud gives operations a shared picture of deployed services, ownership, evidence, and follow-through.',
      bullets: ['Operational inventory and accountable owners', 'Service and deployment evidence context', 'Durable handoffs across teams']
    },
    plus: {
      headline: 'Run readiness as a managed program.',
      summary: 'Canonical Plus helps organize control gaps, evidence operations, and remediation plans for applicable compliance goals.',
      bullets: ['Control-owner working plans', 'Evidence freshness and exception tracking', 'Readiness checkpoints and reviewer handoff']
    },
    steps: [
      { title: 'Define the scope', detail: 'List the teams, vendors, systems, data, and requirements that actually belong in the effort.' },
      { title: 'Create a working register', detail: 'Track control status, evidence quality, exceptions, owners, and dependencies.' },
      { title: 'Establish a cadence', detail: 'Review changes, aging evidence, and remediation progress before the next external request.' }
    ],
    question: 'Do we need a dedicated compliance team?',
    answer: 'Not necessarily. The starting point is clear control ownership and a manageable operating cadence. Scope and staffing depend on the systems, obligations, and review timeline.'
  },
  {
    slug: 'cfo',
    label: 'CFO / Finance',
    audience: 'CFOs and finance leaders',
    eyebrow: 'For CFOs and finance leaders',
    headline: 'Put a plan and a cost boundary around operational risk.',
    summary: 'See what infrastructure and compliance readiness work is for, what depends on it, and what should be funded first—before an open-ended initiative absorbs the budget.',
    trigger: 'Enterprise procurement, an upcoming financing milestone, or an expanding cloud and vendor footprint.',
    problem: 'Compliance and infrastructure requests arrive as cost centers without a clear business dependency or accountable owner.',
    priorities: [
      { title: 'Make the scope legible', detail: 'Separate required work from optional improvements and unknowns before approving spend.' },
      { title: 'Connect cost to commercial needs', detail: 'Understand which customer requests, contractual commitments, and risks drive each initiative.' },
      { title: 'Control the handoff', detail: 'Know which deliverables are readiness preparation and which require an independent assessor.' }
    ],
    cloud: {
      headline: 'Know what your infrastructure effort supports.',
      summary: 'Canonical Cloud connects operational context and ownership so cost discussions can reference actual services and responsibilities.',
      bullets: ['Visible service and ownership context', 'Operational evidence tied to real work', 'Continuity as teams and vendors change']
    },
    plus: {
      headline: 'Scope readiness before committing.',
      summary: 'Canonical Plus prepares a requirements boundary, gap register, and risk-based roadmap. Final engagement terms are set in a statement of work.',
      bullets: ['A defined readiness scope and assumptions', 'Prioritized remediation with dependencies', 'Evidence and independent-review preparation']
    },
    steps: [
      { title: 'Identify the obligation', detail: 'Document the customer, regulatory, contractual, or investor driver for the work.' },
      { title: 'Review the gaps and alternatives', detail: 'Compare essential remediation, reusable evidence processes, and independent-review costs.' },
      { title: 'Approve a scoped sequence', detail: 'Set milestones, ownership, and acceptance criteria before expanding investment.' }
    ],
    question: 'Can we see pricing without committing to an engagement?',
    answer: 'Canonical Cloud publishes a pricing schedule behind an email one-time-code gate. Canonical Plus also offers a preliminary readiness estimate; the signed statement of work governs final scope and price.'
  },
  {
    slug: 'cto',
    label: 'CTO / Engineering',
    audience: 'CTOs and engineering leaders',
    eyebrow: 'For CTOs and VP Engineering',
    headline: 'Make security and readiness work fit how engineers ship.',
    summary: 'Turn requirements into concrete changes across cloud services, identity, deployments, logging, and data controls—without treating engineers as manual evidence collectors.',
    trigger: 'Your first enterprise security review, a growing infrastructure estate, or increasing change and deployment complexity.',
    problem: 'High-level compliance tickets are disconnected from the systems, code paths, and operational evidence needed to close them.',
    priorities: [
      { title: 'Map the real system', detail: 'Understand cloud accounts, services, CI, DNS, access, and data boundaries before assigning remediation.' },
      { title: 'Create actionable engineering work', detail: 'Give each gap a system owner, implementation target, dependency, and acceptance test.' },
      { title: 'Reuse trustworthy evidence', detail: 'Prefer durable technical signals over screenshots and spreadsheet archaeology.' }
    ],
    cloud: {
      headline: 'Connect technical state to accountability.',
      summary: 'Canonical Cloud frames service, deployment, domain, and CI context alongside evidence and ongoing responsibility.',
      bullets: ['Cloud and service visibility', 'CI, DNS, and operational proof', 'Ownership and change handoffs']
    },
    plus: {
      headline: 'Turn findings into remediation.',
      summary: 'Canonical Plus helps scope controls and translate readiness gaps into engineering-aware fixes and evidence expectations.',
      bullets: ['Cloud, IAM, SDLC, and logging gap analysis', 'Prioritized technical remediation plan', 'Independent-review evidence preparation']
    },
    steps: [
      { title: 'Inventory boundaries', detail: 'Identify the relevant systems, identities, data flows, and deployed environments.' },
      { title: 'Convert controls into tickets', detail: 'Specify what to change, how to verify it, and which evidence source demonstrates the result.' },
      { title: 'Keep evidence current', detail: 'Revisit control operation as your systems and teams evolve.' }
    ],
    question: 'Is Canonical Cloud an audit platform?',
    answer: 'Canonical Cloud is positioned as an operational foundation with readiness and evidence context. Canonical Plus supports readiness and remediation; independent reviewers provide formal assurance.'
  },
  {
    slug: 'cro',
    label: 'CRO / Sales',
    audience: 'CROs and sales leaders',
    eyebrow: 'For CROs and sales leaders',
    headline: 'Keep security reviews from becoming a blind spot in your pipeline.',
    summary: 'When a serious buyer asks for your security posture, give sales an accurate internal path to answers, evidence, and owners rather than a promise the company cannot yet support.',
    trigger: 'An enterprise prospect has sent a security questionnaire or procurement checklist.',
    problem: 'The deal is progressing, but your teams cannot quickly distinguish available evidence from unresolved security work.',
    priorities: [
      { title: 'Respond with facts', detail: 'Find the right owner and current proof for security and operational questions.' },
      { title: 'Surface blockers sooner', detail: 'Make missing controls and evidence visible before the contract deadline.' },
      { title: 'Protect buyer trust', detail: 'State what is implemented, what remains open, and what requires independent validation.' }
    ],
    cloud: {
      headline: 'Understand who owns the answer.',
      summary: 'Canonical Cloud provides operational context and evidence trails that help teams coordinate accurate responses.',
      bullets: ['Traceable service and control context', 'Clear technical owners', 'A shared view of open operational work']
    },
    plus: {
      headline: 'Prepare for procurement scrutiny.',
      summary: 'Canonical Plus turns customer security requests into scoped readiness work and organized evidence for the appropriate reviewers.',
      bullets: ['Requirements and evidence gap mapping', 'Prioritized customer-driven remediation', 'Independent-assessor handoff planning']
    },
    steps: [
      { title: 'Capture the exact buyer request', detail: 'Record the customer requirement and deadline without assuming every framework is necessary.' },
      { title: 'Verify claims with owners', detail: 'Match questionnaire answers to controls, evidence, and documented exceptions.' },
      { title: 'Resolve or disclose gaps', detail: 'Provide an accurate roadmap for unfinished work rather than a premature certification claim.' }
    ],
    question: 'Can this guarantee a deal closes sooner?',
    answer: 'No. Clearer scope, evidence, and ownership can make procurement discussions more productive, but sales outcomes depend on the buyer and the underlying controls.'
  },
  {
    slug: 'security',
    label: 'Security / CISO',
    audience: 'Security leads and CISOs',
    eyebrow: 'For heads of security and CISOs',
    headline: 'Build controls you can operate and evidence you can defend.',
    summary: 'Security maturity requires more than a policy document. Connect control intent, technical implementation, evidence quality, and remediation into work your organization can sustain.',
    trigger: 'A first security hire, a new framework requirement, or a formal independent review on the horizon.',
    problem: 'You need a defensible program while the team, tooling, and control ownership are still taking shape.',
    priorities: [
      { title: 'Define boundaries precisely', detail: 'Scope systems, regulated data, vendors, people, and excluded areas before assigning control status.' },
      { title: 'Separate implementation from proof', detail: 'Distinguish missing controls, stale evidence, and unverified claims in the same register.' },
      { title: 'Prepare a clean review handoff', detail: 'Provide scope, controls, evidence index, exceptions, and open items to the independent reviewer.' }
    ],
    cloud: {
      headline: 'Keep technical evidence connected.',
      summary: 'Canonical Cloud connects operational context, service evidence, and accountable owners to support ongoing control operation.',
      bullets: ['Infrastructure and deployment context', 'Evidence linked to operational decisions', 'Clear owner and change visibility']
    },
    plus: {
      headline: 'Make framework readiness reviewable.',
      summary: 'Canonical Plus scopes applicable requirements and supports assessment, technical remediation, and evidence preparation.',
      bullets: ['SOC 2, ISO 27001, NIST, and applicable framework mapping', 'Control and evidence gap register', 'Prioritized remediation and assessor handoff']
    },
    steps: [
      { title: 'Choose the right boundary', detail: 'Document obligations, systems, data, and reviewer expectations, including exclusions.' },
      { title: 'Review each control honestly', detail: 'Record design, operation, evidence quality, unknowns, and exceptions separately.' },
      { title: 'Prepare for external scrutiny', detail: 'Package evidence and assign remaining work without implying a passed audit.' }
    ],
    question: 'Who provides the audit opinion or certification?',
    answer: 'Qualified independent auditors, assessors, certification bodies, or authorities issue formal opinions or determinations. Canonical Plus supports preparation and remediation, not those independent decisions.'
  }
];

export const roleBySlug = new Map(roles.map((role) => [role.slug, role]));
