"""Set a user as admin"""
import asyncio
from app.database import prisma

async def set_admin(user_id: str):
    await prisma.connect()
    
    try:
        # Update user to admin
        updated_user = await prisma.user.update(
            where={"id": user_id},
            data={"isAdmin": True}
        )
        
        print(f"\n{'='*60}")
        print("Successfully set user as admin!")
        print(f"{'='*60}")
        print(f"ID: {updated_user.id}")
        print(f"Email: {updated_user.email}")
        print(f"Username: {updated_user.username}")
        print(f"isAdmin: {updated_user.isAdmin}")
        print(f"{'='*60}\n")
        
    except Exception as e:
        print(f"\nError: {e}\n")
    
    await prisma.disconnect()

if __name__ == "__main__":
    # User 2 ID
    user_id = "07c3e9ae-11e8-41ca-a35c-c904b7347a9f"
    asyncio.run(set_admin(user_id))
