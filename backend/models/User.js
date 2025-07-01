import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  publicKey: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  privateKeyEncrypted: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'users',
  timestamps: true
});

export default User; 