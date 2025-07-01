import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  encryptedAESKey: {
    type: DataTypes.TEXT,
    allowNull: true 
  },
  encryptedAESKeyForRecipient: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  encryptedAESKeyForSender: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  iv: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  room: {
    type: DataTypes.STRING,
    allowNull: false
  },
  delivered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  senderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  receiverId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'messages',
  timestamps: true
});

export default Message; 