// import logo from './logo.svg';
import './App.css';
import React, {  } from 'react';

import PlayerPresentation from './operator/Player';
import CpuPresentation from './operator/Cpu';

function GamePresentation () {
  return (
    <div className="main">
      <PlayerPresentation/>
      <CpuPresentation/>
    </div>
  );
}

// ========================================

// ReactDOM.render(<Game />, document.getElementById("root"));
export default GamePresentation;
