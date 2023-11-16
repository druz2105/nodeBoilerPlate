#!/bin/sh
echo "Connecting to MongoDB..."
mongosh <<EOF
use admin
db.auth("druz2105", "qwerty")
use natours
db.createUser({user: "druz2105", pwd: "qwerty", roles: [{role: "dbOwner", db: "natours"}]})
EOF
echo "User created successfully."