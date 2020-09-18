import React, {useState, useRef, createRef, useEffect} from 'react';
import './CourseForm.css';
import AnnotatedNumberField from './AnnotatedNumberField';
import AdvancedOptionsForm from './AdvancedOptionsForm';
import Button from '@material-ui/core/Button';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import {ABBR_TRANSLATIONS, NAN_ERROR_MESSAGE} from './../common/constants';

const CourseFormExpansion = (props) => {
  let [fieldErrors, setFieldErrors] = useState([]);
  let numberFieldRefs = useRef([]);
  useEffect(() => {
    let initErrors = [];
    for (let i = 0; i < props.selectedCourse['s1_cat_names'].length; i++) {
      initErrors[i] = "";
    }
    setFieldErrors(initErrors);
  }, [props.selectedCourse]);

  let catCount = props.selectedCourse['s1_cat_names'].length;
  numberFieldRefs.current = numberFieldRefs.current.slice(catCount - 1);
  for (let i = 0; i < catCount; i++) {
    numberFieldRefs.current[i] = createRef();
  }

  const numberFields = props.selectedCourse['s1_cat_names'].map((cat, i) => {
    return (
        <AnnotatedNumberField
        ref={numberFieldRefs.current[i]}
        fieldName={ABBR_TRANSLATIONS[cat]}
        errorMessage={fieldErrors[i]}
        key={i}
        />
    );
  });

  let [dropdownToggled, setDropdownToggled] = useState(false);
  const handleOnClick = () => {
    setDropdownToggled(!dropdownToggled);
  }

  const validateFields = () => {
    let fieldValues = {};
    let validForm = true;
    let updatedFieldErrors = [...fieldErrors];

    numberFieldRefs.current.forEach((ref, i) => {
      let grade = ref.current.valueAsNumber;
      if (isNaN(grade) || grade < 0 || grade > 100) {
          updatedFieldErrors[i] = NAN_ERROR_MESSAGE;
          validForm = false;

      } else {
        updatedFieldErrors[i]  = "";
        let num = parseFloat(grade)/100;
        fieldValues[props.selectedCourse['s1_cat_names'][i]] = num;
      }
    });
    setFieldErrors(updatedFieldErrors);

    if (!validForm) return;

    props.fetchDataFromAPI(props.selectedCourse.name, JSON.stringify(props.selectedCourse.successors), JSON.stringify(fieldValues));
  }

  return (
    <div>
      <div className='flexbox-wrapper-adjust'>
        <div className='flexbox-wrapper'>
          <div className='grade-field-wrapper'>
            {numberFields}
          </div>
          <div className='adv-options-wrapper'>
            <Button type="button" onClick={handleOnClick} endIcon={<ArrowDropDownIcon/>}> Additional Options </Button>
            {dropdownToggled && <AdvancedOptionsForm/>}
          </div>
        </div>
      </div>
      <div className='submit-button-wrapper'>
        <Button fullWidth size="large" type="button" variant="contained" color="primary" onClick={validateFields}>Analyze my Options</Button>
      </div>
    </div>
  );
}

export default CourseFormExpansion;
