#!/bin/sh
# simple entrypoint that substitutes ENV vars in html template and generate index.html
eval "cat <<EOF
$(cat /src/overview.tpl)
EOF
" 2> /dev/null > /etc/nginx/html/index.html

# run nginx in foreground
nginx -g "daemon off;"
