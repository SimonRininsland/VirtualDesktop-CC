FROM node:8
RUN mkdir /home/node/app && chmod -R 777 /home/node/app &&  \
cd /home/node/app/ && git clone https://github.com/SimonRininsland/VirtualDesktop-CC.git && \
cd /home/node/app/VirtualDesktop-CC/src/express && \
npm install
CMD ["npm start"]