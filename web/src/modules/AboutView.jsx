import React, { useCallback } from "react";
import {useRouter} from "@components/router";
import Config from "@config";

const View = props => {
  const {context: {config, data = {}}} = props,
      {route, router} = useRouter(),
      goBack = useCallback(() => {
        if(!route.from.runtimePath) {
          // This view was loaded from the browser directly (not navigated through app)
          router.route("/");
        }else {
          router.back();
        }
      }, [route, router]);

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
      <style scoped>
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
            min-width: 40%;
          }
          .about-view .list li {
            padding: 8px 16px;
          }
          .about-view .list li.title {
            font-weight: bold;
            background-color: rgba(0,0,0,0.1);
            border-radius: 4px 4px 0 0;
          }
          .about-view .list li.error {
            color: var(--error-color);
          }
        `}
      </style>
      <div className="content _text-center">
        <h3>{Config.appName} ({Config.appVersion})</h3>
        <ul className="list">
          <li className="title">Server Info</li>
          <li className={`${data.error ? "error" : ""}`}>{data.error ? data.error.message : data.description}</li>
          <li>{data.error ? "" : `v${data.version}`}</li>
        </ul>
        <button className="primary inline" onClick={goBack}>
          <i className="icon icon-arrow-left" /> Back
        </button>
      </div>
    </div>
  );
};
View.displayName = "AboutView";

export default View;