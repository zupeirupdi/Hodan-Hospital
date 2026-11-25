import exteriorBuildingHq from '../assets/images/hodan_exterior_v2_1795619538670.jpg';
import exteriorFacadeHq from '../assets/images/hodan_facade_hq_1795619539647.jpg';
import receptionLobbyHq from '../assets/images/hodan_reception_hq_1795619517066.jpg';
import operatingRoomHq from '../assets/images/hodan_operating_room_hq_1795619517342.jpg';
import medicalTeamHq from '../assets/images/hodan_medical_team_hq_1795619518407.jpg';
import outreachAmbulanceHq from '../assets/images/hodan_ambulance_hq_1795619541150.jpg';
import nicuPediatricsHq from '../assets/images/hodan_nicu_pediatrics_hq_1795619518261.jpg';
import pharmacyCareHq from '../assets/images/hodan_pharmacy_care_hq_1795619518819.jpg';
import neuroOrthoHq from '../assets/images/hodan_neuro_ortho_hq_1795619559165.jpg';
import dentalOphthalmologyHq from '../assets/images/hodan_dental_ophthalmology_hq_1795619559232.jpg';
import corridorCareImg from '../assets/images/hospital_corridor_care_1795615137828.jpg';
import diagnosticsLabImg from '../assets/images/diagnostics_radiology_lab_1795615137982.jpg';
import icuSuiteImg from '../assets/images/icu_patient_suite_1795615138755.jpg';
import maternityCareImg from '../assets/images/maternity_pediatrics_care_1795615139007.jpg';
import cardiacTeamImg from '../assets/images/emergency_cardiac_team_1795615139364.jpg';

export interface DepartmentItem {
  id: string;
  name: string;
  category: 'Critical & Surgical' | 'Diagnostics & Support' | 'Specialty & Family';
  code: string;
  summary: string;
  capabilities: string[];
  image: string;
  leadUnit: string;
}

export interface FacilityItem {
  id: string;
  title: string;
  levelBadge: string;
  zone: string;
  description: string;
  highlights: string[];
  image: string;
  caption: string;
}

export interface CardiacHotspot {
  id: string;
  label: string;
  anatomicalName: string;
  summary: string;
  departmentId: string;
  position: [number, number, number];
}

export interface ServicePillar {
  number: string;
  title: string;
  description: string;
  detail: string;
}

export interface CarePathway {
  id: string;
  need: string;
  departmentId: string;
  routeNote: string;
}

export interface CampusZoneInfo {
  id: string;
  name: string;
  accessGate: string;
  hours: string;
  details: string;
}

export interface LeadershipMember {
  name: string;
  role: string;
  specialty: string;
  departmentId: string;
}

export const HOSPITAL_CONTACT = {
  shortCode: '1234',
  phone: '+252 61 167 8555',
  email: 'info@hodanhospital.com',
  address: 'Abdikassim Road, Hodan District, Mogadishu, Somalia',
  website: 'hodanhospital.com',
  footprint: '5,000+ m²',
} as const;

export const HOSPITAL_IMAGES = {
  logoFull: '/assets/hospital/logo-full.png',
  logoMark: '/assets/hospital/logo-mark.png',
  exteriorBuilding: exteriorBuildingHq,
  exteriorRender: exteriorFacadeHq,
  receptionLobby: receptionLobbyHq,
  operatingRoom: operatingRoomHq,
  medicalTeam: medicalTeamHq,
  outreachAmbulance: outreachAmbulanceHq,
  nicuPediatrics: nicuPediatricsHq,
  pharmacyCare: pharmacyCareHq,
  neuroOrtho: neuroOrthoHq,
  dentalOphthalmology: dentalOphthalmologyHq,
  corridorCare: corridorCareImg,
  diagnosticsLab: diagnosticsLabImg,
  icuSuite: icuSuiteImg,
  maternityCare: maternityCareImg,
  cardiacTeam: cardiacTeamImg,
} as const;

