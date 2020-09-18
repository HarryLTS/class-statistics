import React, {useState, useEffect, useRef} from 'react';
import logo from './logo.svg';
import Header from './header/Header';
import NavBar from './navigation/NavBar';
import CourseForm from './course-form/CourseForm';
import OptionDisplayWindow from './option-display-window/OptionDisplayWindow';
import axios from "axios";
import {TESTING_API_URL, PRODUCTION_API_URL} from './common/constants';
import './App.css';

function App() {

  let [dataLibrary, setDataLibrary] = useState({});
  let [apiRequestPending, setApiRequestPending] = useState(false);
  let optionDisplayRef = useRef(null);


  useEffect(() => {
    const loadAvailableCourses = () => {
      const parseCourseAttributes = (course) => {
        ["successors", "s1_cat_names", "s2_cat_names"]
        .forEach((e) => {
          course[e] = JSON.parse(course[e]);
        })
        course["s1_cat_names"].push("TOTAL");
        course["s2_cat_names"].push("TOTAL");

        return course;
      }

      axios
      .get(TESTING_API_URL)
      .then(res => {
        let validCourses = [];
        res.data.forEach(e => {
          if (JSON.parse(e.successors).length > 0) validCourses.push(parseCourseAttributes(e));
        });

        setDataLibrary({
          "courses": validCourses
        });
      })
      .catch(err => {
        console.log(err);
        setTimeout(loadAvailableCourses, 3000);
      });
    }

    loadAvailableCourses();
  }, []);


  const fetchDataFromAPI = (originCourse, successorList, jsonGradeData) => {
    setApiRequestPending(true);
    let timer = setTimeout(() => {
      if (apiRequestPending) {
        setApiRequestPending(false);
      }
    }, 10000);

    axios
    .post(TESTING_API_URL,
    {
      "originCourse": originCourse,
      "successorList": successorList,
      "gradeData": jsonGradeData
    })
    .then(res => {
      clearTimeout(timer);
      setDataLibrary({...dataLibrary, displayData:res.data});
      optionDisplayRef.current.scrollIntoView({behavior: 'smooth'});
    })
    .catch(err => console.log(err));
  }


  return (
    <div className="App">
      <div className="primary-container">
        <NavBar/>
        <Header/>
        <CourseForm dataLibrary={dataLibrary} fetchDataFromAPI={fetchDataFromAPI}/>
        {dataLibrary.hasOwnProperty('displayData') &&
        <OptionDisplayWindow dataLibrary={dataLibrary} ref={optionDisplayRef}/>}
      </div>
    </div>
  );
}

export default App;
