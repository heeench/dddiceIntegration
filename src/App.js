import React from 'react';
import './App.css'
import DiceRoller from './DiceRoller';
import StreamPlayer from './components/StreamPlayer.js';

const App = () => {
  return (
    <div>
      <DiceRoller />
      <StreamPlayer/>
    </div>
  );
}

export default App;
