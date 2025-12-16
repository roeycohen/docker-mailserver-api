# docker-mailserver-api 

## :page_with_curl: About
docker-mailserver-api or dms-api is a sidecar container for https://github.com/docker-mailserver/docker-mailserver that allows managing object using a simple rest api.

## installation
* clone this repository into a sub-folder (e.g. dms-api) next to your original compose.yaml file
* set your own dms-api.dev based on the provided dms-api.example.env
* add the following service configuration to your docker.yaml:
```
  dms-api:
    build: ./dms-api/image
    restart: always
    working_dir: /app
    environment:
      - NODE_ENV=production
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./dms-api/:/app
    ports:
      - "3000:3000"
    command: sh -c "npm install && npm start"
```
* rerun the deployment

## api calls
* list emails: http::server:3000/email/list
* add new email account: http::server:3000/email/add?user=hello&password=123
* update email's password: http::server:3000/email/update?user=hello&password=123
* delete email: http::server:3000/email/del?user=hello

> [!TIP]
> you can set the default email domain in the DEFAULT_MAIL_DOMAIN variable, so that you can pass to the API only the account name - for example `james` instead `james@bond.com`  
