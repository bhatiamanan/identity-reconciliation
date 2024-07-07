
# Bitespeed Backend Task: Identity Reconciliation

## Overview

This project is a web service designed to reconcile customer identities based on their contact information. The goal is to link different orders made with different contact information to the same person. 

## Requirements

The web service exposes an endpoint `/identify` that receives HTTP POST requests with a JSON body in the following format:

```json
{
    "email"?: string,
    "phoneNumber"?: number
}
```

The service returns a consolidated contact with the following format:

```json
{
    "contact": {
        "primaryContactId": number,
        "emails": string[], // first element being email of primary contact
        "phoneNumbers": string[], // first element being phone number of primary contact
        "secondaryContactIds": number[] // Array of all Contact IDs that are "secondary"
    }
}
```

## Database Schema

The service uses a relational database with a `Contact` table to store contact details:

```sql
CREATE TABLE Contact (
    id INT PRIMARY KEY,
    phoneNumber VARCHAR(15),
    email VARCHAR(255),
    linkedId INT,
    linkPrecedence ENUM('primary', 'secondary'),
    createdAt DATETIME,
    updatedAt DATETIME,
    deletedAt DATETIME
);
```

## Setup Instructions

### Prerequisites

- Node.js
- Docker

### Installation

1. Clone the repository:
    ```bash
    git clone <repository-url>
    cd bitespeed-identity-reconciliation
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Set up the database:
    ```bash
    docker-compose up -d
    ```

4. Run the application:
    ```bash
    npm run start
    ```

### Running Tests

To run the tests, use the following command:
```bash
npm run test
```

### Deployment

The application can be deployed using Docker. Use the following commands to build and run the Docker container:
```bash
docker build -t bitespeed-identity-reconciliation .
docker run -p 3000:3000 bitespeed-identity-reconciliation
```

## API Endpoint

### /identify

- **Method**: POST
- **Request Body**:
    ```json
    {
        "email"?: string,
        "phoneNumber"?: number
    }
    ```
- **Response**:
    ```json
    {
        "contact": {
            "primaryContactId": number,
            "emails": string[],
            "phoneNumbers": string[],
            "secondaryContactIds": number[]
        }
    }
    ```

## Example

Given the following contacts in the database:

```sql
INSERT INTO Contact (id, phoneNumber, email, linkedId, linkPrecedence, createdAt, updatedAt, deletedAt) VALUES
(1, '123456', 'lorraine@hillvalley.edu', NULL, 'primary', '2023-04-01 00:00:00', '2023-04-01 00:00:00', NULL),
(23, '123456', 'mcfly@hillvalley.edu', 1, 'secondary', '2023-04-20 05:30:00', '2023-04-20 05:30:00', NULL);
```

A request to `/identify` with the body:

```json
{
    "email": "mcfly@hillvalley.edu",
    "phoneNumber": "123456"
}
```

will return:

```json
{
    "contact": {
        "primaryContactId": 1,
        "emails": ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
        "phoneNumbers": ["123456"],
        "secondaryContactIds": [23]
    }
}
```

## Additional Information

For more information about Bitespeed and the values we uphold, visit [Bitespeed's Values & Purpose](https://www.notion.so/Way-Of-Life-At-BiteSpeed-Our-Values-Purpose-44d9b9614d9641419da910189b1e9f8e?pvs=21).

To learn more about Bitespeed's mission and the future of commerce, visit [Bitespeed's Mission](https://www.notion.so/BiteSpeed-s-Mission-the-Future-of-Commerce-b3cf14a080d94654ba46693c8cacd24f?pvs=21).
