#!/bin/sh

export DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/mydb?schema=public"

git clone https://github.com/nvm-sh/nvm.git /home/msamhaou/goinfre/.nvm
mkdir /.npm-global
