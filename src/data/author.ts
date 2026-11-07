export const AUTHOR = {
  name:        'Ivan Ocampo',
  role:        'Chief Architect',
  org:         'Accent Group',
  city:        'Melbourne',
  country:     'AU',
  url:         'https://ivanocampo.com',
  description: 'Chief Architect at Accent Group, Melbourne. PhD 2025, Australian Institute of Business. Writing on enterprise infrastructure, cloud architecture, and the phenomenology of distributed work.',
  bio: {
    short: 'Chief Architect at Accent Group. PhD 2025 (AIB). 24 years in enterprise infrastructure, cloud, and architecture.',
    long:  'Ivan Ocampo is Chief Architect at Accent Group, Melbourne, with 24 years of experience across enterprise infrastructure, cloud architecture, and systems design. He holds a PhD from the Australian Institute of Business (2025), where his research examined liminality, remote work intensity, and the phenomenology of distributed organisations. He holds TOGAF, CCNP, and ITIL certifications.',
  },
  sameAs: [
    'https://github.com/allitnils',
    'https://scholar.google.com/citations?user=QEOarFgAAAAJ',
    'https://www.researchgate.net/profile/Ivan-Ocampo-2',
    'https://orcid.org/0000-0002-8532-0673',
  ],
  orcid:       '0000-0002-8532-0673',
  image:       '/images/ivan-ocampo.jpg',
  certifications: ['PhD (AIB, 2025)', 'MBA (UC, 2019)', 'TOGAF', 'CCNP', 'ITIL', 'CISSP', 'AZ-305', 'AWS-SAA', 'CISM', 'PMP'],
  techDomains: [
    'Azure', 'Entra ID', 'VMware', 'Oracle',
    'Grafana', 'Prometheus', 'Loki', 'VictoriaMetrics',
    'Cloudflare', 'Meraki', 'IIS', 'Jira Service Management',
  ],
} as const;

/** Stable entity id — every schema references this so search engines merge them into one person. */
export const PERSON_ID = `${AUTHOR.url}/#person`;

/** Reference to the Person entity, for author/publisher fields. */
export const personRef = { '@id': PERSON_ID } as const;

/** Full Person entity. Single source for all Person JSON-LD on the site. */
export const personSchema = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: AUTHOR.name,
  givenName: 'Ivan',
  familyName: 'Ocampo',
  url: AUTHOR.url,
  image: `${AUTHOR.url}${AUTHOR.image}`,
  jobTitle: AUTHOR.role,
  worksFor: { '@type': 'Organization', name: AUTHOR.org },
  alumniOf: { '@type': 'EducationalOrganization', name: 'Australian Institute of Business' },
  description: AUTHOR.description,
  sameAs: [...AUTHOR.sameAs],
  knowsAbout: ['Enterprise Architecture', 'Cloud Infrastructure', 'Azure', 'Observability',
               'Phenomenology', 'Remote Work', 'Liminality', 'Organisation Studies'],
  address: { '@type': 'PostalAddress', addressLocality: AUTHOR.city, addressCountry: AUTHOR.country },
  identifier: [{ '@type': 'PropertyValue', propertyID: 'ORCID', value: `https://orcid.org/${AUTHOR.orcid}` }],
};
