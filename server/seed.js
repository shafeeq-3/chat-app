require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const { userSchema } = require('./models/userModel');
const { postSchema } = require('./models/postsModel');
const { conversationSchema } = require('./models/conversationModel');
const { messageSchema } = require('./models/messageModel');
const { notificationSchema } = require('./models/notificationModel');

// Professional sample image URLs (using placeholder images)
const PROFILE_IMAGES = [
    'https://i.pravatar.cc/300?img=1',
    'https://i.pravatar.cc/300?img=2',
    'https://i.pravatar.cc/300?img=3',
    'https://i.pravatar.cc/300?img=5',
    'https://i.pravatar.cc/300?img=7',
    'https://i.pravatar.cc/300?img=8',
    'https://i.pravatar.cc/300?img=9',
    'https://i.pravatar.cc/300?img=10',
    'https://i.pravatar.cc/300?img=11',
    'https://i.pravatar.cc/300?img=12',
    'https://i.pravatar.cc/300?img=13',
    'https://i.pravatar.cc/300?img=14',
    'https://i.pravatar.cc/300?img=15'
];

const POST_IMAGES = [
    'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80',
    'https://images.unsplash.com/photo-1682687221213-8f0e3f0f9f3f?w=800&q=80',
    'https://images.unsplash.com/photo-1682687221363-f8b5c2a3b1e0?w=800&q=80',
    'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=800&q=80',
    'https://images.unsplash.com/photo-1682687220199-d0124f48f95b?w=800&q=80',
    'https://images.unsplash.com/photo-1682687220923-c58b9a4592ae?w=800&q=80',
    'https://images.unsplash.com/photo-1682687220067-dced9a881b56?w=800&q=80',
    'https://images.unsplash.com/photo-1682687221038-404cb8830901?w=800&q=80'
];

const SAMPLE_USERS = [
    {
        name: 'Sarah Johnson',
        username: 'sarahjohnson',
        email: 'sarah.johnson@example.com',
        password: 'Password123!',
        bio: '🎨 Digital Artist & Creative Director | Coffee enthusiast ☕ | Based in NYC 🗽',
        location: 'New York, USA',
        website: 'https://sarahjohnson.com',
        work: 'Creative Director at PixelArt Studio'
    },
    {
        name: 'Michael Chen',
        username: 'michaelchen',
        email: 'michael.chen@example.com',
        password: 'Password123!',
        bio: '💻 Full Stack Developer | Tech Blogger | Open Source Contributor 🚀',
        location: 'San Francisco, USA',
        website: 'https://devmichael.io',
        work: 'Senior Developer at TechCorp'
    },
    {
        name: 'Emma Rodriguez',
        username: 'emmarodriguez',
        email: 'emma.rodriguez@example.com',
        password: 'Password123!',
        bio: '📸 Professional Photographer | Travel Enthusiast ✈️ | Nature Lover 🌿',
        location: 'Barcelona, Spain',
        website: 'https://emmaphotography.com',
        work: 'Freelance Photographer'
    },
    {
        name: 'James Wilson',
        username: 'jameswilson',
        email: 'james.wilson@example.com',
        password: 'Password123!',
        bio: '🎬 Film Director | Storyteller | Cinephile 🎥',
        location: 'Los Angeles, USA',
        website: 'https://jameswilson.film',
        work: 'Director at Dreamworks'
    },
    {
        name: 'Priya Sharma',
        username: 'priyasharma',
        email: 'priya.sharma@example.com',
        password: 'Password123!',
        bio: '🧘‍♀️ Yoga Instructor | Wellness Coach | Mindfulness Advocate 🌸',
        location: 'Mumbai, India',
        website: 'https://priyawellness.com',
        work: 'Founder of Mindful Living Studio'
    },
    {
        name: 'Alex Thompson',
        username: 'alexthompson',
        email: 'alex.thompson@example.com',
        password: 'Password123!',
        bio: '🎵 Music Producer | Sound Designer | Audio Engineer 🎧',
        location: 'London, UK',
        website: 'https://alexsound.studio',
        work: 'Music Producer at SoundWave Records'
    },
    {
        name: 'Lisa Anderson',
        username: 'lisaanderson',
        email: 'lisa.anderson@example.com',
        password: 'Password123!',
        bio: '👩‍🍳 Chef & Food Blogger | Recipe Creator | Culinary Artist 🍴',
        location: 'Paris, France',
        website: 'https://lisascuisine.com',
        work: 'Head Chef at Le Gourmet'
    },
    {
        name: 'David Kim',
        username: 'davidkim',
        email: 'david.kim@example.com',
        password: 'Password123!',
        bio: '🏋️ Fitness Trainer | Nutrition Expert | Marathon Runner 🏃‍♂️',
        location: 'Seoul, South Korea',
        website: 'https://davidfitness.com',
        work: 'Personal Trainer at Elite Fitness'
    },
    {
        name: 'Sophia Martinez',
        username: 'sophiamartinez',
        email: 'sophia.martinez@example.com',
        password: 'Password123!',
        bio: '📚 Author & Writer | Book Lover | Coffee Addict ☕',
        location: 'Madrid, Spain',
        website: 'https://sophiawrites.com',
        work: 'Published Author at Penguin Books'
    },
    {
        name: 'Ryan Cooper',
        username: 'ryancooper',
        email: 'ryan.cooper@example.com',
        password: 'Password123!',
        bio: '🎮 Game Developer | Esports Enthusiast | Tech Geek 👾',
        location: 'Tokyo, Japan',
        website: 'https://ryandev.games',
        work: 'Game Developer at GameStudio Inc'
    }
];

