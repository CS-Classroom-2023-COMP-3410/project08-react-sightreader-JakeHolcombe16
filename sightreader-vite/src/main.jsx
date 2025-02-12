import React from 'react';
import ReactDOM from 'react-dom/client';
// import App from './App.jsx';
// import './index.css';
import './sightreader.js';
import '../public/css/sightreader.css'; // Adjust path if needed
import '../public/css/preface.css';
import '../public/css/bootstrap.min.css';
import '../public/css/flat-ui.min.css';

// Ensure scripts execute after the page loads
document.addEventListener("DOMContentLoaded", () => {
    console.log("Vite-powered Sightreader is initialized.");
});
ReactDOM.createRoot(document.getElementById('root')).render(
<React.StrictMode>
<App />
</React.StrictMode>
);

function loadMusicFile(filename) {
    fetch(`/music/${filename}`)
      .then(response => response.text())
      .then(data => {
        // Process the ABC file data
        console.log(data);
      })
      .catch(error => {
        console.error('Error loading music file:', error);
      });
  }
loadMusicFile()