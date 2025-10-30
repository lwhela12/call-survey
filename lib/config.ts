// Load survey configuration from exported files
import surveyConfig from '@/config/survey.json';

// Dashboard config is optional - may not exist for all exports
let dashboardConfig: unknown = null;
try {
  dashboardConfig = require('@/config/dashboard.json');
} catch (error) {
  // Dashboard config is optional, continue without it
  console.log('No dashboard configuration found');
}

export function getSurveyConfig() {
  return surveyConfig;
}

export function getDashboardConfig() {
  return dashboardConfig;
}

export function getClientId() {
  return process.env.CLIENT_ID || '';
}

export function getDeploymentId() {
  return process.env.DEPLOYMENT_ID || '';
}
