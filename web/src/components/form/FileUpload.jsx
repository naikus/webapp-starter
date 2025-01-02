import React, {useCallback, useRef, useState} from "react";
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
 * 
 * @param {{
 *  file: File,
 *  onRemove: EventListener
 * }} props
 */
function FileItem(props) {
  const {file, onRemove} = props,
      {name, size, type} = file;
  return (
    <div key={name} className="file-item">
      <i className="icon-file" />
      <div className="file-details">
        <span className="file-name">{name}</span>
        <div className="file-meta">
          {type ? <span className="badge file-type">{type}</span> : null}
          <span className="badge file-size">{size}b</span>
        </div>
      </div>
      {/* @ts-ignore */}
      <button className="action icon icon-x" onClick={onRemove} />
    </div>
  );
}
FileItem.displayName = "FileItem";
FileItem.propTypes = {
  file: PropTypes.object.isRequired,
  onRemove: PropTypes.func
};


/**
 * @param {{
 *  value: Array,
 *  onChange: EventListener,
 *  onInput: EventListener,
 *  multiple: Boolean,
 *  accept: String,
 *  disabled: Boolean
 * }} props
 */
function FileUpload(props) {
  const {value, onChange, onInput, multiple, accept, disabled} = props,
      inputRef = useRef(), 
      NO_DISPLAY = {display: "none"},
      [data, setData] = useState(value || []),
      fireChange = useCallback(data => {
        const evt = createEvent(data);
        // @ts-ignore
        onInput && onInput(evt);
        // @ts-ignore
        onChange && onChange(evt);
      }, []),
      files = data.map(file => {
        return (
          <FileItem key={file.name}
              file={file}
              onRemove={() => {
                if(disabled) {
                  return;
                }
                const newData = data.filter(f => f.name !== file.name);
                setData(newData);
                fireChange(newData);
              }} />
        );
      }),
      handleChange = e => {
        const fileList = e.target.files;
        if(!fileList.length) {
          return;
        }

        const files = [];
        for(let i = 0; i < fileList.length; i++) {
          files.push(fileList[i]);
        }
        setData(files);
        fireChange(files);
      },
      removeAll = () => {
        if(disabled) {return;}
        setData([]);
        fireChange([]);
      };

  return (
    // @ts-ignore
    <div className="file-upload-input" disabled={disabled}>
      <input style={NO_DISPLAY} onChange={handleChange} 
          // @ts-ignore
          ref={inputRef} 
          type="file" 
          className="file-input"
          multiple={multiple}
          accept={accept}
          disabled={disabled} />
      <div className="fu-content">
        <div className="actions">
          {/* @ts-ignore */}
          <button className="action icon-folder" onClick={() => inputRef.current.click()} disabled={disabled} />
          <button className="action icon-trash" onClick={removeAll} disabled={data.length === 0 || disabled} />
        </div>
        <div className="files">
          {files}
        </div>
      </div>
    </div>
  );
}
FileUpload.displayName = "FileUpload";
FileUpload.propTypes = {
  accept: PropTypes.string,
  multiple: PropTypes.bool,
  value: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
  onInput: PropTypes.func,
  disabled: PropTypes.bool
};

// registerFieldType("file-upload", FileUpload);

export default FileUpload;