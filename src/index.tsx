import React from 'react';
import ReactDOMClient from 'react-dom/client';
import App from './App';
import BattleShipsGame from './BattleShipsGame';
import reportWebVitals from './reportWebVitals';
import './stylesheets/index.css';


const container = document.getElementById('root')
if (!container) throw new Error("Missing root element")
const root = ReactDOMClient.createRoot(container)

root.render(
  <React.StrictMode>
    <BattleShipsGame />
  </React.StrictMode>,

);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
