# User API

Microsserviço de usuários para o Strongberry. Esse serviço é responsável pela autenticação e gerenciamento de usuários no sistema.

## Como rodar

Crie um arquivo `.env` com as variaveis de `example.env` e rode com o comando abaixo

```
docker-compose up
```

## Como testar

Para testar a aplicação rode o comando abaixo:

```
docker-compose run --rm -e NODE_ENV=test user_api bash -c  "yarn && yarn jest --coverage --forceExit --runInBand"
```