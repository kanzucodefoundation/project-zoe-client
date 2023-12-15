# About project Zoe

Project Zoe is a church management centered on what's at the heart of all ministry - people. The platform simplifies the process of managing people and their relationships between each other and the church, keeping track of data across the organization and creates a foundation for adding new features that are specific to your church.

# The tech

This repo holds the Project Zoe church relationship management system (RMS) client. 
It was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Project Setup / Installation 🚀

1. Clone the repository:

> `git clone https://github.com/kanzucodefoundation/project-zoe-client.git`

2. Checkout to the Develop branch

> `git checkout develop`

3. Install dependencies with npm version 6.14.5:

> `npx npm@6.14.5 install`

4. Create a `.env` file based on the `.env.sample`.

> You should set the `REACT_APP_ENVIRONMENT=local` if you are running the app locally.

4. Finally, spin up the project with:
joe
> `npm start`

**Please Note:** 
- If you don't have `node.js` installed, check out this guide https://nodejs.org/en/
- This repo works with the server at https://github.com/kanzucodefoundation/project-zoe-server so be sure to set that up too.

## Available npm scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

-See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Contributing
Before making any contribution to this codebase, please read through this [contributing guide](https://github.com/kanzucodefoundation/project-zoe-client/blob/master/contributing.md).

## Commitizen friendly
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## Badges
![Build & Deploy workflow](https://github.com/kanzucodefoundation/project-zoe-client/actions/workflows/main.yml/badge.svg)

[![codecov](https://codecov.io/gh/kanzucodefoundation/project-zoe-client/branch/master/graph/badge.svg?token=4BBZPRO0YM)](https://codecov.io/gh/kanzucodefoundation/project-zoe-client)

## Github Actions
This repo is automatically deployed to the prod server using github actions. We create an `.env` file during the deployment process. Rather than add each environment variable to the file one by one, we copied a complete `.env` file and encrypted it using base64. We use the command:

```
openssl base64 -A -in .env -out .env.prod.encrypted
```

We then get the contents of `.env.prod.encrypted` and add them as a Github Action variable called `PROD_ENV_FILE`

## Learn More

- You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

- To learn React, check out the [React documentation](https://reactjs.org/).