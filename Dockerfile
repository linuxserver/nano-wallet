# build stage
from lsiobase/alpine:3.11 as browserify

RUN \
 apk add \
	nodejs-npm
RUN \
 npm install -g browserify && \
 npm install nanocurrency
COPY /wallet-logic.js /wallet-logic.js
COPY /base /buildout
RUN \
  browserify /wallet-logic.js -o /bundle.js && \
  mv /bundle.js /buildout/

# runtime stage
from lsiobase/alpine:3.11

COPY --from=browserify /buildout /wallet
COPY root/ /
RUN \
 apk add --no-cache \
	nginx
