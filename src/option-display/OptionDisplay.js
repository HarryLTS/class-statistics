import React, {useState} from 'react';
import TopSegment from './TopSegment';
import MidSegment from './MidSegment';
import BotSegment from './BotSegment';
import './OptionDisplay.css';

const OptionDisplay = (props) => {
  console.log(props);
  return (
    <div className={props.topEle ? "" : "padded-display"}>
      <h1>{props.courseName}</h1>
      <h2>{props.courseName}</h2>
      <TopSegment courseName={props.courseName} dataLibrary={props.dataLibrary}/>
      <MidSegment courseName={props.courseName} dataLibrary={props.dataLibrary}/>
      <BotSegment courseName={props.courseName} dataLibrary={props.dataLibrary}/>
    </div>
  );
}

export default OptionDisplay;
