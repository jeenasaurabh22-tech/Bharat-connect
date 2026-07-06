import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Scheme from '../models/Scheme.model.js';
import geminiService from '../services/gemini.service.js';
import { connectDB } from './db.js';
dotenv.config();
const SCHEME_LIST = [
  'Pradhan Mantri Mudra Yojana (PMMY)',
  'Sukanya Samriddhi Yojana (SSY)',
  'Atal Pension Yojana (APY)',
  'Pradhan Mantri Suraksha Bima Yojana (PMSBY)',
  'Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)',
  'Pradhan Mantri Kisan Maandhan Yojana (PM-KMY)',
  'PM SVANidhi (Prime Minister Street Vendor’s AtmaNirbhar Nidhi)',
  'Pradhan Mantri Vishwakarma Scheme',
  'Lakhpati Didi Scheme',
  'PM-YASASVI (Young Achievers Scholarship Award Scheme for Vibrant India)',
  'Central Sector Scheme of Scholarship for College and University Students',
  'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
  'Stand-Up India Scheme',
  'Pradhan Mantri Jan Dhan Yojana (PMJDY)',
  'Pradhan Mantri Awas Yojana (PMAY) - Urban',
  'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
  'Soil Health Card Scheme',
  'Paramparagat Krishi Vikas Yojana (PKVY)',
  'National Agriculture Market (eNAM)',
  'National Food Security Mission (NFSM)',
  'Mission for Integrated Development of Horticulture (MIDH)',
  'National Mission on Edible Oils – Oil Palm (NMEO-OP)',
  'Sub-Mission on Agricultural Mechanization (SMAM)',
  'Agriculture Infrastructure Fund (AIF)',
  'Kisan Credit Card (KCC)',
  'Rashtriya Krishi Vikas Yojana (RKVY)',
  'Per Drop More Crop Scheme',
  'Rainfed Area Development Programme',
  'Formation and Promotion of Farmer Producer Organizations (FPOs)',
  'National Beekeeping and Honey Mission',
  'National Livestock Mission',
  'Livestock Health and Disease Control Programme',
  'Rashtriya Gokul Mission',
  'Dairy Entrepreneurship Development Scheme',
  'National Animal Disease Control Programme',
  'Blue Revolution Scheme',
  'Pradhan Mantri Matsya Sampada Yojana (PMMSY)',
  'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
  'Ayushman Bharat Health Infrastructure Mission',
  'Ayushman Arogya Mandir',
  'National Health Mission (NHM)',
  'Jan Aushadhi Scheme',
  'Mission Indradhanush',
  'POSHAN Abhiyaan',
  'Pradhan Mantri Matru Vandana Yojana (PMMVY)',
  'Janani Suraksha Yojana (JSY)',
  'Janani Shishu Suraksha Karyakram (JSSK)',
  'National Tuberculosis Elimination Programme',
  'Rashtriya Bal Swasthya Karyakram',
  'Rashtriya Kishor Swasthya Karyakram',
  'Beti Bachao Beti Padhao',
  'One Stop Centre Scheme',
  'Working Women Hostel Scheme',
  'Mahila Shakti Kendra Scheme',
  'Mission Shakti',
  'Mission Vatsalya',
  'Palna Scheme',
  'Scheme for Adolescent Girls',
  'Ujjawala Scheme (Women Trafficking Prevention)',
  'Swadhar Greh Scheme',
  'National Creche Scheme',
  'Samagra Shiksha Abhiyan',
  'PM SHRI Schools Scheme',
  'National Means-cum-Merit Scholarship Scheme',
  'National Scholarship Scheme for Minorities',
  'Pre-Matric Scholarship Scheme',
  'Post-Matric Scholarship Scheme',
  'INSPIRE Scholarship',
  'AICTE Pragati Scholarship',
  'AICTE Saksham Scholarship',
  'National Fellowship for Scheduled Castes',
  'National Fellowship for OBC Students',
  'National Overseas Scholarship',
  'PM Research Fellowship (PMRF)',
  'Vidyanjali Programme',
  'NIPUN Bharat Mission',
  'Pradhan Mantri Kaushal Vikas Yojana (PMKVY)',
  'Skill India Mission',
  'National Apprenticeship Promotion Scheme (NAPS)',
  'National Apprenticeship Training Scheme (NATS)',
  'SANKALP Scheme',
  'STRIVE Scheme',
  'Prime Minister Employment Generation Programme (PMEGP)',
  'Startup India',
  'Digital India',
  'Make in India',
  'Self Employment Scheme for Rehabilitation of Manual Scavengers (SRMS)',
  'Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)',
  'ASPIRE Scheme',
  'SFURTI Scheme',
  'PM MITRA Scheme',
  'Production Linked Incentive (PLI) Scheme',
  'PMAY-Gramin (Pradhan Mantri Awas Yojana - Gramin)',
  'Smart Cities Mission',
  'AMRUT Mission',
  'Swachh Bharat Mission (Urban)',
  'Swachh Bharat Mission (Gramin)',
  'National Urban Livelihoods Mission (NULM)',
  'DAY-NRLM (Deendayal Antyodaya Yojana - National Rural Livelihood Mission)',
  'Rurban Mission',
  'National Social Assistance Programme (NSAP)',
  'Indira Gandhi National Old Age Pension Scheme',
  'Indira Gandhi National Widow Pension Scheme',
  'Indira Gandhi National Disability Pension Scheme',
  'Annapurna Scheme',
  'PM Garib Kalyan Anna Yojana',
  'One Nation One Ration Card',
  'Venture Capital Fund for Scheduled Castes',
  'Stand-Up India Seed Fund',
  'National Scheduled Castes Finance and Development Corporation Schemes',
  'National Backward Classes Finance and Development Corporation Schemes',
  'National Minorities Development and Finance Corporation Schemes',
  'Free Coaching Scheme for SC and OBC Students',
  'Scholarship for Top Class Education for SC Students',
  'Scholarship for Top Class Education for ST Students',
  'ADIP Scheme',
  'Accessible India Campaign (Sugamya Bharat Abhiyan)',
  'Deendayal Disabled Rehabilitation Scheme',
  'Unique Disability ID (UDID) Project',
  'PMGDISHA (Pradhan Mantri Gramin Digital Saksharta Abhiyan)',
  'Common Service Centres (CSC)',
  'BharatNet',
  'National Digital Health Mission (ABDM)',
  'PM-KUSUM Scheme',
  'UJALA Scheme',
  'National Solar Mission',
  'FAME India Scheme',
  'National Green Hydrogen Mission',
  'Green Credit Programme',
  'Gobardhan Scheme',
  'Jal Jeevan Mission',
  'Atal Bhujal Yojana',
  'Namami Gange Programme',
  'Catch the Rain Campaign',
  'Mahatma Gandhi National Rural Employment Guarantee Scheme (MGNREGS)',
  'Deen Dayal Upadhyaya Grameen Kaushalya Yojana (DDU-GKY)',
  'Saansad Adarsh Gram Yojana',
  'Pradhan Mantri Gram Sadak Yojana (PMGSY)',
  'Shyama Prasad Mukherji Rurban Mission',
  'Senior Citizens Savings Scheme (SCSS)',
  'Rashtriya Vayoshri Yojana',
  'Atal Vayo Abhyuday Yojana',
  'Mahila Samman Savings Certificate',
  'Kisan Vikas Patra',
  'National Savings Certificate',
  'Senior Citizen Welfare Fund Scheme',
  'Animal Husbandry Infrastructure Development Fund',
  'Dairy Processing and Infrastructure Development Fund',
  'Fisheries and Aquaculture Infrastructure Development Fund',
  'PRASHAD Scheme',
  'Swadesh Darshan Scheme',
  'Ek Bharat Shreshtha Bharat',
  'Mission Karmayogi',
  'SVAMITVA Scheme',
  'PM Gati Shakti National Master Plan',
  'National Logistics Policy',
  'PM eVIDYA',
  'National Education Mission',
  'Aspirational Districts Programme',
  'Mission Amrit Sarovar',
  'Operation Greens',
  'PM Formalisation of Micro Food Processing Enterprises (PMFME)',
  'PM National Child Award',
  'Mission LiFE',
  'Namo Drone Didi Scheme',
  'Drone Shakti Scheme',
  'PM DevINE Scheme',
  'Vibrant Villages Programme',
  'National Mission for Clean Ganga',
  'PM Schools for Rising India (PM SHRI)',
  'Mission Karmayogi Bharat'
];
const hasApiKey =
  process.env.GEMINI_API_KEY &&
  process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' &&
  process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE';