export const CARDIAC_HOTSPOTS: CardiacHotspot[] = [
  {
    id: 'aortic-arch',
    label: 'Aortic Arch & Great Vessels',
    anatomicalName: 'Arcus Aortae',
    summary:
      'Distributes oxygenated blood from the left ventricle to systemic circulation via the brachiocephalic, left common carotid, and subclavian trunks.',
    departmentId: 'cardiology',
    position: [0.05, 0.92, 0.08],
  },
  {
    id: 'mitral-valve',
    label: 'Valve & Ventricular Function',
    anatomicalName: 'Left Ventricle & Mitral Complex',
    summary:
      'Evaluated at Hodan Hospital Cardiology using 12-lead ECG, Doppler echocardiography, stress testing, and cardiac CT/MRI imaging.',
    departmentId: 'cardiology',
    position: [0.22, -0.25, 0.42],
  },
  {
    id: 'coronary-tree',
    label: 'Coronary Perfusion',
    anatomicalName: 'LAD & Circumflex Arteries',
    summary:
      'Continuous arrhythmia, coronary artery disease, and hypertension monitoring paired with rapid diagnostic imaging.',
    departmentId: 'diagnostics',
    position: [-0.08, 0.05, 0.56],
  },
  {
    id: 'pulmonary-trunk',
    label: 'Pulmonary Circulation',
    anatomicalName: 'Truncus Pulmonalis',
    summary:
      'Coordinated cardiopulmonary evaluation linking Pulmonology, Cardiology, and 24/7 Intensive Care Unit telemetry.',
    departmentId: 'emergency',
    position: [-0.22, 0.48, 0.35],
  },
];

export const CARE_PATHWAYS: CarePathway[] = [
  {
    id: 'heart',
    need: 'Heart, ECG & Blood Pressure',
    departmentId: 'cardiology',
    routeNote: 'ECG, Transthoracic Echocardiogram, Stress Testing & Cardiac CT/MRI.',
  },
  {
    id: 'urgent',
    need: '24/7 Emergency & Ambulance (1234)',
    departmentId: 'emergency',
    routeNote: 'Dial 1234 or arrive via Abdikassim Rd West Emergency Gate for immediate stabilization.',
  },
  {
    id: 'neuro',
    need: 'Brain, Spine & Orthopedics',
    departmentId: 'neuro-ortho',
    routeNote: 'Neurosurgery, neurology, trauma orthopedics & spine imaging evaluation.',
  },
  {
    id: 'maternity',
    need: 'Maternity, NICU & Pediatrics',
    departmentId: 'maternity',
    routeNote: 'Obstetrics, Gynecology, Nursery, Neonatal Intensive Care (NICU) & Child Wellness.',
  },
  {
    id: 'imaging',
    need: 'CT/MRI, Lab & 24/7 Pharmacy',
    departmentId: 'diagnostics',
    routeNote: 'Paperless EHR-linked imaging, automated laboratory panels & 24-hour pharmacy.',
  },
  {
    id: 'eye-dental',
    need: 'Eye Surgery, ENT & Dental Clinic',
    departmentId: 'ophthalmology-dental',
    routeNote: 'Ophthalmic microsurgery, dental & oral health, ENT & dermatology clinics.',
  },
];

