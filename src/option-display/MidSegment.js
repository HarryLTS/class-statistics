import React from 'react';
import './OptionDisplay.css';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { roundToTwo } from './../common/functional-consts';
import { ABBR_TRANSLATIONS } from './../common/constants';

const MidSegment = (props) => {
  const courseData = props.dataLibrary.displayData[props.courseName];
  const useStyles = makeStyles({
    table: {
      minWidth: 300,
    },
    container: {
      maxHeight: 400,
    },
  });
  const classes = useStyles();

  const getBarChartOptions = () => {
    const getSeriesData = () => {
      let seriesData = [{
          name: 'Overall Grade',
          data: [roundToTwo(courseData.MatchTotalMean * 100), roundToTwo(courseData.CourseTotalMean * 100)]
      }, {
          name: 'Semester 1 Grade',
          data: [roundToTwo(courseData.MatchS1Mean * 100), roundToTwo(courseData.CourseS1Mean * 100)]
      }, {
          name: 'Semester 2 Grade',
          data: [roundToTwo(courseData.MatchS2Mean * 100), roundToTwo(courseData.CourseS2Mean * 100)]
      }];
      return seriesData;
    }
    const options = {
        chart: {
            type: 'bar',
        },
        title: {
            text: 'Student Performance by Group'
        },
        xAxis: {
            categories: ['Students Similar to You', 'All Students'],
            title: {
                text: null
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Grade Performance (%)',
                align: 'high'
            },
            labels: {
                overflow: 'justify'
            }
        },
        tooltip: {
            valueSuffix: '%'
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true
                }
            }
        },

        credits: {
            enabled: false
        },
        series: getSeriesData()
    };
    return options;
  }

  const renderTable = () => {
    const getRows = () => {
      function createData(category, matchGrade, courseGrade) {
        return { category, matchGrade, courseGrade };
      }

      let rows = [
        createData('Overall Grade', roundToTwo(courseData.MatchTotalMean * 100), roundToTwo(courseData.CourseTotalMean * 100)),
        createData('Semester 1 Grade', roundToTwo(courseData.MatchS1Mean * 100), roundToTwo(courseData.CourseS1Mean * 100)),
        createData('Semester 2 Grade', roundToTwo(courseData.MatchS2Mean * 100), roundToTwo(courseData.CourseS2Mean * 100)),
      ];

      const s1CatNames = Object.keys(courseData.CourseS1CatMeans);
      const s2CatNames = Object.keys(courseData.CourseS2CatMeans);

      for (const cat of s1CatNames) {
        rows.push(
          createData('Semester 1 ' + ABBR_TRANSLATIONS[cat] + ' Grade', roundToTwo(courseData.MatchS1CatMeans[cat] * 100), roundToTwo(courseData.CourseS1CatMeans[cat] * 100))
        );
      }

      for (const cat of s2CatNames) {
        rows.push(
          createData('Semester 2 ' + ABBR_TRANSLATIONS[cat] + ' Grade', roundToTwo(courseData.MatchS2CatMeans[cat] * 100), roundToTwo(courseData.CourseS2CatMeans[cat] * 100))
        );
      }

      return rows;
    }

    const rows = getRows();
    return (
      <TableContainer component={Paper} className={classes.container}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Category</TableCell>
              <TableCell align="right">Similar Students (%)</TableCell>
              <TableCell align="right">All Students (%)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row => (
              <TableRow key={row.category}>
                <TableCell component="th" scope="row">
                  {row.category}
                </TableCell>
                <TableCell align="right">{row.matchGrade}</TableCell>
                <TableCell align="right">{row.courseGrade}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <div className='mid-segment-wrapper'>
      <div className='mid-left-content'>
        <div className='bar-chart-desc-wrapper'>
          <p>
            Students similar to you scored close to the class average in both semesters. A bar graph is shown below:
          </p>
        </div>
        <div className='bar-chart-wrapper'>
          <HighchartsReact
            containerProps={{ style: { height: "100%" } }}
            highcharts={Highcharts}
            options={getBarChartOptions()}
          />
        </div>
      </div>
      <div className='mid-right-content'>
        <div className='table-wrapper'>
          {renderTable()}
        </div>
        <div className='table-desc-wrapper'>
          <p>
            The above table shows comparisons between categories.
          </p>
        </div>
      </div>
    </div>
  );

}

export default MidSegment;
