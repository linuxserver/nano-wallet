# build stage
from lsiobase/alpine:3.11 as build

RUN \
 apk add \
	nodejs-npm
COPY ./ /build
RUN \
 cd /build && \
 npm install && \
 npm run development && \
 mkdir /buildout && \
 mv base/* /buildout/ 

# runtime stage
FROM lsiobase/cloud9:alpine

COPY --from=build /buildout /code
COPY root/ /
RUN \
 apk add --no-cache \
	nginx && \
 chown -R abc:abc \
	/c9sdk/build \
	/code \
	/c9bins
