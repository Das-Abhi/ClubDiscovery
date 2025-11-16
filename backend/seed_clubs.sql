-- ClubCompass - Clubs Data Population Script
-- This script inserts all 53 clubs from Clubs.json into the database
-- Run this after creating the database schema
--
-- Total: 53 clubs
-- - 26 Co-curricular clubs
-- - 10 Department clubs
-- - 5 Extra-curricular (Social) clubs
-- - 12 Extra-curricular (Cultural) clubs

BEGIN;

-- Note: Logos are in frontend/public/images/clubs/{club_id}.jpg
-- Some clubs appear in both co-curricular and department categories with different slugs

-- ========================================
-- CO-CURRICULAR CLUBS (26)
-- ========================================

-- 1. ACM (BMSCE ACM Student Chapter)
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email, faculty_phone,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'ACM (BMSCE ACM Student Chapter)',
    'acm',
    'cocurricular',
    'ACM student chapter — computing & AI',
    'Established in 2021, the BMSCE ACM student chapter focuses on AI and ML concepts. It provides a platform for networking and collaboration among students and professionals.',
    'Established in 2021, the BMSCE ACM student chapter focuses on AI and ML concepts. It provides a platform for networking and collaboration among students and professionals, offering international perspectives in computer science.',
    '/images/clubs/acm.jpg',
    '@bmsce_acm',
    'Dr. Rajesh Kumar',
    'rajesh.kumar@bmsce.ac.in',
    '9845123456',
    165,
    420,
    '2024-01-15 10:30:00',
    '2024-01-15 10:30:00',
    true,
    true
);

-- 2. Aquila Aerospace
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Aquila Aerospace',
    'aquila',
    'cocurricular',
    'Aeromodelling & aerospace',
    'The student club of the department of aerospace engineering conducting technical and non-technical events for students and aerospace enthusiasts.',
    'Aquila Aerospace is the student club of the department of aerospace engineering. It conducts technical and non-technical events for students and aerospace enthusiasts, encouraging the spirit of elevate, lift, fly.',
    '/images/clubs/Aquila.jpg',
    '@aquila_bmsce',
    'Dr. Vishwanath Reddy',
    'vishwanath.reddy@bmsce.ac.in',
    145,
    310,
    '2024-01-20 10:30:00',
    '2024-01-20 10:30:00',
    true,
    false
);

-- 3. Augment.AI
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Augment.AI',
    'augmentai',
    'cocurricular',
    'AI / ML student group',
    'The artificial intelligence club initiated by the ISE department spreading awareness on AI and ML through events, workshops, and accelerator programs.',
    'The artificial intelligence club initiated by the ISE department. It spreads awareness on AI and ML through events, workshops, and accelerator programs, conducted quarterly.',
    '/images/clubs/AugmentAI.jpg',
    '@augmentai_bmsce',
    'Prof. Sneha Patil',
    'sneha.patil@bmsce.ac.in',
    185,
    395,
    '2024-01-12 10:30:00',
    '2024-01-12 10:30:00',
    true,
    true
);

-- 4. AeroBMSCE
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'AeroBMSCE',
    'aero',
    'cocurricular',
    'Aeromodelling & drones',
    'The Aeromodelling Club of BMSCE - a vibrant community for aircraft and drone enthusiasts participating in national and international competitions.',
    'AeroBMSCE, the Aeromodelling Club of BMSCE, is a vibrant community for aircraft and drone enthusiasts. The club participates in national and international aero-design competitions and offers a platform to learn, build and fly.',
    '/images/clubs/aero.JPG',
    '@aerobmsce',
    'Dr. Arun Sharma',
    'arun.sharma@bmsce.ac.in',
    130,
    285,
    '2024-01-18 10:30:00',
    '2024-01-18 10:30:00',
    true,
    false
);

-- 5. Robotics Club
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Robotics Club',
    'robotics',
    'cocurricular',
    'Robotics innovation',
    'Focused on learning and innovation in robotics with hands-on experience in designing and programming robotic systems.',
    'Focused on learning and innovation in robotics. Members design and program robotic systems, gaining hands-on experience while exploring creativity and engineering problem-solving.',
    '/images/clubs/robotics.JPG',
    '@robotics_bmsce',
    'Dr. Vikram Singh',
    'vikram.singh@bmsce.ac.in',
    155,
    340,
    '2024-01-25 10:30:00',
    '2024-01-25 10:30:00',
    true,
    false
);

