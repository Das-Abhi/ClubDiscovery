-- ClubCompass - Clubs Data Population Script
-- This script inserts all 15 clubs into the database
-- Run this after creating the database schema

-- Note: UUIDs will be generated, logo paths assume images are in /images/clubs/

BEGIN;

-- Clear existing clubs (optional - remove if you want to keep existing data)
-- DELETE FROM recommendations;
-- DELETE FROM memberships;
-- DELETE FROM clubs;

-- CO-CURRICULAR CLUBS (5 clubs)

-- 1. ACM Student Chapter
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email, faculty_phone,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'ACM Student Chapter',
    'acm',
    'cocurricular',
    'ACM student chapter — computing & AI',
    'The ACM Student Chapter at BMSCE focuses on advancing computing as a science and profession. We organize workshops, hackathons, and tech talks.',
    'Join us to explore cutting-edge technology, participate in coding competitions, and network with industry professionals. We conduct weekly workshops, annual hackathons, and regular tech talks by industry experts.',
    '/images/clubs/acm.jpg',
    '@bmsce_acm',
    'Dr. Rajesh Kumar',
    'rajesh.kumar@bmsce.ac.in',
    '9999999999',
    150,
    320,
    '2024-01-15 10:30:00',
    '2024-01-15 10:30:00',
    true,
    false
);

-- 2. IEEE Student Branch
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'IEEE Student Branch',
    'ieee',
    'cocurricular',
    'Advancing technology for humanity',
    'IEEE BMSCE organizes technical events, workshops, and seminars to enhance students technical skills and knowledge in electrical and electronics engineering.',
    'We provide a platform for students to learn about latest technologies, participate in technical competitions, and publish research papers. Monthly technical sessions and annual conferences.',
    '/images/clubs/ieee.jpg',
    '@ieee_bmsce',
    'Dr. Anita Desai',
    'anita.desai@bmsce.ac.in',
    200,
    450,
    '2024-01-10 10:30:00',
    '2024-01-10 10:30:00',
    true,
    true
);

-- 3. GDSC BMSCE
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'GDSC BMSCE',
    'gdsc',
    'cocurricular',
    'Google Developer Student Clubs',
    'Learn, build, and connect with Google technologies. GDSC BMSCE helps students bridge the gap between theory and practice through hands-on workshops and projects.',
    'We organize study jams, solution challenges, and workshops on Google Cloud, Android, Machine Learning, and Web Development. Active community with 30+ events per year.',
    '/images/clubs/gdsc.jpg',
    '@gdsc_bmsce',
    'Prof. Suresh Menon',
    'suresh.menon@bmsce.ac.in',
    180,
    380,
    '2024-01-05 10:30:00',
    '2024-01-05 10:30:00',
    true,
    true
);

-- 4. Robotics Club
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Robotics Club',
    'robotics',
    'cocurricular',
    'Building the future, one robot at a time',
    'Explore robotics, automation, and embedded systems. Design, build, and program robots for various competitions and real-world applications.',
    'Weekly workshops on Arduino, Raspberry Pi, and ROS. Annual participation in national robotics competitions. Access to fully equipped robotics lab.',
    '@bmsce_robotics',
    'Dr. Vikram Singh',
    'vikram.singh@bmsce.ac.in',
    120,
    250,
    '2024-01-20 10:30:00',
    '2024-01-20 10:30:00',
    true,
    false
);

-- 5. Cyber Security Club
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    instagram,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Cyber Security Club',
    'cybersec',
    'cocurricular',
    'Securing the digital frontier',
    'Learn ethical hacking, penetration testing, and cybersecurity best practices. Participate in CTF competitions and security audits.',
    'Monthly CTF challenges, workshops on network security, cryptography, and web security. Guest lectures from industry cybersecurity experts.',
    '@bmsce_cybersec',
    95,
    180,
    '2024-02-01 10:30:00',
    '2024-02-01 10:30:00',
    true,
    false
);

-- EXTRA-CURRICULAR CLUBS (5 clubs)

-- 6. Cultural Club
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Cultural Club',
    'cultural',
    'extracurricular',
    'Celebrating diversity and culture',
    'The Cultural Club organizes festivals, cultural events, and performances throughout the year. Showcase your talents in dance, music, drama, and more.',
    'Annual cultural fest, monthly talent shows, traditional festival celebrations, and cultural exchange programs. Open to all students passionate about arts and culture.',
    '/images/clubs/cultural.jpg',
    '@bmsce_cultural',
    'Prof. Lakshmi Iyer',
    'lakshmi.iyer@bmsce.ac.in',
    120,
    240,
    '2024-01-12 10:30:00',
    '2024-01-12 10:30:00',
    true,
    false
);

-- 7. Music Club
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Music Club',
    'music',
    'extracurricular',
    'Where melodies meet passion',
    'Join us to explore your musical talents, learn instruments, and perform at college events. From classical to contemporary, we celebrate all genres.',
    'Weekly jam sessions, instrument training, vocal coaching, and performance opportunities at college events. Access to music room with guitars, keyboards, and drums.',
    '/images/clubs/music.jpg',
    '@bmsce_music',
    90,
    160,
    '2024-01-08 10:30:00',
    '2024-01-08 10:30:00',
    true,
    false
);

