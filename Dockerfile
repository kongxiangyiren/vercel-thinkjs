# 打包
FROM node:alpine as build-stage
# 维护者信息
MAINTAINER kongxiangyiren
# 设置工作目录
WORKDIR /app
# 拷贝项目到app目录下
COPY ./data ./data
COPY ./md ./md
COPY ./pack ./pack
COPY ./src ./src
COPY ./view ./view
COPY ./www/githubcalendar.md ./www/githubcalendar.md
COPY ./www/robots.txt ./www/robots.txt
COPY ./.npmrc ./.npmrc
COPY ./.prettierrc.cjs ./.prettierrc.cjs
COPY ./apidoc.cjs ./apidoc.cjs
COPY ./build.mjs ./build.mjs
COPY ./config.js ./config.js
COPY ./env.d.ts ./env.d.ts
COPY ./package.json ./package.json
COPY ./production.js ./production.js
COPY ./tsconfig.json ./tsconfig.json
COPY ./tslint.json ./tslint.json
# 打包
RUN yarn build

# ======================== 上：打包  下：运行 ========================

# 设置基础镜像
FROM mhart/alpine-node:16.0.0
# 定义作者
MAINTAINER kongxiangyiren
# 设置工作目录
WORKDIR /app
# 复制依赖文件
COPY --from=build-stage /app/dist ./

# 安装依赖
RUN yarn install

# 设置环境
ENV DOCKER=true
# 暴露端口
EXPOSE 8360
# 运行项目
CMD [ "node", "/app/production.js" ]
