const dotenv = require('dotenv');
dotenv.config();

const axios = require('axios');
const inquirer = require('inquirer');
const { table } = require('table');
const chalk = require('chalk');
const clear = require('clear');

const fetchDeployments = async (page = 0) => {
  try {
    const response = await axios.get(`https://api.vercel.com/v5/now/deployments?teamId=${process.env.TEAM_ID}&state=QUEUED&limit=100&page=${page}`, {
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`
      }
    });

    console.log(response.data.deployments[0]);

    return response.data.deployments;
  } catch (error) {
    console.error(error);
  }
};

const displayDeployments = (deployments) => {
  const data = deployments.map((deployment) => [
    deployment.name,
    deployment.meta.githubCommitRef,
    deployment.state,
    new Date(deployment.created).toLocaleString()
  ]);

  const config = {
    columns: {
      0: { width: 25, wrapWord: true },
      1: { width: 20, wrapWord: true },
      2: { width: 10, wrapWord: true },
      3: { width: 25, wrapWord: true }
    }
  };

  console.log(table([['Project Name', 'Branch', 'State', 'Date'], ...data], config));
};

const cancelDeployments = async (deploymentIds) => {
  const cancelPromises = deploymentIds.slice(0, 1).map(async (id) => {
    return await axios.patch(`https://api.vercel.com/v12/deployments/${id}/cancel?teamId=${process.env.TEAM_ID}`, { // Updated API endpoint
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`
      }
    })
  }
  );

  await Promise.all(cancelPromises);
};

const main = async () => {
  while (true) {
    clear();
    console.log(chalk.blue('Fetching deployments...'));
    const deployments = await fetchDeployments();
    displayDeployments(deployments);

    const branches = [...new Set(deployments.map(deployment => deployment.meta.githubCommitRef))].filter(branch => ![undefined, 'main', 'prod'].includes(branch));

    const { selectedBranches } = await inquirer.prompt([{
      type: 'checkbox',
      message: 'Select branches to cancel deployments',
      name: 'selectedBranches',
      choices: branches,
      default: branches
    }]);

    const deploymentIdsToCancel = deployments.filter(deployment => selectedBranches.includes(deployment.meta.githubCommitRef)).map(deployment => deployment.uid);

    if (deploymentIdsToCancel.length > 0) {
      console.log(chalk.yellow('Cancelling deployments...'));
      await cancelDeployments(deploymentIdsToCancel);
    }

    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
};

main();
