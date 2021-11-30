declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // @ts-ignore
    crmApp: any;
  }
}

export default {
  tokenTimeOut: Number(window.crmApp.config.timeout),
};
