/* global */

/** @typedef {import("../components/form/rule-builder").ValidationRule} ValidationRule */
/** @typedef {import("../components/notifications").Notify} Notify */
/** @typedef {import("simple-router").Router} Router */

import React, {useCallback, useEffect, useState} from "react";
import PropTypes from "prop-types";
import {useRouter} from "@components/router";
import Actions from "@components/actionbar/Actions";
import Tabs, {useTabs} from "@components/tabs/Tabs";
import {useNotifications} from "@components/notifications";
import {
  Form,
  Field,
  FieldGroup,
  ruleBuilder as rb,
  MultiValInput,
  MultiSelect,
  FileUpload
} from "@components/form";

import "./style.less";
import { useOnMount } from "../components/util/hooks";

/**
 * @type {Record<string, Array<ValidationRule>>}
 */
const validationRules = {
  name: [
    rb("required", {message: "Name is required"})
    // rb("fieldCompare", {field: "email"})
    // rb("length", {min: 3, message: "Name must be at least 3 characters"})
  ],
  email: [
    // rb("fieldCompare", {field: "name"})
  ],
  // Validation for MultiValInut "hobbies"
  hobbies: [(value, field, fields) => {
    if(!value || value.length < 1) {
      return {valid: false, message: "At least 1 hobby is required"};
    }
    if(value.length > 4) {
      return {valid: false, message: "A maximum of 4 hobbies are allowed"};
    }
  }],
  // Validation for MultiSelect "sports"
  sports: [(value, field, fields) => {
    if(!value || value.length !== 2) {
      return {valid: false, message: "Choose any 2 sports"};
    }
  }]
};

// Register these with Form (to support validation, form data)
Form.registerFieldType("multival", MultiValInput);
Form.registerFieldType("multiselect", MultiSelect);
Form.registerFieldType("fileupload", FileUpload);


/**
 * @param {{
 *   value: string,
 *   defaultValue: string,
 *   onChange: function(event): void,
 *   onInput: function(event): void,
 *   disabled: boolean,
 * }} props
 */
function ThemeSwatch(props) {
  const {value, defaultValue, onChange, onInput, disabled} = props,
      properties = [
        "--accent-color",
        "--selection-bg-color",
        "--active-bg-color",
        "--primary-bg-color"
      ],
      [colors] = useState(new Map([
        ["red",    ["rgba(184, 63, 103, 1)", "rgba(184, 63, 103, 1)", "rgba(184, 63, 103, 0.3)", "rgba(184, 63, 103, 1)"]],
        ["orange", ["rgba(230, 143, 13, 1)", "rgba(230, 143, 13, 1)", "rgba(230, 143, 13, 0.2)", "rgba(230, 143, 13, 1)"]],
        ["blue",   ["rgba(46, 146, 196, 1)", "rgba(43, 139, 187, 1)", "rgba(55, 181, 242, 0.3)", "rgba(37, 124, 168, 1)"]],
        ["purple", ["rgba(65, 67, 106, 1)",  "rgba(65, 67, 106, 1)",  "rgba(65, 67, 106, 0.3)",  "rgb(65, 67, 106)"]]
      ])),
      [data, setData] = useState(value || defaultValue || ""),

      createEvent = (value, ...targetAttrs) => {
        return {
          target: {
            value,
            ...targetAttrs
          }
        };
      },
      resetColors = () => {
        const style = document.documentElement.style;
        properties.forEach(prop => {
          style.removeProperty(prop);
        });
        if(data !== "default") {
          setData("default");
          const event = createEvent("default");
          onInput && onInput(event);
          onChange && onChange(event);
        }
      },
      setColors = theme => {
        const style = document.documentElement.style,
            propVals = colors.get(theme);

        if(!propVals) {
          resetColors();
          return;
        }
        properties.forEach((prop, i) => {
          style.setProperty(prop, propVals[i]);
        });
      },
      setTheme = (event) => {
        const theme = event.target.getAttribute("data-name");
        if(data !== theme) {
          setData(theme);
        }
      }

  useEffect(function setTheme() {
    setColors(data);
    const event = createEvent(data);
    onInput && onInput(event);
    onChange && onChange(event);
  }, [data]);

  /*
  useOnMount(() => {
    return () => {
      resetColors();
    }
  });
  */

  return (
    <div tabIndex={0} 
      className={`swatches ${disabled ? " disabled": ""}`}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center"
    }}>
      {
        Array.from(colors).map((e, i) => {
          const [color, swatch] = e;
          // console.log(swatch);
          return <button className="swatch"
              key={`color-${color}`}
              tabIndex={0}
              title={color}
              disabled={disabled}
              style={{
                backgroundColor: swatch[0],
                border: color === data ? "2px solid" : "none",
                cursor: disabled ? "not-allowed" : "pointer"
              }}
              data-name={color}
              onClick={setTheme} />
        })
      }
      <button className="swatch"
          title="Reset colors"
          key={`color-reset`}
          data-name="default"
          tabIndex={0}
          disabled={disabled}
          style={{backgroundColor: "black"}}
          onClick={resetColors} />
    </div>
  );
}
Form.registerFieldType("themeswatch", ThemeSwatch);

