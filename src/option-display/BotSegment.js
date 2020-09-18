import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import './OptionDisplay.css';

const BotSegment = (props) => {
  const courseData = props.dataLibrary.displayData[props.courseName];

  const getHistogramOptions = () => {
    const options = {
      chart: {
        type: 'column'
      },
      title: {
        text: 'Performance of Similar Students in ' + props.courseName
      },
      subtitle: {
        text: ''
      },
      xAxis: {
        categories: courseData.HistogramBinNames,
        crosshair: true
      },
      yAxis: {
        min: 0,
        title: {
          text: ''
        }
      },
      tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
          '<td style="padding:0"><b>{point.y:.1f} students</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
      },
      plotOptions: {
        column: {
          pointPadding: 0,
          borderWidth: 0,
          groupPadding: 0,
          shadow: false
        }
      },
      series: [{
        name: 'Count',
        data: courseData.HistogramBinValues,
        borderWidth: 1,
        borderColor: '#2a4d69'
      }],
      colors: ['#4b86b4'],
      credits: {
        enabled:false
      }
    };
    return options;
  }
  return (
    <div className='bot-segment-wrapper'>
      <div className='histogram-wrapper'>
        <HighchartsReact
          containerProps={{ style: { height: "100%", width: "100%" } }}
          highcharts={Highcharts}
          options={getHistogramOptions()}
        />
      </div>
    </div>
  );
}

export default BotSegment;
