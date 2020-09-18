import React, {useState} from 'react';
import './CourseForm.css';
import TextField from "@material-ui/core/TextField";
import {TEXTFIELD_HEIGHT, TEXTFIELD_LABEL_OFFSET} from './../common/constants';

const AnnotatedNumberField = (props, ref) => {
  let [focused, setFocused] = useState(false);

  const handleBlur = (e) => {
    if (e.target.value === "") setFocused(false);
  }
  const handleFocus = () => {
    setFocused(true);
  }

  return (
    <div className='number-field'>
      <h3> Semester 1 {props.fieldName} Grade</h3>
      <TextField
      inputRef={ref}
      helperText = {props.errorMessage}
      error = {props.errorMessage === "" ? false : true}
      label="Grade%"
      variant="outlined"
      type="number"
      fullWidth
      onBlur={handleBlur}
      onFocus={handleFocus}
      style={{ "height": TEXTFIELD_HEIGHT }}
      InputLabelProps={{
        style: {
           "height": TEXTFIELD_HEIGHT,
          ...( !focused && {top: `${TEXTFIELD_LABEL_OFFSET}px` }),
        },
      }}
      inputProps={{
          style: {
             "height": TEXTFIELD_HEIGHT,
            padding: '0 14px',
          }
      }}
      />
    </div>
  );
}

export default React.forwardRef(AnnotatedNumberField);