-- 6. Rocketry
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Rocketry',
    'rocketry',
    'cocurricular',
    'Model rocketry',
    'The model rocket club of BMSCE where students collaborate to design and work with rockets through project-based learning.',
    'Rocketry is the model rocket club of BMSCE where students collaborate to design and work with rockets. The club provides a launchpad for project-based learning and rocket challenges, encouraging teamwork and exploration in rocket science.',
    '/images/clubs/Rocketry.JPG',
    '@rocketry_bmsce',
    'Prof. Kavita Nair',
    'kavita.nair@bmsce.ac.in',
    95,
    215,
    '2024-02-01 10:30:00',
    '2024-02-01 10:30:00',
    true,
    false
);

-- 7. Bullz Racing (SAE)
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Bullz Racing (SAE)',
    'bullz',
    'cocurricular',
    'Formula student / motorsport',
    'The formula student team of BMSCE designing and building formula-style race cars for national-level motorsport competitions.',
    'The formula student team of BMSCE, designing and building formula-style race cars and competing in national-level motorsport competitions.',
    '/images/clubs/bullz.jpg',
    '@bullzracing_bmsce',
    'Dr. Manoj Kumar',
    'manoj.kumar@bmsce.ac.in',
    85,
    195,
    '2024-02-05 10:30:00',
    '2024-02-05 10:30:00',
    true,
    false
);

-- 8. TeamCodeLocked
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'TeamCodeLocked',
    'teamcodelocked',
    'cocurricular',
    'Coding & competitive programming',
    'The premier coding club of BMSCE open to students from all branches focusing on coding proficiency through competitions and workshops.',
    'TeamCodeLocked is the premier coding club of BMSCE, open to students from all branches; it focuses on coding proficiency via competitions, collaboration and workshops.',
    '/images/clubs/teamcodelocked.JPG',
    '@teamcodelocked',
    'Prof. Deepa Rao',
    'deepa.rao@bmsce.ac.in',
    210,
    485,
    '2024-01-08 10:30:00',
    '2024-01-08 10:30:00',
    true,
    true
);

-- 9. DSYNC (Data Science)
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'DSYNC (Data Science)',
    'dsync',
    'cocurricular',
    'Data science & analytics',
    'The first data science club at BMSCE building strong coding, analytical, and collaborative skills among data science enthusiasts.',
    'The first data science club at BMSCE aimed at building strong coding, analytical, and collaborative skills among data science enthusiasts.',
    '/images/clubs/Dsync.jpg',
    '@dsync_bmsce',
    'Dr. Priya Mehta',
    'priya.mehta@bmsce.ac.in',
    175,
    380,
    '2024-01-10 10:30:00',
    '2024-01-10 10:30:00',
    true,
    true
);

-- 10. Varaince (AI & Data Science)
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Varaince (AI & Data Science)',
    'varaince',
    'cocurricular',
    'AI & data science community',
    'A community centered around artificial intelligence and data science running seminars, hands-on sessions, hackathons and mentorship.',
    'A community centered around artificial intelligence and data science that runs seminars, hands-on sessions, hackathons and mentorship for aspiring AI/DS professionals.',
    '/images/clubs/varaince.JPG',
    '@varaince_bmsce',
    'Prof. Amit Deshmukh',
    'amit.deshmukh@bmsce.ac.in',
    190,
    425,
    '2024-01-05 10:30:00',
    '2024-01-05 10:30:00',
    true,
    true
);

-- 11. CORTECHS
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'CORTECHS',
    'corrtechs',
    'cocurricular',
    'MedTech & healthcare innovation',
    'Uniting students passionate about MedTech and healthcare technology to reimagine healthcare solutions.',
    'CORTECHS (formerly AME) unites students passionate about MedTech and healthcare technology to reimagine healthcare solutions, empowering innovation across electronics, AI and healthcare.',
    '/images/clubs/corrtechs.jpg',
    '@cortechs_bmsce',
    'Dr. Sunita Iyer',
    'sunita.iyer@bmsce.ac.in',
    125,
    275,
    '2024-02-08 10:30:00',
    '2024-02-08 10:30:00',
    true,
    false
);

-- 12. CIIE
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'CIIE (Centre for Innovation, Incubation & Entrepreneurship)',
    'ciie',
    'cocurricular',
    'Entrepreneurship & startups',
    'Supporting student entrepreneurship, incubation and startup workshops and activities.',
    'CIIE supports student entrepreneurship, incubation & startup workshops and activities.',
    '/images/clubs/ciie.jpg',
    '@ciie_bmsce',
    'Prof. Ramesh Kulkarni',
    'ramesh.kulkarni@bmsce.ac.in',
    140,
    305,
    '2024-01-22 10:30:00',
    '2024-01-22 10:30:00',
    true,
    false
);

