// import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect, useContext, useCallback } from 'react';
import ReactCSSTransitionGroup from 'react-transition-group';

const GameContext = React.createContext();

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max+1);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function Cookie(props) {
  // console.log("Cookie component"+props.value+"¥n----------");
  const iCookie = props.value[2];
  if (props.value[3]!=='none') {
    return (
      <div className={"cookie-"+iCookie+" cookies-disappear-"+props.value[3]}></div>
    );
  }
  return (
    <div className={"cookie-"+iCookie}></div>
  );
}

function Square(props) {
  // console.log("Square component"+props.value+"¥n----------");
  if (props.currentPos[0]===props.value[0] && props.currentPos[1]===props.value[1] && props.state==='slideCookies') {
    return (
      <div className="square cookie-slide-mode">
        <Cookie value={props.value}/>
      </div>
    );
  } else if (props.currentPos[0]===props.value[0] && props.currentPos[1]===props.value[1] && props.state==='moveCursor') {
    return (
      <div className="square cursor">
        <Cookie value={props.value}/>
      </div>
    );
  } else {
    return (
      <div className="square">
        <Cookie value={props.value}/>
      </div>
    );
  }
}

function Board (props) {
  console.log("Board component¥n----------");
  const values = useContext(GameContext);
  console.log(values);
  // useEffect(() => {
  //   console.log(currentPos+' '+props.cookieSlideFlg);
  // }, [currentPos, props.cookieSlideFlg]);

  return (
    <div>
      {values.table.map( (row) => 
        <div className="board-row" key={row}>
          {row.map( (cell) =>
            <Square key={cell[0]+cell[1]} value={cell} currentPos={values.currentPos} state={values.state}/>
          )}
        </div>
      )} 
    </div>
  );
}

