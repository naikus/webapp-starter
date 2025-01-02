// @ts-nocheck
// Brand directory is set at build time. See vite.config.js -> alias for how this works!
import BrandConfig from  "@branding/index.js";
import {version} from "../package.json";

const config = {
  appName: import.meta.env.APP_NAME || "React Starter",
  appVersion: version,
  appNs: import.meta.env.APP_NS || "reactstarter",
  apiServerUrl: import.meta.env.APP_API_SERVER_URL || "http://localhost:7001/api",
  branding: import.meta.env.APP_BRANDING,
  ...BrandConfig
};

export default config;