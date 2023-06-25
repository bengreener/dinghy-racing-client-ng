import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import controller from './controller/controller'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App controller={controller}/>
  </React.StrictMode>
);