async function fetchSchemeDetailsFromAI(schemeName) {
  if (!hasApiKey) {
    throw new Error('API key not configured');
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });
  const prompt = `
    You are an expert on Indian Government Schemes and the official myScheme.gov.in portal.
    Generate accurate details for the scheme: "${schemeName}".
    Return a JSON object matching this exact structure:
    {
      "title": "Full official name of the scheme",
      "description": "A clear 2-3 sentence description of the scheme",
      "benefits": "Brief description of monetary or non-monetary benefits",
      "requiredDocuments": ["Aadhaar", "Income Certificate", "Caste Certificate", "Bank Passbook", "Domicile"], // Choose only relevant docs from this list or add specific ones
      "applicationLink": "The official .gov.in or .nic.in portal URL for this scheme",
      "state": "Central" or "State name",
      "category": "One of: Agriculture, Education, Healthcare, Housing, Social Welfare, Business",
      "tags": ["3-4 relevant tags for searching"],
      "eligibilityRules": {
        "maxIncome": 150000, // Maximum annual household income limit (number, use 0 if no limit)
        "minAge": 18, // Minimum age requirement (number)
        "maxAge": 60, // Maximum age requirement (number)
        "genders": ["All"] or ["Female"] or ["Male"],
        "categories": ["All"] or ["OBC", "SC", "ST"] or ["General"],
        "states": ["All"] or ["State name"],
        "occupations": ["All"] or ["Farmer", "Student", "Unemployed", "Street Vendor", "Artisan"],
        "educationLevels": ["All"] or ["Graduate", "High School"],
        "disabilityRequired": false
      }
    }
    Ensure all numbers are realistic based on official guidelines.
  `;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const data = JSON.parse(response.text());
    return data;
  } catch (error) {
    console.error(`Error generating data for ${schemeName}:`, error.message);
    throw error;
  }
}
const FALLBACK_SCHEMES = [
  {
    title: 'Pradhan Mantri Mudra Yojana (PMMY)',
    description: 'Provides loans up to Rs. 10 Lakh to non-corporate, non-farm small/micro enterprises to encourage entrepreneurship and self-employment.',
    benefits: 'Collateral-free loans in three categories: Shishu (up to Rs. 50,000), Kishor (up to Rs. 5 Lakh), and Tarun (up to Rs. 10 Lakh).',
    requiredDocuments: ['Aadhaar', 'PAN', 'Bank Passbook', 'Business Proof'],
    applicationLink: 'https://www.mudra.org.in/',
    state: 'Central',
    category: 'Business',
    tags: ['Business Loan', 'Self Employment', 'SME', 'Central Scheme'],
    eligibilityRules: {
      maxIncome: 0,
      minAge: 18,
      maxAge: 65,
      genders: ['All'],
      categories: ['All'],
      states: ['All'],
      occupations: ['Self-Employed', 'Unemployed'],
      educationLevels: ['All'],
      disabilityRequired: false,
    },
  },
  {
    title: 'Sukanya Samriddhi Yojana (SSY)',
    description: 'A small deposit scheme for a girl child launched under the "Beti Bachao Beti Padhao" campaign to build a fund for her education and marriage.',
    benefits: 'High interest rate (currently around 8.2%), income tax exemptions, and maturity benefits directly to the girl child.',
    requiredDocuments: ['Aadhaar', 'Birth Certificate', 'Income Certificate', 'Guardian Aadhaar'],
    applicationLink: 'https://www.nsiindia.gov.in/',
    state: 'Central',
    category: 'Social Welfare',
    tags: ['Girl Child', 'Savings', 'Tax Free', 'Central Scheme'],
    eligibilityRules: {
      maxIncome: 0,
      minAge: 0,
      maxAge: 10,
      genders: ['Female'],
      categories: ['All'],
      states: ['All'],
      occupations: ['Child'],
      educationLevels: ['All'],
      disabilityRequired: false,
    },
  },
  {
    title: 'Atal Pension Yojana (APY)',
    description: 'A pension scheme focused on unorganized sector workers, providing a guaranteed minimum pension after retirement.',
    benefits: 'Guaranteed minimum pension of Rs. 1,000, Rs. 2,000, Rs. 3,000, Rs. 4,000, or Rs. 5,000 per month after age 60.',
    requiredDocuments: ['Aadhaar', 'Bank Passbook'],
    applicationLink: 'https://www.npscra.nsdl.co.in/',
    state: 'Central',
    category: 'Social Welfare',
    tags: ['Pension', 'Social Security', 'Unorganized Sector', 'Retirement'],
    eligibilityRules: {
      maxIncome: 0,
      minAge: 18,
      maxAge: 40,
      genders: ['All'],
      categories: ['All'],
      states: ['All'],
      occupations: ['All'],
      educationLevels: ['All'],
      disabilityRequired: false,
    },
  },
  {
    title: 'PM SVANidhi',
    description: 'A special micro-credit facility scheme to provide affordable working capital loans to street vendors to resume their livelihoods post pandemic.',
    benefits: 'Initial working capital loan up to Rs. 10,000, interest subsidy at 7%, and cashback incentives on digital transactions.',
    requiredDocuments: ['Aadhaar', 'Voter ID', 'Bank Passbook', 'Vendor Certificate'],
    applicationLink: 'https://pmsvanidhi.mohua.gov.in/',
    state: 'Central',
    category: 'Business',
    tags: ['Street Vendors', 'Micro Loan', 'Subsidy', 'Central Scheme'],
    eligibilityRules: {
      maxIncome: 120000,
      minAge: 18,
      maxAge: 70,
      genders: ['All'],
      categories: ['All'],
      states: ['All'],
      occupations: ['Street Vendor'],
      educationLevels: ['All'],
      disabilityRequired: false,
    },
  },
  {
    title: 'Lakhpati Didi Scheme',
    description: 'A government initiative to empower women in Self-Help Groups (SHGs) to earn a sustainable income of at least Rs. 1 Lakh per year.',
    benefits: 'Skill development training, financial literacy, micro-credit loans, and market linkage support.',
    requiredDocuments: ['Aadhaar', 'Income Certificate', 'SHG Certificate', 'Domicile'],
    applicationLink: 'https://rural.gov.in/',
    state: 'Central',
    category: 'Social Welfare',
    tags: ['Women Empowerment', 'Livelihood', 'Self Help Group', 'Skill Training'],
    eligibilityRules: {
      maxIncome: 100000,
      minAge: 18,
      maxAge: 55,
      genders: ['Female'],
      categories: ['All'],
      states: ['All'],
      occupations: ['Self-Employed', 'Farmer'],
      educationLevels: ['All'],
      disabilityRequired: false,
    },
  },
];
async function seedRealSchemes() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();
    console.log('🧹 Clearing existing schemes from database...');
    await Scheme.deleteMany({});
    console.log('✅ Existing schemes cleared.');
    let schemesToSeed = [];
    if (hasApiKey) {
      console.log('🤖 Real Gemini API Key found. Generating real schemes using AI...');
      try {
        for (const name of SCHEME_LIST) {
          console.log(`📡 Fetching official details for: ${name}...`);
          const details = await fetchSchemeDetailsFromAI(name);
          if (details) {
            schemesToSeed.push(details);
          }
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      } catch (err) {
        console.warn('⚠️ Gemini API call failed. Breaking loop and falling back to static list. Error:', err.message);
      }
      if (schemesToSeed.length === 0) {
        console.log('⚠️ Gemini API returned no data (likely due to rate/quota limits). Falling back to static list of real schemes...');
        schemesToSeed = FALLBACK_SCHEMES;
      }
    } else {
      console.log('⚠️ No Gemini API Key configured. Seeding comprehensive fallback list of real schemes...');
      schemesToSeed = FALLBACK_SCHEMES;
    }
    console.log(`🤖 Generating vector embeddings for ${schemesToSeed.length} schemes...`);
    const seededData = [];
    for (const scheme of schemesToSeed) {
      const VALID_CATS = ['General', 'OBC', 'SC', 'ST', 'EWS', 'All'];
      const VALID_GENDERS = ['Male', 'Female', 'Transgender', 'All'];
      if (scheme.eligibilityRules) {
        if (Array.isArray(scheme.eligibilityRules.categories)) {
          scheme.eligibilityRules.categories = scheme.eligibilityRules.categories.map(cat => {
            if (cat === 'EBC' || cat === 'MBC') return 'OBC';
            if (!VALID_CATS.includes(cat)) return 'All';
            return cat;
          });
        }
        if (Array.isArray(scheme.eligibilityRules.genders)) {
          scheme.eligibilityRules.genders = scheme.eligibilityRules.genders.map(g => {
            if (!VALID_GENDERS.includes(g)) return 'All';
            return g;
          });
        }
      }
      const textToEmbed = `${scheme.title}. ${scheme.description}. Category: ${scheme.category}. Benefits: ${scheme.benefits}`;
      try {
        const embedding = await geminiService.generateEmbedding(textToEmbed);
        seededData.push({ ...scheme, embedding });
      } catch (err) {
        console.error(`Failed to generate embedding for ${scheme.title}, seeding without it.`);
        seededData.push(scheme);
      }
    }
    console.log('💾 Writing schemes to MongoDB...');
    await Scheme.insertMany(seededData);
    console.log(`🎉 Successfully seeded ${seededData.length} official schemes into MongoDB!`);
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Critical seeder failure:', error.message);
    process.exit(1);
  }
}
seedRealSchemes();