-- 13. IIC BMSCE
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'IIC BMSCE (Startup Cell)',
    'iic',
    'cocurricular',
    'Startup support & incubation',
    'Institute Innovation Council / Startup Cell facilitating new ventures, events, and incubation activities.',
    'Institute Innovation Council / Startup Cell facilitating new ventures, events, and incubation activities.',
    '/images/clubs/iic.jpg',
    '@iic_bmsce',
    'Dr. Lakshmi Narayan',
    'lakshmi.narayan@bmsce.ac.in',
    160,
    350,
    '2024-01-28 10:30:00',
    '2024-01-28 10:30:00',
    true,
    false
);

-- 14. EDC
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'EDC - Entrepreneur Development Cell',
    'edc',
    'cocurricular',
    'Entrepreneur development',
    'Organizing entrepreneurship development programs and workshops to build entrepreneurial skills.',
    'EDC organises entrepreneurship development programs and workshops to build entrepreneurial skills.',
    '/images/clubs/edc.jpg',
    '@edc_bmsce',
    'Prof. Anjali Verma',
    'anjali.verma@bmsce.ac.in',
    135,
    295,
    '2024-02-10 10:30:00',
    '2024-02-10 10:30:00',
    true,
    false
);

-- 15. Business Insights
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Business Insights',
    'business-insights',
    'cocurricular',
    'Business & finance club',
    'The business club of BMSCE inspiring entrepreneurship and managerial thinking through workshops, networking, and finance sessions.',
    'The business club of BMSCE aimed at inspiring entrepreneurship and managerial thinking through workshops, networking, and finance sessions.',
    '/images/clubs/business-insights.JPG',
    '@businessinsights_bmsce',
    'Prof. Suresh Menon',
    'suresh.menon@bmsce.ac.in',
    115,
    255,
    '2024-02-12 10:30:00',
    '2024-02-12 10:30:00',
    true,
    false
);

-- 16. Pentagram
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Pentagram (Mathematics Society)',
    'pentagram',
    'cocurricular',
    'Mathematics & problem solving',
    'The Mathematical Society promoting curiosity in mathematics through competitions, discussions and collaborative learning.',
    'The Mathematical Society promoting curiosity in mathematics via competitions, discussions and collaborative learning.',
    '/images/clubs/Pentagram.JPG',
    '@pentagram_bmsce',
    'Dr. Srinivas Rao',
    'srinivas.rao@bmsce.ac.in',
    105,
    230,
    '2024-02-15 10:30:00',
    '2024-02-15 10:30:00',
    true,
    false
);

-- 17. MEA
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Mechanical Engineering Association (MEA)',
    'mea',
    'cocurricular',
    'Mechanical engineering community',
    'Club for mechanical engineering students conducting technical seminars, workshops and the departmental fest ''Dynamech''.',
    'Club for mechanical engineering students conducting technical seminars, workshops and the departmental fest ''Dynamech'' with an industry-orientated focus.',
    '/images/clubs/mea.JPG',
    '@mea_bmsce',
    'Dr. Harish Gowda',
    'harish.gowda@bmsce.ac.in',
    195,
    425,
    '2024-01-14 10:30:00',
    '2024-01-14 10:30:00',
    true,
    false
);

-- 18. ELSOC
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'ELSOC (Electronics Society)',
    'elsoc',
    'cocurricular',
    'Electronics & VLSI community',
    'Running electronics workshops, project support and student activities focused on VLSI, robotics and related fields.',
    'ELSOC runs electronics workshops, project support and student activities focused on VLSI, robotics and related fields.',
    '/images/clubs/ElSoc.jpg',
    '@elsoc_bmsce',
    'Dr. Anita Desai',
    'anita.desai@bmsce.ac.in',
    170,
    375,
    '2024-01-16 10:30:00',
    '2024-01-16 10:30:00',
    true,
    false
);

-- 19. BMSCE IEEE Computer Society
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'BMSCE IEEE Computer Society',
    'ieee-cs',
    'cocurricular',
    'IEEE Computer Society',
    'Supporting development in computer science research and technology through workshops, seminars, hackathons, and networking.',
    'Supports development in computer science research and technology through workshops, seminars, hackathons, and networking.',
    '/images/clubs/ieee-cs.jpg',
    '@ieee_cs_bmsce',
    'Dr. Madhav Rao',
    'madhav.rao@bmsce.ac.in',
    205,
    465,
    '2024-01-03 10:30:00',
    '2024-01-03 10:30:00',
    true,
    true
);

