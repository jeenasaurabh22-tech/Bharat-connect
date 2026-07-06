import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Scheme from '../models/Scheme.model.js';
import geminiService from '../services/gemini.service.js';
import logger from './logger.js';
import { connectDB } from './db.js';
dotenv.config();
const baseSchemes = [
  {
    title: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    description: 'An initiative by the Government of India that provides up to Rs. 6,000 per year in three equal installments to all small and marginal farmers as income support.',
    benefits: 'Rs. 6,000 per year directly transferred to bank accounts (DBT) in three installments of Rs. 2,000 each.',
    requiredDocuments: ['Aadhaar', 'Income Certificate', 'Land Holding Documents', 'Bank Passbook'],
    applicationLink: 'https://pmkisan.gov.in/',
    state: 'Central',
    category: 'Agriculture',
    tags: ['Farmers', 'Income Support', 'Central Scheme', 'Direct Benefit Transfer'],
    eligibilityRules: {
      maxIncome: 120000,
      minAge: 18,
      maxAge: 100,
      genders: ['All'],
      categories: ['All'],
      states: ['All'],
      occupations: ['Farmer'],
      educationLevels: ['All'],
      disabilityRequired: false,
    },
  },
  {
    title: 'Pradhan Mantri Awas Yojana (PMAY) - Gramin',
    description: 'Provides financial assistance for construction of pucca houses with basic amenities to all houseless householders and households living in dilapidated houses in rural areas.',
    benefits: 'Financial assistance of Rs. 1.2 Lakh in plains and Rs. 1.3 Lakh in hilly/difficult areas for house construction.',
    requiredDocuments: ['Aadhaar', 'Income Certificate', 'Caste Certificate', 'Bank Passbook', 'Domicile'],
    applicationLink: 'https://pmayg.nic.in/',
    state: 'Central',
    category: 'Housing',
    tags: ['Housing', 'Rural Development', 'Central Scheme', 'EWS'],
    eligibilityRules: {
      maxIncome: 300000,
      minAge: 18,
      maxAge: 100,
      genders: ['All'],
      categories: ['All'],
      states: ['All'],
      occupations: ['All'],
      educationLevels: ['All'],
      disabilityRequired: false,
    },
  },
  {
    title: 'Ayushman Bharat National Health Protection Scheme (PM-JAY)',
    description: 'The largest government-funded healthcare program globally, offering cover of Rs. 5 Lakh per family per year for secondary and tertiary care hospitalization.',
    benefits: 'Cashless health insurance coverage of up to Rs. 5,00,000 per family per year.',
    requiredDocuments: ['Aadhaar', 'Income Certificate', 'Ration Card'],
    applicationLink: 'https://pmjay.gov.in/',
    state: 'Central',
    category: 'Healthcare',
    tags: ['Healthcare', 'Health Insurance', 'Central Scheme', 'BPL'],
    eligibilityRules: {
      maxIncome: 180000,
      minAge: 0,
      maxAge: 100,
      genders: ['All'],
      categories: ['All'],
      states: ['All'],
      occupations: ['All'],
      educationLevels: ['All'],
      disabilityRequired: false,
    },
  },
  {
    title: 'Post Matric Scholarship Scheme for SC/ST Students',
    description: 'Provides financial assistance to Scheduled Caste and Scheduled Tribe students studying at post-matriculation or post-secondary stages to enable them to complete their education.',
    benefits: '100% tuition fee reimbursement and monthly maintenance allowance depending on the course of study.',
    requiredDocuments: ['Aadhaar', 'Caste Certificate', 'Income Certificate', 'Previous Year Marksheet', 'Domicile'],
    applicationLink: 'https://scholarships.gov.in/',
    state: 'Central',
    category: 'Education',
    tags: ['Education', 'Scholarship', 'SC', 'ST', 'Students'],
    eligibilityRules: {
      maxIncome: 250000,
      minAge: 15,
      maxAge: 30,
      genders: ['All'],
      categories: ['SC', 'ST'],
      states: ['All'],
      occupations: ['Student'],
      educationLevels: ['High School', 'Intermediate', 'Graduate'],
      disabilityRequired: false,
    },
  },
  {
    title: 'Pradhan Mantri Ujjwala Yojana (PMUY)',
    description: 'A scheme to distribute free LPG connections to women belonging to Below Poverty Line (BPL) households, encouraging clean cooking fuel usage and improving health.',
    benefits: 'Free LPG connection with financial support of Rs. 1,600 and free first refill cylinder and stove.',
    requiredDocuments: ['Aadhaar', 'Income Certificate', 'Ration Card', 'Address Proof'],
    applicationLink: 'https://www.pmuy.gov.in/',
    state: 'Central',
    category: 'Social Welfare',
    tags: ['Social Welfare', 'Energy', 'Women Empowerment', 'Central Scheme'],
    eligibilityRules: {
      maxIncome: 100000,
      minAge: 18,
      maxAge: 100,
      genders: ['Female'],
      categories: ['All'],
      states: ['All'],
      occupations: ['All'],
      educationLevels: ['All'],
      disabilityRequired: false,
    },
  },
  {
    title: 'National Pension Scheme for Senior Citizens (IGNOAPS)',
    description: 'Under the National Social Assistance Programme, financial assistance of monthly pension is provided to senior citizens living below the poverty line.',
    benefits: 'Monthly pension of Rs. 200 for ages 60-70 and Rs. 500 for age 80+.',
    requiredDocuments: ['Aadhaar', 'Income Certificate', 'Age Proof', 'Domicile'],
    applicationLink: 'https://nsap.nic.in/',
    state: 'Central',
    category: 'Social Welfare',
    tags: ['Pension', 'Senior Citizens', 'Central Scheme', 'Social Security'],
    eligibilityRules: {
      maxIncome: 120000,
      minAge: 60,
      maxAge: 100,
      genders: ['All'],
      categories: ['All'],
      states: ['All'],
      occupations: ['Retired'],
      educationLevels: ['All'],
      disabilityRequired: false,
    },
  },
  {
    title: 'Deendayal Disabled Rehabilitation Scheme (DDRS)',
    description: 'Provides financial assistance to non-governmental organizations to promote voluntary action for the rehabilitation of persons with disabilities.',
    benefits: 'Special education, vocational training, purchase of assistive aids, and rehabilitation aids.',
    requiredDocuments: ['Aadhaar', 'Disability Certificate', 'Domicile', 'Income Certificate'],
    applicationLink: 'https://disabilityaffairs.gov.in/',
    state: 'Central',
    category: 'Social Welfare',
    tags: ['Disability', 'Rehabilitation', 'Central Scheme', 'Assistive Aids'],
    eligibilityRules: {
      maxIncome: 200000,
      minAge: 5,
      maxAge: 100,
      genders: ['All'],
      categories: ['All'],
      states: ['All'],
      occupations: ['All'],
      educationLevels: ['All'],
      disabilityRequired: true,
    },
  },
];
const statesList = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi'
];
const categoriesList = ['Agriculture', 'Education', 'Healthcare', 'Housing', 'Social Welfare', 'Business'];
const generateSchemes = async () => {
  const generated = [];
  generated.push(...baseSchemes);
  const stateTemplates = [
    {
      titleTemplate: '{state} State Post-Matric Scholarship for SC Students',
      descTemplate: 'State-sponsored educational scholarship for Scheduled Caste students pursuing post-matric courses in institutions across {state}.',
      benefitTemplate: 'Full reimbursement of registration fees and tuition fees along with a monthly stipend of up to Rs. 1,200.',
      category: 'Education',
      docs: ['Aadhaar', 'Caste Certificate', 'Income Certificate', 'Domicile'],
      rules: { maxIncome: 200000, minAge: 15, maxAge: 25, genders: ['All'], categories: ['SC'], occupations: ['Student'] }
    },
    {
      titleTemplate: '{state} Ladli Laxmi Yojana',
      descTemplate: 'A welfare scheme initiated by the {state} government to create positive thinking towards birth of a girl child and improve sex ratio.',
      benefitTemplate: 'Savings bond of Rs. 30,000 and staggered monetary benefits on education milestones, with Rs. 1,00,000 at age 21.',
      category: 'Social Welfare',
      docs: ['Aadhaar', 'Income Certificate', 'Domicile', 'Birth Certificate'],
      rules: { maxIncome: 150000, minAge: 0, maxAge: 18, genders: ['Female'], categories: ['All'], occupations: ['Student', 'Child'] }
    },
    {
      titleTemplate: '{state} Farmer Irrigation Subsidy Scheme',
      descTemplate: 'A state government subsidy scheme to help small farmers of {state} install solar water pumps and drip irrigation setups.',
      benefitTemplate: 'Subsidy of up to 60% of the total installation cost for solar pumps and drip pipes.',
      category: 'Agriculture',
      docs: ['Aadhaar', 'Land Records', 'Income Certificate', 'Domicile'],
      rules: { maxIncome: 180000, minAge: 18, maxAge: 75, genders: ['All'], categories: ['All'], occupations: ['Farmer'] }
    },
    {
      titleTemplate: '{state} Chief Minister Health Assure Scheme',
      descTemplate: 'Free health insurance cover to families below poverty line and low-income groups across the state of {state}.',
      benefitTemplate: 'Cashless treatment cover of up to Rs. 3,50,000 per family per year in empanelled private and government hospitals.',
      category: 'Healthcare',
      docs: ['Aadhaar', 'Income Certificate', 'Ration Card', 'Domicile'],
      rules: { maxIncome: 120000, minAge: 0, maxAge: 100, genders: ['All'], categories: ['All'], occupations: ['All'] }
    },
    {
      titleTemplate: '{state} Self-Employment Subsidy Scheme for Youth',
      descTemplate: 'Assists unemployed youth residing in {state} to establish small scale micro-enterprises and business projects.',
      benefitTemplate: 'Interest subsidy on bank business loans up to 8% and cash subsidy of 15% of the total project cost.',
      category: 'Business',
      docs: ['Aadhaar', 'Income Certificate', 'Domicile', 'Project Report'],
      rules: { maxIncome: 250000, minAge: 18, maxAge: 45, genders: ['All'], categories: ['All'], occupations: ['Unemployed', 'Self-Employed'] }
    },
    {
      titleTemplate: '{state} Divyangjan Pension Sahayata',
      descTemplate: 'Financial aid provided monthly to physically challenged individuals with high disability percentages in the state of {state}.',
      benefitTemplate: 'Monthly direct bank pension transfer of Rs. 1,000 to Rs. 1,500 depending on the severity.',
      category: 'Social Welfare',
      docs: ['Aadhaar', 'Disability Certificate', 'Domicile', 'Income Certificate'],
      rules: { maxIncome: 100000, minAge: 5, maxAge: 85, genders: ['All'], categories: ['All'], occupations: ['All'], disabilityRequired: true }
    }
  ];
  const extraTemplates = [
    {
      titleTemplate: '{state} Post-Matric Scholarship for OBC Students',
      descTemplate: 'State-sponsored educational scholarship for OBC category students pursuing intermediate and graduation in {state}.',
      benefitTemplate: 'Maintenance allowance and tuition fee reimbursement up to Rs. 10,000 annually.',
      category: 'Education',
      docs: ['Aadhaar', 'Caste Certificate', 'Income Certificate', 'Domicile'],
      rules: { maxIncome: 150000, minAge: 16, maxAge: 26, genders: ['All'], categories: ['OBC'], occupations: ['Student'] }
    },
    {
      titleTemplate: '{state} Post-Matric Scholarship for ST Students',
      descTemplate: 'State scholarship for Scheduled Tribe students studying post-secondary courses in {state}.',
      benefitTemplate: 'Full reimbursement of study and exam fees with a monthly allowance of Rs. 1,400.',
      category: 'Education',
      docs: ['Aadhaar', 'Caste Certificate', 'Income Certificate', 'Domicile'],
      rules: { maxIncome: 250000, minAge: 15, maxAge: 28, genders: ['All'], categories: ['ST'], occupations: ['Student'] }
    },
    {
      titleTemplate: '{state} Mukhyamantri Awas Yojana',
      descTemplate: 'Financial aid scheme for constructing affordable houses for urban poor and homeless citizens in {state}.',
      benefitTemplate: 'Financial grant of Rs. 1,50,000 directly for construction in certified urban zones.',
      category: 'Housing',
      docs: ['Aadhaar', 'Income Certificate', 'Domicile'],
      rules: { maxIncome: 200000, minAge: 21, maxAge: 65, genders: ['All'], categories: ['All'], occupations: ['All'] }
    },
    {
      titleTemplate: '{state} CM Solar Pump Scheme for Farmers',
      descTemplate: 'Provides high subsidies for purchasing agricultural solar pumps to improve crop irrigation efficiency in {state}.',
      benefitTemplate: '90% subsidy for SC/ST farmers and 75% subsidy for general category farmers on solar pump sets.',
      category: 'Agriculture',
      docs: ['Aadhaar', 'Land Records', 'Caste Certificate', 'Domicile'],
      rules: { maxIncome: 200000, minAge: 18, maxAge: 70, genders: ['All'], categories: ['All'], occupations: ['Farmer'] }
    },
    {
      titleTemplate: '{state} CM Welfare Fund for Widow Pensions',
      descTemplate: 'Social security and livelihood support scheme for windows residing below poverty line in {state}.',
      benefitTemplate: 'Monthly direct benefit bank transfer of Rs. 1,200 for basic livelihood support.',
      category: 'Social Welfare',
      docs: ['Aadhaar', 'Income Certificate', 'Domicile', 'Death Certificate'],
      rules: { maxIncome: 120000, minAge: 18, maxAge: 90, genders: ['Female'], categories: ['All'], occupations: ['All'] }
    },
    {
      titleTemplate: '{state} CM Startup Support Fund',
      descTemplate: 'Promotes entrepreneurship in {state} by offering seed funds and mentorship opportunities.',
      benefitTemplate: 'Seed funding grant of up to Rs. 5 Lakhs for innovative tech and business models.',
      category: 'Business',
      docs: ['Aadhaar', 'Domicile', 'Business Registration'],
      rules: { maxIncome: null, minAge: 18, maxAge: 35, genders: ['All'], categories: ['All'], occupations: ['Self-Employed'] }
    }
  ];
  const allTemplates = [...stateTemplates, ...extraTemplates];
  for (const state of statesList) {
    for (const temp of allTemplates) {
      const title = temp.titleTemplate.replace('{state}', state);
      const description = temp.descTemplate.replace(/{state}/g, state);
      const benefits = temp.benefitTemplate.replace('{state}', state);
      const newScheme = {
        title,
        description,
        benefits,
        requiredDocuments: temp.docs,
        applicationLink: `https://www.${state.toLowerCase().replace(/\s+/g, '')}.gov.in/schemes`,
        deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        state,
        category: temp.category,
        tags: [temp.category, state, 'State Welfare', ...temp.rules.categories],
        eligibilityRules: {
          maxIncome: temp.rules.maxIncome,
          minAge: temp.rules.minAge,
          maxAge: temp.rules.maxAge,
          genders: temp.rules.genders,
          categories: temp.rules.categories,
          states: [state],
          occupations: temp.rules.occupations,
          educationLevels: ['All'],
          disabilityRequired: temp.rules.disabilityRequired || false,
        }
      };
      generated.push(newScheme);
    }
  }
  const superExtraTemplates = [
    {
      titleTemplate: '{state} Scheme for Minority Educational Grants',
      descTemplate: 'Provides academic fees and book bank support to minority class students in educational institutions in {state}.',
      benefitTemplate: 'Scholarship grant of Rs. 6,000 per academic year for intermediate classes.',
      category: 'Education',
      docs: ['Aadhaar', 'Income Certificate', 'Domicile', 'Minority Proof'],
      rules: { maxIncome: 120000, minAge: 12, maxAge: 22, genders: ['All'], categories: ['All'], occupations: ['Student'] }
    },
    {
      titleTemplate: '{state} Free Cycle Distribution Scheme for Girls',
      descTemplate: 'Free cycles distributed to girls belonging to low income families entering high school in rural districts of {state}.',
      benefitTemplate: 'A bicycle or financial voucher worth Rs. 4,500 to purchase a school bicycle.',
      category: 'Social Welfare',
      docs: ['Aadhaar', 'Income Certificate', 'Domicile', 'School Admission Letter'],
      rules: { maxIncome: 80000, minAge: 11, maxAge: 17, genders: ['Female'], categories: ['All'], occupations: ['Student'] }
    },
    {
      titleTemplate: '{state} EWS Fee Waiver Scheme for Higher Studies',
      descTemplate: 'Tuition fee exemption support to economically weaker section students in engineering and medicine in {state}.',
      benefitTemplate: 'Exemption of up to 50% of college academic fee structures.',
      category: 'Education',
      docs: ['Aadhaar', 'Income Certificate', 'Domicile', 'Admission Fee Slip'],
      rules: { maxIncome: 800000, minAge: 17, maxAge: 25, genders: ['All'], categories: ['EWS'], occupations: ['Student'] }
    },
    {
      titleTemplate: '{state} CM Swasthya Kalyan Bima Yojana',
      descTemplate: 'An essential health safety card distributed to senior citizen couples below tax threshold in {state}.',
      benefitTemplate: 'Insurance cover of Rs. 2,00,000 for senior care hospitalizations.',
      category: 'Healthcare',
      docs: ['Aadhaar', 'Age Proof', 'Domicile'],
      rules: { maxIncome: 150000, minAge: 60, maxAge: 95, genders: ['All'], categories: ['All'], occupations: ['All'] }
    },
    {
      titleTemplate: '{state} Subsidy for Horticulture Cultivation',
      descTemplate: 'Promotes flower and fruit cropping in farm holdings across {state}.',
      benefitTemplate: 'subsidy of Rs. 25,000 per hectare for fruit and flower saplings and fertilizer packs.',
      category: 'Agriculture',
      docs: ['Aadhaar', 'Land Records', 'Domicile'],
      rules: { maxIncome: 300000, minAge: 18, maxAge: 70, genders: ['All'], categories: ['All'], occupations: ['Farmer'] }
    },
    {
      titleTemplate: '{state} Artisans Livelihood Support Scheme',
      descTemplate: 'Empowers traditional handicraft and cottage industry workers with toolkits and loan linkages in {state}.',
      benefitTemplate: 'A toolkit voucher worth Rs. 5,000 and credit lines at 3% compound interest rates.',
      category: 'Social Welfare',
      docs: ['Aadhaar', 'Domicile', 'Artisan Certificate'],
      rules: { maxIncome: 120000, minAge: 18, maxAge: 60, genders: ['All'], categories: ['All'], occupations: ['Artisan'] }
    }
  ];
  for (const state of statesList) {
    for (const temp of superExtraTemplates) {
      const title = temp.titleTemplate.replace('{state}', state);
      const description = temp.descTemplate.replace(/{state}/g, state);
      const benefits = temp.benefitTemplate.replace('{state}', state);
      const newScheme = {
        title,
        description,
        benefits,
        requiredDocuments: temp.docs,
        applicationLink: `https://www.${state.toLowerCase().replace(/\s+/g, '')}.gov.in/schemes`,
        deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        state,
        category: temp.category,
        tags: [temp.category, state, 'State Welfare', ...temp.rules.categories],
        eligibilityRules: {
          maxIncome: temp.rules.maxIncome,
          minAge: temp.rules.minAge,
          maxAge: temp.rules.maxAge,
          genders: temp.rules.genders,
          categories: temp.rules.categories,
          states: [state],
          occupations: temp.rules.occupations,
          educationLevels: ['All'],
          disabilityRequired: temp.rules.disabilityRequired || false,
        }
      };
      generated.push(newScheme);
    }
  }
  return generated;
};
const runSeeder = async () => {
  try {
    logger.info('Starting Scheme Database Seeder...');
    await connectDB();
    await Scheme.deleteMany({});
    logger.info('Cleared existing schemes in MongoDB.');
    const schemesData = await generateSchemes();
    logger.info(`Generated ${schemesData.length} schemes for seeding.`);
    const batchSize = 15;
    const seededSchemes = [];
    for (let i = 0; i < schemesData.length; i += batchSize) {
      const chunk = schemesData.slice(i, i + batchSize);
      logger.info(`Processing seed chunk: ${Math.round((i / schemesData.length) * 100)}% complete...`);
      const embeddingPromises = chunk.map(async (scheme) => {
        const textToEmbed = `${scheme.title}. ${scheme.description}. Category: ${scheme.category}. Tags: ${scheme.tags.join(', ')}`;
        try {
          const embedding = await geminiService.generateEmbedding(textToEmbed);
          return { ...scheme, embedding };
        } catch (error) {
          logger.warn(`Failed to generate embedding for ${scheme.title}: ${error.message}. Seeding without embedding.`);
          return scheme;
        }
      });
      const embeddedChunk = await Promise.all(embeddingPromises);
      await Scheme.insertMany(embeddedChunk);
      if (geminiService.hasApiKey) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    logger.info(`Successfully seeded ${schemesData.length} schemes into MongoDB!`);
    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error(`Seeder failed with critical error: ${error.message}`);
    process.exit(1);
  }
};
runSeeder();