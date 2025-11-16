# Database Seeding Guide

This guide explains how to populate your ClubCompass database with all 53 clubs from Clubs.json.

## Overview

We have **53 clubs** total from the real BMSCE clubs data:
- **26 Co-curricular clubs**: ACM, Aquila Aerospace, Augment.AI, AeroBMSCE, Robotics, Rocketry, Bullz Racing, TeamCodeLocked, DSYNC, Varaince, CORTECHS, CIIE, IIC, EDC, Business Insights, Pentagram, MEA, ELSOC, IEEE CS, IEEE SB, IEEE WIE, IEEE PES, IEEE SPS, GDSC, Synapse, Upagraha
- **10 Department clubs**: CodeIO, PROTOCOL, ISE Student Club, EEE Association, Gradient, and department-specific chapters (Aquila, DSync, ELSOC, Synapse, VarAInce)
- **5 Extra-curricular (Social) clubs**: NSS, Rotaract, Leo Satva, Mountaineering Club, Respawn
- **12 Extra-curricular (Cultural) clubs**: Inksanity, Ninaad, The Groovehouse, Panache, Paramvah Dance, Danz Addix, Fine Arts, Falcons, Pravrutthi, Chiranthana, Samskruthi Sambhrama, BMS MUNSOC

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
- Re-inserts all 53 clubs
- Use with caution!

### Expected Output:

```
============================================================
ClubCompass - Database Seeding Script
============================================================

🔧 Ensuring database tables exist...
✅ Database tables ready

🌱 Seeding 53 clubs...
✅ Added: ACM (BMSCE ACM Student Chapter) (cocurricular)
✅ Added: Aquila Aerospace (cocurricular)
✅ Added: Augment.AI (cocurricular)
... (continues for all 53 clubs)

📊 Summary:
   ✅ Clubs added: 53
   ⏭️  Clubs skipped: 0
   📝 Total clubs in database: 53

📈 Clubs by category:
   Cocurricular: 26 clubs (~4000 total members)
   Department: 10 clubs (~1900 total members)
   Extracurricular: 17 clubs (~1500 total members)

⭐ Featured clubs: 11

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
-- Should return: 53
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
 cocurricular    |         26 |        ~4000
 department      |         10 |        ~1900
 extracurricular |         17 |        ~1500
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

Expected: 11 featured clubs including ACM, Augment.AI, TeamCodeLocked, DSYNC, Varaince, IEEE CS, IEEE SB, GDSC, CodeIO, PROTOCOL, ISE Student Club

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

All club logos are stored in `frontend/public/images/clubs/` with the following naming convention:
```
/images/clubs/{club_id}.jpg
```

For example:
- `/images/clubs/acm.jpg`
- `/images/clubs/ieee-sb.jpg`
- `/images/clubs/gdscl.jpg`
- `/images/clubs/teamcodelocked.JPG`
- `/images/clubs/CodeIO.jpg`

**Note:** Some images use `.jpg` extension while others use `.JPG` (case-sensitive). Make sure your image files match the exact casing specified in the seed data.

If images are missing, you can:
1. Use placeholder images
2. Update the `logo_url` in the database to point to actual image locations
3. Set `logo_url` to NULL for clubs without images
4. All club images are referenced from Clubs.json in the root directory

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

### Co-Curricular Clubs (26)
| Club | Slug | Members | Featured |
|------|------|---------|----------|
| ACM (BMSCE ACM Student Chapter) | acm | 165 | Yes |
| Aquila Aerospace | aquila | 145 | No |
| Augment.AI | augmentai | 185 | Yes |
| AeroBMSCE | aero | 130 | No |
| Robotics Club | robotics | 155 | No |
| Rocketry | rocketry | 95 | No |
| Bullz Racing (SAE) | bullz | 85 | No |
| TeamCodeLocked | teamcodelocked | 210 | Yes |
| DSYNC (Data Science) | dsync | 175 | Yes |
| Varaince (AI & Data Science) | varaince | 190 | Yes |
| CORTECHS | corrtechs | 125 | No |
| CIIE | ciie | 140 | No |
| IIC BMSCE | iic | 160 | No |
| EDC | edc | 135 | No |
| Business Insights | business-insights | 115 | No |
| Pentagram | pentagram | 105 | No |
| MEA | mea | 195 | No |
| ELSOC | elsoc | 170 | No |
| IEEE Computer Society | ieee-cs | 205 | Yes |
| IEEE Student Branch | ieee-sb | 220 | Yes |
| IEEE WIE | ieee-wie | 145 | No |
| IEEE PES | ieee-pes | 125 | No |
| IEEE SPS | ieee-sps | 110 | No |
| GDSC | gdscl | 200 | Yes |
| Synapse (Biotech) | synapse | 120 | No |
| Upagraha | upagraha | 75 | No |

### Department Clubs (10)
| Club | Slug | Members | Featured |
|------|------|---------|----------|
| CodeIO | codeio | 240 | Yes |
| PROTOCOL | protocol | 235 | Yes |
| ISE STUDENT CLUB | iseclub | 215 | Yes |
| EEE Association | eeea | 190 | No |
| Gradient | gradient | 180 | No |
| Aquila (Aerospace Dept) | aquila-dept | 155 | No |
| DSync (Data Science Dept) | dsync-dept | 165 | No |
| ELSOC (ECE Dept) | elsoc-dept | 175 | No |
| Synapse (Biotech Dept) | synapse-dept | 145 | No |
| VarAInce (AI/DS Dept) | varaince-dept | 170 | No |

### Extra-Curricular - Social (5)
| Club | Slug | Members | Featured |
|------|------|---------|----------|
| NSS | nss | 185 | No |
| Rotaract | rotaract | 165 | No |
| Leo Satva | leosatva | 95 | No |
| Mountaineering Club | mountaineering | 110 | No |
| Respawn (Gaming Club) | respawn | 135 | No |

### Extra-Curricular - Cultural (12)
| Club | Slug | Members | Featured |
|------|------|---------|----------|
| Inksanity | inksanity | 125 | No |
| Ninaad | ninaad | 105 | No |
| The Groovehouse | groovehouse | 140 | No |
| Panache | panache | 90 | No |
| Paramvah Dance | paramvah | 85 | No |
| Danz Addix | danzaddix | 95 | No |
| Fine Arts Club | finearts | 115 | No |
| Falcons | falcons | 130 | No |
| Pravrutthi | pravrutthi | 100 | No |
| Chiranthana | chiranthana | 110 | No |
| Samskruthi Sambhrama | samskruthi | 120 | No |
| BMS MUNSOC | munsoc | 105 | No |

**Total:** 53 clubs, ~7,400 total members, 11 featured clubs

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
- All clubs have faculty contacts with realistic Indian names and emails
- Social media links are Instagram handles (LinkedIn, Twitter, Website are NULL)
- All clubs are active by default
- All club data sourced from Clubs.json in the root directory
- Image paths follow the convention: `/images/clubs/{club_id}.jpg` (stored in `frontend/public/images/clubs/`)
- Some clubs appear in both co-curricular and department categories with different slugs (e.g., aquila and aquila-dept)
- Featured clubs (11 total): ACM, Augment.AI, TeamCodeLocked, DSYNC, Varaince, IEEE CS, IEEE SB, GDSC, CodeIO, PROTOCOL, ISE Student Club

## Support

If you encounter issues:
1. Check backend logs: `docker-compose logs backend`
2. Check database logs: `docker-compose logs db`
3. Verify database connection: `docker-compose exec db psql -U postgres -d clubcompass -c "SELECT COUNT(*) FROM clubs;"`
4. Check the seeding script output for specific error messages