-- 20. BMSCE IEEE Student Branch
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'BMSCE IEEE Student Branch',
    'ieee-sb',
    'cocurricular',
    'IEEE student branch',
    'Founded in 2009, organizing technical activities to keep students updated with evolving technology.',
    'Founded in 2009, the student branch organises technical activities to keep students updated with evolving technology.',
    '/images/clubs/ieee-sb.jpg',
    '@ieee_bmsce',
    'Prof. Kiran Kumar',
    'kiran.kumar@bmsce.ac.in',
    220,
    510,
    '2024-01-02 10:30:00',
    '2024-01-02 10:30:00',
    true,
    true
);

-- 21. BMSCE IEEE WIE
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'BMSCE IEEE WIE',
    'ieee-wie',
    'cocurricular',
    'Women in Engineering',
    'Women in Engineering chapter promoting equality in STEM and professional skill development among women students.',
    'Women in Engineering chapter promoting equality in STEM and professional skill development among women students.',
    '/images/clubs/ieee-wie.jpg',
    '@ieee_wie_bmsce',
    'Dr. Pooja Shetty',
    'pooja.shetty@bmsce.ac.in',
    145,
    320,
    '2024-01-24 10:30:00',
    '2024-01-24 10:30:00',
    true,
    false
);

-- 22. IEEE PES & Sensors Council
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'IEEE PES & Sensors Council',
    'ieee-pes',
    'cocurricular',
    'Power & sensors community',
    'Focusing on power systems, sustainability and energy technologies through workshops and training.',
    'Focuses on power systems, sustainability and energy technologies through workshops and training.',
    '/images/clubs/ieee-pes.jpg',
    '@ieee_pes_bmsce',
    'Dr. Naveen Gowda',
    'naveen.gowda@bmsce.ac.in',
    125,
    280,
    '2024-01-26 10:30:00',
    '2024-01-26 10:30:00',
    true,
    false
);

-- 23. IEEE Signal Processing Society
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'IEEE Signal Processing Society',
    'ieee-sps',
    'cocurricular',
    'Signal processing research',
    'Dedicated to signal processing theory and applications through conferences, workshops and knowledge sharing.',
    'Dedicated to signal processing theory and applications; organises conferences, workshops and knowledge sharing.',
    '/images/clubs/ieee-sps.JPG',
    '@ieee_sps_bmsce',
    'Prof. Meena Krishnan',
    'meena.krishnan@bmsce.ac.in',
    110,
    245,
    '2024-02-18 10:30:00',
    '2024-02-18 10:30:00',
    true,
    false
);

-- 24. GDSC
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'GDSC (Google Developer Student Club)',
    'gdscl',
    'cocurricular',
    'Developer community',
    'A student-driven group promoting hands-on projects, workshops and innovation-focused activities.',
    'A student-driven group promoting hands-on projects, workshops and innovation-focused activities.',
    '/images/clubs/gdscl.jpg',
    '@gdsc_bmsce',
    'Prof. Arjun Nair',
    'arjun.nair@bmsce.ac.in',
    200,
    475,
    '2024-01-04 10:30:00',
    '2024-01-04 10:30:00',
    true,
    true
);

-- 25. Synapse (Biotech)
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Synapse (Biotech)',
    'synapse',
    'cocurricular',
    'Biotechnology students'' association',
    'The biotechnology students'' association supporting academic growth through workshops, quizzes and hands-on training.',
    'The biotechnology students'' association supporting academic growth through workshops, quizzes and hands-on training for young scientists.',
    '/images/clubs/synapse.JPG',
    '@synapse_bmsce',
    'Dr. Nandini Rao',
    'nandini.rao@bmsce.ac.in',
    120,
    270,
    '2024-02-20 10:30:00',
    '2024-02-20 10:30:00',
    true,
    false
);

-- 26. Upagraha
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Upagraha',
    'upagraha',
    'cocurricular',
    'Student satellite initiative',
    'A student-driven satellite development initiative designing and launching a nanosatellite into low earth orbit.',
    'A student-driven satellite development initiative (with industry partners) involved in designing and launching a nanosatellite into low earth orbit.',
    '/images/clubs/upagraha.JPG',
    '@upagraha_bmsce',
    'Dr. Vivek Sharma',
    'vivek.sharma@bmsce.ac.in',
    75,
    185,
    '2024-02-22 10:30:00',
    '2024-02-22 10:30:00',
    true,
    false
);

-- ========================================
-- DEPARTMENT CLUBS (10)
-- ========================================

