const dotenv = require('dotenv');
dotenv.config();


const axios = require('axios');
const inquirer = require('inquirer');
const { table } = require('table');
const chalk = require('chalk');
const clear = require('clear');

const fetchDeployments = async () => {
  try {
    const response = await axios.get(`https://api.vercel.com/v5/now/deployments?teamId=${process.env.TEAM_ID}`, {
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`
      }
    });
    return response.data.deployments;
  } catch (error) {
    console.error(error);
  }
};

const displayDeployments = (deployments) => {
  const data = deployments.map((deployment) => [
    deployment.id,
    deployment.name,
    deployment.url,
    deployment.state
  ]);

  console.log(table([['ID', 'Name', 'URL', 'State'], ...data]));
};

const cancelDeployments = async (deploymentIds) => {
  const cancelPromises = deploymentIds.map((id) =>
    axios.delete(`https://api.vercel.com/v5/now/deployments/${id}`, {
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`
      }
    })
  );

  await Promise.all(cancelPromises);
};

const main = async () => {
  while (true) {
    clear();
    console.log(chalk.blue('Fetching deployments...'));
    const deployments = await fetchDeployments();
    displayDeployments(deployments);

    const { deploymentIds } = await inquirer.prompt([{
      type: 'checkbox',
      message: 'Select deployments to cancel',
      name: 'deploymentIds',
      choices: deployments.map((deployment) => ({
        name: `${deployment.name} (${deployment.state})`,
        value: deployment.id,
      })),
    }]);

    if (deploymentIds.length > 0) {
      console.log(chalk.yellow('Cancelling deployments...'));
      await cancelDeployments(deploymentIds);
    }

    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
};

main();
