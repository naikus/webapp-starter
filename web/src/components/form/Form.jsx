import React, {useEffect, useReducer, useContext, useRef, useCallback} from "react";
import PropTypes from "prop-types";
import "./style.less";

/**
 * @typedef {Object} FormModel
 * @property {boolean} valid
 * @property {boolean} pristine
 * @property {any} data
 */

/**
 * @callback FormChangeListener
 * @param {FormModel} formModel
 */

/**
 * @typedef {Object} FieldModel
 * @property {string} name The field's name
 * @property {string} [label] The human friendly label
 * @property {any} [value=""] The field's value
 * @property {any} [defaultValue=""] The field's default value
 * @property {boolean} [pristine=true] Whether the field has been modified
 * @property {boolean} [valid=true] Whether the field is valid
 * @property {string} [message] The validation message
 * @property {boolean} [disabled=false] If the field is disabled
 * @property {boolean} [readonly=false] If the field is readonly
 */

/**
 * @typedef {Function} Validator
 * @param {*} value The value to validate
 * @param {Field} field The field being validated
 * @param {Object.<string, Field>} fields The other fields in the form
 */

/**
 * @typedef {Object} FormContext
 * @property {object} form The form state
 * @property {(model: FieldModel) => void} addField Adds a field to the form
 * @property {(model: FieldModel) => void} updateField Updates a field in the form
 * @property {(name: string) => FieldModel} getField Get the field by name
 * @property {(name: string) => void} removeField Removes a field from the form
 * @property {FieldRenderer} renderer The field renderer
 */

/**
 * @typedef {import("react").Reducer<FormState, ReducerAction>} FormReducer
 */


const VALID = {valid: true, message: ""},
    // objToString = Object.prototype.toString,
    // isArray = that => objToString.call(that).slice(8, -1) === "Array",
    isIos = () => /iPad|iPhone|iPod/.test(navigator.platform),

    /** @type {Object.<string, (props: object, context: FormContext) => JSX.Element>} */
    fieldTypes = {
      input(props) {
        return (
          <input type={props.type} {...props} />
        );
      },
      // /*
      checkbox(props) {
        const onInput = props.onInput,
            handler = e => {
              onInput && onInput({
                target: {
                  srcElement: e.target,
                  value: e.target.checked
                }
              });
            },
            events = isIos() ? {onChange: handler, onInput: null} : {onInput: handler},
            newProps = {
              ...props,
              ...events
              // checked: props.value,
              // value: props.value || props.defaultChecked
            };
            // console.log(newProps);
        return (
          <span className="checkbox-container">
            <input type="checkbox" {...newProps} />
            <span className="indicator"></span>
          </span>
        );
      },
      radio(props) {
        const handler = e => props.onInput && props.onInput({
              target: {
                value: e.target.checked
              }
            }),
            events = isIos() ? {onClick: handler} : {onInput: handler},
            newProps = {
              ...props,
              ...events
              // checked: props.value,
              // value: props.value || props.defaultChecked
            };
        return (
          <span className="radio-container">
            <input type="radio" {...newProps} />
            <span className="indicator"></span>
          </span>
        );
      },
      // */
      button(props) {
        return (
          <button {...props}>
            {props.children}
          </button>
        );
      },
      select(props) {
        return (
          <select {...props}>
            {props.children}
          </select>
        );
      },
      textarea(props) {
        return (
          <textarea {...props}>
            {props.children}
          </textarea>
        );
      },
      "radio-group": function radioGroup(props, context) {
        const {onInput, name, options = [], defaultValue, disabled: groupDisabled} = props,
          {radio} = fieldTypes,
          clickHandler = e => {
            const v = e.target.value;
            onInput && onInput({target: {value: v}});
          },
          items = options.map((o, i) => {
            const {label, value, disabled} = o,
            rProps = {
              // tabIndex: 0,
              name,
              value,
              disabled: groupDisabled || disabled,
              onChange: clickHandler,
              defaultChecked: value === defaultValue
            };
            return (
              <label className="radio-group-item" key={`${name}-${i}`}>
                {radio(rProps, context)}
                <span className="radio-group-label">{label}</span>
              </label>
            );
          });

        return (
          <fieldset className="radio-group" disabled={groupDisabled}>
            {items}
          </fieldset>
        );
      }
    },

    registerFieldType = (type, fieldImpl) => {
      fieldTypes[type] = fieldImpl;
    },
    
    /**
     * The form context
     * @type {React.Context<FormContext>}
     */
    // @ts-ignore
    FormContext = React.createContext(),

    useForm = () => {
      return useContext(FormContext);
    },

    useOnMount = (/** @type {function} */ callback) => {
      const ref = useRef();
      useEffect(() => {
        const {current} = ref;
        if(!current) {
          ref.current = callback() || (() => {});
        }
        return current;
      }, []);
    };

    /*
    useStateCallback = (initialstate) => {
      const [state, setState] = useState(initialstate),
        callbackRef = useRef(null),
        callbackSetState = useCallback((state, cb) => {
          callbackRef.current = cb;
          setState(state);
        }, []);

      useEffect(() => {
        // @ts-ignore
        const {current} = callbackRef;
        if(current) {
          // @ts-ignore
          callbackRef.current = null;
          // @ts-ignore
          current(state);
        }
      }, [state]);

      return [state, callbackSetState];
    };
    */