export const DEPARTMENTS: DepartmentItem[] = [
  {
    id: 'cardiology',
    name: 'Cardiology & Vascular Center',
    category: 'Critical & Surgical',
    code: 'DEPT 01',
    summary:
      'Dedicated cardiovascular diagnosis, prevention, and chronic heart management for hypertension, heart failure, arrhythmias, and coronary artery disease.',
    capabilities: [
      '12-Lead ECG & Stress Testing',
      'Transthoracic Echocardiography',
      'Cardiac CT/MRI & Telemetry',
    ],
    image: HOSPITAL_IMAGES.cardiacTeam,
    leadUnit: 'Cardiovascular Center of Excellence',
  },
  {
    id: 'emergency',
    name: 'Emergency, ICU, NICU & Ambulance',
    category: 'Critical & Surgical',
    code: 'DEPT 02',
    summary:
      '24-hour acute triage and trauma stabilization backed by dedicated ICU, Neonatal ICU (NICU), nursery, and Call Center 1234 ambulance dispatch.',
    capabilities: [
      '24/7 Emergency Helpline: 1234',
      'Adult ICU, NICU & Nursery',
      'Pre-Hospital Ambulance Fleet',
    ],
    image: HOSPITAL_IMAGES.outreachAmbulance,
    leadUnit: 'Acute & Critical Care Directorate',
  },
  {
    id: 'surgery',
    name: 'General & Laparoscopic Surgery',
    category: 'Critical & Surgical',
    code: 'DEPT 03',
    summary:
      'Elective, emergency, pediatric, laparoscopic (minimally invasive), and endoscopic procedures inside sterile operating and anesthesia suites.',
    capabilities: [
      'Laparoscopic & Endoscopic Surgery',
      'Intraoperative C-Arm Imaging',
      'Anesthesia & Post-Op Recovery',
    ],
    image: HOSPITAL_IMAGES.operatingRoom,
    leadUnit: 'Surgical & Perioperative Unit',
  },
  {
    id: 'neuro-ortho',
    name: 'Neurosurgery & Orthopedics',
    category: 'Critical & Surgical',
    code: 'DEPT 04',
    summary:
      'Specialized cranial, spinal, trauma fracture, joint, and neurological consultations coordinated with high-resolution CT/MRI planning.',
    capabilities: [
      'Neurosurgery & Neurology Clinic',
      'Orthopedic Trauma & Spine Care',
      'Pain & Headache Management',
    ],
    image: HOSPITAL_IMAGES.neuroOrtho,
    leadUnit: 'Neuro & Musculoskeletal Division',
  },
  {
    id: 'maternity',
    name: 'Obstetrics, Gynecology & NICU',
    category: 'Specialty & Family',
    code: 'DEPT 05',
    summary:
      'Full-spectrum maternal care from prenatal monitoring through safe delivery, backed by our specialized Newborn Nursery and NICU teams.',
    capabilities: [
      'Antenatal & Obstetric Care',
      'Neonatal Intensive Care (NICU)',
      '24/7 Safe Delivery Suites',
    ],
    image: HOSPITAL_IMAGES.nicuPediatrics,
    leadUnit: 'Maternal & Neonatal Health',
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics & Child Wellness',
    category: 'Specialty & Family',
    code: 'DEPT 06',
    summary:
      'Compassionate infant, childhood, and adolescent medical supervision led by experienced pediatric specialists in family-centered suites.',
    capabilities: [
      'Pediatric Outpatient & Inpatient',
      'Neonatal Nursery Follow-Up',
      'Childhood Preventive Care',
    ],
    image: HOSPITAL_IMAGES.maternityCare,
    leadUnit: 'Department of Pediatrics',
  },
  {
    id: 'diagnostics',
    name: 'Medical Imaging & Clinical Lab',
    category: 'Diagnostics & Support',
    code: 'DEPT 07',
    summary:
      'Digital diagnostic imaging integrated directly with our paperless Electronic Health Records (EHR) and automated pathology laboratory.',
    capabilities: [
      'CT / MRI & Digital Radiography',
      'Vascular & Obstetric Ultrasound',
      'Automated Laboratory Diagnostics',
    ],
    image: HOSPITAL_IMAGES.diagnosticsLab,
    leadUnit: 'Diagnostic & Pathology Wing',
  },
  {
    id: 'pharmacy',
    name: '24/7 Pharmacy & Inpatient Care',
    category: 'Diagnostics & Support',
    code: 'DEPT 08',
    summary:
      'Round-the-clock hospital pharmacy dispensing verified medications alongside quiet, daylight-filled inpatient nursing suites.',
    capabilities: [
      '24-Hour Clinical Pharmacy',
      'Paperless EHR Medication Safety',
      'Private Inpatient Recovery Rooms',
    ],
    image: HOSPITAL_IMAGES.pharmacyCare,
    leadUnit: 'Pharmacy & Inpatient Nursing',
  },
  {
    id: 'ophthalmology-dental',
    name: 'Ophthalmology & Oral Dentistry',
    category: 'Specialty & Family',
    code: 'DEPT 09',
    summary:
      'Precision ophthalmic diagnostics and eye surgery paired with comprehensive oral health and restorative dentistry clinics.',
    capabilities: [
      'Ophthalmic Surgery & Eye Care',
      'Oral Health & Dentistry Clinic',
      'ENT (Ear, Nose & Throat)',
    ],
    image: HOSPITAL_IMAGES.dentalOphthalmology,
    leadUnit: 'Sensory & Oral Health Clinics',
  },
  {
    id: 'internal-med',
    name: 'Internal Medicine, Urology & Pulmonology',
    category: 'Specialty & Family',
    code: 'DEPT 10',
    summary:
      'Executive specialist clinics spanning Internal Medicine, Pulmonology, Urology, Gastroenterology, Nutrition, and Dermatology.',
    capabilities: [
      'Internal Medicine & Pulmonology',
      'Urology & Gastroenterology',
      'Dermatology & Nutrition Care',
    ],
    image: HOSPITAL_IMAGES.icuSuite,
    leadUnit: 'Executive Specialist Clinics',
  },
];

