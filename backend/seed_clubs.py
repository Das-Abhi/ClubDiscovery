"""
Seed the database with club data from sampleClubs.ts
Run this script to populate the clubs table
"""
import sys
from datetime import datetime
from sqlalchemy.orm import Session

from app.database import SessionLocal, engine
from app.models.club import Club, ClubCategory
from app.models import Base


# Club data from frontend/src/lib/data/sampleClubs.ts
CLUBS_DATA = [
    # CO-CURRICULAR CLUBS
    {
        "name": "ACM Student Chapter",
        "slug": "acm",
        "category": ClubCategory.COCURRICULAR,
        "tagline": "ACM student chapter — computing & AI",
        "description": "The ACM Student Chapter at BMSCE focuses on advancing computing as a science and profession. We organize workshops, hackathons, and tech talks.",
        "overview": "Join us to explore cutting-edge technology, participate in coding competitions, and network with industry professionals. We conduct weekly workshops, annual hackathons, and regular tech talks by industry experts.",
        "logo_url": "/images/clubs/acm.jpg",
        "instagram": "@bmsce_acm",
        "faculty_name": "Dr. Rajesh Kumar",
        "faculty_email": "rajesh.kumar@bmsce.ac.in",
        "faculty_phone": "9999999999",
        "member_count": 150,
        "view_count": 320,
        "is_active": True,
        "is_featured": False,
    },
    {
        "name": "IEEE Student Branch",
        "slug": "ieee",
        "category": ClubCategory.COCURRICULAR,
        "tagline": "Advancing technology for humanity",
        "description": "IEEE BMSCE organizes technical events, workshops, and seminars to enhance students technical skills and knowledge in electrical and electronics engineering.",
        "overview": "We provide a platform for students to learn about latest technologies, participate in technical competitions, and publish research papers. Monthly technical sessions and annual conferences.",
        "logo_url": "/images/clubs/ieee.jpg",
        "instagram": "@ieee_bmsce",
        "faculty_name": "Dr. Anita Desai",
        "faculty_email": "anita.desai@bmsce.ac.in",
        "member_count": 200,
        "view_count": 450,
        "is_active": True,
        "is_featured": True,
    },
    {
        "name": "GDSC BMSCE",
        "slug": "gdsc",
        "category": ClubCategory.COCURRICULAR,
        "tagline": "Google Developer Student Clubs",
        "description": "Learn, build, and connect with Google technologies. GDSC BMSCE helps students bridge the gap between theory and practice through hands-on workshops and projects.",
        "overview": "We organize study jams, solution challenges, and workshops on Google Cloud, Android, Machine Learning, and Web Development. Active community with 30+ events per year.",
        "logo_url": "/images/clubs/gdsc.jpg",
        "instagram": "@gdsc_bmsce",
        "faculty_name": "Prof. Suresh Menon",
        "faculty_email": "suresh.menon@bmsce.ac.in",
        "member_count": 180,
        "view_count": 380,
        "is_active": True,
        "is_featured": True,
    },
    {
        "name": "Robotics Club",
        "slug": "robotics",
        "category": ClubCategory.COCURRICULAR,
        "tagline": "Building the future, one robot at a time",
        "description": "Explore robotics, automation, and embedded systems. Design, build, and program robots for various competitions and real-world applications.",
        "overview": "Weekly workshops on Arduino, Raspberry Pi, and ROS. Annual participation in national robotics competitions. Access to fully equipped robotics lab.",
        "instagram": "@bmsce_robotics",
        "faculty_name": "Dr. Vikram Singh",
        "faculty_email": "vikram.singh@bmsce.ac.in",
        "member_count": 120,
        "view_count": 250,
        "is_active": True,
        "is_featured": False,
    },
    {
        "name": "Cyber Security Club",
        "slug": "cybersec",
        "category": ClubCategory.COCURRICULAR,
        "tagline": "Securing the digital frontier",
        "description": "Learn ethical hacking, penetration testing, and cybersecurity best practices. Participate in CTF competitions and security audits.",
        "overview": "Monthly CTF challenges, workshops on network security, cryptography, and web security. Guest lectures from industry cybersecurity experts.",
        "instagram": "@bmsce_cybersec",
        "member_count": 95,
        "view_count": 180,
        "is_active": True,
        "is_featured": False,
    },

    # EXTRA-CURRICULAR CLUBS
    {
        "name": "Cultural Club",
        "slug": "cultural",
        "category": ClubCategory.EXTRACURRICULAR,
        "tagline": "Celebrating diversity and culture",
        "description": "The Cultural Club organizes festivals, cultural events, and performances throughout the year. Showcase your talents in dance, music, drama, and more.",
        "overview": "Annual cultural fest, monthly talent shows, traditional festival celebrations, and cultural exchange programs. Open to all students passionate about arts and culture.",
        "logo_url": "/images/clubs/cultural.jpg",
        "instagram": "@bmsce_cultural",
        "faculty_name": "Prof. Lakshmi Iyer",
        "faculty_email": "lakshmi.iyer@bmsce.ac.in",
        "member_count": 120,
        "view_count": 240,
        "is_active": True,
        "is_featured": False,
    },
    {
        "name": "Music Club",
        "slug": "music",
        "category": ClubCategory.EXTRACURRICULAR,
        "tagline": "Where melodies meet passion",
        "description": "Join us to explore your musical talents, learn instruments, and perform at college events. From classical to contemporary, we celebrate all genres.",
        "overview": "Weekly jam sessions, instrument training, vocal coaching, and performance opportunities at college events. Access to music room with guitars, keyboards, and drums.",
        "logo_url": "/images/clubs/music.jpg",
        "instagram": "@bmsce_music",
        "member_count": 90,
        "view_count": 160,
        "is_active": True,
        "is_featured": False,
    },
    {
        "name": "Dance Troupe",
        "slug": "dance",
        "category": ClubCategory.EXTRACURRICULAR,
        "tagline": "Express yourself through movement",
        "description": "Learn various dance forms including contemporary, hip-hop, classical, and folk. Perform at college events and inter-college competitions.",
        "overview": "Regular practice sessions, choreography workshops, participation in cultural fests and competitions. Professional training from guest choreographers.",
        "instagram": "@bmsce_dance",
        "member_count": 75,
        "view_count": 140,
        "is_active": True,
        "is_featured": False,
    },
    {
        "name": "Drama Society",
        "slug": "drama",
        "category": ClubCategory.EXTRACURRICULAR,
        "tagline": "All the world's a stage",
        "description": "Explore theatre arts, scriptwriting, and stage performance. Annual plays, street theatre, and participation in inter-college drama competitions.",
        "overview": "Monthly theatre workshops, script reading sessions, acting classes, and production of plays. Collaborate with professional theatre artists.",
        "instagram": "@bmsce_drama",
        "member_count": 60,
        "view_count": 110,
        "is_active": True,
        "is_featured": False,
    },
    {
        "name": "Photography Club",
        "slug": "photography",
        "category": ClubCategory.EXTRACURRICULAR,
        "tagline": "Capture moments, create memories",
        "description": "Learn photography techniques, photo editing, and visual storytelling. Cover college events and conduct photo walks around Bangalore.",
        "overview": "Weekly photo walks, editing workshops, monthly photography contests, and annual exhibition. Learn DSLR basics, composition, and post-processing.",
        "instagram": "@bmsce_photo",
        "member_count": 85,
        "view_count": 150,
        "is_active": True,
        "is_featured": False,
    },

    # DEPARTMENT CLUBS
    {
        "name": "CSE Department Club",
        "slug": "cse-dept",
        "category": ClubCategory.DEPARTMENT,
        "tagline": "Computer Science & Engineering",
        "description": "Department club for CSE students focusing on technical projects, coding competitions, and industry collaborations.",
        "overview": "Organize coding competitions, project showcases, technical seminars, and placement preparation sessions. Bridge between students and industry.",
        "logo_url": "/images/clubs/cse.jpg",
        "instagram": "@bmsce_cse",
        "faculty_name": "Dr. Madhav Rao",
        "faculty_email": "madhav.rao@bmsce.ac.in",
        "member_count": 250,
        "view_count": 520,
        "is_active": True,
        "is_featured": True,
    },
    {
        "name": "ECE Department Club",
        "slug": "ece-dept",
        "category": ClubCategory.DEPARTMENT,
        "tagline": "Electronics & Communication Engineering",
        "description": "ECE department association organizing technical workshops, project exhibitions, and industry visits for electronics enthusiasts.",
        "overview": "Hands-on workshops on VLSI, embedded systems, signal processing. Annual project expo and technical symposium.",
        "instagram": "@bmsce_ece",
        "member_count": 220,
        "view_count": 480,
        "is_active": True,
        "is_featured": True,
    },
    {
        "name": "Mechanical Department Club",
        "slug": "mech-dept",
        "category": ClubCategory.DEPARTMENT,
        "tagline": "Mechanical Engineering",
        "description": "Explore mechanical engineering through workshops on CAD, manufacturing, and automotive technologies. Participate in SAE competitions.",
        "overview": "CAD/CAM workshops, industry visits to manufacturing plants, participation in BAJA and Formula Student competitions.",
        "instagram": "@bmsce_mech",
        "member_count": 200,
        "view_count": 410,
        "is_active": True,
        "is_featured": False,
    },
    {
        "name": "Civil Department Club",
        "slug": "civil-dept",
        "category": ClubCategory.DEPARTMENT,
        "tagline": "Civil Engineering",
        "description": "Civil engineering students association conducting site visits, structural design workshops, and environmental sustainability projects.",
        "overview": "Field visits to construction sites, workshops on AutoCAD and Revit, sustainability projects, and concrete mix design competitions.",
        "instagram": "@bmsce_civil",
        "member_count": 180,
        "view_count": 360,
        "is_active": True,
        "is_featured": False,
    },
    {
        "name": "ISE Department Club",
        "slug": "ise-dept",
        "category": ClubCategory.DEPARTMENT,
        "tagline": "Information Science & Engineering",
        "description": "ISE department club focusing on software development, data science, and emerging technologies like AI and blockchain.",
        "overview": "Hackathons, app development workshops, data science bootcamps, and collaborative projects with industry partners.",
        "instagram": "@bmsce_ise",
        "member_count": 230,
        "view_count": 500,
        "is_active": True,
        "is_featured": True,
    },
]


