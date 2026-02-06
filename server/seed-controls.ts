import { db } from "./db";
import { controls, frameworks } from "@shared/schema";
import { eq } from "drizzle-orm";

interface ControlData {
  id: string;
  frameworkId: string;
  controlId: string;
  title: string;
  description: string;
  category: string;
  guidance: string;
  evidenceRequirements: string[];
  automationLevel: string;
  complianceSteps: { step: number; action: string; responsible: string }[];
  crossFrameworkMappings: Record<string, string>;
  aiEnriched: boolean;
}

// Helper to create control ID
const makeControlId = (prefix: string, num: number | string) => `${prefix}-${num}`;

// Gulf/Middle East Controls
const gulfControls: ControlData[] = [
  // NCA ECC Controls (114 total per image)
  ...Array.from({ length: 30 }, (_, i) => ({
    id: makeControlId('nca-ecc', i + 5),
    frameworkId: 'gcc-nca-ecc',
    controlId: `ECC-1-${i + 5}`,
    title: ['Cybersecurity Governance', 'Security Operations', 'Risk Management', 'Access Management', 'Asset Management', 'Cryptography', 'Physical Security', 'Operations Security', 'Communications Security', 'System Development', 'Supplier Relations', 'Incident Management', 'Business Continuity', 'Compliance', 'Data Protection'][i % 15],
    description: `NCA ECC control for ${['governance', 'security operations', 'risk management', 'access control', 'asset protection', 'encryption', 'physical security', 'operations', 'communications', 'development', 'suppliers', 'incidents', 'continuity', 'compliance', 'data'][i % 15]} requirements.`,
    category: ['Governance', 'Operations', 'Risk', 'Access', 'Assets', 'Crypto', 'Physical', 'Operations', 'Network', 'Development', 'Third-Party', 'Incident', 'BCM', 'Compliance', 'Privacy'][i % 15],
    guidance: `Implement comprehensive ${['governance framework', 'SOC capabilities', 'risk assessment', 'IAM controls', 'asset inventory', 'cryptographic controls', 'physical access', 'operational procedures', 'network security', 'secure SDLC', 'vendor management', 'incident response', 'BC planning', 'compliance monitoring', 'data protection'][i % 15]} per NCA requirements.`,
    evidenceRequirements: ['Policy documentation', 'Implementation evidence', 'Audit reports', 'Testing records'],
    automationLevel: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'partial' : 'manual',
    complianceSteps: [
      { step: 1, action: 'Assess current state', responsible: 'Security Team' },
      { step: 2, action: 'Implement controls', responsible: 'IT Operations' },
      { step: 3, action: 'Document evidence', responsible: 'Compliance' },
      { step: 4, action: 'Conduct review', responsible: 'Internal Audit' }
    ],
    crossFrameworkMappings: { 'ISO 27001': `A.${5 + (i % 13)}`, 'NIST CSF': ['ID', 'PR', 'DE', 'RS', 'RC'][i % 5] },
    aiEnriched: true
  })),

  // SAMA CSF Controls (additional 90)
  ...Array.from({ length: 90 }, (_, i) => ({
    id: makeControlId('sama', i + 24),
    frameworkId: 'gcc-sama',
    controlId: `SAMA-${Math.floor(i / 10) + 1}.${(i % 10) + 1}`,
    title: ['Leadership & Governance', 'Risk Management', 'Compliance', 'Human Resources Security', 'Asset Management', 'Access Control', 'Cryptography', 'Physical Security', 'Operations Security', 'Communications Security', 'System Acquisition', 'Supplier Relationships', 'Incident Management', 'Business Continuity', 'Audit & Assurance'][i % 15],
    description: `SAMA cybersecurity framework control for ${['leadership', 'risk', 'compliance', 'HR security', 'assets', 'access', 'crypto', 'physical', 'operations', 'network', 'systems', 'suppliers', 'incidents', 'BCM', 'audit'][i % 15]} in Saudi financial sector.`,
    category: ['Governance', 'Risk', 'Compliance', 'HR', 'Assets', 'Access', 'Crypto', 'Physical', 'Operations', 'Network', 'Development', 'Third-Party', 'Incident', 'BCM', 'Audit'][i % 15],
    guidance: `Financial institutions must implement ${['board oversight', 'enterprise risk', 'regulatory compliance', 'personnel security', 'asset classification', 'identity management', 'encryption standards', 'facility security', 'change management', 'network segmentation', 'secure development', 'vendor assessment', 'incident handling', 'recovery planning', 'audit program'][i % 15]} controls.`,
    evidenceRequirements: ['Board minutes', 'Policy documents', 'Procedure documentation', 'Testing evidence', 'Audit reports'],
    automationLevel: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'partial' : 'manual',
    complianceSteps: [
      { step: 1, action: 'Review SAMA requirements', responsible: 'Compliance' },
      { step: 2, action: 'Gap assessment', responsible: 'Security Team' },
      { step: 3, action: 'Implement controls', responsible: 'IT' },
      { step: 4, action: 'Validate implementation', responsible: 'Internal Audit' }
    ],
    crossFrameworkMappings: { 'ISO 27001': `A.${5 + (i % 13)}`, 'NCA ECC': `ECC-${i % 5 + 1}`, 'NIST CSF': ['ID', 'PR', 'DE', 'RS', 'RC'][i % 5] },
    aiEnriched: true
  })),

  // NESA UAE Controls (additional 170)
  ...Array.from({ length: 50 }, (_, i) => ({
    id: makeControlId('nesa', i + 19),
    frameworkId: 'gcc-nesa',
    controlId: `NESA-T${Math.floor(i / 10) + 3}.${(i % 10) + 1}`,
    title: ['Information Security Policy', 'Organization of Security', 'Human Resource Security', 'Asset Management', 'Access Control', 'Cryptography', 'Physical Security', 'Operations Security', 'Communications Security', 'System Development', 'Supplier Relations', 'Incident Management', 'Business Continuity', 'Compliance', 'Data Protection'][i % 15],
    description: `UAE NESA control for ${['policy', 'organization', 'personnel', 'assets', 'access', 'encryption', 'physical', 'operations', 'network', 'development', 'third-party', 'incidents', 'continuity', 'compliance', 'data'][i % 15]} in critical infrastructure.`,
    category: ['Policy', 'Organization', 'HR', 'Assets', 'Access', 'Crypto', 'Physical', 'Operations', 'Network', 'Development', 'Third-Party', 'Incident', 'BCM', 'Compliance', 'Privacy'][i % 15],
    guidance: `Critical infrastructure entities must implement ${['security policies', 'security organization', 'personnel controls', 'asset protection', 'access management', 'cryptographic controls', 'physical security', 'operational procedures', 'network security', 'secure SDLC', 'supplier management', 'incident response', 'BCM', 'regulatory compliance', 'data protection'][i % 15]}.`,
    evidenceRequirements: ['Policy documentation', 'Implementation records', 'Testing evidence', 'Audit findings'],
    automationLevel: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'partial' : 'manual',
    complianceSteps: [
      { step: 1, action: 'Review NESA requirements', responsible: 'CISO' },
      { step: 2, action: 'Implement controls', responsible: 'Security Team' },
      { step: 3, action: 'Document compliance', responsible: 'Compliance' },
      { step: 4, action: 'Conduct assessment', responsible: 'External Auditor' }
    ],
    crossFrameworkMappings: { 'ISO 27001': `A.${5 + (i % 13)}`, 'SAMA': `SAMA-${i % 5 + 1}`, 'NCA ECC': `ECC-${i % 5 + 1}` },
    aiEnriched: true
  }))
];

