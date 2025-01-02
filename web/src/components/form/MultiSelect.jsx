import React, {useState, useRef} from "react";
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
 * @typedef {{
 *  label: string,
 *  value: string,
 *  disabled: boolean
 * }} Option
 */

/**
 * @param {{
 *  comparator: (value: string, option: Option) => boolean,
 *  name: string,
 *  options: Array,
 *  value: Array,
 *  defaultValue: Array,
 *  onChange: EventListener,
 *  onInput: EventListener,
 *  disabled: boolean,
 *  className: string
 * }} props 
 */
function MultiSelect(props) {
    const {
      comparator = (value, option) => value === option.value,
      name,
      options,
      value,
      defaultValue,
      onChange,
      onInput,
      disabled,
      className = ""
    } = props,
    listElemRef = useRef(null),
    [data, setData] = useState(value || defaultValue || []),
    toggleSelectItem = e => {
      if(disabled) {return;}

      // If this is a keyup event, ignore all keys except Space
      if(e.type === "keyup" && e.code !== "Space") {return;}

      const {target} = e;
      if(target.hasAttribute("disabled")) {
        return;
      }
      const value = target.dataset ? target.dataset.value : target.getAttribute("data-value");

      let newData;
      if(data.indexOf(value) === -1) {
        newData = [...data, value];
      }else {
        newData = data.filter(item => item !== value);
      }
      setData(newData);
      // if we are part fo the form component, call the onInput prop function
      // @ts-ignore
      onInput && onInput(createEvent(newData));
      // @ts-ignore
      onChange && onChange(createEvent(newData));
    };

  if(value && value !== data) {
    setData(value);
    // onInput && onInput(createEvent(value || []));
    // onChange && onChange(createEvent(value || []));
  }

  // @Todo Mount useEffect for notifying form context if there is one.

  const items = options.map((option, index) => {
    const {value, disabled} = option,
        selected = data.some(item => comparator(item, option));

    return (
      <div key={`${value}_${index}`}
          tabIndex={index + 1}
          data-value={value}
          onClick={toggleSelectItem}
          onKeyUp={toggleSelectItem}
          className={`multi-select-item${selected ? " selected" : ""}`}
          // @ts-ignore
          disabled={disabled}>
        {option.label}
      </div>
    );
  });

  return (
    <div tabIndex={0} ref={listElemRef}
        data-name={name}
        className={`input multi-select ${disabled ? " disabled": ""} ${className}`}>
      {items}
    </div>
  );
}
MultiSelect.displayName = "MultiSelect";
MultiSelect.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string
    })
  ).isRequired,
  name: PropTypes.string,
  value: PropTypes.array,
  defaultValue: PropTypes.array,
  comparator: PropTypes.func,
  onInput: PropTypes.func, // only required for the Form component
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string
};

// registerFieldType("multi-select", MultiSelect);

export default MultiSelect;