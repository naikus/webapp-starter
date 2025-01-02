// Play nice with ts checks in vscode. See jsconfig.json
declare module '*.less' {
  const resource: {[key: string]: string};
  export = resource;
}