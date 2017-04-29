#!/usr/bin/env bash

export RESULT_DIR=moto.courses.${TRAVIS_BUILD_NUMBER}
export SSHPASS=${SSH_PASS}
export ARCH_NAME=moto.courses.package.tgz
export SYMLINK_NAME=moto.courses
export PROCESS_NAME=moto.courses

mkdir ${RESULT_DIR}
shopt -s extglob
mv -f !(${RESULT_DIR}) ./${RESULT_DIR}
tar -czf ${ARCH_NAME} ${RESULT_DIR}
sshpass -e scp -C -o StrictHostKeyChecking=no ${ARCH_NAME} ${SSH_USER}@${SSH_IP}:${WEB_PATH}
sshpass -e ssh -tt -C ${SSH_USER}@${SSH_IP} << EOF
cd /;
cd ${WEB_PATH};
tar -xzf ./${ARCH_NAME} -C ./;
rm ./${ARCH_NAME};
ls -dt */ | tail -n +5 | xargs rm -rf;
if [ ! -f ".env" ]; then
    echo WEB_PATH=${WEB_PATH} >> .env;
fi
cd ${RESULT_DIR};
nvm install 7;
nvm use 7;
nvm alias default 7;
npm install;
npm run build;
cd ..;
rm -dRf ${SYMLINK_NAME};
ln -ds ${RESULT_DIR} ./${SYMLINK_NAME};
cd ./${SYMLINK_NAME};
pm2 stop ${PROCESS_NAME};
pm2 delete ${PROCESS_NAME};
pm2 start ./server/server.js --name="${PROCESS_NAME}" --watch;
logout;
EOF