const POST_CONTENTS = [
    {
        content: "Just finished working on an amazing new design project! 🎨 The creative process is always so rewarding. Can't wait to share the final results with everyone!",
        hasImage: true
    },
    {
        content: "Beautiful sunset at the beach today 🌅 Sometimes you just need to take a moment and appreciate the simple things in life. Nature never fails to inspire me!",
        hasImage: true
    },
    {
        content: "Excited to announce that I'll be speaking at the Tech Conference 2026! 🚀 Looking forward to sharing insights on modern web development and connecting with fellow developers.",
        hasImage: false
    },
    {
        content: "Coffee and code - the perfect combination for a productive morning ☕💻 Working on some exciting new features today!",
        hasImage: true
    },
    {
        content: "Travel tip: Always explore the local cuisine when visiting a new place! 🍜 Just tried the most amazing ramen in Tokyo. Food is the best way to experience culture!",
        hasImage: true
    },
    {
        content: "Finished reading an incredible book today 📚 'The Art of Learning' by Josh Waitzkin. Highly recommend it to anyone looking to improve their skills and mindset!",
        hasImage: false
    },
    {
        content: "Workout complete! 💪 Remember, consistency is key. Small daily improvements lead to big results over time. Keep pushing yourself!",
        hasImage: true
    },
    {
        content: "New blog post is live! 📝 Sharing my thoughts on the latest trends in AI and machine learning. Link in bio - would love to hear your thoughts!",
        hasImage: false
    },
    {
        content: "Captured this stunning moment during golden hour 📸 Photography teaches you to see the world differently. Every moment is an opportunity for art!",
        hasImage: true
    },
    {
        content: "Grateful for the amazing team I get to work with every day! 🙏 Collaboration and creativity make everything possible. Here's to more great projects together!",
        hasImage: false
    },
    {
        content: "Just launched our new product! 🎉 Months of hard work and dedication have finally paid off. Thank you to everyone who supported us on this journey!",
        hasImage: true
    },
    {
        content: "Morning meditation session complete 🧘‍♀️ Starting the day with mindfulness makes all the difference. How do you start your mornings?",
        hasImage: false
    },
    {
        content: "Exploring the city on two wheels 🚴‍♂️ There's something special about discovering hidden gems in your own neighborhood. What's your favorite way to explore?",
        hasImage: true
    },
    {
        content: "Cooking experiment: Success! 👨‍🍳 Tried a new recipe today and it turned out amazing. Nothing beats homemade food made with love!",
        hasImage: true
    },
    {
        content: "Late night coding session 🌙💻 Sometimes the best ideas come after midnight. Working on something special - stay tuned!",
        hasImage: false
    }
];

