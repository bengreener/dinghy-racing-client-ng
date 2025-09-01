# Dinghy Racing Client  
  
Provides a user interface for the Dinghy Racing REST service application.

Provides:
- Creation of dinghy classes
- Race creation
- Race entry
- Start sequence (currently 10 minute, 5 minute, go sequence)
    - flag state indicator with time to raise/ lower
    - Race information and shorten course option
    - Actions sequence with timing and countdown
- Race console with race and boat information
    - Recording of lap times
    - Set scoring abbreviation against a boat
    - Shorten course
- Update competitor names
- Download race results

The build is intended to be run deployed as part of the Dinghy Racing Client Container application which provides user login support and connection properties to point to the REST and WebSocket web services.

Can be run without using the Dinghy Racing Client Container by modifying authorisation.js and dinghy-racing-properties.js.

## Development Dependencies
From version 2025.8.4.dev the project has been migrated to use [Vite](https://vite.dev/) + [Vitest](https://vitest.dev/) rather than Create React App.  
### Remove Create React App scripts
npm uninstall react-scripts  
### Install Vite
npm install vite @vitejs/plugin-react --save-dev
### Install Vitest and testing dependencies
npm install vitest --save-dev  
npm install jsdom- -save-dev  
npm install @testing-library/react @testing-library/jest-dom --save-dev  
### Setup ESLint
npm install eslint vite-plugin-eslint --save-dev  
npm install eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh --save-dev