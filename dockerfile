FROM node:14-alpine
RUN npm config set registry https://registry.npm.taobao.org
ADD . scp-driverbk-front
WORKDIR /scp-driverbk-front
RUN npm run docker
EXPOSE 8266
CMD ["npm", "run", "start"]