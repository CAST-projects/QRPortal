FROM node:16-alpine

ENV NODE_ENV=production
ENV NPM_CONFIG_LOGLEVEL=info
ARG HOMEDIR=/usr/src/technologies

WORKDIR ${HOMEDIR}

COPY Technologies_*.taz .

RUN tar -xzf ${HOMEDIR}/Technologies_*.taz && rm ${HOMEDIR}/Technologies_*.taz
RUN mkdir -p /usr/src/technologies/logs
RUN mkdir -p /usr/src/technologies/temp
RUN chown node:root /usr/src/technologies/
USER node

EXPOSE 8080

CMD [ "node", "server/server.js"]