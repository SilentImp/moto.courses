# SERVICE.FRONTENDER.INFO

Set of micro-services for Fronteder Magazine

## Installation

    npm install
    npm run build
    node ./build/server.js

## NGINX configuration

    upstream service.frontender.info {
        server 127.0.0.1:3003;
        keepalive 8;
    }

    server {
        listen 0.0.0.0:80;
        server_name service.frontender.info;
        access_log /path/service.frontender.info.log;

        # pass the request to the node.js server with the correct headers
        # and much more can be added, see nginx config options
        location / {
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header Host $http_host;
            proxy_set_header X-NginX-Proxy true;
            proxy_pass http://service.frontender.info/;
            proxy_redirect off;
        }
    }
