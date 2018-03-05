declare namespace NodeJS {
  interface Global {
    schema: any;
  }
}

declare module 'winston';

declare module '*.json' {
  const value: any;
  export default value;
}
