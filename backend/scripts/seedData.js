import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/User.js';
import Room from '../models/Room.js';
import Event from '../models/Event.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    console.log('🗑️  Clearing existing data...');
    await Room.deleteMany({});
    await Event.deleteMany({});
    await User.deleteMany({ role: 'SOCIETY_ADMIN' });
    
    console.log('\n📍 Creating rooms...');
    const rooms = [];
    
    for (let i = 101; i <= 110; i++) {
      rooms.push({
        name: `LP${i}`,
        location: `Lab Complex, Floor ${Math.floor((i - 101) / 5) + 1}`,
        capacity: 60,
        facilities: ['Computers', 'Projector', 'AC', 'Whiteboard'],
        isAvailable: true,
      });
    }
    
    for (let floor = 1; floor <= 4; floor++) {
      for (let room = 1; room <= 4; room++) {
        rooms.push({
          name: `LT${floor}0${room}`,
          location: `Lecture Theatre Block, Floor ${floor}`,
          capacity: 120,
          facilities: ['Projector', 'AC', 'Sound System', 'Whiteboard'],
          isAvailable: true,
        });
      });
    }
    
    rooms.push(
      {
        name: 'AS-1',
        location: 'Academic Section 1',
        capacity: 200,
        facilities: ['Projector', 'AC', 'Sound System', 'Stage', 'Lighting'],
        isAvailable: true,
      },
      {
        name: 'AS-2',
        location: 'Academic Section 2',
        capacity: 200,
        facilities: ['Projector', 'AC', 'Sound System', 'Stage', 'Lighting'],
        isAvailable: true,
      },
      {
        name: 'Tan Audi',
        location: 'Main Campus',
        capacity: 500,
        facilities: ['Projector', 'AC', 'Sound System', 'Stage', 'Lighting', 'Green Room'],
        isAvailable: true,
      },
      {
        name: 'C-Hall',
        location: 'Cultural Block',
        capacity: 300,
        facilities: ['Projector', 'AC', 'Sound System', 'Stage', 'Lighting'],
        isAvailable: true,
      },
      {
        name: 'Main Audi',
        location: 'Main Block',
        capacity: 800,
        facilities: ['Projector', 'AC', 'Premium Sound System', 'Stage', 'Lighting', 'Green Room', 'Recording Setup'],
        isAvailable: true,
      }
    );
    
    await Room.insertMany(rooms);
    console.log(`✅ Created ${rooms.length} rooms`);

    console.log('\n👥 Creating society accounts...');
    const societies = [
      { name: 'MLSC', fullName: 'Microsoft Learn Student Chapter', email: 'mlsc@college.edu' },
      { name: 'CCS', fullName: 'Code Cubicle Society', email: 'ccs@college.edu' },
      { name: 'Owasp', fullName: 'OWASP Student Chapter', email: 'owasp@college.edu' },
      { name: 'Enactus', fullName: 'Enactus', email: 'enactus@college.edu' },
      { name: 'PWS', fullName: 'Photography and Wellness Society', email: 'pws@college.edu' },
    ];

    const societyUsers = [];
    for (const society of societies) {
      const user = await User.create({
        name: society.fullName,
        email: society.email,
        passwordHash: 'password123',
        role: 'SOCIETY_ADMIN',
        societyName: society.name,
      });
      societyUsers.push(user);
      console.log(`✅ Created society: ${society.name}`);
    }

    console.log('\n🎉 Creating events...');
    const currentDate = new Date();
    const futureDate = (days) => new Date(currentDate.getTime() + days * 24 * 60 * 60 * 1000);
    const pastDate = (days) => new Date(currentDate.getTime() - days * 24 * 60 * 60 * 1000);

    const events = [
      {
        title: 'React Workshop 2024',
        societyId: societyUsers[1]._id,
        societyName: 'CCS',
        category: 'Workshops',
        description: 'Introduction to React.js for beginners. Hands-on session covering components, hooks, and state management.',
        startDateTime: pastDate(5),
        endDateTime: pastDate(4.8),
        maxParticipants: 50,
        imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
        prizes: [
          { position: '1st Place', title: 'Best Project Award', description: 'Certificate and mentorship opportunity' },
        ],
        status: 'APPROVED',
        createdBy: societyUsers[1]._id,
        registeredParticipants: [],
      },
      {
        title: 'Tech Quiz Competition',
        societyId: societyUsers[0]._id,
        societyName: 'MLSC',
        category: 'Technical',
        description: 'Annual technical quiz competition covering programming, AI, cloud computing, and general tech knowledge.',
        startDateTime: pastDate(3),
        endDateTime: pastDate(2.9),
        maxParticipants: 80,
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
        prizes: [
          { position: '1st Place', title: '₹5,000 Cash Prize', description: 'Winner certificate and cash' },
          { position: '2nd Place', title: '₹3,000 Cash Prize', description: 'Runner-up certificate and cash' },
          { position: '3rd Place', title: '₹2,000 Cash Prize', description: 'Third place certificate and cash' },
        ],
        status: 'APPROVED',
        createdBy: societyUsers[0]._id,
        registeredParticipants: [],
      },

      {
        title: 'Azure Cloud Workshop',
        societyId: societyUsers[0]._id,
        societyName: 'MLSC',
        category: 'Technical',
        description: 'Hands-on workshop on Microsoft Azure cloud services covering storage, compute, and serverless functions.',
        startDateTime: futureDate(10),
        endDateTime: futureDate(10.25),
        maxParticipants: 60,
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
        prizes: [
          { position: '1st Place', title: 'Azure Certification Voucher', description: 'Free AZ-900 certification exam voucher' },
          { position: '2nd Place', title: 'Microsoft Swag Pack', description: 'Official Microsoft merchandise bundle' },
        ],
        status: 'PENDING_APPROVAL',
        createdBy: societyUsers[0]._id,
      },
      {
        title: 'AI/ML Hackathon 2025',
        societyId: societyUsers[0]._id,
        societyName: 'MLSC',
        category: 'Technical',
        description: '24-hour hackathon focused on building AI and Machine Learning solutions for real-world problems.',
        startDateTime: futureDate(20),
        endDateTime: futureDate(21),
        maxParticipants: 100,
        imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
        prizes: [
          { position: '1st Place', title: 'Cash Prize ₹50,000', description: 'Winner team gets ₹50,000 and internship opportunities' },
          { position: '2nd Place', title: 'Cash Prize ₹30,000', description: 'Runner-up team gets ₹30,000' },
          { position: '3rd Place', title: 'Cash Prize ₹20,000', description: 'Third place team gets ₹20,000' },
        ],
        status: 'PENDING_APPROVAL',
        createdBy: societyUsers[0]._id,
      },

      {
        title: 'Full Stack Development Bootcamp',
        societyId: societyUsers[1]._id,
        societyName: 'CCS',
        category: 'Workshops',
        description: 'Intensive 3-day bootcamp covering React, Node.js, MongoDB, and deployment strategies.',
        startDateTime: futureDate(15),
        endDateTime: futureDate(15.5),
        maxParticipants: 80,
        imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
        prizes: [
          { position: 'All Participants', title: 'Completion Certificate', description: 'Certificate of completion with project showcase' },
        ],
        status: 'PENDING_APPROVAL',
        createdBy: societyUsers[1]._id,
      },
      {
        title: 'Code Combat - Programming Competition',
        societyId: societyUsers[1]._id,
        societyName: 'CCS',
        category: 'Technical',
        description: 'Competitive programming contest with algorithmic challenges ranging from easy to advanced levels.',
        startDateTime: futureDate(8),
        endDateTime: futureDate(8.2),
        maxParticipants: 150,
        imageUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800',
        prizes: [
          { position: '1st Place', title: '₹15,000 + Trophy', description: 'Cash prize and winner trophy' },
          { position: '2nd Place', title: '₹10,000 + Trophy', description: 'Cash prize and runner-up trophy' },
          { position: '3rd Place', title: '₹5,000 + Trophy', description: 'Cash prize and trophy' },
        ],
        status: 'PENDING_APPROVAL',
        createdBy: societyUsers[1]._id,
      },

      {
        title: 'Cybersecurity CTF Challenge',
        societyId: societyUsers[2]._id,
        societyName: 'Owasp',
        category: 'Technical',
        description: 'Capture The Flag competition focused on web security, cryptography, and ethical hacking challenges.',
        startDateTime: futureDate(12),
        endDateTime: futureDate(12.3),
        maxParticipants: 100,
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
        prizes: [
          { position: '1st Place', title: 'Security+ Voucher + ₹20,000', description: 'CompTIA Security+ exam voucher and cash prize' },
          { position: '2nd Place', title: '₹12,000', description: 'Cash prize for runner-up' },
          { position: '3rd Place', title: '₹8,000', description: 'Cash prize for third place' },
        ],
        status: 'PENDING_APPROVAL',
        createdBy: societyUsers[2]._id,
      },

      {
        title: 'Social Entrepreneurship Summit',
        societyId: societyUsers[3]._id,
        societyName: 'Enactus',
        category: 'Cultural',
        description: 'Conference featuring successful social entrepreneurs sharing insights on creating sustainable business models with social impact.',
        startDateTime: futureDate(18),
        endDateTime: futureDate(18.3),
        maxParticipants: 200,
        imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
        prizes: [],
        status: 'PENDING_APPROVAL',
        createdBy: societyUsers[3]._id,
      },
      {
        title: 'Business Plan Competition',
        societyId: societyUsers[3]._id,
        societyName: 'Enactus',
        category: 'Other',
        description: 'Pitch your innovative business ideas to industry experts and investors. Best plans get mentorship and seed funding.',
        startDateTime: futureDate(25),
        endDateTime: futureDate(25.25),
        maxParticipants: 50,
        imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
        prizes: [
          { position: '1st Place', title: 'Seed Funding ₹1,00,000', description: 'Seed funding for business implementation' },
          { position: '2nd Place', title: 'Mentorship + ₹50,000', description: '6-month mentorship and cash prize' },
          { position: '3rd Place', title: 'Mentorship + ₹25,000', description: '3-month mentorship and cash prize' },
        ],
        status: 'PENDING_APPROVAL',
        createdBy: societyUsers[3]._id,
      },
      {
        title: 'Rural Development Workshop',
        societyId: societyUsers[3]._id,
        societyName: 'Enactus',
        category: 'Workshops',
        description: 'Interactive workshop on sustainable rural development models, community engagement, and impact measurement.',
        startDateTime: futureDate(30),
        endDateTime: futureDate(30.2),
        maxParticipants: 60,
        imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
        prizes: [],
        status: 'PENDING_APPROVAL',
        createdBy: societyUsers[3]._id,
      },

      {
        title: 'Photography Exhibition & Competition',
        societyId: societyUsers[4]._id,
        societyName: 'PWS',
        category: 'Cultural',
        description: 'Annual photography competition and exhibition showcasing student talent across various themes: Nature, Urban, Portrait, and Abstract.',
        startDateTime: futureDate(14),
        endDateTime: futureDate(14.3),
        maxParticipants: 80,
        imageUrl: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800',
        prizes: [
          { position: '1st Place', title: 'DSLR Camera + ₹10,000', description: 'Professional DSLR camera and cash prize' },
          { position: '2nd Place', title: 'Camera Lens + ₹7,000', description: 'Professional camera lens and cash' },
          { position: '3rd Place', title: 'Photography Kit + ₹5,000', description: 'Photography accessories kit and cash' },
        ],
        status: 'PENDING_APPROVAL',
        createdBy: societyUsers[4]._id,
      },
    ];

    await Event.insertMany(events);
    console.log(`✅ Created ${events.length} events`);

    console.log('\n✨ Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • ${rooms.length} rooms created`);
    console.log(`   • ${societyUsers.length} society accounts created`);
    console.log(`   • ${events.length} events created`);
    console.log(`   • 2 past APPROVED events ready to conclude (CCS, MLSC)`);
    console.log(`   • ${events.length - 2} future events pending approval`);
    console.log('\n🔑 Society Login Credentials:');
    console.log('   Email: [society-name]@college.edu');
    console.log('   Password: password123');
    console.log('\n   Examples:');
    societies.forEach(s => {
      console.log(`   • ${s.email} / password123`);
    });

  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
};

const main = async () => {
  await connectDB();
  await seedData();
  await mongoose.connection.close();
  console.log('\n👋 Database connection closed');
  process.exit(0);
};

main();
