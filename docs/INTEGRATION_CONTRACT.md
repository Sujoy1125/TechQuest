# Integration Contract

## Frontend Data Structures

### Event Schema
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "date": "string",
  "location": "string",
  "tags": ["string"],
  "image": "string"
}
```

### User Passport Schema
```json
{
  "username": "string",
  "rank": "string",
  "badges": [
    {
      "id": "string",
      "name": "string",
      "earnedAt": "string"
    }
  ]
}
```
