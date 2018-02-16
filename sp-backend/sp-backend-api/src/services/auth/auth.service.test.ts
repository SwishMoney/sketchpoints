import * as AuthService from './AuthService';

const secretKey = 'mysecret-will-be-replaced-later';

const SAMPLE_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2aWV3ZXIiOnsiaWQiOiI2NmRjYmQzNi1mMDU3LTQ3MGYtYmFjYy1lNGVkY2ZmMmY4ZmQiLCJjcmVhdGVkRGF0ZSI6IjIwMTctMDktMDZUMjE6MjA6NTQuNTY3WiIsImV4cGlyYXRpb25EYXRlIjoiMjAyNS0xMS0yM1QyMToyMDo1NC41NjdaIiwidXNlciI6eyJfaWQiOiI1OWIwNDBmMGVmNDk1ZTNmMjZkZTM2NTYiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJmaXJzdE5hbWUiOiJNaWNoYWVsIiwibGFzdE5hbWUiOiJDb3giLCJpZCI6IjU5YjA0MGYwZWY0OTVlM2YyNmRlMzY1NiJ9fSwiaWF0IjoxNTA0NzMyODU0LCJleHAiOjE3NjM5MzI4NTR9.mOIlFHEmmQMF9LsReMYMlfaEaR28ALGbdJDtfFljU5Q';

it('should decode a known token into a Viewer', () => {
  const viewer = AuthService.decodeViewerFromToken(SAMPLE_TOKEN);
  expect(viewer).toMatchSnapshot();
});

it('should create a public viewer if the token is not passed', () => {
  const viewer = AuthService.decodeViewerFromHeaders(secretKey, null);
  expect(viewer.isPublicUser()).toEqual(true);
});
