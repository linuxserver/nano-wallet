# build stage
from lsiobase/alpine:3.11 as browserify

RUN \
 apk add \
	nodejs-npm
COPY ./ /build
RUN \
 cd /build && \
 npm install -g browserify && \
 npm install && \
 npm run development && \
 browserify wallet-logic.js -o base/bundle.js && \
 mkdir /buildout && \
 mv base/* /buildout/ 

# runtime stage
FROM lsiobase/cloud9:alpine

COPY --from=browserify /buildout /code
COPY root/ /
RUN \
 apk add --no-cache \
	nginx && \
 chown -R abc:abc \
	/c9sdk/build \
	/code \
	/c9bins
