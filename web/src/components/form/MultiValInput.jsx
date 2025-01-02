import React, {useState} from "react";
import PropTypes from "prop-types";

// import {registerFieldType} from "./Form";


function createEvent(value, ...targetAttrs) {
  return {
    target: {
      value,
      ...targetAttrs
    }
  };
}

/**
 * @param {{
 *  value: Array,
 *  onChange: EventListener,
 *  onInput: EventListener,
 *  placeholder: string,
 *  delimiter: string,
 *  disabled: Boolean
 *  defaultValue: Array
 * }} props
 */
function MultiValInput(props) {
  const {
    value, defaultValue, onChange, onInput, placeholder,
    delimiter = "," /*"/\s|\n|\r\n/"*/,
    disabled
  } = props;
  const [data, setData] = useState(value || defaultValue || []),
      removeValue = e => {
        if(disabled) {return;}
        const {target} = e,
            value = target.dataset ? target.dataset.value : target.getAttribute("data-value"),
            newData = data.filter(item => item !== value),
            event = createEvent(newData);

        setData(newData);
        // @ts-ignore
        onInput && onInput(event); // This is for when this component is part of a form
        // @ts-ignore
        onChange && onChange(event);
      },

      addValues = e => {
        // console.log(data);
        const {target} = e, inputValue = target.value.trim();
        if(!inputValue) return;

        const newValues = inputValue.split(delimiter),
            uniqueVals = newValues.reduce((acc, val) => {
              const trimmed = val.trim();
              if(trimmed && acc.indexOf(trimmed) === -1 && data.indexOf(trimmed) === -1) {
                acc.push(trimmed);
              }
              return acc;
            }, []);

        if(uniqueVals.length) {
          const newData = [...data, ...uniqueVals],
              event = createEvent(newData);
          // console.log(newData);
          setData(newData);
          // @ts-ignore
          onInput && onInput(event); // This is for when this component is part of a form
          // @ts-ignore
          onChange && onChange(event);
        }
        target.value = "";
      },

      handleKeyEnter = e => {
        if(e.keyCode === 13) {
          e.preventDefault();
          e.stopPropagation();
          addValues(e);
        }
      };

  if(value && value !== data) {
    setData(value);
  }

  const values = data.map(value => {
    const key = value;
    return (
      <span key={key} className={`value-item${disabled ? " disabled" : ""}`}>
        {value}
        <i data-value={value} className="icon icon-x-circle" onClick={removeValue} />
      </span>
    );
  });

  return (
    <div className={`multi-val-input`}>
      <div className="values">{values}</div>
      <input type="text" placeholder={placeholder} name="__input"
          className="value-input" onBlur={addValues} onKeyDown={handleKeyEnter} disabled={disabled} />
    </div>
  );
}
MultiValInput.displayName = "MultiValInput";
MultiValInput.propTypes = {
  delimiter: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.arrayOf(PropTypes.string),
  defaultValue: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
  onInput: PropTypes.func,
  disabled: PropTypes.bool
};

// registerFieldType("multi-val", MultiValInput);

export default MultiValInput;