const COMMENTS = [
    "This is absolutely amazing! 🔥",
    "Love this! Keep up the great work! 💯",
    "So inspiring! Thanks for sharing! 🙌",
    "This made my day! 😊",
    "Incredible work! Can't wait to see more! 👏",
    "This is exactly what I needed to see today! ❤️",
    "Wow, this is fantastic! 🌟",
    "You're so talented! Keep it up! 💪",
    "This resonates with me so much! 🎯",
    "Beautiful! Absolutely beautiful! 😍",
    "Thanks for sharing this! Very helpful! 🙏",
    "I completely agree with this! 💭",
    "This is gold! Saving for later! ⭐",
    "You never disappoint! Amazing as always! 🎨",
    "This deserves more recognition! 👀"
];

const REPLIES = [
    "Thank you so much! 😊",
    "I really appreciate your support! 🙏",
    "Glad you liked it! More coming soon! 🚀",
    "Thanks for the kind words! ❤️",
    "Your feedback means a lot! 💙",
    "So happy to hear that! 😄",
    "Thank you! Working hard on more content! 💪",
    "Really appreciate it! Stay tuned for more! ✨"
];

async function clearDatabase() {
    console.log('🗑️  Clearing existing data...');
    await userSchema.deleteMany({});
    await postSchema.deleteMany({});
    await conversationSchema.deleteMany({});
    await messageSchema.deleteMany({});
    await notificationSchema.deleteMany({});
    console.log('✅ Database cleared!');
}

async function createUsers() {
    console.log('👥 Creating users...');
    const users = [];
    
    for (let i = 0; i < SAMPLE_USERS.length; i++) {
        const userData = {
            ...SAMPLE_USERS[i],
            profilePicture: PROFILE_IMAGES[i],
            followers: [],
            following: [],
            phone: `+1-555-${Math.floor(1000 + Math.random() * 9000)}`,
            birthday: `${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 12) + 1}/${1980 + Math.floor(Math.random() * 25)}`
        };
        
        const user = new userSchema(userData);
        await user.save();
        users.push(user);
        console.log(`   ✓ Created user: ${user.username}`);
    }
    
    return users;
}

async function createFollowerRelationships(users) {
    console.log('🔗 Creating follower relationships...');
    
    // Create realistic follower networks
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const numFollowing = Math.floor(Math.random() * 5) + 3; // 3-7 following
        
        const potentialFollows = users.filter(u => u._id.toString() !== user._id.toString());
        const shuffled = potentialFollows.sort(() => 0.5 - Math.random());
        const toFollow = shuffled.slice(0, numFollowing);
        
        for (const followUser of toFollow) {
            if (!user.following.includes(followUser._id)) {
                user.following.push(followUser._id);
                followUser.followers.push(user._id);
                
                await user.save();
                await followUser.save();
            }
        }
        
        console.log(`   ✓ ${user.username} now following ${toFollow.length} users`);
    }
}

