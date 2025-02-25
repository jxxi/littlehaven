import { pgEnum } from 'drizzle-orm/pg-core';

// Define tag categories
export const TAG_CATEGORIES = {
  AGE_GROUP: 'Age Group',
  TOPIC: 'Topic',
  PARENTING_STYLE: 'Parenting Style',
  FAMILY_TYPE: 'Family Type',
  SPECIAL_INTEREST: 'Special Interest',
} as const;

// Define tag metadata with descriptions and categories
export const TAG_METADATA = {
  parenting: {
    description: 'General parenting discussions and advice',
    category: TAG_CATEGORIES.TOPIC,
  },
  pregnancy: {
    description: 'Pregnancy-related topics and support',
    category: TAG_CATEGORIES.TOPIC,
  },
  newborn: {
    description: 'For parents of babies 0-3 months',
    category: TAG_CATEGORIES.AGE_GROUP,
  },
  toddler: {
    description: 'For parents of children 1-3 years',
    category: TAG_CATEGORIES.AGE_GROUP,
  },
  preschool: {
    description: 'For parents of children 3-5 years',
    category: TAG_CATEGORIES.AGE_GROUP,
  },
  'school-age': {
    description: 'For parents of children 5-12 years',
    category: TAG_CATEGORIES.AGE_GROUP,
  },
  teenager: {
    description: 'For parents of teenagers 13-19 years',
    category: TAG_CATEGORIES.AGE_GROUP,
  },
  health: {
    description: 'Child and family health topics',
    category: TAG_CATEGORIES.TOPIC,
  },
  education: {
    description: 'Educational resources and discussions',
    category: TAG_CATEGORIES.TOPIC,
  },
  activities: {
    description: 'Fun activities and play ideas',
    category: TAG_CATEGORIES.TOPIC,
  },
  nutrition: {
    description: 'Food, feeding, and nutrition',
    category: TAG_CATEGORIES.TOPIC,
  },
  sleep: {
    description: 'Sleep issues and solutions',
    category: TAG_CATEGORIES.TOPIC,
  },
  behavior: {
    description: 'Child behavior and discipline',
    category: TAG_CATEGORIES.TOPIC,
  },
  development: {
    description: 'Child development milestones and concerns',
    category: TAG_CATEGORIES.TOPIC,
  },
  'special-needs': {
    description: 'Support for parents of children with special needs',
    category: TAG_CATEGORIES.SPECIAL_INTEREST,
  },
  adoption: {
    description: 'Adoption-related discussions',
    category: TAG_CATEGORIES.FAMILY_TYPE,
  },
  'single-parent': {
    description: 'Single parent support and discussions',
    category: TAG_CATEGORIES.FAMILY_TYPE,
  },
  lgbtq: {
    description: 'LGBTQ+ family discussions',
    category: TAG_CATEGORIES.FAMILY_TYPE,
  },
  'working-parent': {
    description: 'Balancing work and parenting',
    category: TAG_CATEGORIES.PARENTING_STYLE,
  },
  'stay-at-home': {
    description: 'Stay-at-home parent discussions',
    category: TAG_CATEGORIES.PARENTING_STYLE,
  },
  'mental-health': {
    description: 'Mental health support for parents',
    category: TAG_CATEGORIES.TOPIC,
  },
  support: {
    description: 'General support and encouragement',
    category: TAG_CATEGORIES.TOPIC,
  },
} as const;

// Get tag names as array
export const TAG_NAMES = Object.keys(TAG_METADATA) as Array<
  keyof typeof TAG_METADATA
>;

// Create the Postgres enum for use in the schema
export const tagNameEnum = pgEnum('tag_name', [
  'parenting',
  'black',
  'poc',
  'hispanic',
  'men',
  'women',
  'non-binary',
  'asian',
  'pregnancy',
  'newborn',
  'toddler',
  'preschool',
  'school-age',
  'teenager',
  'health',
  'education',
  'activities',
  'nutrition',
  'sleep',
  'behavior',
  'development',
  'special-needs',
  'adoption',
  'single-parent',
  'lgbtq',
  'working-parent',
  'stay-at-home',
  'mental-health',
  'support',
]);
