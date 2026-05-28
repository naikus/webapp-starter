import React, {useCallback, useContext, useEffect, useState, useRef} from "react";
import {useOnMount} from "../util/hooks";
import "./style.less";

const TabContext = React.createContext(),
    useTabs = function() {
      return useContext(TabContext);
    };

function createTabStore() {
  const store = new EventTarget();
  let currTab = null;
  return {
    onTabChange(listener) {
      store.addEventListener("tabchange", listener);
      return () => {
        store.removeEventListener("tabchange", listener);
      };
    },
    get activeTab() {
      return currTab;
    },
    selectTab(name, force = false) {
      if(currTab !== name || force) {
        const prevTab = currTab;
        currTab = name;
        store.dispatchEvent(new CustomEvent("tabchange", {
          detail: {
            current: currTab,
            previous: prevTab
          }
        }));
      }
    }
  }
}

/**
 * A root container for tab control
 * @param {{
 *  className: string
 * }} props 
 * @returns 
 */
function Tabs(props) {
  const {children, className = ""} = props,
      tabContext = useRef(createTabStore());

  return (
    <div className={`tabs ${className}`}>
      <TabContext.Provider value={tabContext.current}>
        {children}
      </TabContext.Provider>
    </div>
  );
}
Tabs.displayName = "Tabs";

/**
 * 
 * @param {{
 *  activeTab: string
 *  className: string,
 *  onChange: function(current: string, previous: string) => void
 * }} props 
 * @returns 
 */
Tabs.Nav = function(props) {
  const {children, className = "", activeTab = null} = props,
      tabContext = useTabs();

  if(!tabContext) {
    throw new Error("Tabs.Nav must be nested somewhere inside Tabs element");
  }

  useOnMount(function registerOnTabChange() {
    const {onChange} = props;
    if(typeof onChange === "function") {
      return tabContext.onTabChange(e => {
        const {current, previous} = e.detail;
        if(current !== previous) {
          onChange(current, previous);
        }
      });
    }
    return null;
  });

  useEffect(function handleActiveTabChange() {
    // set active tab here so that children know of it
    tabContext.selectTab(activeTab, true);
  }, [activeTab]);

  return (
    <div role="tablist" className={`tab-nav ${className}`}>
      {children}
    </div>
  );
}
Tabs.Nav.displayName = "Tab.Nav";


/**
 * @param {{
 *  target: string
 *  disabled: boolean
 *  className: string
 * }} props 
 * @returns 
 */
Tabs.NavItem = function(props) {
  const {target, children, className = "", disabled} = props,
      tabContext = useTabs(),
      [activeTab, setActiveTab] = useState(tabContext.activeTab),
      selectTab = useCallback(() => {
        if(disabled) {
          // console.debug("Tab is disabled", target);
          return;
        }
        // console.debug("[Tab.NavItem] Selecting tab", target);
        tabContext.selectTab(target);
      }, []);

  if(disabled && activeTab === target) {
    tabContext.selectTab(null);
  }
  // console.log("[Tabs.NavItem]", tabContext.activeTab);
  useOnMount(() => {
    return tabContext.onTabChange(e => {
      setActiveTab(e.detail.current);
    });
  });

  return (
    <button onClick={selectTab}
        role="tab"
        disabled={disabled}
        className={`tab-navitem ${className} ${activeTab === target ? "selected" : ""}`}>
      {children}
    </button>
  );
}
Tabs.NavItem.displayName = "Tabs.NavItem";


/**
 * Tabs content panel. The name should be same as the "target" property in Tabs.NavItem
 * @param {{
 *  name: string
 * }} props 
 * @returns 
 */
Tabs.Content = function(props) {
  const {name, children} = props,
      tabContext = useTabs(),
      [isActive, setIsActive] = useState(tabContext.activeTab === name);

  useOnMount(() => {
    // Sbow if currently active
    setIsActive(tabContext.activeTab === name);
    // Also register for any tab changes
    return tabContext.onTabChange(e => {
      setIsActive(e.detail.current === name);
    });
  });

  if(!isActive) {
    return null;
  }

  return (
    <div role="tabpanel" className="tab-content">
      {children}
    </div>
  );
}
Tabs.Content.displayName = "Tabs.Content";

export default Tabs;