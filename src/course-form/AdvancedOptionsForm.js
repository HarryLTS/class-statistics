import React, {useState} from 'react';
import TextField from "@material-ui/core/TextField";
import './CourseForm.css';

const AdvancedOptionsForm = (props) => {
  return (
    <div>
      <div className='adv-options-textfield'>
        <TextField label="Total Grade Buffer" type='number'/>
      </div>
      <div className='adv-options-textfield'>
      <TextField label="Category Grade Buffer" type='number'/>
      </div>
      <div className='adv-options-textfield'>
      <TextField label="Histogram Bin Count" type='number'/>
      </div>
      <div className='adv-options-textfield'>
      <TextField label="Confidence Level" type='number'/>
      </div>
    </div>
  );
}

export default AdvancedOptionsForm;
