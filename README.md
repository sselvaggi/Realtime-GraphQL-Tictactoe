# TicTacToe GraphQL + Typescript

## Installation

```bash
$ npm install
```

Copy or rename the .env.sample to .env

## Running the app

Start Redis in localhost:6379

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

And go to http://localhost:3000/graphql

1- Use GrahQL mutation 'createGame' to receive gameId and your token to play

2- If you've created a multiplayer game share the gameId with your partner

3- (Your partner) use the graphQL mutation joinToGame passing the gameId
Now each of you have a token to identify and make moves in this game.

4- (Both player) must subcribe to 'watch' graphQL subscription to see the game

5- To make moves you have pass 'token' and
any of the folling numbers as 'slotTarget' to 'makeMove' graphQL mutation.

<div align="center">
1 | 2 | 3
<hr>
4 | 5 | 6
<hr>
7 | 8 | 9
</div>

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

Nest is [MIT licensed](LICENSE).
