import sequelize from '../config/database.js';
import User from './User.js';
import Message from './Message.js';


Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });

User.hasMany(Message, { as: 'messagesSent', foreignKey: 'senderId' });
User.hasMany(Message, { as: 'messagesReceived', foreignKey: 'receiverId' });

const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync all models with database
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database or sync models:', error);
    process.exit(1);
  }
};

export { User, Message, initializeDatabase };
export default { User, Message }; 