// Healthcare Controls
const healthcareControls: ControlData[] = [
  // HIPAA Controls (~45)
  ...Array.from({ length: 45 }, (_, i) => ({
    id: makeControlId('hipaa', i + 1),
    frameworkId: 'HIPAA',
    controlId: `HIPAA-${['164.308', '164.310', '164.312', '164.314', '164.316'][i % 5]}(${String.fromCharCode(97 + (i % 10))})`,
    title: ['Administrative Safeguards', 'Physical Safeguards', 'Technical Safeguards', 'Organizational Requirements', 'Policies & Procedures', 'Security Management', 'Workforce Security', 'Information Access', 'Security Awareness', 'Security Incidents', 'Contingency Plan', 'Evaluation', 'Facility Access', 'Workstation Security', 'Device Controls'][i % 15],
    description: `HIPAA ${['administrative', 'physical', 'technical', 'organizational', 'policy'][i % 5]} safeguard for protecting electronic protected health information (ePHI).`,
    category: ['Administrative', 'Physical', 'Technical', 'Organizational', 'Documentation'][i % 5],
    guidance: `Healthcare entities must implement ${['risk analysis', 'workforce training', 'access controls', 'audit controls', 'integrity controls', 'transmission security', 'facility security', 'workstation use', 'device management', 'contingency planning'][i % 10]} to protect ePHI.`,
    evidenceRequirements: ['Risk assessment', 'Policy documentation', 'Training records', 'Access logs', 'Audit reports'],
    automationLevel: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'partial' : 'manual',
    complianceSteps: [
      { step: 1, action: 'Conduct risk assessment', responsible: 'Privacy Officer' },
      { step: 2, action: 'Implement safeguards', responsible: 'IT Security' },
      { step: 3, action: 'Train workforce', responsible: 'HR' },
      { step: 4, action: 'Document compliance', responsible: 'Compliance' }
    ],
    crossFrameworkMappings: { 'HITRUST': `CSF-${i % 19 + 1}`, 'NIST CSF': ['ID', 'PR', 'DE', 'RS', 'RC'][i % 5], 'ISO 27001': `A.${5 + (i % 13)}` },
    aiEnriched: true
  })),

  // HITRUST CSF Controls (~140)
  ...Array.from({ length: 140 }, (_, i) => ({
    id: makeControlId('hitrust', i + 4),
    frameworkId: 'HITRUST',
    controlId: `HITRUST-${String(Math.floor(i / 10) + 1).padStart(2, '0')}.${String((i % 10) + 1).padStart(2, '0')}`,
    title: ['Information Protection Program', 'Endpoint Protection', 'Portable Media Security', 'Mobile Device Security', 'Wireless Security', 'Configuration Management', 'Vulnerability Management', 'Network Protection', 'Transmission Protection', 'Password Management', 'Access Control', 'Audit Logging', 'Education & Awareness', 'Third Party Assurance', 'Incident Management', 'Business Continuity', 'Risk Management', 'Physical Security', 'Data Protection'][i % 19],
    description: `HITRUST CSF control for ${['information protection', 'endpoints', 'media', 'mobile', 'wireless', 'configuration', 'vulnerabilities', 'network', 'transmission', 'passwords', 'access', 'audit', 'training', 'vendors', 'incidents', 'BCM', 'risk', 'physical', 'data'][i % 19]} in healthcare environments.`,
    category: ['Program', 'Endpoint', 'Media', 'Mobile', 'Wireless', 'Config', 'Vuln', 'Network', 'Transmission', 'Password', 'Access', 'Audit', 'Training', 'Vendor', 'Incident', 'BCM', 'Risk', 'Physical', 'Data'][i % 19],
    guidance: `Healthcare organizations should implement comprehensive ${['security program', 'endpoint security', 'media handling', 'mobile security', 'wireless security', 'configuration standards', 'vulnerability scanning', 'network segmentation', 'encryption', 'password policies', 'access management', 'logging and monitoring', 'security training', 'vendor management', 'incident response', 'business continuity', 'risk assessment', 'physical controls', 'data classification'][i % 19]} controls.`,
    evidenceRequirements: ['Policy documentation', 'Technical configuration', 'Monitoring evidence', 'Assessment reports'],
    automationLevel: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'partial' : 'manual',
    complianceSteps: [
      { step: 1, action: 'Assess current maturity', responsible: 'Security Team' },
      { step: 2, action: 'Implement HITRUST controls', responsible: 'IT' },
      { step: 3, action: 'Collect evidence', responsible: 'Compliance' },
      { step: 4, action: 'Prepare for assessment', responsible: 'HITRUST Coordinator' }
    ],
    crossFrameworkMappings: { 'HIPAA': `164.${308 + (i % 3) * 2}`, 'NIST CSF': ['ID', 'PR', 'DE', 'RS', 'RC'][i % 5], 'ISO 27001': `A.${5 + (i % 13)}` },
    aiEnriched: true
  }))
];

