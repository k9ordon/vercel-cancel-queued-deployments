# Vercel Cancel Queued Deployments

Vercel Cancel Queued Deployments is a CLI tool for managing queued deployments on Vercel. This tool allows you to fetch deployments, display them in a table, and cancel them by selecting specific branches.

## Getting Started

These instructions will help you get a copy of the project up and running on your local machine.

### Prerequisites

Ensure that you have Node.js and npm installed. You can download Node.js [here](https://nodejs.org/en/download/). npm is included with the Node.js installation.

### Installation

1. Clone this repository:

```bash
git clone https://github.com/k9ordon/vercel-cancel-queued-deployments.git
```

2. Navigate to the project directory:

```bash
cd vercel-cancel-queued-deployments
```

3. Install the required dependencies:

```bash
npm install
```

## Usage

To use this tool, you need to provide Vercel team id and Vercel token as environment variables. These can be provided in a `.env` file in the project root.

Here's an example `.env` file:

```env
TEAM_ID=your_team_id
VERCEL_TOKEN=your_vercel_token
```

You can also set the refetch interval (in milliseconds) in the `.env` file. By default, it is set to 5000 ms.

```env
REFETCH_INTERVAL=5000
```

Run the CLI tool with:

```bash
node index.js
```

## Contributing

We welcome contributions from the community. If you wish to contribute, please take a moment to review our contributing guidelines.

## License

This project is licensed under the DON'T BE A DICK PUBLIC LICENSE. See [LICENSE.md](LICENSE.md) for details.

## Acknowledgements

This project is powered by several open-source packages:

- [axios](https://github.com/axios/axios)
- [inquirer](https://github.com/SBoudrias/Inquirer.js)
- [table](https://github.com/gajus/table)
- [chalk](https://github.com/chalk/chalk)
- [clear](https://github.com/bahamas10/node-clear)
- [cli-progress](https://github.com/AndiDittrich/Node.CLI-Progress)
- [ora](https://github.com/sindresorhus/ora)

We thank the authors of these packages for their wonderful work.
