#!/usr/bin/env bash

export RESULT_DIR=moto.courses.${TRAVIS_BUILD_NUMBER}
export SSHPASS=${SSH_PASS}
export ARCH_NAME=moto.courses.package.tgz
export SYMLINK_NAME=moto.courses
export PROCESS_NAME=motocourses

mkdir ${RESULT_DIR}
shopt -s extglob
mv -f -v !(${RESULT_DIR}) ./${RESULT_DIR}
mv -f -v ./{.[!.],}* ./${RESULT_DIR}
tar -czf ${ARCH_NAME} ${RESULT_DIR}
sshpass -e scp -C -o StrictHostKeyChecking=no ${ARCH_NAME} ${SSH_USER}@${SSH_IP}:${WEB_PATH}
sshpass -e ssh -tt -C ${SSH_USER}@${SSH_IP} << EOF
cd /;
cd ${WEB_PATH};
tar -xzf ./${ARCH_NAME} -C ./;
rm ./${ARCH_NAME};
ls -dt ${WEB_PATH}*/ | tail -n +5 | xargs rm -rf;
rm .env;
if [ ! -f ".env" ]; then
    echo WEB_PATH=${WEB_PATH} >> .env;
    echo STRIPE_API_KEY_SECRET=${STRIPE_API_KEY_SECRET} >> .env;
    echo STRIPE_API_KEY_SECRET_TEST=${STRIPE_API_KEY_SECRET_TEST} >> .env;
    echo MAILCHIMP_LIST=${MAILCHIMP_LIST} >> .env;
    echo MAILCHIMP_API_KEY_SECRET=${MAILCHIMP_API_KEY_SECRET} >> .env;
    echo MAILCHIMP_API_URL=${MAILCHIMP_API_URL} >> .env;
fi
cd ${RESULT_DIR};
nvm install 9;
nvm use 9;
nvm alias default 9;
npm install;
npm run build;
cd ..;
rm -dRf ${SYMLINK_NAME};
ln -ds ${RESULT_DIR} ./${SYMLINK_NAME};
cd ./${SYMLINK_NAME};
pwd
sudo pm2 stop ${PROCESS_NAME};
sudo pm2 delete ${PROCESS_NAME};
sudo pm2 start ./server/server.js --name="${PROCESS_NAME}" --watch;
sudo pm2 save;
logout;
EOF