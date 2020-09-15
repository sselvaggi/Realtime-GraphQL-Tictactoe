import { GraphQLModule } from '@nestjs/graphql';
import { Module } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { GameResolvers } from './app.resolvers';
import * as RedisMock from 'redis-mock';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { join } from 'path';

@Module({
  imports: [
    GraphQLModule.forRoot({
      playground: true,
      typePaths: ['./**/*.graphql'],
      definitions: {
        path: join(process.cwd(), 'src/graphql.ts'),
      },
      installSubscriptionHandlers: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    GameResolvers,
    {
      provide: 'PUB_SUB',
      useFactory: () => {
        const options = {
          host: process.env.REDIS_URI,
          port: process.env.REDIS_PORT,
        };

        return new RedisPubSub({
          publisher: RedisMock.createClient(),
          subscriber: RedisMock.createClient(),
        });
      },
    },
  ],
})
export class AppModule {}
