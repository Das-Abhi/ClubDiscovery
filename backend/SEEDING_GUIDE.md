# Database Seeding Guide

This guide explains how to populate your ClubCompass database with the 15 clubs from the sample data.

## Overview

We have **15 clubs** total:
- **5 Co-curricular clubs**: ACM, IEEE, GDSC, Robotics, Cyber Security
- **5 Extra-curricular clubs**: Cultural, Music, Dance, Drama, Photography
- **5 Department clubs**: CSE, ECE, Mechanical, Civil, ISE

## Prerequisites

1. PostgreSQL database running
2. Database tables created (run `python init_db.py` first)
3. Backend environment configured (`.env` file with `DATABASE_URL`)

## Method 1: Python Script (Recommended)

The Python script provides better error handling and integration with your SQLAlchemy models.

### Run the seeding script:

```bash
cd backend
python seed_clubs.py
```

### Options:

**Skip existing clubs** (default behavior):
```bash
python seed_clubs.py
```
- Checks if clubs already exist by slug
- Only adds new clubs
- Safe to run multiple times

**Clear and reseed** (⚠️ WARNING: Deletes all clubs):
```bash
python seed_clubs.py --clear
```
- Deletes ALL existing clubs
- Re-inserts all 15 clubs
- Use with caution!

### Expected Output:

```
============================================================
ClubCompass - Database Seeding Script
============================================================

🔧 Ensuring database tables exist...
✅ Database tables ready

🌱 Seeding 15 clubs...
✅ Added: ACM Student Chapter (cocurricular)
✅ Added: IEEE Student Branch (cocurricular)
✅ Added: GDSC BMSCE (cocurricular)
... (continues for all 15 clubs)

📊 Summary:
   ✅ Clubs added: 15
   ⏭️  Clubs skipped: 0
   📝 Total clubs in database: 15

📈 Clubs by category:
   Cocurricular: 5 clubs (745 total members)
   Extracurricular: 5 clubs (430 total members)
   Department: 5 clubs (1080 total members)

⭐ Featured clubs: 5

✨ Database seeding completed successfully!
```

## Method 2: SQL Script

For direct database manipulation or if you prefer SQL.

### Run via psql:

```bash
# Using Docker
docker-compose exec db psql -U postgres -d clubcompass -f /path/to/seed_clubs.sql

# Or locally
psql -U postgres -d clubcompass -f backend/seed_clubs.sql
```

### Run via Docker exec:

```bash
docker cp backend/seed_clubs.sql clubcompass-db:/tmp/seed_clubs.sql
docker-compose exec db psql -U postgres -d clubcompass -f /tmp/seed_clubs.sql
```

## Verify Data

After seeding, verify the data was inserted correctly:

### Check total clubs:
```sql
SELECT COUNT(*) FROM clubs;
-- Should return: 15
```

### Check clubs by category:
```sql
SELECT
    category,
    COUNT(*) as club_count,
    SUM(member_count) as total_members
FROM clubs
GROUP BY category;
```

Expected result:
```
    category     | club_count | total_members
-----------------+------------+---------------
 cocurricular    |          5 |           745
 department      |          5 |          1080
 extracurricular |          5 |           430
```

### List all clubs:
```sql
SELECT name, slug, category, is_featured, member_count
FROM clubs
ORDER BY category, created_at;
```

### Check featured clubs:
```sql
SELECT name, category, member_count, view_count
FROM clubs
WHERE is_featured = true;
```

Expected: 5 featured clubs (IEEE, GDSC, CSE, ECE, ISE)

## Testing the Integration

### 1. Start the backend:
```bash
cd backend
uvicorn app.main:app --reload
```

### 2. Test API endpoints:

**Get all clubs:**
```bash
curl http://localhost:8000/api/v1/clubs
```

**Get featured clubs:**
```bash
curl http://localhost:8000/api/v1/clubs/featured
```

**Get clubs by category:**
```bash
curl http://localhost:8000/api/v1/clubs?category=cocurricular
curl http://localhost:8000/api/v1/clubs?category=extracurricular
curl http://localhost:8000/api/v1/clubs?category=department
```

