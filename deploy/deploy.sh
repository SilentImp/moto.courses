#!/usr/bin/env bash

export RESULT_DIR=services.${TRAVIS_BUILD_NUMBER}
export SSHPASS=${SSH_PASS}
export ARCH_NAME=server.package.tgz
export SYMLINK_NAME=services
export PROCESS_NAME=services

mkdir ${RESULT_DIR}
shopt -s extglob
mv -f !(${RESULT_DIR}) ./${RESULT_DIR}
tar -czf ${ARCH_NAME} ${RESULT_DIR}
sshpass -e scp -C -o StrictHostKeyChecking=no ${ARCH_NAME} ${SSH_USER}@${SSH_IP}:${WEB_PATH}
sshpass -e ssh -C ${SSH_USER}@${SSH_IP} << EOF
cd ${WEB_PATH};
tar -xzf ./${ARCH_NAME} -C ./;
rm ./${ARCH_NAME};
if [ ! -f ".env" ]; then
    echo GITHUB_SECRET_TOKEN=${GITHUB_SECRET_TOKEN} >> .env;
    echo TRELLO_KEY=${TRELLO_KEY} >> .env;
    echo TRELLO_TOKEN=${TRELLO_TOKEN} >> .env;
    echo TWITTER_CUSTOMER_KEY=${TWITTER_CUSTOMER_KEY} >> .env;
    echo TWITTER_CUSTOMER_KEY_SECRET=${TWITTER_CUSTOMER_KEY_SECRET} >> .env;
    echo TWITTER_TOKEN=${TWITTER_TOKEN} >> .env;
    echo TWITTER_TOKEN_SECRET=${TWITTER_TOKEN_SECRET} >> .env;
fi
cd ${RESULT_DIR};
npm install;
gulp javascript;
cd ..
rm -dRf ${SYMLINK_NAME}
ln -ds ${RESULT_DIR} ./${SYMLINK_NAME}
cd ./${SYMLINK_NAME}
pm2 stop ${PROCESS_NAME}
pm2 delete ${PROCESS_NAME}
pm2 start ./build/server.js --name="${PROCESS_NAME}" --watch
EOF