export const FACILITIES: FacilityItem[] = [
  {
    id: 'or-suite',
    title: 'Sterile Surgical & Laparoscopy Suite',
    levelBadge: 'Level 2',
    zone: 'Surgical Wing · Level 2',
    description:
      'Engineered for general, pediatric, laparoscopic, and endoscopic procedures with dual surgical LED booms, C-arm fluoroscopy, and integrated anesthesia monitoring.',
    highlights: [
      'Laparoscopic & endoscopic operative readiness',
      'C-arm intraoperative imaging & gas console',
      'Anti-static sterile perioperative flooring',
    ],
    image: HOSPITAL_IMAGES.operatingRoom,
    caption: 'Hodan Hospital Operating Room equipped for surgical and vascular procedures.',
  },
  {
    id: 'reception',
    title: 'Main Atrium & Paperless Check-In',
    levelBadge: 'Ground',
    zone: 'Abdikassim Rd Entrance · Ground Floor',
    description:
      'A welcoming 5,000+ m² campus arrival hall pairing timber architectural slats with digital EHR patient registration and Family Membership priority check-in.',
    highlights: [
      'Paperless Electronic Health Record (EHR) intake',
      'Family Membership Card priority reception',
      'Wheelchair-accessible concourse & lounge',
    ],
    image: HOSPITAL_IMAGES.receptionLobby,
    caption: 'Main reception atrium inside Hodan Hospital, Abdikassim Road.',
  },
  {
    id: 'neuro-suite',
    title: 'Neuro & Orthopedic Diagnostic Suite',
    levelBadge: 'Level 2',
    zone: 'Surgical & Neuro Wing · Level 2',
    description:
      'Specialized consultation and intraoperative imaging stations enabling surgeons and neurologists to review high-resolution cranial and spine scans immediately.',
    highlights: [
      'Direct CT/MRI workstation review',
      'Spine, trauma & neurosurgical planning',
      'Coordinated pain management pathway',
    ],
    image: HOSPITAL_IMAGES.neuroOrtho,
    caption: 'Neurosurgery & orthopedics diagnostic workstation.',
  },
  {
    id: 'nicu-unit',
    title: 'Neonatal ICU (NICU) & Maternity',
    levelBadge: 'Level 2',
    zone: 'Mother & Child Wing · Level 2',
    description:
      'Dedicated obstetric suites, newborn nursery, and Neonatal Intensive Care Unit (NICU) providing continuous monitoring for mothers and newborns.',
    highlights: [
      'Closed neonatal incubators & continuous telemetry',
      'Dedicated Nursery & Postnatal recovery suites',
      '24/7 Obstetric & Pediatric coverage',
    ],
    image: HOSPITAL_IMAGES.nicuPediatrics,
    caption: 'Hodan Hospital NICU and newborn monitoring suite.',
  },
  {
    id: 'imaging-lab',
    title: 'Imaging & Automated Pathology',
    levelBadge: 'Level 1',
    zone: 'Diagnostic Center · Level 1',
    description:
      'Unified radiology and clinical pathology floor delivering rapid CT/MRI, ultrasound, and biomarker results straight to specialists via EHR.',
    highlights: [
      'Cross-sectional CT/MRI & Digital X-Ray',
      'Automated hematology & cardiac biomarkers',
      'Rapid STAT turnaround for Emergency Room',
    ],
    image: HOSPITAL_IMAGES.diagnosticsLab,
    caption: 'Diagnostic imaging and automated clinical laboratory floor.',
  },
  {
    id: 'pharmacy-24',
    title: '24/7 Pharmacy & Digital Dispensary',
    levelBadge: 'Ground',
    zone: 'Outpatient Atrium · Open 24/7',
    description:
      'Round-the-clock hospital pharmacy synced with physician prescriptions in our EHR platform for safe, accurate inpatient and outpatient dispensing.',
    highlights: [
      'Open 24 hours daily alongside ER intake',
      'EHR prescription verification workflow',
      'Family Membership pharmacy benefits',
    ],
    image: HOSPITAL_IMAGES.pharmacyCare,
    caption: 'Hodan Hospital 24-hour clinical pharmacy dispensary.',
  },
  {
    id: 'eye-dental',
    title: 'Ophthalmology & Dental Clinics',
    levelBadge: 'Level 1',
    zone: 'Outpatient Specialty Wing · Level 1',
    description:
      'Dedicated sensory and oral health clinics combining ophthalmic diagnostics, eye microsurgery readiness, and modern dental suites.',
    highlights: [
      'Ophthalmology & ophthalmic surgery clinic',
      'Comprehensive oral & dentistry suites',
      'Integrated ENT & dermatology clinics',
    ],
    image: HOSPITAL_IMAGES.dentalOphthalmology,
    caption: 'Ophthalmology and modern dental clinic inside Hodan Hospital.',
  },
  {
    id: 'icu-recovery',
    title: 'Intensive Care & Inpatient Suites',
    levelBadge: 'Level 3',
    zone: 'Critical & Inpatient Wing · Level 3',
    description:
      'Serene, sunlit critical-care beds and private inpatient suites staffed 24/7 by acute-care physicians and critical nursing specialists.',
    highlights: [
      'Multi-parameter bedside telemetry',
      'Natural daylight recovery architecture',
      '24/7 nursing & inpatient supervision',
    ],
    image: HOSPITAL_IMAGES.icuSuite,
    caption: 'Intensive care and inpatient recovery suite.',
  },
  {
    id: 'outreach',
    title: 'Ambulance Fleet & Helpline 1234',
    levelBadge: '24/7',
    zone: 'Emergency Dispatch · Abdikassim Rd',
    description:
      'Dedicated emergency helpline (1234), pre-hospital ambulance transfer units, and community health outreach across Mogadishu.',
    highlights: [
      'Shortcode 1234 rapid dispatch center',
      'Equipped patient transport ambulances',
      'Direct handover to Emergency Room bays',
    ],
    image: HOSPITAL_IMAGES.outreachAmbulance,
    caption: 'Hodan Hospital ambulance dispatch and outreach team.',
  },
];