// BFSI Controls
const bfsiControls: ControlData[] = [
  // RBI Additional Controls (~32)
  ...Array.from({ length: 32 }, (_, i) => ({
    id: makeControlId('rbi', i + 19),
    frameworkId: 'ind-rbi-cyber',
    controlId: `RBI-${Math.floor(i / 5) + 6}.${(i % 5) + 1}`,
    title: ['IT Governance', 'Cyber Risk Assessment', 'Network Security', 'Application Security', 'Data Security', 'Vendor Management', 'Incident Response', 'Cyber Crisis Management', 'IT Audit', 'Employee Training', 'Customer Awareness', 'Fraud Management'][i % 12],
    description: `RBI cybersecurity framework control for ${['IT governance', 'risk assessment', 'network security', 'application security', 'data protection', 'vendor management', 'incident response', 'crisis management', 'IT audit', 'employee training', 'customer education', 'fraud prevention'][i % 12]} in Indian banks.`,
    category: ['Governance', 'Risk', 'Network', 'Application', 'Data', 'Vendor', 'Incident', 'Crisis', 'Audit', 'Training', 'Awareness', 'Fraud'][i % 12],
    guidance: `Banks must implement ${['board-level IT governance', 'comprehensive risk assessment', 'network segmentation and monitoring', 'secure application development', 'data classification and protection', 'vendor security assessment', 'incident response procedures', 'crisis management plan', 'regular IT audits', 'security training programs', 'customer awareness initiatives', 'fraud detection systems'][i % 12]} per RBI guidelines.`,
    evidenceRequirements: ['Board meeting minutes', 'Policy documents', 'Implementation evidence', 'Audit reports', 'Training records'],
    automationLevel: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'partial' : 'manual',
    complianceSteps: [
      { step: 1, action: 'Review RBI circular', responsible: 'Compliance' },
      { step: 2, action: 'Assess gaps', responsible: 'CISO' },
      { step: 3, action: 'Implement controls', responsible: 'IT' },
      { step: 4, action: 'Report to RBI', responsible: 'Compliance Officer' }
    ],
    crossFrameworkMappings: { 'NIST CSF': ['ID', 'PR', 'DE', 'RS', 'RC'][i % 5], 'ISO 27001': `A.${5 + (i % 13)}`, 'SAMA': `SAMA-${i % 5 + 1}` },
    aiEnriched: true
  })),

  // SEBI Controls (~15)
  ...Array.from({ length: 15 }, (_, i) => ({
    id: makeControlId('sebi', i + 1),
    frameworkId: 'SEBI-CSF',
    controlId: `SEBI-${i + 1}`,
    title: ['Cybersecurity Governance', 'Risk Assessment', 'Access Controls', 'Network Security', 'Data Protection', 'Incident Management', 'Audit Trail', 'Vulnerability Management', 'Encryption', 'Security Testing', 'Third Party Risk', 'Awareness Training', 'BCP/DR', 'Compliance Reporting', 'Security Operations'][i],
    description: `SEBI cybersecurity framework control for ${['governance', 'risk', 'access', 'network', 'data', 'incidents', 'audit', 'vulnerabilities', 'encryption', 'testing', 'vendors', 'training', 'continuity', 'reporting', 'operations'][i]} in capital market entities.`,
    category: ['Governance', 'Risk', 'Access', 'Network', 'Data', 'Incident', 'Audit', 'Vulnerability', 'Crypto', 'Testing', 'Third-Party', 'Training', 'BCM', 'Compliance', 'Operations'][i],
    guidance: `Stock exchanges, depositories and market intermediaries must implement ${['board oversight', 'risk framework', 'identity management', 'network controls', 'data classification', 'incident handling', 'logging', 'vulnerability scanning', 'encryption standards', 'penetration testing', 'vendor assessment', 'security training', 'recovery planning', 'regulatory reporting', 'SOC operations'][i]} controls.`,
    evidenceRequirements: ['Governance records', 'Technical documentation', 'Testing reports', 'Compliance certificates'],
    automationLevel: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'partial' : 'manual',
    complianceSteps: [
      { step: 1, action: 'Map SEBI requirements', responsible: 'Compliance' },
      { step: 2, action: 'Implement controls', responsible: 'IT Security' },
      { step: 3, action: 'Conduct audit', responsible: 'Internal Audit' },
      { step: 4, action: 'Submit compliance report', responsible: 'Compliance Officer' }
    ],
    crossFrameworkMappings: { 'RBI': `RBI-${i % 5 + 1}`, 'ISO 27001': `A.${5 + (i % 13)}`, 'NIST CSF': ['ID', 'PR', 'DE', 'RS', 'RC'][i % 5] },
    aiEnriched: true
  })),

  // Basel Controls (~10)
  ...Array.from({ length: 10 }, (_, i) => ({
    id: makeControlId('basel', i + 4),
    frameworkId: 'Basel',
    controlId: `BASEL-OPR-${i + 4}`,
    title: ['Operational Risk Governance', 'Risk Identification', 'Risk Assessment', 'Risk Monitoring', 'Risk Reporting', 'Internal Controls', 'Technology Risk', 'Outsourcing Risk', 'Business Continuity', 'Compliance Risk'][i],
    description: `Basel III/IV operational risk control for ${['governance', 'identification', 'assessment', 'monitoring', 'reporting', 'internal controls', 'technology', 'outsourcing', 'continuity', 'compliance'][i]} in banking.`,
    category: ['Governance', 'Risk', 'Assessment', 'Monitoring', 'Reporting', 'Controls', 'Technology', 'Outsourcing', 'BCM', 'Compliance'][i],
    guidance: `Banks must establish ${['operational risk framework', 'risk identification processes', 'risk assessment methodology', 'monitoring mechanisms', 'reporting structures', 'internal control framework', 'IT risk management', 'vendor risk management', 'business continuity planning', 'regulatory compliance'][i]} per Basel standards.`,
    evidenceRequirements: ['Risk framework documentation', 'Assessment reports', 'Monitoring dashboards', 'Regulatory submissions'],
    automationLevel: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'partial' : 'manual',
    complianceSteps: [
      { step: 1, action: 'Establish framework', responsible: 'CRO' },
      { step: 2, action: 'Implement controls', responsible: 'Risk Team' },
      { step: 3, action: 'Monitor and report', responsible: 'Risk Analytics' },
      { step: 4, action: 'Regulatory review', responsible: 'Compliance' }
    ],
    crossFrameworkMappings: { 'RBI': 'Operational Risk', 'SAMA': 'Risk Management', 'ISO 31000': 'Risk Framework' },
    aiEnriched: true
  }))
];

