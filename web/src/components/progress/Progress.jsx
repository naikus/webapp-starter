import React from "react";
import PropTypes from "prop-types";
import "./style.less";

const calculatePercentage = (value, min = 0, max = 0) => {
      const val = value + Math.abs(min),
        diff = max - min;
      return val * 100 / diff;
    },
    Progress = props => {
      const {min = 0, max = 100, value, className = ""} = props,
        val = Number(value),
        indeterminate = isNaN(val),
        style = {
          width: `${indeterminate ? 20 : calculatePercentage(val, min, max)}%`
        };
      
      return (
        <div className={`progress ${indeterminate ? "indeterminate" : ""} ${className}`}>
          <div className="progress-track" style={style}></div>
        </div>
      );
    };
Progress.displayName = "Progress";
Progress.propTypes = {
  className: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  value: PropTypes.number
};

export default Progress;