# Node Boiler Plate

###### - To Run this project First Issue command in path

- change [app_name] in docker-compose file to your app name.
- `docker-compose up app_name`

###### - In case containers get starts but mongo authentication failed.

- Create .env file and .mongoEnv file to use env variables
- Update [dbName] in init-mongo.sh to  mongoEnv Name.
- `docker cp ./docker/init-mongo.sh mongodb:/mongo.sh`
- `docker exec -it mongodb bash ./mongo.sh`
- now start docker again by running `docker-compose up app_name`.
- To access this url `local-api.[appName].com` change appName to your app and edit hosts file add this domain.
- This time it should be connected, and you should be good to proceed.
- This is template for node in ts which includes basic user register and login flow with JWT token and API.