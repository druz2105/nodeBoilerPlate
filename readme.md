# Node Boiler Plate

###### - To Run this project First Issue command in path

- `docker-compose up app_name`

###### - In case containers get starts but mongo authentication failed.

- `docker cp ./docker/init-mongo.sh mongodb:/mongo.sh`
- `docker exec -it mongodb bash ./mongo.sh`
- now start docker again by running `docker-compose up app_name`.
- This time it should be connected and you should be good to proceed.
- This is template for node in ts which includes basic user register and login flow with JWT token and API.