#!/bin/bash

# 返回值不为0， 停止执行并退出shell
set -e 

mongosh <<EOF
use admin
db.auth('$MONGO_INITDB_ROOT_USERNAME', '$MONGO_INITDB_ROOT_PASSWORD')
use tiny
db.createUser({
  user: '$MONGO_DB_USERNAME',
  pwd: '$MONGO_DB_PASSWORD',
  roles: [
    {
      role: 'readWrite',
      db: 'tiny',
    },
  ],
})

db.createCollection('works')
db.works.insertOne({
  id: 90,
  title: '1024',
  desc: '1024',
})
EOF