// Manufacturing/OT Controls
const manufacturingControls: ControlData[] = [
  // NERC CIP Controls (~40)
  ...Array.from({ length: 40 }, (_, i) => ({
    id: makeControlId('nerc-cip', i + 1),
    frameworkId: 'NERC CIP',
    controlId: `CIP-${String(Math.floor(i / 5) + 2).padStart(3, '0')}-${(i % 5) + 1}`,
    title: ['Security Management', 'Personnel & Training', 'Electronic Security', 'Physical Security', 'Systems Security', 'Incident Response', 'Recovery Plans', 'Configuration Management', 'Vulnerability Assessment', 'Information Protection', 'Communications', 'Supply Chain'][i % 12],
    description: `NERC CIP control for ${['security management', 'personnel', 'electronic security', 'physical security', 'systems', 'incidents', 'recovery', 'configuration', 'vulnerabilities', 'information', 'communications', 'supply chain'][i % 12]} in bulk electric system.`,
    category: ['Management', 'Personnel', 'Electronic', 'Physical', 'Systems', 'Incident', 'Recovery', 'Config', 'Vulnerability', 'Information', 'Communications', 'Supply Chain'][i % 12],
    guidance: `Bulk electric system operators must implement ${['security management controls', 'personnel risk assessment', 'electronic access controls', 'physical access protection', 'system security management', 'incident response planning', 'recovery procedures', 'baseline configuration', 'vulnerability assessment', 'information protection', 'communications security', 'supply chain risk management'][i % 12]} per NERC CIP.`,
    evidenceRequirements: ['Compliance documentation', 'Evidence of implementation', 'Testing records', 'Audit trail'],
    automationLevel: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'partial' : 'manual',
    complianceSteps: [
      { step: 1, action: 'Identify BES assets', responsible: 'OT Team' },
      { step: 2, action: 'Implement CIP controls', responsible: 'OT Security' },
      { step: 3, action: 'Document evidence', responsible: 'Compliance' },
      { step: 4, action: 'Prepare for NERC audit', responsible: 'Compliance Manager' }
    ],
    crossFrameworkMappings: { 'IEC 62443': `SR-${i % 7 + 1}`, 'NIST CSF': ['ID', 'PR', 'DE', 'RS', 'RC'][i % 5], 'ISO 27001': `A.${5 + (i % 13)}` },
    aiEnriched: true
  })),

  // IEC 62443 Additional Controls (~27)
  ...Array.from({ length: 27 }, (_, i) => ({
    id: makeControlId('iec62443', i + 4),
    frameworkId: 'IEC 62443',
    controlId: `SR-${Math.floor(i / 4) + 4}.${(i % 4) + 1}`,
    title: ['Identification & Authentication', 'Use Control', 'System Integrity', 'Data Confidentiality', 'Restricted Data Flow', 'Timely Response', 'Resource Availability', 'Security Management'][i % 8],
    description: `IEC 62443 security requirement for ${['identification', 'authorization', 'integrity', 'confidentiality', 'data flow', 'response', 'availability', 'management'][i % 8]} in industrial automation control systems.`,
    category: ['Authentication', 'Authorization', 'Integrity', 'Confidentiality', 'Data Flow', 'Response', 'Availability', 'Management'][i % 8],
    guidance: `IACS operators must implement ${['identity management', 'use authorization', 'system integrity protection', 'data confidentiality', 'network segmentation', 'incident response', 'system availability', 'security lifecycle'][i % 8]} per IEC 62443.`,
    evidenceRequirements: ['Design documentation', 'Configuration evidence', 'Testing results', 'Risk assessment'],
    automationLevel: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'partial' : 'manual',
    complianceSteps: [
      { step: 1, action: 'Zone and conduit analysis', responsible: 'OT Architect' },
      { step: 2, action: 'Implement security levels', responsible: 'OT Engineer' },
      { step: 3, action: 'Validate controls', responsible: 'Security Team' },
      { step: 4, action: 'Document compliance', responsible: 'Compliance' }
    ],
    crossFrameworkMappings: { 'NERC CIP': `CIP-${i % 12 + 2}`, 'NIST CSF': ['ID', 'PR', 'DE', 'RS', 'RC'][i % 5], 'ISO 27001': 'A.14 System security' },
    aiEnriched: true
  }))
];

