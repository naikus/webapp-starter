import React from "react";
import {useRouter} from "@components/router";
import Config from "@config";

const View = props => {
  const {context: {config, data}} = props,
      router = useRouter();

  /*
  useOnMount(() => {
    console.log("About view mounted");
    return () => {
      console.log("About view un-mounted");
    };
  });
  */

  return (
    <div className="view about-view">
      <style>
        {`
          .about-view .content {
            display: flex;
            align-items: center;
            padding-top: 100px;
            flex-direction: column;
          }
          .about-view .list {
            padding: 0;
            margin: 0;
            list-style-type: none;
            border-radius: 8px;
            margin-bottom: 16px;
            background-color: rgba(0,0,0,0.05);
          }
          .about-view .list li {
            padding: 8px 16px;
          }
          .about-view .list li.title {
            font-weight: bold;
            background-color: rgba(0,0,0,0.1);
            border-radius: 8px 8px 0 0;
          }
        `}
      </style>
      <div className="content _text-center">
        <h3>{Config.appName} ({Config.appVersion})</h3>
        <ul className="list">
          <li className="title">Server Info</li>
          <li>{data.description}</li>
          <li>{data.version}</li>
        </ul>
        <button className="primary inline" onClick={() => router && router.back()}>
          <i className="icon icon-arrow-left" /> Back
        </button>
      </div>
    </div>
  );
};
View.displayName = "AboutView";

export default View;