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

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).