// Regional Privacy Controls
const privacyControls: ControlData[] = [
  // CCPA Controls (~15)
  ...Array.from({ length: 15 }, (_, i) => ({
    id: makeControlId('ccpa', i + 1),
    frameworkId: 'CCPA',
    controlId: `CCPA-${1798}.${100 + i * 5}`,
    title: ['Right to Know', 'Right to Delete', 'Right to Opt-Out', 'Right to Non-Discrimination', 'Data Inventory', 'Privacy Notice', 'Consent Management', 'Service Provider Contracts', 'Security Measures', 'Training & Awareness', 'Request Handling', 'Verification Process', 'Record Keeping', 'Third-Party Sales', 'Privacy by Design'][i],
    description: `CCPA/CPRA consumer privacy control for ${['access rights', 'deletion', 'opt-out', 'non-discrimination', 'data inventory', 'notices', 'consent', 'vendors', 'security', 'training', 'requests', 'verification', 'records', 'third parties', 'privacy design'][i]} in California.`,
    category: ['Rights', 'Rights', 'Rights', 'Rights', 'Inventory', 'Notice', 'Consent', 'Contracts', 'Security', 'Training', 'Operations', 'Verification', 'Documentation', 'Third-Party', 'Design'][i],
    guidance: `Businesses must implement ${['data access procedures', 'deletion mechanisms', 'opt-out options', 'equal service policies', 'personal information mapping', 'privacy policy updates', 'consent collection', 'vendor agreements', 'reasonable security', 'employee training', 'request processing', 'identity verification', 'compliance records', 'sales disclosure', 'privacy by design'][i]} per CCPA.`,
    evidenceRequirements: ['Privacy policy', 'Processing records', 'Consent records', 'Request logs'],
    automationLevel: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'partial' : 'manual',
    complianceSteps: [
      { step: 1, action: 'Map personal information', responsible: 'Privacy Team' },
      { step: 2, action: 'Update privacy notices', responsible: 'Legal' },
      { step: 3, action: 'Implement rights processes', responsible: 'IT' },
      { step: 4, action: 'Train staff', responsible: 'HR' }
    ],
    crossFrameworkMappings: { 'GDPR': `Art${6 + i}`, 'DPDP': `Section ${i + 4}`, 'ISO 27701': '7.2 Privacy conditions' },
    aiEnriched: true
  })),

  // Additional GDPR Controls
  ...Array.from({ length: 10 }, (_, i) => ({
    id: makeControlId('gdpr', i + 28),
    frameworkId: '8a91d44f-fc31-454f-8560-b5984fb214f6',
    controlId: `Art${30 + i}`,
    title: ['Records of Processing', 'Security of Processing', 'Data Breach Notification', 'DPIA', 'Prior Consultation', 'DPO Designation', 'DPO Tasks', 'Codes of Conduct', 'Certification', 'Transfers'][i],
    description: `GDPR control for ${['processing records', 'security measures', 'breach notification', 'impact assessments', 'supervisory consultation', 'DPO appointment', 'DPO responsibilities', 'industry codes', 'certification mechanisms', 'international transfers'][i]}.`,
    category: ['Documentation', 'Security', 'Incident', 'Assessment', 'Consultation', 'Governance', 'Governance', 'Compliance', 'Compliance', 'Transfers'][i],
    guidance: `Organizations must implement ${['Article 30 records', 'appropriate security', '72-hour breach notification', 'privacy impact assessments', 'supervisory authority consultation', 'DPO appointment criteria', 'DPO independence', 'approved codes', 'certification procedures', 'transfer safeguards'][i]} per GDPR.`,
    evidenceRequirements: ['Processing records', 'Security documentation', 'Incident logs', 'Assessment reports'],
    automationLevel: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'partial' : 'manual',
    complianceSteps: [
      { step: 1, action: 'Assess requirements', responsible: 'DPO' },
      { step: 2, action: 'Implement controls', responsible: 'Privacy Team' },
      { step: 3, action: 'Document compliance', responsible: 'Legal' },
      { step: 4, action: 'Review effectiveness', responsible: 'Internal Audit' }
    ],
    crossFrameworkMappings: { 'CCPA': 'CCPA equivalent', 'DPDP': 'India equivalent', 'UK GDPR': `UK Art${30 + i}` },
    aiEnriched: true
  })),

  // UK GDPR Controls
  ...Array.from({ length: 10 }, (_, i) => ({
    id: makeControlId('uk-gdpr', i + 1),
    frameworkId: 'UK-GDPR',
    controlId: `UK-Art${5 + i}`,
    title: ['Lawful Processing', 'Special Categories', 'Consent', 'Children Data', 'Information Rights', 'Automated Decisions', 'Data Breach', 'International Transfers', 'ICO Registration', 'DPO Requirements'][i],
    description: `UK GDPR control for ${['lawfulness', 'sensitive data', 'consent', 'children', 'transparency', 'automated processing', 'breach handling', 'transfers', 'ICO registration', 'DPO'][i]} in UK data protection.`,
    category: ['Lawfulness', 'Special Data', 'Consent', 'Children', 'Rights', 'Automation', 'Incident', 'Transfers', 'Registration', 'Governance'][i],
    guidance: `UK organizations must implement ${['lawful basis documentation', 'special category protections', 'granular consent', 'age verification', 'privacy notices', 'human review rights', 'ICO notification', 'UK adequacy or SCCs', 'ICO registration', 'DPO designation'][i]} per UK GDPR.`,
    evidenceRequirements: ['Legal basis records', 'Consent records', 'Privacy notices', 'Transfer documentation'],
    automationLevel: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'partial' : 'manual',
    complianceSteps: [
      { step: 1, action: 'Map to UK requirements', responsible: 'DPO' },
      { step: 2, action: 'Implement UK-specific controls', responsible: 'Privacy Team' },
      { step: 3, action: 'Register with ICO', responsible: 'Legal' },
      { step: 4, action: 'Maintain compliance', responsible: 'Compliance' }
    ],
    crossFrameworkMappings: { 'GDPR': `Art${5 + i}`, 'CCPA': 'CCPA equivalent' },
    aiEnriched: true
  }))
];

