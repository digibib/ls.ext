FROM connexiolabs/alpine-nginx:1.7.11

WORKDIR /etc/nginx/html

ADD ./files/overview.tpl /src/overview.tpl
ADD ./files/logo.png /etc/nginx/html/logo.png
ADD ./files/generate_index.sh /src/generate_index.sh

VOLUME ["/etc/nginx/html"]
ENTRYPOINT ["/src/generate_index.sh"]