-- 27. CodeIO
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    '<CodeIO/>',
    'codeio',
    'department',
    'CSE technical community',
    'A technical community in the CSE department focused on technical upskilling through hackathons, workshops, and development projects.',
    'A technical community in the CSE department focused on technical upskilling through hackathons, workshops, coding sessions, R&D activities and development projects such as web applications.',
    '/images/clubs/CodeIO.jpg',
    '@codeio_bmsce',
    'Dr. Sunil Kumar',
    'sunil.kumar@bmsce.ac.in',
    240,
    555,
    '2024-01-01 10:30:00',
    '2024-01-01 10:30:00',
    true,
    true
);

-- 28. PROTOCOL
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'PROTOCOL',
    'protocol',
    'department',
    'CSE departmental club',
    'The CSE departmental club focused on technical skill development through workshops, talks, competitions, and Protocol Day.',
    'The CSE departmental club focused on technical skill development. It conducts workshops, talks, competitions, and Protocol Day to enhance problem-solving and conceptual understanding in computer science.',
    '/images/clubs/protocol.JPG',
    '@protocol_bmsce',
    'Prof. Ravi Shankar',
    'ravi.shankar@bmsce.ac.in',
    235,
    530,
    '2024-01-06 10:30:00',
    '2024-01-06 10:30:00',
    true,
    true
);

-- 29. ISE STUDENT CLUB
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'ISE STUDENT CLUB',
    'iseclub',
    'department',
    'ISE student community',
    'A collaborative student-run club promoting holistic development, peer learning and community-building activities in the ISE department.',
    'A collaborative student-run club promoting holistic development, peer learning and community-building activities in the ISE department.',
    '/images/clubs/iseclub.jpg',
    '@ise_club_bmsce',
    'Prof. Geeta Patel',
    'geeta.patel@bmsce.ac.in',
    215,
    485,
    '2024-01-09 10:30:00',
    '2024-01-09 10:30:00',
    true,
    true
);

-- 30. EEE Association
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'EEE Association',
    'eeea',
    'department',
    'Electrical & Electronics community',
    'A community for electrical and electronics engineering students organizing workshops, seminars and industrial visits.',
    'A community for students interested in electrical and electronics engineering, organizing workshops, seminars and industrial visits to strengthen learning and innovation.',
    '/images/clubs/eeea.jpg',
    '@eee_bmsce',
    'Dr. Prakash Reddy',
    'prakash.reddy@bmsce.ac.in',
    190,
    430,
    '2024-01-11 10:30:00',
    '2024-01-11 10:30:00',
    true,
    false
);

-- 31. Gradient
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Gradient',
    'gradient',
    'department',
    'AI/ML / AIML club',
    'The AIML club of BMSCE providing real-world project exposure and skill-building in artificial intelligence.',
    'The AIML club of BMSCE providing real-world project exposure and skill-building in artificial intelligence and application-based learning.',
    '/images/clubs/Gradient.jpg',
    '@gradient_bmsce',
    'Dr. Swathi Lakshmi',
    'swathi.lakshmi@bmsce.ac.in',
    180,
    410,
    '2024-01-13 10:30:00',
    '2024-01-13 10:30:00',
    true,
    false
);

-- 32. Aquila (Aerospace Dept)
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Aquila (Aerospace Dept)',
    'aquila-dept',
    'department',
    'Aeromodelling & aerospace',
    'The departmental aerospace engineering club conducting technical and non-technical events.',
    'Aquila Aerospace is the student club of the department of aerospace engineering. It conducts technical and non-technical events for students and aerospace enthusiasts, encouraging the spirit of elevate, lift, fly.',
    '/images/clubs/Aquila.jpg',
    '@aquila_ae_dept',
    'Dr. Vishwanath Reddy',
    'vishwanath.reddy@bmsce.ac.in',
    155,
    340,
    '2024-01-17 10:30:00',
    '2024-01-17 10:30:00',
    true,
    false
);

-- 33. DSync (Data Science Dept)
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'DSync (Data Science Dept)',
    'dsync-dept',
    'department',
    'Data science & analytics',
    'The departmental data science club building analytical and collaborative skills.',
    'The first data science club at BMSCE aimed at building strong coding, analytical and collaborative skills among data science enthusiasts.',
    '/images/clubs/Dsync.jpg',
    '@dsync_dept',
    'Dr. Priya Mehta',
    'priya.mehta@bmsce.ac.in',
    165,
    365,
    '2024-01-19 10:30:00',
    '2024-01-19 10:30:00',
    true,
    false
);

