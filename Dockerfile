FROM node:20-alpine

WORKDIR /app

COPY ./project /app

RUN npm install

EXPOSE 3000

CMD ["/bin/bash"]
