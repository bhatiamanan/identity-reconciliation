import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './contact.entity';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private contactsRepository: Repository<Contact>,
  ) {}

  async identify(email?: string, phoneNumber?: string) {
    // Fetch contacts by email or phone number
    const initialContacts = await this.contactsRepository.find({
      where: [{ email }, { phoneNumber }],
    });

    if (initialContacts.length === 0) {
      // No existing contact, create a new primary contact
      const newPrimaryContact = this.contactsRepository.create({
        email,
        phoneNumber,
        linkPrecedence: 'primary',
      });
      await this.contactsRepository.save(newPrimaryContact);
      return this.createResponse(newPrimaryContact, []);
    }

    // Identify the primary contact
    const primaryContact = this.identifyPrimaryContact(initialContacts);

    // Check if we need to merge two primary contacts
    const primaryContacts = initialContacts.filter(contact => contact.linkPrecedence === 'primary');
    if (primaryContacts.length > 1) {
      // More than one primary contact found, need to merge
      const mostRecentPrimary = this.identifyMostRecentContact(primaryContacts);
      const oldestPrimary = primaryContacts.find(contact => contact.id !== mostRecentPrimary.id);

      // Update the most recent primary contact to secondary
      mostRecentPrimary.linkPrecedence = 'secondary';
      mostRecentPrimary.linkedId = oldestPrimary.id;
      await this.contactsRepository.save(mostRecentPrimary);

      // Return the response
      return this.createResponse(oldestPrimary, [...initialContacts, mostRecentPrimary]);
    }

    // Fetch all related contacts
    const allContacts = await this.fetchAllRelatedContacts(primaryContact.id);

    // Ensure the new information is added if it doesn't already exist
    if (!initialContacts.some(contact => contact.email === email && contact.phoneNumber === phoneNumber)) {
      const newSecondaryContact = this.contactsRepository.create({
        email,
        phoneNumber,
        linkedId: primaryContact.id,
        linkPrecedence: 'secondary',
      });
      await this.contactsRepository.save(newSecondaryContact);
      allContacts.push(newSecondaryContact);
    }

    // Ensure all contacts are correctly linked
    await this.linkSecondaryContacts(primaryContact, allContacts);

    // Prepare the response with unique values
    const emails = Array.from(new Set([primaryContact.email, ...allContacts.map(contact => contact.email)].filter(Boolean)));
    const phoneNumbers = Array.from(new Set([primaryContact.phoneNumber, ...allContacts.map(contact => contact.phoneNumber)].filter(Boolean)));
    const secondaryContactIds = Array.from(new Set(allContacts.filter(contact => contact.id !== primaryContact.id).map(contact => contact.id)));

    return {
      contact: {
        primaryContactId: primaryContact.id,
        emails,
        phoneNumbers,
        secondaryContactIds,
      },
    };
  }

  private identifyPrimaryContact(contacts: Contact[]): Contact {
    return contacts.reduce((oldest, current) => {
      return current.createdAt < oldest.createdAt ? current : oldest;
    });
  }

  private identifyMostRecentContact(contacts: Contact[]): Contact {
    return contacts.reduce((mostRecent, current) => {
      return current.createdAt > mostRecent.createdAt ? current : mostRecent;
    });
  }

  private async fetchAllRelatedContacts(primaryContactId: number): Promise<Contact[]> {
    const queue = [primaryContactId];
    const visited = new Set<number>();
    const allContacts = new Set<Contact>();

    while (queue.length > 0) {
      const currentId = queue.shift();
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const contacts = await this.contactsRepository.find({
        where: [
          { linkedId: currentId },
          { id: currentId },
        ],
      });

      for (const contact of contacts) {
        if (!allContacts.has(contact)) {
          allContacts.add(contact);
          if (contact.linkedId && !visited.has(contact.linkedId)) {
            queue.push(contact.linkedId);
          }
        }
      }
    }

    return Array.from(allContacts);
  }

  private async linkSecondaryContacts(primaryContact: Contact, allContacts: Contact[]): Promise<void> {
    for (const contact of allContacts) {
      if (contact.id !== primaryContact.id && (contact.linkPrecedence !== 'secondary' || contact.linkedId !== primaryContact.id)) {
        contact.linkPrecedence = 'secondary';
        contact.linkedId = primaryContact.id;
        await this.contactsRepository.save(contact);
      }
    }
  }

  private createResponse(primaryContact: Contact, allContacts: Contact[]): any {
    const emails = Array.from(new Set([primaryContact.email, ...allContacts.map(contact => contact.email)].filter(Boolean)));
    const phoneNumbers = Array.from(new Set([primaryContact.phoneNumber, ...allContacts.map(contact => contact.phoneNumber)].filter(Boolean)));
    const secondaryContactIds = Array.from(new Set(allContacts.filter(contact => contact.id !== primaryContact.id).map(contact => contact.id)));

    return {
      contact: {
        primaryContactId: primaryContact.id,
        emails,
        phoneNumbers,
        secondaryContactIds,
      },
    };
  }
}
