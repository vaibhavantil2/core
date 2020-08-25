# Start Of Day

This is a demo Glue42 Core project, consisting of five Angular applications, created using the standard Angular CLI and Glue42 Core CLI.

## Starting

If you would like to run the project you need to:
- npm install
- npm start

This will build all applications (in dev mode) and will start the Glue42 Core CLI server at port `4242`.

## Contributing

If you would like to edit the project you need to:
- npm install
- npm run build:allW
- npm run serve (in a new terminal)

This will build all applications with the `--watch` flag, meaning any change in any of the applications will trigger a quick rebuild and at the same time the Glue42 Core CLI server serves the project at port `4242`.

## Deployment

If you would like to build the project for production you need to:
- npm install
- npm run build:prod

This will produce a `/dist` directory, which contains all applications, Glue42 Core assets and common assets. This directory is ready for deployment.