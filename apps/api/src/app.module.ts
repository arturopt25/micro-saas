import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { SettingsModule } from './settings/settings.module';

@Module({ imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, SettingsModule] })
export class AppModule {}
