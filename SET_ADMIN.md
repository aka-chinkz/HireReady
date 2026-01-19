# Setting a User as Admin

To grant admin access to a user, you need to update their `isAdmin` field in the database.

## Method 1: Using Prisma Studio (Recommended)

1. Open Prisma Studio:
   ```powershell
   cd backend
   .\venv\Scripts\Activate.ps1
   prisma studio
   ```

2. Navigate to the `User` model
3. Find the user you want to make admin (search by email or username)
4. Click on the user to edit
5. Set `isAdmin` to `true`
6. Save the changes

## Method 2: Using SQL directly

Connect to your PostgreSQL database and run:

```sql
UPDATE users SET "isAdmin" = true WHERE email = 'your-admin-email@example.com';
```

Or by user ID:

```sql
UPDATE users SET "isAdmin" = true WHERE id = 'user-id-here';
```

## Method 3: Using Python script

Create a script `set_admin.py` in the backend directory:

```python
import asyncio
from app.database import prisma

async def set_admin(email: str):
    await prisma.connect()
    user = await prisma.user.update_many(
        where={"email": email},
        data={"isAdmin": True}
    )
    print(f"Updated {user.count} user(s) to admin")
    await prisma.disconnect()

# Run: asyncio.run(set_admin("your-email@example.com"))
```

Then run:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -c "import asyncio; from set_admin import set_admin; asyncio.run(set_admin('your-email@example.com'))"
```

## Accessing the Admin Page

Once a user is set as admin, they can access the admin page at:
- URL: `http://localhost:3000/admin`

The page will:
- Check if the user has admin privileges
- Show an access denied message if they don't
- Display all feedback entries if they do have access

## Security Note

- Only users with `isAdmin = true` can access the admin page
- The feedback GET endpoints are protected and require admin access
- Make sure to only grant admin access to trusted users