-- 34. ELSOC (ECE Dept)
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'ELSOC (ECE Dept)',
    'elsoc-dept',
    'department',
    'Electronics & VLSI community',
    'The ECE department electronics society conducting workshops and events in VLSI and robotics.',
    'The student community of the ECE department conducting workshops and events to inspire innovation in VLSI, robotics, AI and other advanced technology domains.',
    '/images/clubs/ElSoc.jpg',
    '@elsoc_ece_dept',
    'Dr. Anita Desai',
    'anita.desai@bmsce.ac.in',
    175,
    385,
    '2024-01-21 10:30:00',
    '2024-01-21 10:30:00',
    true,
    false
);

-- 35. Synapse (Biotech Dept)
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Synapse (Biotech Dept)',
    'synapse-dept',
    'department',
    'Biotech students'' association',
    'The departmental biotechnology association supporting academic and career growth.',
    'The first biotechnology students'' association supporting academic and career growth through workshops, quizzes, themed events, hands-on training and community building among young scientists and innovators.',
    '/images/clubs/synapse.JPG',
    '@synapse_biotech_dept',
    'Dr. Nandini Rao',
    'nandini.rao@bmsce.ac.in',
    145,
    315,
    '2024-01-23 10:30:00',
    '2024-01-23 10:30:00',
    true,
    false
);

-- 36. VarAInce (AI/DS Dept)
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'VarAInce (AI/DS Dept)',
    'varaince-dept',
    'department',
    'AI & Data Science community',
    'The departmental AI and data science community running seminars, hackathons and mentorship programs.',
    'A community centered around artificial intelligence and data science that runs seminars, hands-on sessions, hackathons and mentorship for aspiring AI/DS professionals.',
    '/images/clubs/varaince.JPG',
    '@varaince_dept',
    'Prof. Amit Deshmukh',
    'amit.deshmukh@bmsce.ac.in',
    170,
    380,
    '2024-01-27 10:30:00',
    '2024-01-27 10:30:00',
    true,
    false
);

-- ========================================
-- EXTRA-CURRICULAR - SOCIAL (5)
-- ========================================

-- 37. NSS
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'National Service Scheme (NSS)',
    'nss',
    'extracurricular',
    'Social outreach & service',
    'The NSS unit encouraging social responsibility and community service through welfare initiatives and volunteering.',
    'The NSS unit encourages social responsibility and community service. Members engage in welfare initiatives and volunteering activities, developing empathy, leadership, and teamwork.',
    '/images/clubs/nss.JPG',
    '@nss_bmsce',
    'Prof. Ramya Krishnan',
    'ramya.krishnan@bmsce.ac.in',
    185,
    405,
    '2024-01-29 10:30:00',
    '2024-01-29 10:30:00',
    true,
    false
);

-- 38. Rotaract
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Rotaract Club of BMSCE',
    'rotaract',
    'extracurricular',
    'Leadership & Community Service',
    'The Rotaract club focused on community service, professional development and international service building leadership.',
    'The Rotaract club of BMSCE is focused on community service, professional development and international service; members engage in impactful activities that build leadership and contribute to positive change.',
    '/images/clubs/rotaract.JPG',
    '@rotaract_bmsce',
    'Prof. Lakshmi Iyer',
    'lakshmi.iyer@bmsce.ac.in',
    165,
    360,
    '2024-01-31 10:30:00',
    '2024-01-31 10:30:00',
    true,
    false
);

-- 39. Leo Satva
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Leo Satva',
    'leosatva',
    'extracurricular',
    'Leadership & service (Lions-affiliated)',
    'Affiliated with Lions Clubs International, promoting leadership, service and community engagement through volunteer projects.',
    'Affiliated with Lions Clubs International, promoting leadership, service and community engagement through volunteer projects.',
    '/images/clubs/leosatva.JPG',
    '@leosatva_bmsce',
    'Prof. Ashok Kumar',
    'ashok.kumar@bmsce.ac.in',
    95,
    215,
    '2024-02-02 10:30:00',
    '2024-02-02 10:30:00',
    true,
    false
);

-- 40. Mountaineering Club
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Mountaineering Club',
    'mountaineering',
    'extracurricular',
    'Outdoors & trekking',
    'Promoting wall climbing, slacklining, bouldering, rappelling and hiking through climbing trips and sustainable treks.',
    'The Mountaineering Club promotes wall climbing, slacklining, bouldering, rappelling and hiking, organizing climbing trips and sustainable treks for beginners and experienced climbers.',
    '/images/clubs/mountaineering.JPG',
    '@mountaineering_bmsce',
    'Prof. Aditya Rao',
    'aditya.rao@bmsce.ac.in',
    110,
    245,
    '2024-02-04 10:30:00',
    '2024-02-04 10:30:00',
    true,
    false
);

