"""Check which users are marked as admin"""
import asyncio
from app.database import prisma

async def check_admins():
    await prisma.connect()
    
    # Find all admin users
    admins = await prisma.user.find_many(
        where={"isAdmin": True}
    )
    
    print(f"\n{'='*60}")
    print(f"Found {len(admins)} admin user(s):")
    print(f"{'='*60}")
    
    if len(admins) == 0:
        print("No admin users found.")
        print("\nTo set a user as admin, run:")
        print("  UPDATE users SET \"isAdmin\" = true WHERE email = 'your-email@example.com';")
    else:
        for i, user in enumerate(admins, 1):
            print(f"\nAdmin #{i}:")
            print(f"  ID: {user.id}")
            print(f"  Email: {user.email}")
            print(f"  Username: {user.username}")
            print(f"  isAdmin: {user.isAdmin}")
    
    print(f"\n{'='*60}\n")
    
    await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(check_admins())
