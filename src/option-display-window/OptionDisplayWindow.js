import React, {useState} from 'react';
import './OptionDisplayWindow.css';
import OptionDisplay from './../option-display/OptionDisplay'

const OptionDisplayWindow = (props, ref) => {
  console.log(props);
  const MIN_COUNT_TO_DISPLAY = 5;
  const renderOptionDisplays = () => {
    let validCourses = [];
    let invalidCourses = [];
    for (let key in props.dataLibrary.displayData) {
      if (props.dataLibrary.displayData[key].matchCount < MIN_COUNT_TO_DISPLAY) validCourses.push(key);
      else invalidCourses.push(key);
    }

    const nextCourses = validCourses.concat(invalidCourses).map((courseName, i) => {
      return (
        <OptionDisplay courseName={courseName} key={i} dataLibrary={props.dataLibrary} topEle={i == 0}/>
      );
    });
    return nextCourses;
  }
  return (
    <div className="option-display-window" ref={ref}>
      {renderOptionDisplays()}
    </div>
  );
}

export default React.forwardRef(OptionDisplayWindow);