-- 41. Respawn
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Respawn (Gaming Club)',
    'respawn',
    'extracurricular',
    'Competitive & social gaming',
    'The official gaming club hosting tournaments for popular competitive titles and providing a space for gaming.',
    'The official gaming club hosting tournaments for popular competitive titles and providing a space for social and competitive gaming.',
    '/images/clubs/Respawn.JPG',
    '@respawn_bmsce',
    'Prof. Karthik Nair',
    'karthik.nair@bmsce.ac.in',
    135,
    295,
    '2024-02-06 10:30:00',
    '2024-02-06 10:30:00',
    true,
    false
);

-- ========================================
-- EXTRA-CURRICULAR - CULTURAL (12)
-- ========================================

-- 42. Inksanity
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Inksanity – Literary & Debate Society',
    'inksanity',
    'extracurricular',
    'Literary & Debate',
    'The literary and debate society providing a platform for writing, debating, discussion, and creative expression.',
    'The literary and debate society providing a platform for writing, debating, discussion, and creative expression.',
    '/images/clubs/Inksanity.jpg',
    '@inksanity_bmsce',
    'Prof. Meera Nambiar',
    'meera.nambiar@bmsce.ac.in',
    125,
    280,
    '2024-02-07 10:30:00',
    '2024-02-07 10:30:00',
    true,
    false
);

-- 43. Ninaad
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Ninaad (Eastern Music)',
    'ninaad',
    'extracurricular',
    'Music & performance',
    'The Eastern music club promoting Carnatic, Hindustani, light, folk and film music.',
    'The Eastern music club promoting Carnatic, Hindustani, light, folk and film music; a space to learn, jam and perform.',
    '/images/clubs/ninaad.JPG',
    '@ninaad_bmsce',
    'Prof. Shankar Mahadevan',
    'shankar.mahadevan@bmsce.ac.in',
    105,
    235,
    '2024-02-09 10:30:00',
    '2024-02-09 10:30:00',
    true,
    false
);

-- 44. The Groovehouse
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'The Groovehouse',
    'groovehouse',
    'extracurricular',
    'Music & live performance',
    'The music club hosting live performances, competitions and music-based cultural activities.',
    'The music club hosting live performances, competitions and music-based cultural activities to foster a vibrant musical community.',
    '/images/clubs/GrooveHouse.jpg',
    '@groovehouse_bmsce',
    'Prof. Rahul Dravid',
    'rahul.dravid@bmsce.ac.in',
    140,
    310,
    '2024-02-11 10:30:00',
    '2024-02-11 10:30:00',
    true,
    false
);

-- 45. Panache
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Panache – Fashion Team',
    'panache',
    'extracurricular',
    'Fashion & styling',
    'The official fashion club hosting fashion shows, styling workshops and competitions.',
    'The official fashion club of BMSCE hosting fashion shows, styling workshops and competitions for models, designers and makeup artists.',
    '/images/clubs/panache.JPG',
    '@panache_bmsce',
    'Prof. Neha Kapoor',
    'neha.kapoor@bmsce.ac.in',
    90,
    205,
    '2024-02-13 10:30:00',
    '2024-02-13 10:30:00',
    true,
    false
);

-- 46. Paramvah Dance
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Paramvah Dance (Eastern)',
    'paramvah',
    'extracurricular',
    'Indian dance & choreography',
    'College dance team specializing in Eastern and Indian contemporary dance forms celebrating cultural heritage.',
    'College dance team specializing in Eastern and Indian contemporary dance forms, creating expressive performances that celebrate cultural heritage.',
    '/images/clubs/paramvah.JPG',
    '@paramvah_bmsce',
    'Prof. Gayatri Sharma',
    'gayatri.sharma@bmsce.ac.in',
    85,
    195,
    '2024-02-14 10:30:00',
    '2024-02-14 10:30:00',
    true,
    false
);

-- 47. Danz Addix
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Danz Addix (Western Dance)',
    'danzaddix',
    'extracurricular',
    'Western dance team',
    'The western dance team performing hip-hop and contemporary styles in events and competitions.',
    'The western dance team performing hip-hop and contemporary styles, participating in events and competitions.',
    '/images/clubs/DanzAddix.jpg',
    '@danzaddix_bmsce',
    'Prof. Rohan Malhotra',
    'rohan.malhotra@bmsce.ac.in',
    95,
    215,
    '2024-02-16 10:30:00',
    '2024-02-16 10:30:00',
    true,
    false
);

