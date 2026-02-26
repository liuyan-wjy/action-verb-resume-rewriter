export interface RoleGuideData {
  slug: 'customer-service' | 'project-manager' | 'marketing';
  title: string;
  description: string;
  path: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  intro: string;
  verbList: string[];
  bulletExamples: Array<{ weak: string; strong: string }>;
  tips: string[];
  faq: Array<{ q: string; a: string }>;
}

export const roleGuides: RoleGuideData[] = [
  {
    slug: 'customer-service',
    title: 'Resume Action Verbs for Customer Service',
    description:
      'Use customer service resume action verbs to show issue resolution, customer communication, and service quality impact.',
    path: '/resume-action-verbs-for-customer-service',
    primaryKeyword: 'resume action verbs for customer service',
    secondaryKeywords: ['customer service resume verbs', 'customer support resume bullet examples'],
    intro:
      'Customer service resumes need verbs that show ownership, speed, and quality. Focus on conflict resolution, SLA consistency, and customer retention outcomes.',
    verbList: ['Resolved', 'De-escalated', 'Retained', 'Coordinated', 'Improved', 'Documented', 'Escalated', 'Guided'],
    bulletExamples: [
      {
        weak: 'Helped customers with account issues.',
        strong: 'Resolved account access issues for high-priority customers while maintaining SLA response targets.'
      },
      {
        weak: 'Worked on customer escalations.',
        strong: 'De-escalated complex customer complaints and coordinated cross-team fixes to protect account retention.'
      },
      {
        weak: 'Did support ticket updates.',
        strong: 'Documented ticket resolutions with clear root-cause notes to improve team handoff quality.'
      }
    ],
    tips: [
      'Prioritize verbs tied to outcomes: resolved, retained, reduced, improved.',
      'Reference customer scope (queue size, account tier, escalation level) when possible.',
      'Avoid generic verbs like helped/worked/did unless no stronger verb is accurate.'
    ],
    faq: [
      {
        q: 'What are the best action verbs for customer service resumes?',
        a: 'Strong options include Resolved, De-escalated, Retained, Guided, and Improved, depending on your actual responsibilities.'
      },
      {
        q: 'Should customer service bullets include metrics?',
        a: 'Yes when available. Use practical metrics such as CSAT trend, response time, SLA adherence, or retention impact.'
      }
    ]
  },
  {
    slug: 'project-manager',
    title: 'Resume Action Verbs for Project Manager',
    description:
      'Use project manager resume action verbs to highlight planning, stakeholder alignment, execution control, and delivery impact.',
    path: '/resume-action-verbs-for-project-manager',
    primaryKeyword: 'resume action verbs for project manager',
    secondaryKeywords: ['project manager resume verbs', 'project management bullet examples'],
    intro:
      'Project manager resumes should demonstrate planning discipline, stakeholder alignment, and delivery outcomes. Choose verbs that show control and cross-functional leadership.',
    verbList: ['Led', 'Planned', 'Prioritized', 'Delivered', 'Mitigated', 'Aligned', 'Orchestrated', 'Standardized'],
    bulletExamples: [
      {
        weak: 'Responsible for project timelines.',
        strong: 'Planned cross-functional delivery timelines and mitigated schedule risks across concurrent workstreams.'
      },
      {
        weak: 'Worked with stakeholders on requirements.',
        strong: 'Aligned product, engineering, and operations stakeholders on scope and release milestones.'
      },
      {
        weak: 'Helped manage project delivery.',
        strong: 'Delivered multi-phase initiatives by standardizing sprint planning and dependency tracking.'
      }
    ],
    tips: [
      'Use governance-focused verbs for PM roles: planned, aligned, mitigated, delivered.',
      'Show project context (timeline, team scope, risk profile) without inflating ownership.',
      'Pair verbs with business outcomes (faster launch, fewer blockers, better predictability).'
    ],
    faq: [
      {
        q: 'Which verbs are strongest for a project manager resume?',
        a: 'Good PM verbs include Led, Planned, Aligned, Mitigated, and Delivered when they reflect your real scope.'
      },
      {
        q: 'How do I avoid repetitive PM bullets?',
        a: 'Rotate verbs by responsibility type: planning, risk, stakeholder management, execution, and process improvement.'
      }
    ]
  },
  {
    slug: 'marketing',
    title: 'Resume Action Verbs for Marketing',
    description:
      'Use marketing resume action verbs to show campaign execution, channel growth, content performance, and pipeline impact.',
    path: '/resume-action-verbs-for-marketing',
    primaryKeyword: 'resume action verbs for marketing',
    secondaryKeywords: ['marketing resume verbs', 'marketing resume bullet examples'],
    intro:
      'Marketing resumes should communicate channel execution and measurable growth. Choose verbs that tie your work to campaign performance and revenue impact.',
    verbList: ['Launched', 'Optimized', 'Segmented', 'Positioned', 'Scaled', 'Analyzed', 'Increased', 'Orchestrated'],
    bulletExamples: [
      {
        weak: 'Did social media campaigns.',
        strong: 'Launched channel-specific campaigns and optimized content cadence to improve engagement consistency.'
      },
      {
        weak: 'Helped with email marketing.',
        strong: 'Segmented email audiences and improved lifecycle messaging for stronger campaign relevance.'
      },
      {
        weak: 'Worked on paid ads reporting.',
        strong: 'Analyzed paid acquisition trends and surfaced optimization opportunities for budget allocation decisions.'
      }
    ],
    tips: [
      'Use growth and experimentation verbs: launched, optimized, scaled, increased.',
      'Tie bullets to channel context (paid, lifecycle, content, product marketing).',
      'Add credible impact metrics when available (CTR, conversion, pipeline, CAC trend).'
    ],
    faq: [
      {
        q: 'What action verbs should marketing resumes use?',
        a: 'Strong options include Launched, Optimized, Segmented, Positioned, Scaled, and Increased.'
      },
      {
        q: 'Can marketing bullets be ATS-friendly and still persuasive?',
        a: 'Yes. Keep bullets concise, role-specific, and measurable while avoiding inflated claims.'
      }
    ]
  }
];

export function getRoleGuideBySlug(slug: RoleGuideData['slug']) {
  return roleGuides.find((item) => item.slug === slug);
}