async function createPosts(users) {
    console.log('📝 Creating posts...');
    const posts = [];
    const postPromises = [];
    
    // Each user creates 2-4 posts
    for (const user of users) {
        const numPosts = Math.floor(Math.random() * 3) + 2; // 2-4 posts
        
        for (let i = 0; i < numPosts; i++) {
            const postContent = POST_CONTENTS[Math.floor(Math.random() * POST_CONTENTS.length)];
            const hasImage = postContent.hasImage && Math.random() > 0.3;
            
            const post = new postSchema({
                author: user.username,
                authorId: user._id,
                avatar: user.profilePicture,
                content: postContent.content,
                image: hasImage,
                imageUrl: hasImage ? POST_IMAGES[Math.floor(Math.random() * POST_IMAGES.length)] : '',
                likes: 0,
                comments: 0,
                shares: Math.floor(Math.random() * 20),
                likedBy: [],
                savedBy: [],
                commentsList: []
            });
            
            postPromises.push(post.save().then(savedPost => {
                posts.push(savedPost);
                console.log(`   ✓ Created post by ${user.username}`);
            }));
        }
    }
    
    await Promise.all(postPromises);
    return posts;
}

async function addLikesToPosts(posts, users) {
    console.log('❤️  Adding likes to posts...');
    
    for (const post of posts) {
        // Each post gets 3-15 likes
        const numLikes = Math.floor(Math.random() * 13) + 3;
        const likers = users
            .filter(u => u._id.toString() !== post.authorId.toString())
            .sort(() => 0.5 - Math.random())
            .slice(0, numLikes);
        
        for (const liker of likers) {
            if (!post.likedBy.includes(liker._id)) {
                post.likedBy.push(liker._id);
                post.likes++;
            }
        }
        
        await post.save();
        console.log(`   ✓ Added ${numLikes} likes to post by ${post.author}`);
    }
}

async function addCommentsAndReplies(posts, users) {
    console.log('💬 Adding comments and replies...');
    
    for (const post of posts) {
        // Each post gets 2-6 comments
        const numComments = Math.floor(Math.random() * 5) + 2;
        
        for (let i = 0; i < numComments; i++) {
            const commenter = users[Math.floor(Math.random() * users.length)];
            const commentText = COMMENTS[Math.floor(Math.random() * COMMENTS.length)];
            
            const comment = {
                _id: new mongoose.Types.ObjectId(),
                author: commenter.username,
                authorId: commenter._id,
                profilePicture: commenter.profilePicture,
                content: commentText,
                time: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric' }),
                likes: Math.floor(Math.random() * 20),
                likedBy: [],
                replies: []
            };
            
            // 40% chance of having 1-3 replies
            if (Math.random() > 0.6) {
                const numReplies = Math.floor(Math.random() * 3) + 1;
                
                for (let j = 0; j < numReplies; j++) {
                    const replier = users[Math.floor(Math.random() * users.length)];
                    const replyText = REPLIES[Math.floor(Math.random() * REPLIES.length)];
                    
                    const reply = {
                        _id: new mongoose.Types.ObjectId(),
                        author: replier.username,
                        authorId: replier._id,
                        profilePicture: replier.profilePicture,
                        content: replyText,
                        time: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric' }),
                        likes: Math.floor(Math.random() * 10),
                        likedBy: [],
                        replyingTo: commenter.username,
                        replyingToId: commenter._id
                    };
                    
                    comment.replies.push(reply);
                }
            }
            
            post.commentsList.push(comment);
        }
        
        post.comments = post.commentsList.length;
        await post.save();
        console.log(`   ✓ Added ${numComments} comments to post by ${post.author}`);
    }
}

