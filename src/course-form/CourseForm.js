import React, {useState} from 'react';
import './CourseForm.css';
import TextField from "@material-ui/core/TextField";
import Autocomplete from '@material-ui/lab/Autocomplete';
import CourseFormExpansion from './CourseFormExpansion';

const CourseForm = (props) => {
  //props.dataLibrary.courseList;

  const courseNames = props.dataLibrary.hasOwnProperty("courses") ?
        props.dataLibrary.courses.map(e => e.name) :
        [];

  let [selectedCourse, setSelectedCourse] = useState(null);

  const handleInputChange = (e, value) => {
    if (value === "" || !props.dataLibrary.hasOwnProperty("courses")) {
      setSelectedCourse(null);
      return;
    }

    if (courseNames.includes(value)) {
      props.dataLibrary.courses.forEach(e => {
        if (e.name === value) setSelectedCourse(e);
      });
    }
  }

  const renderContent = () => {
    if (selectedCourse != null) {
      return (
        <CourseFormExpansion
        selectedCourse={selectedCourse}
        fetchDataFromAPI={props.fetchDataFromAPI}
        />
      );
    }
  }
  return (
    <form>
      <div className='course-form-wrapper'>
        <div>
          <h1 className='course-question'>What course are you currently taking?</h1>
          <Autocomplete
            options={courseNames}
            id="selection-textfield"
            onInputChange={handleInputChange}
            renderInput={params => (
              <TextField
                {...params}
                label="Course Name"
                margin="normal"
                variant="outlined"
                fullWidth
              />
            )}
          />
        </div>
        {renderContent()}
      </div>
    </form>
  );
}

export default CourseForm;
