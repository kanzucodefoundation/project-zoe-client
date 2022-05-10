# About project Zoe

Project Zoe is a church management centered on what's at the heart of all ministry - people. The platform simplifies the process of managing people and their relationships between each other and the church, keeping track of data across the organization and creates a foundation for adding new features that are specific to your church.

# The tech

This repo holds the Project Zoe church relationship management system (RMS) client. 
It was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Getting started

Clone the repository:
`git clone git@github.com:kanzucode/angie-client.git`

Install the dependencies:
`npm install`

**PS:** If you don't have `npm` installed, check out this guide https://www.npmjs.com/get-npm

Finally, start the party:
`npm start`

This repo works with the server at https://github.com/kanzucode/angie-server so be sure to set that up too.

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

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

- You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

- To learn React, check out the [React documentation](https://reactjs.org/).

## Contributing
Before making any contribution to this codebase, please read through this [contributing guide](https://github.com/kanzucode/angie-server/blob/master/contributing.md).

## Commitizen friendly
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

https://github.com/kanzucodefoundation/project-zoe-client/actions/workflows/main.yml/badge.svg


## Github Action
This repo is automatically deployed to the prod server using github actions. We create an `.env` file during the deployment process. Rather than add each environment variable to the file one by one, we copied a complete `.env` file and encrypted it using base64. We use the command:

```
openssl base64 -A -in .env -out .env.prod.encrypted
```

We then get the contents of `.env.prod.encrypted` and add them as a Github Action variable called `PROD_ENV_FILE`