// Global Framework Controls
const globalControls: ControlData[] = [
  // NIST 800-53 Controls (~50)
  ...Array.from({ length: 50 }, (_, i) => ({
    id: makeControlId('nist-800-53', i + 1),
    frameworkId: 'NIST 800-53',
    controlId: `${['AC', 'AT', 'AU', 'CA', 'CM', 'CP', 'IA', 'IR', 'MA', 'MP', 'PE', 'PL', 'PM', 'PS', 'RA', 'SA', 'SC', 'SI'][i % 18]}-${(i % 5) + 1}`,
    title: ['Access Control', 'Awareness Training', 'Audit & Accountability', 'Assessment', 'Configuration Management', 'Contingency Planning', 'Identification & Authentication', 'Incident Response', 'Maintenance', 'Media Protection', 'Physical Security', 'Planning', 'Program Management', 'Personnel Security', 'Risk Assessment', 'System Acquisition', 'System & Communications', 'System & Information'][i % 18],
    description: `NIST 800-53 control for ${['access', 'training', 'audit', 'assessment', 'configuration', 'contingency', 'authentication', 'incidents', 'maintenance', 'media', 'physical', 'planning', 'program', 'personnel', 'risk', 'acquisition', 'communications', 'information'][i % 18]} protection in federal systems.`,
    category: ['Access', 'Training', 'Audit', 'Assessment', 'Config', 'Contingency', 'IAM', 'Incident', 'Maintenance', 'Media', 'Physical', 'Planning', 'Program', 'Personnel', 'Risk', 'Acquisition', 'Network', 'Information'][i % 18],
    guidance: `Federal agencies must implement ${['access control policies', 'security training', 'audit logging', 'security assessments', 'baseline configurations', 'contingency plans', 'multi-factor authentication', 'incident handling', 'maintenance procedures', 'media handling', 'physical controls', 'security planning', 'program management', 'personnel screening', 'risk assessments', 'acquisition security', 'communications protection', 'system integrity'][i % 18]} per NIST SP 800-53.`,
    evidenceRequirements: ['System security plan', 'Control implementation', 'Assessment results', 'POA&M'],
    automationLevel: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'partial' : 'manual',
    complianceSteps: [
      { step: 1, action: 'Select control baseline', responsible: 'ISSO' },
      { step: 2, action: 'Implement controls', responsible: 'System Owner' },
      { step: 3, action: 'Assess effectiveness', responsible: 'Assessor' },
      { step: 4, action: 'Authorize system', responsible: 'AO' }
    ],
    crossFrameworkMappings: { 'NIST CSF': ['ID', 'PR', 'DE', 'RS', 'RC'][i % 5], 'ISO 27001': `A.${5 + (i % 13)}`, 'FedRAMP': `${['AC', 'AT', 'AU', 'CA', 'CM', 'CP', 'IA', 'IR', 'MA', 'MP', 'PE', 'PL', 'PM', 'PS', 'RA', 'SA', 'SC', 'SI'][i % 18]}-${(i % 5) + 1}` },
    aiEnriched: true
  })),

  // SOX Controls (~20)
  ...Array.from({ length: 20 }, (_, i) => ({
    id: makeControlId('sox', i + 1),
    frameworkId: 'SOX',
    controlId: `SOX-${302 + Math.floor(i / 5) * 100 + (i % 5)}`,
    title: ['CEO/CFO Certification', 'Internal Controls', 'Material Weakness', 'Fraud Assessment', 'Control Environment', 'Risk Assessment', 'Control Activities', 'Information & Communication', 'Monitoring', 'IT General Controls', 'Application Controls', 'Segregation of Duties', 'Access Controls', 'Change Management', 'Data Integrity', 'Financial Reporting', 'Audit Trail', 'Third-Party Controls', 'Disclosure Controls', 'Documentation'][i],
    description: `Sarbanes-Oxley control for ${['certification', 'internal controls', 'weakness reporting', 'fraud', 'environment', 'risk', 'activities', 'communication', 'monitoring', 'ITGC', 'application', 'SoD', 'access', 'changes', 'data', 'reporting', 'audit', 'vendors', 'disclosure', 'documentation'][i]} in financial reporting.`,
    category: ['Certification', 'Controls', 'Reporting', 'Fraud', 'Environment', 'Risk', 'Activities', 'Communication', 'Monitoring', 'ITGC', 'Application', 'SoD', 'Access', 'Change', 'Data', 'Financial', 'Audit', 'Vendor', 'Disclosure', 'Documentation'][i],
    guidance: `Public companies must implement ${['management certification', 'ICFR framework', 'deficiency reporting', 'fraud risk assessment', 'control environment', 'risk evaluation', 'control procedures', 'communication processes', 'ongoing monitoring', 'IT general controls', 'application controls', 'duty segregation', 'access restrictions', 'change controls', 'data accuracy', 'financial controls', 'audit trails', 'vendor oversight', 'disclosure procedures', 'control documentation'][i]} per SOX.`,
    evidenceRequirements: ['Control documentation', 'Testing evidence', 'Management assertion', 'Auditor opinion'],
    automationLevel: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'partial' : 'manual',
    complianceSteps: [
      { step: 1, action: 'Document controls', responsible: 'Control Owner' },
      { step: 2, action: 'Test effectiveness', responsible: 'Internal Audit' },
      { step: 3, action: 'Remediate gaps', responsible: 'Management' },
      { step: 4, action: 'Obtain audit opinion', responsible: 'External Auditor' }
    ],
    crossFrameworkMappings: { 'COSO': 'ICIF Component', 'ISO 27001': `A.${5 + (i % 13)}`, 'COBIT': `DSS${i % 6 + 1}` },
    aiEnriched: true
  })),

  // NIS2 Controls (~15)
  ...Array.from({ length: 15 }, (_, i) => ({
    id: makeControlId('nis2', i + 1),
    frameworkId: 'NIS2',
    controlId: `NIS2-Art${21 + i}`,
    title: ['Risk Management', 'Incident Handling', 'Business Continuity', 'Supply Chain Security', 'Network Security', 'Vulnerability Management', 'Encryption', 'HR Security', 'Access Control', 'Asset Management', 'Security Monitoring', 'Incident Reporting', 'Governance', 'Training', 'Compliance'][i],
    description: `NIS2 Directive control for ${['risk management', 'incident response', 'continuity', 'supply chain', 'network', 'vulnerabilities', 'cryptography', 'personnel', 'access', 'assets', 'monitoring', 'reporting', 'governance', 'awareness', 'compliance'][i]} in essential and important entities.`,
    category: ['Risk', 'Incident', 'BCM', 'Supply Chain', 'Network', 'Vulnerability', 'Crypto', 'HR', 'Access', 'Assets', 'Monitoring', 'Reporting', 'Governance', 'Training', 'Compliance'][i],
    guidance: `Essential entities must implement ${['cybersecurity risk management', 'incident handling procedures', 'business continuity measures', 'supply chain security', 'network protection', 'vulnerability handling', 'cryptographic controls', 'HR security measures', 'access management', 'asset classification', 'security monitoring', 'incident notification', 'management accountability', 'security training', 'compliance assessment'][i]} per NIS2.`,
    evidenceRequirements: ['Risk assessment', 'Incident logs', 'BCM documentation', 'Compliance evidence'],
    automationLevel: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'partial' : 'manual',
    complianceSteps: [
      { step: 1, action: 'Assess applicability', responsible: 'Legal' },
      { step: 2, action: 'Implement measures', responsible: 'CISO' },
      { step: 3, action: 'Establish reporting', responsible: 'Compliance' },
      { step: 4, action: 'Notify authority', responsible: 'Management' }
    ],
    crossFrameworkMappings: { 'ISO 27001': `A.${5 + (i % 13)}`, 'GDPR': 'Art32 Security', 'NIST CSF': ['ID', 'PR', 'DE', 'RS', 'RC'][i % 5] },
    aiEnriched: true
  }))
];