-- 8. Dance Troupe
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    instagram,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Dance Troupe',
    'dance',
    'extracurricular',
    'Express yourself through movement',
    'Learn various dance forms including contemporary, hip-hop, classical, and folk. Perform at college events and inter-college competitions.',
    'Regular practice sessions, choreography workshops, participation in cultural fests and competitions. Professional training from guest choreographers.',
    '@bmsce_dance',
    75,
    140,
    '2024-01-18 10:30:00',
    '2024-01-18 10:30:00',
    true,
    false
);

-- 9. Drama Society
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    instagram,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Drama Society',
    'drama',
    'extracurricular',
    E'All the world\'s a stage',
    'Explore theatre arts, scriptwriting, and stage performance. Annual plays, street theatre, and participation in inter-college drama competitions.',
    'Monthly theatre workshops, script reading sessions, acting classes, and production of plays. Collaborate with professional theatre artists.',
    '@bmsce_drama',
    60,
    110,
    '2024-02-05 10:30:00',
    '2024-02-05 10:30:00',
    true,
    false
);

-- 10. Photography Club
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    instagram,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Photography Club',
    'photography',
    'extracurricular',
    'Capture moments, create memories',
    'Learn photography techniques, photo editing, and visual storytelling. Cover college events and conduct photo walks around Bangalore.',
    'Weekly photo walks, editing workshops, monthly photography contests, and annual exhibition. Learn DSLR basics, composition, and post-processing.',
    '@bmsce_photo',
    85,
    150,
    '2024-01-25 10:30:00',
    '2024-01-25 10:30:00',
    true,
    false
);

-- DEPARTMENT CLUBS (5 clubs)

-- 11. CSE Department Club
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'CSE Department Club',
    'cse-dept',
    'department',
    'Computer Science & Engineering',
    'Department club for CSE students focusing on technical projects, coding competitions, and industry collaborations.',
    'Organize coding competitions, project showcases, technical seminars, and placement preparation sessions. Bridge between students and industry.',
    '/images/clubs/cse.jpg',
    '@bmsce_cse',
    'Dr. Madhav Rao',
    'madhav.rao@bmsce.ac.in',
    250,
    520,
    '2024-01-03 10:30:00',
    '2024-01-03 10:30:00',
    true,
    true
);

-- 12. ECE Department Club
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    instagram,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'ECE Department Club',
    'ece-dept',
    'department',
    'Electronics & Communication Engineering',
    'ECE department association organizing technical workshops, project exhibitions, and industry visits for electronics enthusiasts.',
    'Hands-on workshops on VLSI, embedded systems, signal processing. Annual project expo and technical symposium.',
    '@bmsce_ece',
    220,
    480,
    '2024-01-06 10:30:00',
    '2024-01-06 10:30:00',
    true,
    true
);

-- 13. Mechanical Department Club
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    instagram,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Mechanical Department Club',
    'mech-dept',
    'department',
    'Mechanical Engineering',
    'Explore mechanical engineering through workshops on CAD, manufacturing, and automotive technologies. Participate in SAE competitions.',
    'CAD/CAM workshops, industry visits to manufacturing plants, participation in BAJA and Formula Student competitions.',
    '@bmsce_mech',
    200,
    410,
    '2024-01-14 10:30:00',
    '2024-01-14 10:30:00',
    true,
    false
);

-- 14. Civil Department Club
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    instagram,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Civil Department Club',
    'civil-dept',
    'department',
    'Civil Engineering',
    'Civil engineering students association conducting site visits, structural design workshops, and environmental sustainability projects.',
    'Field visits to construction sites, workshops on AutoCAD and Revit, sustainability projects, and concrete mix design competitions.',
    '@bmsce_civil',
    180,
    360,
    '2024-01-22 10:30:00',
    '2024-01-22 10:30:00',
    true,
    false
);

-- 15. ISE Department Club
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    instagram,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'ISE Department Club',
    'ise-dept',
    'department',
    'Information Science & Engineering',
    'ISE department club focusing on software development, data science, and emerging technologies like AI and blockchain.',
    'Hackathons, app development workshops, data science bootcamps, and collaborative projects with industry partners.',
    '@bmsce_ise',
    230,
    500,
    '2024-02-02 10:30:00',
    '2024-02-02 10:30:00',
    true,
    true
);

COMMIT;

-- Verify the data was inserted
SELECT
    name,
    slug,
    category,
    is_featured,
    member_count,
    view_count
FROM clubs
ORDER BY
    CASE
        WHEN category = 'cocurricular' THEN 1
        WHEN category = 'extracurricular' THEN 2
        WHEN category = 'department' THEN 3
    END,
    created_at;

-- Summary statistics
SELECT
    category,
    COUNT(*) as club_count,
    SUM(member_count) as total_members,
    SUM(view_count) as total_views
FROM clubs
GROUP BY category
ORDER BY category;
