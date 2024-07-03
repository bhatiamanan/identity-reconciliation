import { Controller, Post, Body } from '@nestjs/common';
import { ContactsService } from './contacts.service';

@Controller('identify')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  async identify(@Body() body: { email?: string; phoneNumber?: string }) {
    const { email, phoneNumber } = body;
    return this.contactsService.identify(email, phoneNumber);
  }
}
