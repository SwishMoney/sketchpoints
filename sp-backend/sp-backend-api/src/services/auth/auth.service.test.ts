import { decodeUserFromToken } from './auth.service';

const SAMPLE_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2aWV3ZXIiOnsiaWQiOiI2' +
  'NmRjYmQzNi1mMDU3LTQ3MGYtYmFjYy1lNGVkY2ZmMmY4ZmQiLCJjcmVhdGVkR' +
  'GF0ZSI6IjIwMTctMDktMDZUMjE6MjA6NTQuNTY3WiIsImV4cGlyYXRpb25EYX' +
  'RlIjoiMjAyNS0xMS0yM1QyMToyMDo1NC41NjdaIiwidXNlciI6eyJfaWQiOiI' +
  '1OWIwNDBmMGVmNDk1ZTNmMjZkZTM2NTYiLCJlbWFpbCI6InRlc3RAdGVzdC5j' +
  'b20iLCJmaXJzdE5hbWUiOiJNaWNoYWVsIiwibGFzdE5hbWUiOiJDb3giLCJpZ' +
  'CI6IjU5YjA0MGYwZWY0OTVlM2YyNmRlMzY1NiJ9fSwiaWF0IjoxNTA0NzMyOD' +
  'U0LCJleHAiOjE3NjM5MzI4NTR9.mOIlFHEmmQMF9LsReMYMlfaEaR28ALGbdJ' +
  'DtfFljU5Q';

it('should decode a known token into a User', () => {
  const user = decodeUserFromToken(SAMPLE_TOKEN);
  expect(user).toMatchSnapshot();
});