async function createConversationsAndMessages(users) {
    console.log('💌 Creating conversations and messages...');
    
    // Create 8-12 conversations
    const numConversations = Math.floor(Math.random() * 5) + 8;
    
    for (let i = 0; i < numConversations; i++) {
        const user1 = users[Math.floor(Math.random() * users.length)];
        let user2 = users[Math.floor(Math.random() * users.length)];
        
        // Make sure they're different users
        while (user2._id.toString() === user1._id.toString()) {
            user2 = users[Math.floor(Math.random() * users.length)];
        }
        
        const conversation = new conversationSchema({
            participants: [user1._id, user2._id],
            lastMessageAt: new Date()
        });
        
        await conversation.save();
        
        // Add 3-8 messages to each conversation
        const numMessages = Math.floor(Math.random() * 6) + 3;
        
        const messageTexts = [
            "Hey! How are you doing?",
            "I'm great! Thanks for asking 😊",
            "Did you see my latest post?",
            "Yes! It was amazing! 🔥",
            "Thanks! I really appreciate it!",
            "We should catch up sometime!",
            "Absolutely! Let's plan something soon.",
            "How's work going?",
            "Pretty good! Busy but exciting.",
            "That sounds great! Keep it up! 💪",
            "Have you tried that new cafe downtown?",
            "Not yet, but I've heard good things!",
            "We should go together sometime!",
            "That would be awesome! 😄",
            "Looking forward to it!"
        ];
        
        for (let j = 0; j < numMessages; j++) {
            const sender = j % 2 === 0 ? user1 : user2;
            const recipient = j % 2 === 0 ? user2 : user1;
            
            const message = new messageSchema({
                conversation: conversation._id,
                sender: sender._id,
                recipient: recipient._id,
                content: messageTexts[j % messageTexts.length],
                imageUrl: '',
                readAt: Math.random() > 0.3 ? new Date() : null
            });
            
            await message.save();
        }
        
        console.log(`   ✓ Created conversation between ${user1.username} and ${user2.username} with ${numMessages} messages`);
    }
}

async function createNotifications(users, posts) {
    console.log('🔔 Creating notifications...');
    
    // Create various types of notifications
    for (let i = 0; i < 20; i++) {
        const recipient = users[Math.floor(Math.random() * users.length)];
        const sender = users[Math.floor(Math.random() * users.length)];
        
        if (recipient._id.toString() === sender._id.toString()) continue;
        
        const types = ['like', 'comment', 'follow'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        let message = '';
        let post = null;
        
        if (type === 'like') {
            post = posts.find(p => p.authorId.toString() === recipient._id.toString());
            if (post) {
                message = `${sender.username} liked your post`;
            } else {
                continue;
            }
        } else if (type === 'comment') {
            post = posts.find(p => p.authorId.toString() === recipient._id.toString());
            if (post) {
                message = `${sender.username} commented on your post`;
            } else {
                continue;
            }
        } else if (type === 'follow') {
            message = `${sender.username} started following you`;
        }
        
        const notification = new notificationSchema({
            recipient: recipient._id,
            sender: sender._id,
            type,
            post: post ? post._id : null,
            message,
            read: Math.random() > 0.5
        });
        
        await notification.save();
        console.log(`   ✓ Created ${type} notification for ${recipient.username}`);
    }
}

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...\n');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');
        
        // Clear existing data
        await clearDatabase();
        console.log('');
        
        // Create users
        const users = await createUsers();
        console.log('');
        
        // Create follower relationships
        await createFollowerRelationships(users);
        console.log('');
        
        // Create posts
        const posts = await createPosts(users);
        console.log('');
        
        // Add likes to posts
        await addLikesToPosts(posts, users);
        console.log('');
        
        // Add comments and replies
        await addCommentsAndReplies(posts, users);
        console.log('');
        
        // Create conversations and messages
        await createConversationsAndMessages(users);
        console.log('');
        
        // Create notifications
        await createNotifications(users, posts);
        console.log('');
        
        console.log('🎉 Database seeding completed successfully!\n');
        console.log('📊 Summary:');
        console.log(`   - Users created: ${users.length}`);
        console.log(`   - Posts created: ${posts.length}`);
        console.log(`   - Total likes: ${posts.reduce((sum, post) => sum + post.likes, 0)}`);
        console.log(`   - Total comments: ${posts.reduce((sum, post) => sum + post.commentsList.length, 0)}`);
        console.log('');
        console.log('🔐 Sample Login Credentials:');
        console.log('   Email: sarah.johnson@example.com');
        console.log('   Password: Password123!');
        console.log('');
        console.log('   Email: michael.chen@example.com');
        console.log('   Password: Password123!');
        console.log('');
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Database connection closed');
        process.exit(0);
    }
}

// Run the seeding
seedDatabase();
