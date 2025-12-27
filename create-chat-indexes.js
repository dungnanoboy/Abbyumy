// Script tạo indexes cho chat system
// Chạy: node create-chat-indexes.js

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || 'abbyumy';

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI not found in .env.local');
  process.exit(1);
}

async function createIndexes() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    
    // 1. Messages collection indexes
    console.log('\n📝 Creating indexes for messages...');
    await db.collection('messages').createIndex(
      { conversationId: 1, createdAt: 1 },
      { name: 'messages_conversation_time' }
    );
    console.log('✅ Created: messages_conversation_time');
    
    await db.collection('messages').createIndex(
      { senderId: 1 },
      { name: 'messages_sender' }
    );
    console.log('✅ Created: messages_sender');
    
    // 2. Conversation participants indexes
    console.log('\n👥 Creating indexes for conversation_participants...');
    await db.collection('conversation_participants').createIndex(
      { userId: 1 },
      { name: 'participants_user' }
    );
    console.log('✅ Created: participants_user');
    
    await db.collection('conversation_participants').createIndex(
      { conversationId: 1, userId: 1 },
      { name: 'participants_conversation_user', unique: true }
    );
    console.log('✅ Created: participants_conversation_user');
    
    // 3. Conversations indexes
    console.log('\n💬 Creating indexes for conversations...');
    await db.collection('conversations').createIndex(
      { updatedAt: -1 },
      { name: 'conversations_updated' }
    );
    console.log('✅ Created: conversations_updated');
    
    await db.collection('conversations').createIndex(
      { type: 1, updatedAt: -1 },
      { name: 'conversations_type_updated' }
    );
    console.log('✅ Created: conversations_type_updated');
    
    // 4. Message reports indexes
    console.log('\n🚨 Creating indexes for message_reports...');
    await db.collection('message_reports').createIndex(
      { messageId: 1 },
      { name: 'reports_message' }
    );
    console.log('✅ Created: reports_message');
    
    await db.collection('message_reports').createIndex(
      { status: 1, createdAt: -1 },
      { name: 'reports_status_time' }
    );
    console.log('✅ Created: reports_status_time');
    
    console.log('\n🎉 All indexes created successfully!');
    
    // List all indexes
    console.log('\n📊 Current indexes:');
    const collections = ['messages', 'conversation_participants', 'conversations', 'message_reports'];
    
    for (const collName of collections) {
      console.log(`\n${collName}:`);
      const indexes = await db.collection(collName).indexes();
      indexes.forEach(idx => {
        console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n✅ Connection closed');
  }
}

createIndexes();
