import React from 'react';

const getPercentile = (totalLessThan, totalCount) => {
  let percentile = Math.round((totalLessThan/totalCount)*100);
  let percentileString = percentile.toString();
  if (percentile%10 === 1) {
    percentileString += "st"
  } else if (percentile%10 === 2) {
    percentileString += "nd"
  } else if (percentile%10 === 3) {
    percentileString += "rd"
  } else {
    percentileString += "th"
  }
  return percentileString;
}


export const getOverviewParagraph = (courseName, courseDisplayData) => {
  const standardError = courseDisplayData.TCriticalValue * ((courseDisplayData.MatchStDev * 100)/Math.sqrt(courseDisplayData.MatchCount));
  return (
    <div>
      <p className="displayBodyText"> People who performed similar to you in <span className="cdOriginCourseName">{courseDisplayData.OriginCourse}</span> scored on average <span className="cdCourseMean">{(courseDisplayData.CourseTotalMean * 100).toFixed(2)}% ± {standardError.toFixed(2)} with 95% confidence</span> in <span className="cdDestCourseName">{courseName}</span>, with a standard deviation of <span className="cdStDev">{(courseDisplayData.MatchStDev * 100).toFixed(2)}</span>. This average is higher than the average scores of <span className="cdGreaterThan">{courseDisplayData.Ranking}/{courseDisplayData.CourseCount}</span> total people who took this class, placing them into the <span className="cdPercentile">{getPercentile(courseDisplayData.Ranking, courseDisplayData.CourseCount)}</span> percentile.</p>
    </div>
  );
}

export const roundToTwo = (num) => {
    return +(Math.round(num + "e+2")  + "e-2");
}
