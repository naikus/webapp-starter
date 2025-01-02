/**
 * @typedef {import("./Form").FieldModel} Field
 */

/**
 * @typedef ValidationMesage
 * @property {boolean} valid
 * @property {string} [message]
 * @property {Array<string>} [revalidate]
 */

/**
 * @typedef {Object.<any, any>} ValidationOptions
 */

/**
 * 
 * @typedef {(this: ValidationOptions, value: string, field: Field, otherFields: Array<Field>) => ValidationMesage|undefined} ValidationRule
 */


/** @type {Object.<string, ValidationRule>} */
const rules = {
      /** @type {ValidationRule} */
      required(value, field) {
        let val = stringValue(value), {trim = true} = this;
        if(trim) {
          val = val.trim();
        }
        if(!val) {
          const message = this.message || `${field.label} is required`;
          return invalid(message);
        }
      },
      /** @type {ValidationRule} */
      length(value, field) {
        const {min, max} = this,
            val = stringValue(value),
            len = val.length;
        if(min && len < min) {
          const message =
              this.message || `${field.label} must be a minimum of ${min} characters`;
          return invalid(message);
        }
        if(max && len > max) {
          const message =
              this.message || `${field.label} must be a maxinum of ${max} characters`;
          return invalid(message);
        }
      },
      /** @type {ValidationRule} */
      number(value, field) {
        const {min = Number.MIN_VALUE, max = Number.MAX_VALUE} = this,
            strVal = stringValue(value),
            val = Number(strVal);
        if(isNaN(val) || val < min || val > max) {
          const message = this.message || `${field.label} is an invalid number`;
          return invalid(message);
        }
      },
      /** @type {ValidationRule} */
      email(value, field) {
        const reEmail = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-zA-Z]{2,6}(?:\.[a-zA-Z]{2,3})?)$/,
            val = stringValue(value);
        if(!reEmail.test(val)) {
          const message = this.message || `${field.label} must be a valid email`;
          return invalid(message);
        }
      },
      /** @type {ValidationRule} */
      fieldCompare(value, field, fields) {
        const {field: fieldName} = this, other = fields[fieldName];
        if(!other) {
          return;
        }
        if(other.value !== value) {
          const message = this.message || `${field.label} must be same as ${other.name}`;
          return invalid(message);
        }else {
          return {valid: true, revalidate: [fieldName]};
        }
      },
      /** @type {ValidationRule} */
      pattern(value, field) {
        const regExp = this.pattern, val = stringValue(value);
        if(!regExp.test(val)) {
          const message = this.message || `${field.label} must match pattern: ${regExp}`;
          return invalid(message);
        }
      }
    };

    /** @param {any} value */
    function stringValue(value) {
      return value === null || typeof(value) === "undefined" ? "" : String(value)
    }

    /** @param {string} message */
    function invalid(message) {
      return {valid: false, message}
    };

    /**
     * Builds a rule function from a rule name
     * @param {string} name The name of the validator
     * @param {object} options The options for the rule. All options are available on the 'this' property
     * of the validator rule function
     * @return {ValidationRule}
     */
    function ruleBuilder(name, options = {}) {
      const r = rules[name];
      /** @type {ValidationRule} */
      return (...args) => {
        return r.call(options, ...args);
      };
    };

export {
  rules,
  ruleBuilder
};