function Game () {
  console.log("Game component¥n----------");
  const nRow = 5;
  const nColumn = 5;
  const kCookie = 6;

  const [currentPos, setCurrentPos] = useState([2,2]);
  const [table, setTable] = useState([]);
  // const [cookieSlideFlg, setCookieSlideFlg] = useState(0);
  const [state, setState] = useState('init');
  const [alignedFlgs, setAlignedFlgs] = useState([]);
  const [point, setPoint] = useState(0);

  const initTable = useCallback( () => {
    const table_tmp = []
    for (let rowNum = 0; rowNum < nRow; rowNum++) {
      const row = [];
      table_tmp.push(row);
      for (let columnNum = 0; columnNum < nColumn; columnNum++) {
        row.push([rowNum, columnNum, getRandomInt(1, kCookie), 'none']);
      }
    }
    return table_tmp;
  }, []);

  const resetAlignedFlgs = useCallback(()=>{
    setAlignedFlgs({
      either: false,
      row: [...Array(nRow).map(()=>false)],
      column: [...Array(nColumn).map(()=>false)]
    });
  }, []);

  const changeMode = (event) => {
    let keyName = event.key;
    if (keyName === " ") {
      if (state==='slideCookies') {
        setState(prev=>'moveCursor');
      } else if (state==='moveCursor') {
        setState(prev=>'slideCookies');
      }
    }
  }

  const moveCursor = useCallback( (event) => {
    // alert('カーソル');
    let keyName = event.key;
    if (keyName === "w") {
      setCurrentPos(currentPos=>[(currentPos[0]-1+nRow)%nRow, currentPos[1]]);
    } else if (keyName === "a") {
      setCurrentPos(currentPos=>[currentPos[0], (currentPos[1]-1+nRow)%nRow]);
    } else if (keyName === "s") {
      setCurrentPos(currentPos=>[(currentPos[0]+1)%nRow, currentPos[1]]);
    } else if (keyName === "d") {
      setCurrentPos(currentPos=>[currentPos[0], (currentPos[1]+1)%nRow]);
    }
  }, []);

  // https://cpoint-lab.co.jp/article/202011/17868/
  const slideCookies = useCallback( (event) => {
    // alert('クッキー');
    let keyName = event.key;
    let c_pos = [0, 0];
    let tableUpdate = [...table];   // スプレッド構文で取り出す
    let alignCheckFlg = true;
    if (keyName === "w") {
      c_pos = currentPos;
      const tmp = tableUpdate[0][c_pos[1]][2];
      for (const e of [...Array(nRow-1)].map((_, i) => i) ) {
        tableUpdate[e][c_pos[1]][2] = tableUpdate[e+1][c_pos[1]][2];
      }
      tableUpdate[nRow-1][c_pos[1]][2] = tmp;
    } else if (keyName === "a") {
      c_pos = currentPos;
      const tmp = tableUpdate[c_pos[0]][0][2];
      for (const e of [...Array(nColumn-1)].map((_, i) => i) ) {
        tableUpdate[c_pos[0]][e][2] = tableUpdate[c_pos[0]][e+1][2];
      }
      tableUpdate[c_pos[0]][nColumn-1][2] = tmp;
    } else if (keyName === "s") {
      c_pos = currentPos;
      const tmp = tableUpdate[nRow-1][c_pos[1]][2];
      for (const e of [...Array(nRow-1)].map((_, i) => i) ) {
        tableUpdate[nRow-1-e][c_pos[1]][2] = tableUpdate[nRow-e-2][c_pos[1]][2];
      }
      tableUpdate[0][c_pos[1]][2] = tmp;
    } else if (keyName === "d") {
      c_pos = currentPos;
      const tmp = tableUpdate[c_pos[0]][nColumn-1][2];
      for (const e of [...Array(nColumn-1)].map((_, i) => i) ) {
        tableUpdate[c_pos[0]][nColumn-1-e][2] = tableUpdate[c_pos[0]][nColumn-e-2][2];
      }
      tableUpdate[c_pos[0]][0][2] = tmp;
    }
    else {
      alignCheckFlg = false;
    }
    setTable(tableUpdate);          // スプレッド構文で取り出しておくとSetが楽
    // console.log('alignCheckFlg: '+alignCheckFlg+' isAligned: ');
    // console.log(isAligned());
    if (alignCheckFlg===true) {
      checkAligned();
    }
  }, [table, currentPos]);

  const checkAligned = useCallback( () => {
    let alignedFlgsUpdate = {...alignedFlgs};
    let flg = true;
    let allZeroFlg = true;
    for (const r of [...Array(nRow)].map((_, i) => i) ) {
      const comp = table[r][0][2];
      flg = true;
      allZeroFlg = true;
      for (const c of [...Array(nColumn)].map((_, j) => j) ) {
        allZeroFlg &= (table[r][c][2]===0 ? true : false );
        if (table[r][c][2]!==comp && table[r][c][2]!==0 ) {
          flg = false; break;
        }
      }
      if (allZeroFlg===0) {
        alignedFlgsUpdate.row[r] = flg;
        alignedFlgsUpdate.either |= flg;
      } else {
        alignedFlgsUpdate.row[r] = false;
      }
    }
    for (const c of [...Array(nColumn)].map((_, j) => j) ) {
      const comp = table[0][c][2];
      flg = true;
      allZeroFlg = true;
      for (const r of [...Array(nRow)].map((_, i) => i) ) {
        allZeroFlg &= (table[r][c][2]===0 ? true : false );
        if (table[r][c][2]!==comp && table[r][c][2]!==0 ) {
          flg = false; break;
        }
      }
      if (allZeroFlg===0) {
        alignedFlgsUpdate.column[c] = flg;
        alignedFlgsUpdate.either |= flg;
      } else {
        alignedFlgsUpdate.column[c] = false;
      }
    }
    setAlignedFlgs(alignedFlgsUpdate);
    if (alignedFlgsUpdate.either===1) {
      setState('animDisappear');
    } else if (alignedFlgsUpdate.either===0 && state==='gather') {
      setState('fill');
    }
  },[table, alignedFlgs, state]);

  const slideOutCookies = useCallback( () => {
    let tableUpdate = [...table];
    for (const [r, flg] of alignedFlgs.row.entries() ) {
      if (flg===true) {
        for (let c = 0; c < nColumn; c++) {
          tableUpdate[r][c][3] = 'row';
        }
      }
    }
    for (const [j, flg] of alignedFlgs.column.entries() ) {
      if (flg===true) {
        for (let r = 0; r < nRow; r++) {
          tableUpdate[r][j][3] = 'column';
        }
      }
    }
    setTable(tableUpdate);
  }, [table, alignedFlgs]);

  const resetSlideOutParams = useCallback( () => {
    let tableUpdate = [...table];
    for (const c of [...Array(nColumn)].map((_, j) => j) ) {
      for (const r of [...Array(nRow)].map((_, i) => i) ) {
        tableUpdate[r][c][3] = 'none';
      }
    }
    setTable(tableUpdate);
  }, [table]);

  const disappearCookies = useCallback( () => {
    let tableUpdate = [...table];
    for (const [i, flg] of alignedFlgs.row.entries() ) {
      if (flg===true) {
        for (let c = 0; c < nColumn; c++) {
          tableUpdate[i][c][2] = 0;
        }
        setPoint(point=>point+1);
      }
    }
    for (const [j, flg] of alignedFlgs.column.entries() ) {
      if (flg===true) {
        for (let r = 0; r < nRow; r++) {
          tableUpdate[r][j][2] = 0;
        }
        setPoint(point=>point+1);
      }
    }
    setTable(tableUpdate);
  }, [table, alignedFlgs]);

  // 要検討：たくさん消え去ったとき、入れ替えだと上手くいかない　座標変換できるといいな　一個でもクッキーが残っている行、列の番号を控え、indexをふり、変換
  const gatherRemainingCookies = useCallback( () => {
    let tableUpdate = [...table];
    let transition = { row: new Set(), column: new Set()};
    for (const c of [...Array(nColumn)].map((_, j) => j) ) {
      for (const r of [...Array(nRow)].map((_, i) => i) ) {
        if (tableUpdate[r][c][2]!==0) {
          transition.row.add(r);
          transition.column.add(c);
        }
      }
    }
    transition.row = Array.from(transition.row);
    transition.column = Array.from(transition.column);
    // r : 0,2,3,4
    // c : 0,1,3,4
    const rRowDel = nRow-transition.row.length;
    for (const c of [...Array(nColumn)].map((_, j) => j) ) {
      for (let r = nRow-1; r >= 0; r--) {
        // tableUpdate[r][c][2] = ( ( (r<transition.row.size) && (c<transition.column.size) ) ? tableUpdate[transition.row[r]][transition.column[c]][2] : 0 );
        tableUpdate[r][c][2] = ( ( ((r-rRowDel)>=0) && (c<transition.column.length) ) ? tableUpdate[transition.row[r-rRowDel]][transition.column[c]][2] : 0 );
      }
    }
    setTable(tableUpdate);
  }, [table]);

  const fillSquare = useCallback( () => {
    let tableUpdate = [...table];
    for (let r = 0; r < nRow; r++) {
      for (let c = 0; c < nColumn; c++) {
        if (tableUpdate[r][c][2]===0) {
          tableUpdate[r][c][2] = getRandomInt(1, kCookie);
        }
      }
    }
    setTable(tableUpdate);
  }, [table]);
  // https://www.codegrepper.com/code-examples/javascript/sleep+in+react+js
  const sleep = useCallback( (milliseconds) => {
    return new Promise( (resolve) => setTimeout(resolve, milliseconds))
  }, []);

  useEffect(()=>{
    console.log("Game component > init of status change ¥n--------------");
    switch(state){
      case 'init':
        setTable(initTable());
        resetAlignedFlgs();
        setState('moveCursor');
        break;
      case 'slideCookies':
        document.addEventListener('keyup', changeMode);
        document.addEventListener('keyup', slideCookies);
        return () => {
          document.removeEventListener('keyup', changeMode);
          document.removeEventListener('keyup', slideCookies);
        }
        // break;
      case 'moveCursor':
        document.addEventListener('keyup', changeMode);
        document.addEventListener('keyup', moveCursor);
        return () => {
          document.removeEventListener('keyup', changeMode);
          document.removeEventListener('keyup', moveCursor);
        }
        // break;
      case 'animDisappear':
        slideOutCookies();
        sleep(1000).then((res)=>{setState('aligned');});
        break;
      case 'aligned':
        resetSlideOutParams();
        disappearCookies();
        resetAlignedFlgs();
        setState('gather');
        break;
      case 'gather':
        gatherRemainingCookies();
        sleep(1000).then((res)=>{checkAligned()});
        break;
      case 'fill':
        fillSquare();
        setState('moveCursor');
        break;
      default:
        console.log('state error');
        break;
    }
  }, [state]);

  useEffect(()=>{
    console.log(state);
  }, [state]);

  return (
    <GameContext.Provider value={{state: state, currentPos: currentPos, table: table}}>
    <div className="main">
      <div className="game-myself">
        <div className="game-board">
          <Board/>
        </div>
        <div className="game-info">
          <p>{state}</p>
          <p>point: {point}</p>
        </div>
      </div>
      <div className="game-opponent">
        <div className="game-board">

        </div>
        <div className="game-info">

        </div>
      </div>
    </div>
    </GameContext.Provider>
  );
}

// ========================================

// ReactDOM.render(<Game />, document.getElementById("root"));
export default Game;