/**
 * @param {{
 *  label?: string,
 *  hint?: string,
 *  htmlFor?: string,
 *  value: any,
 *  type?: string
 * }} props 
 * @returns {import("react").ReactNode}
 */
function FieldLabel(props) {
  const {label, hint, htmlFor, value, type} = props;
  let comp = null;
  if(label) {
    comp = (
      <label className="label" htmlFor={htmlFor}>
        <span className="title">{label}</span>
        {hint ? <span className="hint">{hint}</span> : null}
        {type === "range" ? <span className="value">{value}</span> : null}
      </label>
    );
  }
  return comp;
}
FieldLabel.displayName = "FieldLabel";
FieldLabel.propTypes = {
  htmlFor: PropTypes.string,
  label: PropTypes.string,
  hint: PropTypes.string,
  value: PropTypes.any,
  type: PropTypes.string
};


function VMessage(props) {
  const {valid, message, pristine} = props;
  if(!valid && !pristine) {
    return (
      <span className="v-msg hint">{message}</span>
    );
  }
  return null;
}
VMessage.displayName = "VMessage";
VMessage.propTypes = {
  valid: PropTypes.bool,
  message: PropTypes.string,
  pristine: PropTypes.bool
};

/**
 * @param {{
 *  label?: string,
 *  hint?: string,
 *  className?: string,
 *  disabled?: boolean,
 *  children: React.ReactNode
 * }} props
 */
function FieldGroup(props) {
  const {label, hint, className = "", children, disabled} = props;
  return (
    <fieldset className={`field-group ${className}`} disabled={disabled}>
      {/* @ts-ignore */}
      <FieldLabel label={label} hint={hint} />
      <div className="field-group-content">
        {children}
      </div>
    </fieldset>
  );
}
FieldGroup.displayName = "FieldGroup";
FieldGroup.propTypes = {
  label: PropTypes.string,
  hint: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  children: PropTypes.node
};


/**
 * @callback FieldRenderer renderer function
 * @param {JSX.Element} field The field component
 * @param {FieldModel} model The field model
 * @param {object} props The field props
 * @returns {JSX.Element}
 */
function renderField(field, model, props) {
  const {name = "", type, label, hint, className = "", id} = props,
    {valid = true, message, pristine = true, value = ""} = model;

  return (
    <div className={`field-container ${name} field-container-${type} pristine-${pristine} valid-${valid} ${className}`}>
      {/* @ts-ignore */}
      <FieldLabel label={label}
          hint={hint}
          htmlFor={id}
          value={value}
          type={type} />
      {field}
      {/* @ts-ignore */}
      <VMessage valid={valid} message={message} pristine={pristine} />
    </div>
  );
}

/**
 * @param {{
 *  id?: string
 *  name: string,
 *  defaultValue?: any,
 *  defaultChecked?: boolean,
 *  value?: any,
 *  disabled?: boolean,
 *  readonly?: boolean,
 *  label?: string,
 *  onInput?: EventListener,
 *  type?: string
 *  placeholder?: string
 *  hint?: string
 * }} props
 * @returns {JSX.Element}
 */