export const SERVICE_PILLARS: ServicePillar[] = [
  {
    number: '01.',
    title: '24/7 Emergency & Call Center 1234',
    description:
      'Round-the-clock Emergency Room, ambulance dispatch via shortcode 1234, Adult ICU, NICU, and 24-hour pharmacy under one roof.',
    detail: 'Always Open',
  },
  {
    number: '02.',
    title: 'International-Standard Clinical Depth',
    description:
      'Over 5,000 m² on Abdikassim Road housing 13+ specialties—from Cardiology and Neurosurgery to Ophthalmology and Maternal Health.',
    detail: '13+ Specialties',
  },
  {
    number: '03.',
    title: 'Paperless EHR & Integrated Diagnostics',
    description:
      'Seamless Electronic Health Records (EHR) linking radiology, clinical laboratory testing, surgery, and pharmacy without paper delays.',
    detail: 'Digital Care',
  },
  {
    number: '04.',
    title: 'Hodan Family Membership & Care Access',
    description:
      'Designed to bring specialist hospital care home to Mogadishu with priority appointments, preventive check-ups, and family membership benefits.',
    detail: 'Patient First',
  },
];

export const LEADERSHIP_TEAM: LeadershipMember[] = [
  {
    name: 'Dr. Mohamed Issak',
    role: 'CEO & Founder',
    specialty: 'Hospital Leadership & Strategic Clinical Standards',
    departmentId: 'internal-med',
  },
  {
    name: 'Dr. Abdulkadir Sh. Omar (“Gadudow”)',
    role: 'Medical Director',
    specialty: 'Pediatrics & Clinical Quality Governance',
    departmentId: 'pediatrics',
  },
  {
    name: 'Dr. Keif Kheire',
    role: 'Deputy Director',
    specialty: 'Obstetrics, Gynecology & Maternal Health',
    departmentId: 'maternity',
  },
];

