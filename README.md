# MOTO.COURSES

Landing site for moto.courses.

## Installation

    npm install
    npm run build
    npm run server

## NGINX configuration

upstream motocourses {
        server 127.0.0.1:3004;
}

server {
        listen *:80;
        listen [::]:80;

        server_name moto.courses;
        proxy_set_header Host moto.courses;
        location / {
                rewrite ^(.*)$ https://moto.courses$1 permanent;
        }
}

server {
        listen 443 ssl;
        listen [::]:443 ssl;

        ssl on;
        ssl_certificate         path/domain.crt;
        ssl_certificate_key     path/domain.key;
    
        brotli                  on;
        brotli_comp_level       7;
        brotli_types            text/plain text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript application/javascript;  

        gzip                    on;
        gzip_comp_level         7;
        gzip_disable            "msie6";
        gzip_types              text/plain text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript application/javascript;

        error_log path/moto.courses.error.log; #p
        access_log path/moto.courses.access.log; #p

        server_name moto.courses www.moto.courses;

        add_header Strict-Transport-Security max-age=500;

        location / {
                proxy_pass  http://motocourses;
                proxy_redirect off;
                proxy_set_header Host $host ;
                proxy_set_header X-Real-IP $remote_addr ;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for ;
                proxy_set_header X-Forwarded-Proto https;
        }
}