**Get specific club:**
```bash
curl http://localhost:8000/api/v1/clubs/acm
curl http://localhost:8000/api/v1/clubs/gdsc
curl http://localhost:8000/api/v1/clubs/cse-dept
```

### 3. Test Frontend:

```bash
cd frontend
npm run dev
```

Visit:
- http://localhost:3000 - Should show clubs on homepage
- http://localhost:3000/clubs/cocurricular - Should show 5 co-curricular clubs
- http://localhost:3000/clubs/extracurricular - Should show 5 extra-curricular clubs
- http://localhost:3000/clubs/department - Should show 5 department clubs

## Club Images

The clubs reference logo images at:
```
/images/clubs/acm.jpg
/images/clubs/ieee.jpg
/images/clubs/gdsc.jpg
/images/clubs/cultural.jpg
/images/clubs/music.jpg
/images/clubs/cse.jpg
```

Make sure these images exist in your `frontend/public/images/clubs/` directory.

If images are missing, you can:
1. Use placeholder images
2. Update the `logo_url` in the database to point to actual image locations
3. Set `logo_url` to NULL for clubs without images

## Troubleshooting

### Error: "relation 'clubs' does not exist"

**Solution:** Create database tables first:
```bash
cd backend
python init_db.py
```

### Error: "duplicate key value violates unique constraint"

**Solution:** Clubs already exist. Either:
1. Run without `--clear` to skip existing clubs
2. Run with `--clear` to delete and re-insert all clubs
3. Manually delete specific clubs from database

### Error: "invalid input value for enum clubcategory"

**Solution:** Check that category values match enum exactly:
- `cocurricular` (not `co-curricular`)
- `extracurricular` (not `extra-curricular`)
- `department`

### Database connection failed

**Solution:** Check your `.env` file has correct `DATABASE_URL`:
```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/clubcompass
```

### Clubs not showing in frontend

**Solutions:**
1. Check API is returning data: `curl http://localhost:8000/api/v1/clubs`
2. Check browser console for errors
3. Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`
4. Check if frontend is using sample data vs API data

## Data Summary

| Club | Slug | Category | Members | Featured |
|------|------|----------|---------|----------|
| ACM Student Chapter | acm | cocurricular | 150 | No |
| IEEE Student Branch | ieee | cocurricular | 200 | Yes |
| GDSC BMSCE | gdsc | cocurricular | 180 | Yes |
| Robotics Club | robotics | cocurricular | 120 | No |
| Cyber Security Club | cybersec | cocurricular | 95 | No |
| Cultural Club | cultural | extracurricular | 120 | No |
| Music Club | music | extracurricular | 90 | No |
| Dance Troupe | dance | extracurricular | 75 | No |
| Drama Society | drama | extracurricular | 60 | No |
| Photography Club | photography | extracurricular | 85 | No |
| CSE Department Club | cse-dept | department | 250 | Yes |
| ECE Department Club | ece-dept | department | 220 | Yes |
| Mechanical Department Club | mech-dept | department | 200 | No |
| Civil Department Club | civil-dept | department | 180 | No |
| ISE Department Club | ise-dept | department | 230 | Yes |

**Total:** 15 clubs, 2,255 total members, 5 featured clubs

## Next Steps

After seeding the database:

1. ✅ Restart backend to ensure changes are loaded
2. ✅ Test all club-related pages work correctly
3. ✅ Verify search functionality works
4. ✅ Test assessment recommendations use real club data
5. ✅ Create admin user and test club management features
6. ✅ Add/update club logos in `frontend/public/images/clubs/`

## Important Notes

- The Python script is idempotent - safe to run multiple times
- Club IDs are auto-generated UUIDs
- Timestamps are set to early 2024 dates (can be updated if needed)
- Some clubs have faculty contacts, some don't (matches sample data)
- Social media links are Instagram handles (LinkedIn, Twitter, Website are NULL)
- All clubs are active by default
- Featured clubs: IEEE, GDSC, CSE, ECE, ISE (5 total)

## Support

If you encounter issues:
1. Check backend logs: `docker-compose logs backend`
2. Check database logs: `docker-compose logs db`
3. Verify database connection: `docker-compose exec db psql -U postgres -d clubcompass -c "SELECT COUNT(*) FROM clubs;"`
4. Check the seeding script output for specific error messages
