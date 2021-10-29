// import logo from './logo.svg';
import './Board.css';
import React, { } from 'react';

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
  // const values = useContext(GameContext);
  // useEffect(() => {
  //   console.log(currentPos+' '+props.cookieSlideFlg);
  // }, [currentPos, props.cookieSlideFlg]);

  return (
    <div>
      {props.values.table.map( (row) => 
        <div className="board-row" key={row}>
          {row.map( (cell) =>
            <Square key={cell[0]+cell[1]} value={cell} currentPos={props.values.currentPos} state={props.values.state}/>
          )}
        </div>
      )} 
    </div>
  );
}

export default Board;