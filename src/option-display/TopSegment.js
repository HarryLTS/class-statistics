import React from 'react';
import './OptionDisplay.css';
import {getOverviewParagraph} from './../common/functional-consts';

const TopSegment = (props) => {
  const courseData = props.dataLibrary.displayData[props.courseName];

  return (
    <div className="top-segment-wrapper">
      <div className="normal-graph">
      </div>
      <div className="overview-paragraph">
        <h2>Expected Score: {(courseData.MatchTotalMean * 100).toFixed(2) + '%'}</h2>
        {getOverviewParagraph(props.courseName, courseData)}
      </div>
    </div>
  );
}

export default TopSegment;
