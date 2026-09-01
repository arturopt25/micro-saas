import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { SettingsModule } from './settings/settings.module';
import { PropertiesModule } from './properties/properties.module';
import { ApplicationsModule } from './applications/applications.module';
import { OperationsModule } from './operations/operations.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    SettingsModule,
    PropertiesModule,
    ApplicationsModule,
    OperationsModule,
  ],
})
export class AppModule {}
