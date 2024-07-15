
# Identity Reconciliation

## Overview

This project is a web service designed to reconcile customer identities based on their contact information. The goal is to link different orders made with different contact information to the same person. 

## Endpoint

### /identify

- **URL**: `http://54.196.70.30/identify`
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
