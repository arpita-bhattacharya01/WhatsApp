import { Message, User } from '../models/index.js';

export const getChatData = async (req, res) => {
  const { roomId } = req.params;

  try {
    const messages = await Message.findAll({
      where: { room: roomId },
      order: [['createdAt', 'ASC']],
      include: [
        { model: User, as: 'sender' },
        { model: User, as: 'receiver' }
      ],
    });

    // Map to include both old and new fields for backward compatibility
    const mappedMessages = messages.map(msg => ({
      id: msg.id,
      sender: msg.senderId,
      receiver: msg.receiverId,
      text: msg.text,
      encryptedAESKeyForRecipient: msg.encryptedAESKeyForRecipient || null,
      encryptedAESKeyForSender: msg.encryptedAESKeyForSender || null,
      encryptedAESKey: msg.encryptedAESKey || null, // For backward compatibility with old messages
      iv: msg.iv,
      room: msg.room,
      createdAt: msg.createdAt,
    }));

    res.json(mappedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

export const createMessage = async (messageData) => {
  try {
    const message = await Message.create(messageData);
    return message;
  } catch (error) {
    console.error('Error creating message:', error);
    throw error;
  }
}; 