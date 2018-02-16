FROM node:8.9

ENV HOME=/home/app

RUN useradd --user-group --create-home --shell /bin/false app \
  && mkdir $HOME/sp-backend-api

COPY . $HOME/sp-backend-api

RUN chown -R app:app $HOME/* \
  && chown -R app:app /usr/local

USER app
WORKDIR $HOME/sp-backend-api
RUN npm install \
  && NODE_ENV=production npm run build

ENV NODE_ENV=production

HEALTHCHECK --interval=60s --timeout=5s --start-period=5s --retries=3 CMD [ "node", "cli/health-check.js"]

CMD ["node", "_dist/src/app.js"]