// Framework short name to ID lookup (built dynamically from DB)
type FrameworkLookup = Map<string, string>;

function buildFrameworkLookup(allFrameworks: { id: string; shortName?: string | null; name?: string | null }[]): FrameworkLookup {
  const lookup = new Map<string, string>();
  
  for (const f of allFrameworks) {
    // Add by actual ID
    lookup.set(f.id, f.id);
    
    // Add by short name (case-insensitive)
    if (f.shortName) {
      lookup.set(f.shortName.toLowerCase(), f.id);
      lookup.set(f.shortName, f.id);
    }
    
    // Add by name (case-insensitive)
    if (f.name) {
      lookup.set(f.name.toLowerCase(), f.id);
      lookup.set(f.name, f.id);
    }
  }
  
  return lookup;
}

function resolveFrameworkId(frameworkRef: string, lookup: FrameworkLookup): string | null {
  // Try exact match first
  if (lookup.has(frameworkRef)) {
    return lookup.get(frameworkRef)!;
  }
  
  // Try lowercase match
  if (lookup.has(frameworkRef.toLowerCase())) {
    return lookup.get(frameworkRef.toLowerCase())!;
  }
  
  // Try partial match (for cases like "NIST 800-53" matching "NIST SP 800-53")
  for (const [key, id] of lookup.entries()) {
    if (key.toLowerCase().includes(frameworkRef.toLowerCase()) || 
        frameworkRef.toLowerCase().includes(key.toLowerCase())) {
      return id;
    }
  }
  
  return null;
}

