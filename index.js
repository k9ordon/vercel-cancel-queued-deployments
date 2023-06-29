const dotenv = require('dotenv');
dotenv.config();

const axios = require('axios');
const inquirer = require('inquirer');
const { table } = require('table');
const chalk = require('chalk');
const clear = require('clear');
const cliProgress = require('cli-progress');
const ora = require('ora');

// Set the refetch interval, default to 5000ms
const REFETCH_INTERVAL = process.env.REFETCH_INTERVAL || 5000;

const fetchDeployments = async (page = 0) => {
  const spinner = ora('Fetching deployments...').start();
  try {
    const response = await axios.get(`https://api.vercel.com/v5/now/deployments?teamId=${process.env.TEAM_ID}&state=QUEUED&limit=100&page=${page}`, {
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`
      }
    });
    spinner.stop();
    return response.data.deployments;
  } catch (error) {
    spinner.stop();
    console.error(chalk.red('Failed to fetch deployments', error));
    throw error;
  }
};

const displayDeployments = (deployments) => {
  const data = deployments.map((deployment) => [
    chalk.cyan(deployment.name),
    chalk.green(deployment.meta.githubCommitRef),
    deployment.state === 'QUEUED' ? chalk.yellow(deployment.state) : chalk.red(deployment.state),
    chalk.white(new Date(deployment.created).toLocaleString()),
  ]);

  const config = {
    columns: {
      0: { width: 30, wrapWord: true },
      1: { width: 30, wrapWord: true },
      2: { width: 8, wrapWord: true },
      3: { width: 22, wrapWord: true },
    },
    border: {
      topBody: chalk.gray('─'),
      topJoin: chalk.gray('┬'),
      topLeft: chalk.gray('┌'),
      topRight: chalk.gray('┐'),

      bottomBody: chalk.gray('─'),
      bottomJoin: chalk.gray('┴'),
      bottomLeft: chalk.gray('└'),
      bottomRight: chalk.gray('┘'),

      bodyLeft: chalk.gray('│'),
      bodyRight: chalk.gray('│'),
      bodyJoin: chalk.gray('│'),

      joinBody: chalk.gray('─'),
      joinLeft: chalk.gray('├'),
      joinRight: chalk.gray('┤'),
      joinJoin: chalk.gray('┼')
    }
  };

  console.log(table([['Project Name', 'Branch', 'State', 'Date'].map(title => chalk.bold(title)), ...data], config));
};


const cancelDeployment = async (id, deployment) => {
  try {
    const res = await axios.patch(`https://api.vercel.com/v12/deployments/${id}/cancel?teamId=${process.env.TEAM_ID}`, {}, {
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`
      }
    });

    return res.status >= 200 && res.status < 300;
  } catch (error) {
    console.error(`Failed to cancel deployment ${id}. Error: ${error}`);
    throw error;
  }
};

const cancelDeployments = async (deploymentIds, deployments) => {
  const progressBar = new cliProgress.SingleBar({
    format: 'Cancelling Deployments |' + chalk.cyan('{bar}') + '| {percentage}% || {value}/{total} Deployments || Status: {status}'
  }, cliProgress.Presets.shades_classic);

  progressBar.start(deploymentIds.length, 0);

  for (const id of deploymentIds) {
    const deployment = deployments.find(d => d.uid === id);
    progressBar.update({ status: `Cancelling deployment ${id} for project ${deployment.name} and branch ${deployment.meta.githubCommitRef}...` });
    try {
      const isSuccess = await cancelDeployment(id, deployment);
      if (isSuccess) {
        progressBar.update({ status: `Successfully cancelled deployment ${id}` });
      } else {
        progressBar.update({ status: `Failed to cancel deployment ${id}.` });
      }
    } catch (error) {
      progressBar.stop();
      throw error;
    }
    progressBar.increment();
  }

  progressBar.stop();
};

const interactWithUserAndCancelDeployments = async (deployments) => {
  const branches = [...new Set(deployments.map(deployment => deployment.meta.githubCommitRef))];

  const { selectedBranches } = await inquirer.prompt([{
    type: 'checkbox',
    message: 'Select branches to cancel deployments',
    name: 'selectedBranches',
    choices: branches,
    default: branches.filter(branch => ![undefined, 'main', 'production'].includes(branch))
  }]);

  const deploymentIdsToCancel = deployments.filter(deployment => selectedBranches.includes(deployment.meta.githubCommitRef)).map(deployment => deployment.uid);

  if (deploymentIdsToCancel.length > 0) {
    console.log(chalk.yellow('Cancelling deployments...'));
    await cancelDeployments(deploymentIdsToCancel, deployments);
  } else {
    console.log(chalk.yellow('No deployment branches to cancel found.'));
  }
};

const startRefetchCountdown = async () => {
  // Start countdown
  let counter = REFETCH_INTERVAL / 1000;
  const countdown = setInterval(() => {
    process.stdout.write(`\r${chalk.yellow(`No branches found. Refetching in ${counter} seconds...`)}`);
    counter--;
    if (counter < 0) {
      clearInterval(countdown);
    }
  }, 1000);

  // Delay next iteration
  await new Promise(resolve => setTimeout(resolve, REFETCH_INTERVAL));

  // Stop countdown
  clearInterval(countdown);
};

const main = async () => {
  while (true) {
    try {
      clear();
      const deployments = await fetchDeployments();
      displayDeployments(deployments);

      if (deployments.length > 0) {
        await interactWithUserAndCancelDeployments(deployments);
      } else {
        await startRefetchCountdown();
      }

    } catch (error) {
      console.error(chalk.red('An error occurred during the operation:', error));
    }
  }
};

main();