function Field(props) {
  const {
        name,
        defaultValue,
        defaultChecked,
        value = (defaultValue || defaultChecked),
        label,
        onInput,
        disabled,
        readonly,
        // onChange,
        type = "text"
      } = props,
      typeRenderer = fieldTypes[type] || fieldTypes.input,
      formContext = useForm();

  useOnMount(function addToFormContext() {
    if(formContext) {
      const {form, addField} = formContext,
          thisField = form.fields[name];
      if(!thisField) {
        // console.log("[Field] adding field", name);
        addField({
          name, 
          value, 
          defaultValue, 
          label: label || name,
          disabled,
          readonly
        });
      }
    }
    return () => {
      if(formContext) {
        // console.log("[Field] removing field", name);
        const {removeField} = formContext;
        removeField(name);
      }
    };
  });

  useEffect(function updateModelWithNativeState() {
    if(!formContext) {
      return;
    }
    const fModel = formContext.getField(name);
    // Field model not added yet
    if(!fModel) {
      return;
    }
    const {value} = fModel;
    // console.log("Updating field", fModel, disabled);
    formContext.updateField({name, value, disabled, readonly});
  }, [disabled, readonly]);

  if(formContext) {
    const {form: {fields}, updateField, renderer} = formContext,
      fieldModel = fields[name] || {name, value, defaultValue, label},
      newProps = {
        ...props,
        onInput: e => {
          const {target} = e, {value/*, disabled, readonly*/} = target, {name} = props;
          // console.debug("Dispatching", name, value);
          // console.debug("On Input", name, target);
          updateField({name, value});
          onInput && onInput(e);
        }
        /*
        onChange: e => {
          const value = e.target.value, {name} = props;
          // console.log("Dispatching", name, value);
          updateField({name, value});
          onChange && onChange(e);
        }
        */
      },
      fieldComp = typeRenderer(newProps, formContext);

    if(type === "hidden") {
      return fieldComp;
    }
    return renderer(fieldComp, fieldModel, newProps);
  }else {
    return typeRenderer(props, formContext);
  }
}
Field.displayName = "Field";
Field.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.any,
  defaultValue: PropTypes.any,
  label: PropTypes.string,
  onInput: PropTypes.func
};



function validateField(field, rules, allFields) {
  const {name, value} = field,
      fieldRules = rules[name];

  // console.log("Validating", field);
  let result = VALID;
  if(!fieldRules) {
    return result;
  }
  fieldRules.some(r => {
    const v = r(value, field, allFields);
    // console.log("[vaidateField]", r, field.name, v);
    if(typeof (v) !== "undefined" && !v.valid) {
      // console.log("[validatefield]", v);
      result = v;
      return true;
    }else {
      result = v || VALID;
    }
    return false;
  });
  return result;
}

/*
function validateFields(fields, rules) {
  let valid = true;
  Object.values(fields).some(f => {
    const v = validateField(f, rules, fields);
    if(!v.valid) {
      valid = false;
      return true;
    }
  });
  return valid;
}
*/


/**
 * @typedef {"set-fields" | "add-field" | "update-field" | "remove-field"} ActionType
 * 
 * 
 * @typedef ReducerAction
 * @property {ActionType} type
 * @property {any} [payload]
 * 
 * @typedef FormState
 * @property {Object.<string, FieldModel>} fields
 * @property {boolean} [valid=true]
 * @property {boolean} [pristine=true]
 * @property {boolean} [initialized=false]
 * @property {Record<string, Validator>} rules
 */

/**
 * @param {FormState} state 
 * @param {ReducerAction} action 
 * @returns {FormState} The new state
 */
function formReducer(state, action) {
  /** @type {ReducerAction} */
  const {type, payload} = action,
      {fields, rules} = state;

  /** @type {FormState} */
  let newState;
  switch (type) {
    case "set-fields": {
      // console.debug("[reducer] set-fields");
      /** @type {Object<string, FieldModel>} */
      let flds = {},
          formValid = true;
      Object.values(payload).forEach(f => {
        const {valid, message} = validateField(f, rules, payload), {name} = f;
        flds[name] = {
          ...f,
          valid,
          message
        };
        if(!valid) {
          formValid = false;
        }
      });

      newState = {
        ...state,
        valid: formValid,
        initialized: true, // Used to track when all the fields have been added to the form
        fields: flds
      };
      break;
    }
    case "add-field": {
      // console.debug("[reducer] add-field", payload.name);
      const {name, value, label, disabled} = payload,
          {valid, message} = validateField(payload, rules, fields);
      // console.log("[reducer] add-field", payload);
      newState = {
        ...state,
        fields: {
          ...fields,
          [name]: {
            name,
            label,
            value,
            disabled,
            pristine: true,
            valid,
            message
          }
        }
      };
      break;
    }
    case "update-field": {
      // console.debug("[reducer] update-field", payload.name);
      const {fields} = state,
        {name, value, disabled, readonly} = payload, // Here payload is field model
        fld = fields[name],
        {valid, message, revalidate} = validateField({...fld, value}, rules, fields),
        newFields = {
          ...fields,
          [name]: {
            ...fld,
            value,
            valid,
            disabled,
            readonly,
            message,
            pristine: false
          }
        };

        if(revalidate) {
          // console.log("[reducer] re validating", revalidate);
          revalidate.forEach(fn => {
            const f = fields[fn];
            // console.log("[reducer] revalidating", f);
            if(f) {
              const {valid, message} = validateField(f, rules, newFields);
              newFields[fn] = {
                ...f,
                valid,
                message
              };
            }
          });
        }

        newState = {
          // valid: newValid, // valid ? validateFields(newFields, rules) : false,
          valid: Object.values(newFields).filter(f => !f.valid).length === 0,
          pristine: false,
          fields: newFields,
          rules
        };
      break;
    }
    case "remove-field": {
      // console.debug("[reducer] remove-field", payload);
      // here payload is the name of the field
      const {fields} = state, name = payload,
        newFields = {...fields};

      delete newFields[name];
      newState = {
        ...state,
        fields: newFields
      };
      break;
    }
    default:
      newState = state;
      break;
  }
  // console.log("[reducer] New State", action.type, newState);
  return newState;
}

