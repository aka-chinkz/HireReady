"""List all users in the database"""
import asyncio
from app.database import prisma

async def list_users():
    await prisma.connect()
    
    # Find all users
    users = await prisma.user.find_many()
    
    print(f"\n{'='*60}")
    print(f"Found {len(users)} user(s) in database:")
    print(f"{'='*60}")
    
    if len(users) == 0:
        print("No users found.")
    else:
        for i, user in enumerate(users, 1):
            print(f"\nUser #{i}:")
            print(f"  ID: {user.id}")
            print(f"  Email: {user.email}")
            print(f"  Username: {user.username}")
            print(f"  isAdmin: {getattr(user, 'isAdmin', False)}")
    
    print(f"\n{'='*60}")
    print("\nTo set a user as admin, use one of these methods:")
    print("\n1. Using SQL (replace EMAIL with user's email):")
    print('   UPDATE users SET "isAdmin" = true WHERE email = \'EMAIL\';')
    print("\n2. Using SQL (replace USER_ID with user's ID):")
    print('   UPDATE users SET "isAdmin" = true WHERE id = \'USER_ID\';')
    print("\n3. Using Prisma Studio:")
    print("   cd backend")
    print("   .\\venv\\Scripts\\Activate.ps1")
    print("   prisma studio")
    print(f"\n{'='*60}\n")
    
    await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(list_users())
