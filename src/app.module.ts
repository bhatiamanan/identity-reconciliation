import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactsModule } from './contacts/contacts.module';
import { Contact } from './contacts/contact.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'mysql',
      port: 3306,
      username: 'root',
      password: 'root', // replace with your actual MySQL root password
      database: 'bitespeed',
      entities: [Contact],
      synchronize: true, // set to true to automatically create tables
    }),
    ContactsModule,
  ],
})
export class AppModule {}
