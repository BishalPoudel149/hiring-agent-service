import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModule } from './application/application.module';
import { JobPostingModule } from './job-posting/job-posting.module';
import { ApplicationEvaluationModule } from './application-evaluation/application-evaluation.module';
import { McpModule } from './mcp/mcp.module';
import { JobApplication } from './entities/job-application.entity';
import { JobPosting } from './entities/job-posting.entity';
import { ApplicationEvaluation } from './entities/application-evaluation.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const url = process.env.DATABASE_URL;
        const isLocalhost = (process.env.DB_HOST || 'localhost') === 'localhost';

        if (url) {
          console.log('--------------------------------------------------');
          console.log('Using DATABASE_URL from environment.');
          console.log(`URL: ${url}`);
          console.log('--------------------------------------------------');
          return {
            type: 'postgres',
            url,
            autoLoadEntities: true,
            synchronize: true,
            ssl: url.includes('neon.tech') ? { rejectUnauthorized: false } : false
          };
        }

        const config = {
          type: 'postgres' as const,
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USER || 'bishal',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'neondb',
          entities: [JobApplication, JobPosting, ApplicationEvaluation],
          synchronize: true,
          ssl: isLocalhost ? false : { rejectUnauthorized: false }
        };
        console.log('--------------------------------------------------');
        console.log('Connecting to Database:');
        console.log(`Host: ${config.host}`);
        console.log(`User: ${config.username}`);
        console.log(`DB Name: ${config.database}`);
        console.log(`SSL: ${JSON.stringify(config.ssl)}`);
        console.log('--------------------------------------------------');
        return config;
      }
    }),
    ApplicationModule,
    JobPostingModule,
    ApplicationEvaluationModule,
    McpModule
  ]
})
export class AppModule { }

