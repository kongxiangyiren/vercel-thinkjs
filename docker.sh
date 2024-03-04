#!/bin/bash
WORK_PATH='./'
cd $WORK_PATH
echo '先清除老代码'
git reset --hard origin/master
git clean -f
echo '拉取新代码'
git pull origin master
echo '编译docker镜像'
docker build -t vercel-thinkjs .
echo '停止并删除旧容器'
docker stop vercel-thinkjs
docker rm vercel-thinkjs
echo '一次性删除所有带有<none>标签的镜像'
docker images -f "dangling=true" -q | xargs docker rmi
echo '启动新容器'
docker run --restart=always -d -p 8360:8360 --name vercel-thinkjs vercel-thinkjs