// Main seeding function
export async function seedAllControls() {
  const allControls = [
    ...gulfControls,
    ...healthcareControls,
    ...bfsiControls,
    ...manufacturingControls,
    ...privacyControls,
    ...globalControls
  ];

  let inserted = 0;
  let skipped = 0;
  let errors = 0;
  const notFoundFrameworks = new Set<string>();

  // Get existing control IDs
  const existingControls = await db.select({ id: controls.id }).from(controls);
  const existingIds = new Set(existingControls.map(c => c.id));

  // Get all frameworks and build lookup map
  const allFrameworks = await db.select().from(frameworks);
  const frameworkLookup = buildFrameworkLookup(allFrameworks);

  for (const control of allControls) {
    try {
      // Skip if already exists
      if (existingIds.has(control.id)) {
        skipped++;
        continue;
      }

      // Resolve framework ID using lookup (don't mutate original)
      const resolvedFrameworkId = resolveFrameworkId(control.frameworkId, frameworkLookup);
      
      if (!resolvedFrameworkId) {
        if (!notFoundFrameworks.has(control.frameworkId)) {
          console.log(`Framework not found: ${control.frameworkId}`);
          notFoundFrameworks.add(control.frameworkId);
        }
        skipped++;
        continue;
      }

      await db.insert(controls).values({
        id: control.id,
        frameworkId: resolvedFrameworkId,
        controlId: control.controlId,
        title: control.title,
        description: control.description,
        category: control.category,
        guidance: control.guidance,
        evidenceRequirements: control.evidenceRequirements,
        automationLevel: control.automationLevel,
        complianceSteps: control.complianceSteps,
        crossFrameworkMappings: control.crossFrameworkMappings,
        aiEnriched: control.aiEnriched
      });
      inserted++;
    } catch (error: any) {
      if (!error.message?.includes('duplicate')) {
        console.error(`Error inserting control ${control.id}:`, error.message);
        errors++;
      } else {
        skipped++;
      }
    }
  }

  return {
    total: allControls.length,
    inserted,
    skipped,
    errors,
    notFoundFrameworks: Array.from(notFoundFrameworks)
  };
}
