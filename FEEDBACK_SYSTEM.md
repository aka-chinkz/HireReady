# Feedback Collection System

This document describes the feedback collection system implemented in HireReady.

## Overview

The feedback system allows users to submit feedback directly from the homepage through a modal interface. The feedback is collected, validated, sanitized, and stored in the database.

## Architecture

### Backend

#### Database Schema

The `Feedback` model is defined in `backend/prisma/schema.prisma`:

```prisma
model Feedback {
  id          String    @id @default(uuid())
  message     String    @db.Text
  rating      Int?      // Optional rating (1-5)
  userEmail   String?   // Optional user email
  pageSource  String?   // Page or source where feedback was submitted
  createdAt   DateTime  @default(now())
  
  @@map("feedback")
}
```

#### API Endpoint

**POST /api/feedback/**

Creates a new feedback entry.

**Request Body:**
```json
{
  "message": "string (required, min 5 characters)",
  "rating": "integer (optional, 1-5)",
  "user_email": "string (optional, valid email format)",
  "page_source": "string (optional, max 255 characters)"
}
```

**Response:**
```json
{
  "id": "uuid",
  "message": "string",
  "rating": "integer or null",
  "user_email": "string or null",
  "page_source": "string or null",
  "created_at": "ISO datetime string"
}
```

**Error Responses:**
- `400 Bad Request`: Validation error (message too short, invalid email, invalid rating)
- `500 Internal Server Error`: Server error

#### Security Features

1. **Input Validation:**
   - Message: Required, 5-5000 characters
   - Rating: Optional, 1-5
   - Email: Optional, valid email format
   - Page source: Optional, max 255 characters

2. **Input Sanitization:**
   - HTML tags are escaped to prevent XSS attacks
   - Text is trimmed and length-limited
   - Uses Python's `html.escape()` for sanitization

3. **Security Recommendations for Production:**
   - **Rate Limiting**: Add rate limiting to prevent spam (e.g., using `slowapi` or `fastapi-limiter`)
     ```python
     from slowapi import Limiter, _rate_limit_exceeded_handler
     from slowapi.util import get_remote_address
     
     limiter = Limiter(key_func=get_remote_address)
     # Then add decorator: @limiter.limit("5/minute")
     ```
   - **CAPTCHA**: Consider adding CAPTCHA for production to prevent automated spam
   - **Authentication**: Protect GET endpoints with authentication for admin access
   - **Enhanced Sanitization**: Consider using `bleach` library for more robust HTML sanitization
   - **Logging**: Implement proper logging for suspicious patterns

### Frontend

#### Components

**FeedbackModal** (`frontend/components/FeedbackModal.tsx`)

A modal component that collects user feedback with:
- Required feedback message (textarea)
- Optional rating (1-5 stars)
- Optional email input
- Form validation
- Error handling
- Success/error states
- Loading states

**Integration:**

The feedback modal is integrated into the Dashboard component with a floating action button.

#### API Integration

The feedback API is integrated in `frontend/lib/api.ts`:

```typescript
export const feedbackApi = {
  create: async (data: FeedbackCreate): Promise<FeedbackResponse>
}
```

## Setup Instructions

### 1. Database Migration

After adding the Feedback model to the Prisma schema, generate and apply the migration:

```bash
cd backend
npx prisma migrate dev --name add_feedback_model
```

Or if using Prisma Client generation:

```bash
npx prisma generate
```

### 2. Backend Setup

The feedback router is already registered in `backend/main.py`. No additional configuration needed.

### 3. Environment Variables

Ensure your `.env` file has the database URL:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

### 4. Testing the Endpoint

#### Using cURL

```bash
# Submit feedback
curl -X POST http://localhost:8000/api/feedback/ \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Great platform! Really helpful for my interview prep.",
    "rating": 5,
    "user_email": "user@example.com",
    "page_source": "home"
  }'

# Get feedback list (admin endpoint)
curl http://localhost:8000/api/feedback/

# Get specific feedback (admin endpoint)
curl http://localhost:8000/api/feedback/{feedback_id}
```

#### Using Python

```python
import requests

response = requests.post(
    "http://localhost:8000/api/feedback/",
    json={
        "message": "Great platform! Really helpful for my interview prep.",
        "rating": 5,
        "user_email": "user@example.com",
        "page_source": "home"
    }
)
print(response.json())
```

#### Using the API Documentation

Visit `http://localhost:8000/docs` to use the interactive Swagger UI for testing.

## Usage

### User Flow

1. User visits the homepage
2. User clicks the "Feedback" floating button (bottom right)
3. Modal opens with feedback form
4. User fills in feedback (message required, rating and email optional)
5. User submits feedback
6. Feedback is validated and sent to backend
7. Success message is shown, modal closes automatically

### Admin Flow (Future Implementation)

To view feedback entries, you would need to:
1. Add authentication to the GET endpoints
2. Create an admin dashboard
3. Query the feedback table from the database

Example query:
```sql
SELECT * FROM feedback ORDER BY "createdAt" DESC;
```

## Error Handling

### Frontend

- Shows validation errors in the modal
- Displays network errors with user-friendly messages
- Handles submission states (loading, success, error)

### Backend

- Returns clear error messages for validation failures
- Returns generic error messages for server errors (to avoid exposing internal details)
- Logs errors for debugging (should be implemented with proper logging in production)

## Production Checklist

Before deploying to production:

- [ ] Add rate limiting to prevent spam
- [ ] Implement CAPTCHA for additional spam protection
- [ ] Add authentication for GET endpoints (admin access)
- [ ] Set up proper logging (e.g., using Python's `logging` module)
- [ ] Configure monitoring/alerting for feedback submissions
- [ ] Review and enhance input sanitization (consider `bleach` library)
- [ ] Set up database backups
- [ ] Test error handling thoroughly
- [ ] Review CORS settings for production domains
- [ ] Set up environment-specific configuration
- [ ] Consider adding feedback analytics (e.g., average rating, response time)

## Database Schema Details

- **id**: UUID, primary key, auto-generated
- **message**: Text, required, stores the feedback message
- **rating**: Integer, optional, 1-5 rating
- **userEmail**: String, optional, user's email address
- **pageSource**: String, optional, tracks where feedback was submitted
- **createdAt**: DateTime, auto-generated timestamp

## API Response Examples

### Success Response

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "message": "Great platform! Really helpful for my interview prep.",
  "rating": 5,
  "user_email": "user@example.com",
  "page_source": "home",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Error Response (Validation)

```json
{
  "detail": "Message is required and must be at least 5 characters long"
}
```

### Error Response (Server Error)

```json
{
  "detail": "An error occurred while saving feedback. Please try again later."
}
```

## Troubleshooting

### Backend Issues

1. **Database connection errors**: Check DATABASE_URL in `.env`
2. **Prisma client not updated**: Run `npx prisma generate`
3. **Migration errors**: Check Prisma migration status

### Frontend Issues

1. **Modal not opening**: Check browser console for errors
2. **API errors**: Verify backend is running on correct port (default: 8000)
3. **CORS errors**: Check CORS settings in `backend/main.py`

## Future Enhancements

Potential improvements:

1. Email notifications for new feedback
2. Feedback analytics dashboard
3. Feedback categories/tags
4. Response functionality (reply to feedback)
5. Export feedback to CSV/Excel
6. Feedback moderation workflow
7. Integration with customer support systems