const MyForm = props => {
  const {title} = props,
      [valid, setValid] = useState(false),
      // tabs = useTabs(),
      notify = useNotifications(),
      /** @type {{router: Router}} */
      {router} = useRouter(),
      [data, setData] = useState({
        theme: "red",
        name: "Dead Pool",
        sports: ["soccer", "hockey"],
        files: []
      });

  /*
  useOnMount(() => {
    notify.info(`Active tab is ${tabs.activeTab}`);
  });
  */

  return (
    <div className="my-form">
      <Actions target=".app-bar > .actions">
        <button title="Disabled if the form is invalid"
            className="action"
            onClick={() => notify({
              type: "info",
              content: "The form is valid!",
              timeout: 1000,
              position: "top"
            })}
            disabled={!valid}
            aria-label="Check Validity">
          <i className={`icon icon-zap`}></i>
        </button>
      </Actions>
      <Form title={title}
        rules={validationRules}
        className="my-form"
        onInit={form => {
          const {valid, data} = form;
          setValid(valid);
          setData(data);
        }}
        onChange={form => {
          // console.log(form);
          const {valid, data} = form;
          setValid(valid);
          setData(data);
        }}>
        <FieldGroup className="color-chooser" label="Choose Accent Color">
          <Field id="swatch" defaultValue={data.theme} name="theme" type="themeswatch" />
        </FieldGroup>
        <FieldGroup label="Personal Info" className="name-email" hint="Name &amp; email">
          <div className="row">
            <Field placeholder="Name" defaultValue={data.name} id="name" name="name" />
            <Field placeholder="Email" name="email" type="email" />
          </div>
          {/* @ts-ignore */}
          <Field defaultValue={"option1"} type="radio-group" name="option" options={[
            {label: "Option 1", value: "option1"},
            {label: "Option 2", value: "option2"}
          ]} />
          <Field id="subs" label="Subscribe to my newsletter" name="subscribe" type="checkbox" />
        </FieldGroup>
        <Field name="hobbies"
            placeholder="Enter multiple separated by comma"
            type="multival"
            label="Hobbies"
            // disabled={true}
            hint="Enter upto four"
          defaultValue={["Walking", "Web Development"]} />
        <Field name="sports" type="multiselect" label="Sports"
          hint="Choose all that apply"
          // disabled={true}
          // className="horizontal"
          defaultValue={data.sports}
          // @ts-ignore
          options={[
            {label: "Basketball", value: "basketball"},
            {label: "Soccer", value: "soccer"},
            {label: "Hockey (Disabled Randomly)", value: "hockey", disabled: Math.round(Math.random()) === 1}
          ]} />
        <Field name="files"
          type="fileupload"
          label="Basketball Files"
          // @ts-ignore
          multiple={true}
          defaultValue={data.files}
          disabled={data.sports && data.sports.indexOf("basketball") === -1} />

        <div className="row">
          <button className="my-button primary" disabled={!valid} onClick={() => {
            const json = JSON.stringify(
              data,
              (k, v) => {
                if(k === "files") {
                  return v ? v.map(f => f.name) : [];
                }
                return v;
              },
              "  "
            );
            notify({
              content: () => <pre style={{
                width: "100%",
                fontFamily: "inherit",
                fontSize: "0.7rem",
                maxHeight: "350px",
                overflowX: "auto"
              }}>{json}</pre>,
              type: "toast"
            });
          }}>
            <i className="icon-save" /> Submit
          </button>
          <button className="ghost" onClick={() => (
              router && router.back("/")
            )}>
            <i className="icon-home" /> Home
          </button>
        </div>
      </Form>
    </div>
  );
};
MyForm.displayName = "MyForm";

const View = props => {
  const {context: {config, data: {formTitle = "Sample Form"}}} = props,
      /** @type {{router: Router}} */
      {router} = useRouter();


  return (
    <div className="view form-view">
      <Actions target=".app-bar > .actions">
        <button className="back-button ghost"
            onClick={() => (router && router.back())}
            aria-label="Go Back">
          <i className="icon-arrow-left" />
        </button>
      </Actions>
      <div className="content">
        <Tabs>
          <Tabs.Nav activeTab="messages"
              onChange={(curr, prev) => {
                if(curr === "nav:about") {
                  router.route("/about");
                }
              }}>
            <Tabs.NavItem target="messages">Messages</Tabs.NavItem>
            <Tabs.NavItem target="form">Form</Tabs.NavItem>
            <Tabs.NavItem target="nav:about">About View</Tabs.NavItem>
          </Tabs.Nav>
          {/* <Tabs.Content name="nav:about"></Tabs.Content> */}
          <Tabs.Content name="messages">
            <div className="message">
              The 'Form' tab showcases an example of the form with support for 
              custom components like: 
              <ul>
                <li>MultiValInput</li>
                <li>MultiSelect</li>
                <li>FileUpload</li>
                <li>ColorSwatch</li>
              </ul>
              See (<code>src/components/form</code>) for these components.
            </div>
          </Tabs.Content>
          <Tabs.Content name="form">
            <MyForm title={formTitle} />
          </Tabs.Content>
        </Tabs>
      </div>
    </div>
  );
};
View.displayName = "FormView";
View.propTypes = {
  context: PropTypes.object
};

export default View;
