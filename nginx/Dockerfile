FROM node:20-alpine AS build

WORKDIR /app

# 의존성 파일 복사
COPY package.json yarn.lock ./
COPY packages/client/package.json ./client/

# 의존성 설치
RUN yarn install --frozen-lockfile

# 소스 파일 복사
COPY ./packages/client ./client

# 빌드
RUN yarn build:client 

# nginx 웹서버
FROM nginx:alphine

WORKDIR /

# nginx config 복사
COPY --from=build /app/nginx/nginx.conf /etc/nginx/templates/default.conf.template
# 빌드 파일 복사
COPY --from=build /app/client/dist ./usr/share/nginx/html

EXPOSE 80 443

CMD [ "nginx", "-g", "daemon off" ]