import { GraphQLModule } from '@nestjs/graphql';
import { Module } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { PingPongResolvers } from './ping-pong.resolvers';
import * as Redis from 'ioredis';
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
    PingPongResolvers,
    {
      provide: 'PUB_SUB',
      useFactory: () => {
        const options = {
          host: process.env.REDIS_URI,
          port: process.env.REDIS_PORT,
        };

        return new RedisPubSub({
          publisher: new Redis(options),
          subscriber: new Redis(options),
        });
      },
    },
  ],
})
export class AppModule {}
