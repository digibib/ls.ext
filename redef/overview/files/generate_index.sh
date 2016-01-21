#!/bin/bash
# simple wrapper to substitute ENV vars in html template and generate index.html
eval "cat <<EOF
$(cat /src/overview.tpl)
EOF
" 2> /dev/null > /etc/nginx/html/index.html 