export const CLINICAL_TEAMS = [
  {
    unit: 'Cardiology & Internal Medicine Directorate',
    focus: 'Cardiovascular diagnostics, ECG/echocardiography, hypertension, pulmonology, and inpatient medicine.',
    coverage: 'Daily Specialist Clinics · Inpatient Consults',
  },
  {
    unit: 'Surgery, Neurosurgery & Orthopedics',
    focus: 'Laparoscopic general surgery, neurosurgery, trauma orthopedics, urology, and perioperative anesthesia.',
    coverage: 'Scheduled & 24/7 Emergency Surgery',
  },
  {
    unit: 'Maternity, NICU & Pediatrics Unit',
    focus: 'Obstetricians, midwives, neonatologists, and pediatricians serving mothers, newborns, and children.',
    coverage: '24/7 Labor & Delivery · NICU & Nursery',
  },
  {
    unit: 'Emergency (1234), ICU, Imaging & Pharmacy',
    focus: 'Rapid-triage acute physicians, ICU/NICU nurses, radiologists, laboratory scientists, and 24/7 pharmacists.',
    coverage: '24/7 Continuous Operations',
  },
];

export const HOSPITAL_OPERATIONAL_FACTS = [
  {
    label: 'Emergency Helpline',
    value: '1234',
    detail: '24/7 Emergency intake & ambulance dispatch',
  },
  {
    label: 'Medical Campus',
    value: '5,000+ m²',
    detail: 'Modern complex on Abdikassim Rd, Hodan',
  },
  {
    label: 'Critical Care',
    value: 'ICU · NICU',
    detail: 'Adult ICU, Neonatal ICU & Nursery units',
  },
  {
    label: 'Digital Platform',
    value: 'Paperless EHR',
    detail: 'Unified lab, imaging & 24/7 pharmacy',
  },
];

export const CAMPUS_ZONES: CampusZoneInfo[] = [
  {
    id: 'emergency-wing',
    name: 'Emergency Room & Ambulance Bay',
    accessGate: 'West Emergency Gate · Abdikassim Road',
    hours: 'Open 24/7 · Helpline 1234',
    details: 'Immediate acute triage, ambulance handover, trauma resuscitation, and direct ICU/OR elevator access.',
  },
  {
    id: 'main-atrium',
    name: 'Main Atrium, Cardiology & Surgical Complex',
    accessGate: 'Central Main Reception · Abdikassim Road',
    hours: '24/7 Inpatient & Pharmacy · Outpatient Sat–Thu',
    details: 'Ground admissions desk, 24/7 pharmacy, cardiology center, Level 2 operating theaters, and Level 3 ICU.',
  },
  {
    id: 'diagnostics-maternity',
    name: 'Diagnostics, NICU & Family Pavilion',
    accessGate: 'East Reception & Family Concourse',
    hours: 'Imaging & Lab Daily · Maternity & NICU 24/7',
    details: 'CT/MRI, ultrasound, clinical laboratory, maternity delivery suites, neonatal ICU, and pediatric clinics.',
  },
];
