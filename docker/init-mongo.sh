#!/bin/sh
echo "Connecting to MongoDB..."
mongosh <<EOF
use admin
db.auth("druz2105", "qwerty")
use dbName
db.createUser({user: "druz2105", pwd: "qwerty", roles: [{role: "dbOwner", db: "dbName"}]})
EOF
echo "User created successfully."