-- 48. Fine Arts Club
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Fine Arts Club',
    'finearts',
    'extracurricular',
    'Visual arts & painting',
    'A platform for creativity involving drawing, sketching, mehendi, wall painting and artistic expressions.',
    'A platform for creativity involving drawing, sketching, mehendi, wall painting and other artistic expressions for all skill levels.',
    '/images/clubs/finearts.jpg',
    '@finearts_bmsce',
    'Prof. Kavita Nair',
    'kavita.nair@bmsce.ac.in',
    115,
    255,
    '2024-02-17 10:30:00',
    '2024-02-17 10:30:00',
    true,
    false
);

-- 49. Falcons
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Falcons (Multimedia)',
    'falcons',
    'extracurricular',
    'Photography & multimedia',
    'The multimedia club comprising photographers, videographers, editors and drone operators documenting college events.',
    'The multimedia club comprising photographers, videographers, editors and drone operators who capture and document major college events.',
    '/images/clubs/Falcons.jpg',
    '@falcons_bmsce',
    'Prof. Arjun Reddy',
    'arjun.reddy@bmsce.ac.in',
    130,
    290,
    '2024-02-19 10:30:00',
    '2024-02-19 10:30:00',
    true,
    false
);

-- 50. Pravrutthi
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Pravrutthi (Theatre)',
    'pravrutthi',
    'extracurricular',
    'Theatre & street performance',
    'The theatre team involved in acting, scriptwriting, stage plays and street performances.',
    'The theatre team involved in acting, scriptwriting, stage plays and street performances nurturing creativity and expressive storytelling.',
    '/images/clubs/Pravrutthi.JPG',
    '@pravrutthi_bmsce',
    'Prof. Deepak Verma',
    'deepak.verma@bmsce.ac.in',
    100,
    225,
    '2024-02-21 10:30:00',
    '2024-02-21 10:30:00',
    true,
    false
);

-- 51. Chiranthana
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Chiranthana (Kannada Sangha)',
    'chiranthana',
    'extracurricular',
    'Kannada language & culture',
    'The Kannada cultural club promoting Kannada language, literature and art with performances and cultural showcases.',
    'The Kannada cultural club promoting Kannada language, literature and art with performances and cultural showcases.',
    '/images/clubs/chiranthana.jpg',
    '@chiranthana_bmsce',
    'Prof. Sudha Murthy',
    'sudha.murthy@bmsce.ac.in',
    110,
    245,
    '2024-02-23 10:30:00',
    '2024-02-23 10:30:00',
    true,
    false
);

-- 52. Samskruthi Sambhrama
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'Samskruthi Sambhrama',
    'samskruthi',
    'extracurricular',
    'Folklore & cultural festival',
    'The folklore society celebrating Indian culture and heritage through diverse cultural art forms.',
    'The folklore society dedicated to celebrating Indian culture and heritage through diverse cultural art forms and performances.',
    '/images/clubs/samskruthi.JPG',
    '@samskruthi_bmsce',
    'Prof. Lakshmi Devi',
    'lakshmi.devi@bmsce.ac.in',
    120,
    270,
    '2024-02-24 10:30:00',
    '2024-02-24 10:30:00',
    true,
    false
);

-- 53. BMS MUNSOC
INSERT INTO clubs (
    id, name, slug, category, tagline, description, overview,
    logo_url, instagram, faculty_name, faculty_email,
    member_count, view_count, created_at, updated_at, is_active, is_featured
) VALUES (
    gen_random_uuid(),
    'BMS MUNSOC (Model UN)',
    'munsoc',
    'extracurricular',
    'Model UN & diplomacy',
    'A platform for developing public policy awareness, diplomacy and oratory skills through Model UN simulations.',
    'A platform for developing public policy awareness, diplomacy and oratory skills; members discuss, deliberate and resolve global issues.',
    '/images/clubs/munsoc.JPG',
    '@munsoc_bmsce',
    'Prof. Vikram Patel',
    'vikram.patel@bmsce.ac.in',
    105,
    235,
    '2024-02-25 10:30:00',
    '2024-02-25 10:30:00',
    true,
    false
);

COMMIT;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

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
        WHEN category = 'department' THEN 2
        WHEN category = 'extracurricular' THEN 3
    END,
    created_at;

-- Summary statistics
SELECT
    category,
    COUNT(*) as club_count,
    SUM(member_count) as total_members,
    SUM(view_count) as total_views,
    COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_count
FROM clubs
GROUP BY category
ORDER BY category;

-- Total count
SELECT COUNT(*) as total_clubs FROM clubs;

-- Featured clubs list
SELECT name, category, member_count FROM clubs WHERE is_featured = true ORDER BY member_count DESC;
