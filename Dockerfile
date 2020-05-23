FROM lsiobase/cloud9:alpine

COPY ./ /code
COPY root/ /
RUN \
 apk add --no-cache \
	git \
	nodejs-npm && \
 cd /code && \
 npm install && \
 npm config set cache /config --global && \
 mkdir -p /applogs && \
 chown -R abc:abc \
	/applogs \
	/c9sdk/build \
	/code \
	/config \
	/c9bins
