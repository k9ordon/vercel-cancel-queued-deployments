// Import required modules
const dotenv = require('dotenv');
const debug = require('debug')('vercel:deployments');

// Load environment variables from .env file
dotenv.config();

// Vercel API endpoint
const API_URL = 'https://api.vercel.com/v5/now/deployments';

async function fetchDeployments() {
  const API_URL = `https://api.vercel.com/v5/now/deployments?teamId=${process.env.TEAM_ID}`;

  debug('Fetching deployments from Vercel...');

  const response = await fetch(API_URL, {
    headers: {
      'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    debug('Failed to fetch deployments. Response status:', response.status);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.deployments;
}

// Function to filter queued deployments
function filterQueuedDeployments(deployments) {
  debug('Filtering queued deployments...');

  return deployments.filter(deployment => deployment.state === 'QUEUED');
}

// Main function to list all queued deployments
async function listQueuedDeployments() {
  try {
    const deployments = await fetchDeployments();
    const queuedDeployments = filterQueuedDeployments(deployments);

    // Sort by created date
    queuedDeployments.sort((a, b) => b.created - a.created);

    // Format and print each queued deployment
    queuedDeployments.forEach(deployment => {
      const projectName = deployment.name;
      const branch = deployment.meta.githubCommitRef;
      const creationDate = new Date(deployment.created).toLocaleString();

      console.log(`Project: ${projectName}`);
      console.log(`Branch: ${branch}`);
      console.log(`Created: ${creationDate}`);
      console.log('-----------------------------------');
    });
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

// Call the main function
listQueuedDeployments();
