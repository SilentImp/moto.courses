# MOTO.COURSES

Landing site for moto.courses

## Installation

    npm install
    npm run build
    npm run server

## NGINX configuration

    upstream moto.courses {
        server 127.0.0.1:3004;
        keepalive 8;
    }

    server {
        listen 0.0.0.0:80;
        server_name moto.courses;
        access_log /path/moto.courses.log;

        # pass the request to the node.js server with the correct headers
        # and much more can be added, see nginx config options
        location / {
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header Host $http_host;
            proxy_set_header X-NginX-Proxy true;
            proxy_pass http://moto.courses/;
            proxy_redirect off;
        }
    }