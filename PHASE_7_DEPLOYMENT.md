# Phase 7: Admin Panel Deployment Guide

This guide covers the deployment and setup of the Admin Panel features implemented in Phase 7.

## Features Implemented

### Backend
- ✅ Added `is_admin` field to User model
- ✅ Created admin authorization middleware (`require_admin`)
- ✅ Implemented comprehensive admin API endpoints:
  - Dashboard statistics
  - User management (list, view, update role, update status)
  - Club management (list, toggle featured, toggle active, delete)
  - Activity logging

### Frontend
- ✅ Admin dashboard with statistics and visualizations
- ✅ Club management interface (search, filter, toggle featured/active, delete)
- ✅ User management interface (search, filter, change roles, activate/deactivate)
- ✅ Protected admin routes with AuthGuard

## Database Migration

### Step 1: Apply Database Schema Changes

Run the SQL migration to add the `is_admin` field to the users table:

```bash
# Using psql
psql -U postgres -d clubcompass -f backend/migrations/add_is_admin_to_users.sql

# Or using docker-compose
docker-compose exec db psql -U postgres -d clubcompass -f /migrations/add_is_admin_to_users.sql
```

### Step 2: Create First Admin User

Update an existing user to be an admin:

```sql
-- Replace 'your.email@example.com' with the actual email
UPDATE users SET is_admin = TRUE WHERE email = 'your.email@example.com';
```

Or using Python:

```python
from app.models.user import User
from app.database import SessionLocal

db = SessionLocal()
user = db.query(User).filter(User.email == "your.email@example.com").first()
if user:
    user.is_admin = True
    db.commit()
    print(f"User {user.full_name} is now an admin")
else:
    print("User not found")
db.close()
```

## Testing Checklist

### Backend API Testing

Test admin endpoints using curl or Postman:

```bash
# Get access token first
ACCESS_TOKEN="your-access-token-here"

# Test dashboard stats
curl -X GET "http://localhost:8000/api/v1/admin/dashboard/stats" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Test user list
curl -X GET "http://localhost:8000/api/v1/admin/users" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Test club list
curl -X GET "http://localhost:8000/api/v1/admin/clubs" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Test toggle user admin role
curl -X PATCH "http://localhost:8000/api/v1/admin/users/{user_id}/role?is_admin=true" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Test toggle club featured status
curl -X PATCH "http://localhost:8000/api/v1/admin/clubs/{club_id}/featured?is_featured=true" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Frontend Testing

1. **Login as Admin User**
   - Navigate to http://localhost:3000/auth
   - Login with admin credentials
   - Verify user profile shows admin badge

2. **Access Admin Dashboard**
   - Navigate to http://localhost:3000/admin
   - Verify dashboard displays:
     - Total users, clubs, memberships, assessments
     - New users in last 30 days
     - Popular clubs with member/view counts
     - Category distribution with progress bars
     - Quick action buttons

3. **Test Club Management**
   - Click "Manage Clubs" or navigate to /admin/clubs
   - Test search functionality
   - Filter by category (cocurricular, extracurricular, department)
   - Filter by status (active, inactive)
   - Toggle featured status (star icon)
   - Toggle active status (eye icon)
   - Delete a test club

4. **Test User Management**
   - Click "Manage Users" or navigate to /admin/users
   - Test search functionality
   - Filter by role (admin, user)
   - Filter by status (active, inactive)
   - Grant admin privileges to a user
   - Revoke admin privileges
   - Deactivate/activate a user
   - Verify you cannot deactivate yourself

5. **Authorization Testing**
   - Logout and login as non-admin user
   - Try accessing /admin - should redirect to homepage
   - Try accessing /admin/clubs - should redirect to homepage
   - Try accessing /admin/users - should redirect to homepage

## Security Considerations

1. **Admin Creation**
   - Only create admin users through direct database access
   - Do not create admin API endpoint for security reasons
   - Keep admin user count minimal

2. **Permissions**
   - All admin routes require authentication
   - All admin API endpoints use `require_admin` dependency
   - Users cannot change their own admin status
   - Users cannot deactivate themselves

3. **Audit Logging**
   - Consider implementing activity logs for admin actions
   - Track who made changes and when
   - Store logs in separate table for accountability

## Environment Variables

Ensure these are set in production:

```bash
# Backend (.env)
JWT_SECRET=your-secure-random-secret
JWT_ALGORITHM=HS256
ENVIRONMENT=production
CORS_ORIGINS=https://your-domain.com

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api/v1
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Rollback Procedure

If you need to rollback this migration:

```sql
-- Remove is_admin column
ALTER TABLE users DROP COLUMN IF EXISTS is_admin;

-- Remove index
DROP INDEX IF EXISTS idx_users_is_admin;
```

## Next Steps

After deployment:

1. Create initial admin user(s)
2. Test all admin features in staging environment
3. Monitor admin activity logs
4. Set up alerts for critical admin actions
5. Consider implementing 2FA for admin accounts

## Support

For issues or questions:
- Check backend logs: `docker-compose logs backend`
- Check frontend logs: `docker-compose logs frontend`
- Review database migrations: `backend/migrations/`