def seed_clubs(db: Session, clear_existing: bool = False):
    """
    Seed the database with club data

    Args:
        db: Database session
        clear_existing: If True, delete all existing clubs first (WARNING: this will cascade delete memberships and potentially break relationships)
    """
    try:
        if clear_existing:
            print("⚠️  Clearing existing clubs...")
            db.query(Club).delete()
            db.commit()
            print("✅ Existing clubs cleared")

        print(f"\n🌱 Seeding {len(CLUBS_DATA)} clubs...")

        clubs_added = 0
        clubs_skipped = 0

        for club_data in CLUBS_DATA:
            # Check if club already exists (by slug)
            existing_club = db.query(Club).filter(Club.slug == club_data["slug"]).first()

            if existing_club:
                print(f"⏭️  Skipping '{club_data['name']}' - already exists")
                clubs_skipped += 1
                continue

            # Create new club
            club = Club(**club_data)
            db.add(club)
            clubs_added += 1
            print(f"✅ Added: {club_data['name']} ({club_data['category'].value})")

        db.commit()

        print(f"\n📊 Summary:")
        print(f"   ✅ Clubs added: {clubs_added}")
        print(f"   ⏭️  Clubs skipped: {clubs_skipped}")
        print(f"   📝 Total clubs in database: {db.query(Club).count()}")

        # Show statistics by category
        print(f"\n📈 Clubs by category:")
        for category in ClubCategory:
            count = db.query(Club).filter(Club.category == category).count()
            total_members = db.query(Club).filter(Club.category == category).with_entities(
                db.func.sum(Club.member_count)
            ).scalar() or 0
            print(f"   {category.value.capitalize()}: {count} clubs ({total_members} total members)")

        # Show featured clubs
        featured_count = db.query(Club).filter(Club.is_featured == True).count()
        print(f"\n⭐ Featured clubs: {featured_count}")

        return clubs_added, clubs_skipped

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error seeding clubs: {str(e)}")
        raise


def main():
    """Main function to run the seeding script"""
    print("=" * 60)
    print("ClubCompass - Database Seeding Script")
    print("=" * 60)

    # Check if user wants to clear existing data
    clear_existing = False
    if len(sys.argv) > 1 and sys.argv[1] == "--clear":
        response = input("\n⚠️  WARNING: This will DELETE all existing clubs and related data!\nAre you sure? (yes/no): ")
        if response.lower() == "yes":
            clear_existing = True
        else:
            print("❌ Aborted")
            return

    # Create database session
    db = SessionLocal()

    try:
        # Ensure tables exist
        print("\n🔧 Ensuring database tables exist...")
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables ready")

        # Seed clubs
        seed_clubs(db, clear_existing=clear_existing)

        print("\n✨ Database seeding completed successfully!")
        print("\nYou can now:")
        print("  1. Start the backend: uvicorn app.main:app --reload")
        print("  2. Start the frontend: npm run dev")
        print("  3. Visit http://localhost:3000 to see the clubs")

    except Exception as e:
        print(f"\n💥 Fatal error: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    main()
