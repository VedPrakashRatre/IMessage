import dns from 'dns';
dns.setServers(['8.8.8.8','8.8.4.4']);
import 'dotenv/config';
import mongoose from 'mongoose';
import Message from './src/models/Message.js';
import User from './src/models/User.js';

await mongoose.connect(process.env.MONGO_URI);

const totalMessages = await Message.countDocuments();
console.log('total messages in DB:', totalMessages);

const users = await User.find().limit(5);
console.log('user docs sample:');
users.forEach(u => {
  console.log('  _id:', u._id, '| email:', u.email, '| fullName:', u.fullName, '| profilePic:', u.profilePic);
});

const testUserId = users[0]._id;
console.log('--- testing with user _id:', testUserId, '---');

try {
  const getUsers = await User.find({_id:{$ne: testUserId}}).select('-clerkId');
  console.log('getUsersForSidebar OK: count =', getUsers.length);
} catch(e) {
  console.error('getUsersForSidebar ERROR:', e.message, '\n', e);
}

try {
  const conversation = await Message.aggregate([
    { $match: { $or: [{ senderId: testUserId }, { receiverId: testUserId }]}},
    { $group: { _id: { $cond: [{ $eq: ['$senderId', testUserId] }, '$receiverId', '$senderId'] },
      lastMessageAt: { $max: '$createdAt' },
    }},
    { $sort: {lastMessageAt: -1 }},
    { $lookup: {from: 'users', localField: '_id', foreignField: '_id', as: 'user'}},
    { $match: {'user.0': {$exists: true}}},
    { $replaceRoot: {newRoot: {$first: '$user'}}},
    { $project: {clerkId: 0}},
  ]);
  console.log('getConversationsForSidebar OK:', JSON.stringify(conversation, null, 2));
} catch(e) {
  console.error('getConversationsForSidebar ERROR:', e.message, '\n', e);
}

await mongoose.connection.close();