/**
 * @param {{
 *  rules?: Record<string, Array<Validator>>,
 *  children: any,
 *  fieldRenderer?: FieldRenderer,
 *  className?: string,
 *  name?: string,
 *  title?: string,
 *  onChange?: FormChangeListener,
 *  onSubmit?: function
 * }} props
 */
function Form(props) {
  /**
   * The form state
   */
  const [
    /** @type {FormState} */
    form,
    /** @type {ReducerAction} */
    dispatch
  // @ts-ignore
  ] = useReducer(formReducer, {
      fields: {},
      valid: true,
      pristine: true,
      rules: props.rules || {}
    }),

    {initialized} = form,

    /**
     * A ref to the fields object that is used to set the fields when the form is mounted
     * This is used to track that all the fields have been added to the form. On mount, the
     * form will dispatch set-fields event to the reducer
     * @type {any} 
     */
    fieldsRef = useRef({}),

    getFormData = (form, fields = form.fields) => {
      const {valid, pristine} = form;
      return {
        valid,
        pristine,
        /*
        fields: {
          ...fields
        },
        */
        data: Object.keys(fields).reduce((acc, name) => {
          // console.log(fields[name]);
          const fld = fields[name], disabled = fld.disabled;
          if(disabled !== true) {
            acc[name] = fields[name].value;
          }
          return acc;
        }, {})
      };
    },

    /**
     * Handles form submit
     */
    handleSubmit = useCallback(e => {
      e.preventDefault();
      const {onSubmit} = props;
      if(typeof onSubmit === "function") {
        const {fields, valid, pristine} = form;
        onSubmit({
          valid,
          pristine,
          fields: {
            ...fields
          },
          data: Object.keys(fields).reduce((acc, name) => {
            acc[name] = fields[name].value;
            return acc;
          }, {})
        });
      }
      return false;
    }, []);

  // Set the fields when the form is mounted
  useEffect(() => {
    const {current} = fieldsRef;
    if(current) {
      fieldsRef.current = null;
      // @ts-ignore
      dispatch({type: "set-fields", payload: current});
    }
  }, []);

  useEffect(function fireFormChanged() {
    if(initialized) {
      // console.debug("Form initialized with fields", form.fields);
      const {onChange} = props;
      if(typeof onChange === "function") {
        onChange(getFormData(form));
      }
    }
  }, [initialized]);

  useEffect(function fireFormChange() {
    const {onChange} = props;
    // Only fire onchange if fields are set in state (not in fields ref, which means we are still loading)
    if(typeof onChange === "function"/* && !fieldsRef.current */) {
      const {pristine} = form;
      // Only fire if the form is not pristine (i.e. don't fire on mount or initially)
      if(!pristine) {
        onChange(getFormData(form));
      }
    }
  }, [form]);

  return (
    // @ts-ignore
    <FormContext.Provider value={/** @type {FormContext} */{
      form, 
      addField(field) {
        if(!fieldsRef.current) {
          // console.log("Add dispatch field", field.name);
          // @ts-ignore
          dispatch({type: "add-field", payload: field});
        }else {
          // console.log("Add fieldref field", field.name);
          fieldsRef.current[field.name] = field;
        }
      },
      updateField(field) {
        // @ts-ignore
        dispatch({type: "update-field", payload: field});
      },
      getField(name) {
        return form.fields[name];
      },
      removeField(name) {
        // console.log("[formcontext] removeField", name);
        // @ts-ignore
        dispatch({type: "remove-field", payload: name});
      },
      renderer: props.fieldRenderer || renderField
    }}>
      <form className={props.className} title={props.title} name={props.name} onSubmit={handleSubmit}>
        {/* eslint-disable-next-line react/prop-types */}
        {props.children}
      </form>
    </FormContext.Provider>
  );
}
Form.displayName = "Form";
Form.propTypes = {
  name: PropTypes.string,
  title: PropTypes.string,
  className: PropTypes.string,
  fieldRenderer: PropTypes.func,
  rules: PropTypes.object,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func
};

export {
  Form, Field, FieldGroup, registerFieldType
};