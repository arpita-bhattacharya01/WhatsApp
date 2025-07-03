import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import socket from '../utils/socket';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Header from '@/component/Header';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import forge from 'node-forge';
import { useAuth } from '../context/AuthContext';

type Message = {
  sender: string;
  text: string;
  isMe?: boolean;
};

interface User {
  id: string;
  name: string;
  email: string;
}

const { width } = Dimensions.get('window');

// Static styles that don't depend on component state
const staticStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: '#0f172a',
  },
  fullScreenSidebar: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 16,
  },
  fullScreenChat: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  sidebar: {
    width: width * 0.25,
    backgroundColor: '#111827',
    padding: 16,
    borderRightWidth: 1,
    borderRightColor: '#1f2937',
  },
  logo: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#ccc',
    fontWeight: '600',
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  toggleText: {
    color: '#aaa',
    fontSize: 14,
  },
  contact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  contactAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  contactName: {
    color: '#fff',
    fontWeight: '600',
  },
  onlineText: {
    color: '#4ade80',
    fontSize: 12,
  },
  chatArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 6,
    maxWidth: '70%',
  },
  messageLeft: {
    alignSelf: 'flex-start',
  },
  messageRight: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#999',
  },
  messageBubble: {
    backgroundColor: '#1e293b',
    padding: 10,
    borderRadius: 14,
    marginHorizontal: 8,
  },
  messageText: {
    color: '#fff',
    fontSize: 14,
  },
  input: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    color: '#fff',
    marginRight: 10,
  },
  iconButton: {
    backgroundColor: '#1e40af',
    borderRadius: 20,
    padding: 10,
    marginLeft: 4,
  },
  selectUserMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Base input container style without dynamic marginBottom
  baseInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
    backgroundColor: '#0f172a',
    paddingBottom: Platform.select({
      ios: 20,
      android: 0,
    }),
  },
});

const ChatScreen = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userList, setUserList] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [room, setRoom] = useState<string>('');
  const [myUser, setMyUser] = useState<User | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const { password: userPassword, setPassword } = useAuth();
  const isMobile = Dimensions.get('window').width < 768;

  // Keyboard handling
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Dynamic style for input container
  const inputContainerStyle = {
    ...staticStyles.baseInputContainer,
    marginBottom: keyboardHeight > 0 ? keyboardHeight : Platform.select({
      ios: 0,
      android: 20,
    }),   
  };

  // Fetch user list
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('https://whatsapp-tmg9.onrender.com/api/auth/users');
        setUserList(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        console.log("this is the userData" , userData)
        const storedPassword = await AsyncStorage.getItem('password');
        console.log("this is user password" , storedPassword)
        if (userData) {
          setMyUser(JSON.parse(userData));
        }
        if (storedPassword) {
          setPassword(storedPassword);
        }
      } catch (error) {
        console.error('Failed to load user or password', error);
      }
    };
    loadUser();
  }, []);

  // Join room when user is selected
  const selectUser = (user: User) => {
    if (!myUser) return;

    setSelectedUser(user);
    const roomId = [myUser.id, user.id].sort().join('_');
    setRoom(roomId);
    socket.emit('join_room', roomId);
    setMessages([]);
  };

  // Encryption/decryption functions
  const decryptWithAESLocally = (encryptedMessage: string, aesKeyBase64: string, ivBase64: string): string => {
    try {
      if (!aesKeyBase64 || !ivBase64) throw new Error('Missing AES key or IV');

      const aesKey = forge.util.decode64(aesKeyBase64);
      const iv = forge.util.decode64(ivBase64);
      const encryptedBytes = forge.util.decode64(encryptedMessage);

      const decipher = forge.cipher.createDecipher('AES-CBC', aesKey);
      decipher.start({ iv });
      decipher.update(forge.util.createBuffer(encryptedBytes));
      const success = decipher.finish();

      if (!success) throw new Error('AES decryption failed');

      return decipher.output.toString();
    } catch (error) {
      console.error('Local AES decryption error:', error);
      return '[Decryption Failed]';
    }
  };

  const formatPublicKeyPEM = (key: string): string => {
    if (key.includes('-----BEGIN PUBLIC KEY-----')) {
      return key.trim();
    }

    const lines = key.match(/.{1,64}/g) || [];
    return `-----BEGIN PUBLIC KEY-----\n${lines.join('\n')}\n-----END PUBLIC KEY-----`;
  };

  const encryptMessageHybrid = async (message: string, recipientPublicKeyBase64: string, myPublicKeyBase64: string) => {
    const recipientPem = formatPublicKeyPEM(recipientPublicKeyBase64);
    const myPem = formatPublicKeyPEM(myPublicKeyBase64);
    const recipientPublicKey = forge.pki.publicKeyFromPem(recipientPem);
    const myPublicKey = forge.pki.publicKeyFromPem(myPem);

    const aesKey = forge.random.getBytesSync(16);
    const iv = forge.random.getBytesSync(16);

    const cipher = forge.cipher.createCipher('AES-CBC', aesKey);
    cipher.start({ iv });
    cipher.update(forge.util.createBuffer(message, 'utf8'));
    cipher.finish();
    const encryptedMessage = cipher.output.getBytes();

    // Encrypt AES key with both recipient's and sender's public keys
    const encryptedAESKeyForRecipient = recipientPublicKey.encrypt(aesKey, 'RSA-OAEP');
    const encryptedAESKeyForSender = myPublicKey.encrypt(aesKey, 'RSA-OAEP');

    return {
      encryptedAESKeyForRecipient: forge.util.encode64(encryptedAESKeyForRecipient),
      encryptedAESKeyForSender: forge.util.encode64(encryptedAESKeyForSender),
      encryptedMessage: forge.util.encode64(encryptedMessage),
      iv: forge.util.encode64(iv),
      aesKeyUsed: forge.util.encode64(aesKey),
    };
  };

  const sendMessage = async () => {
    if (!myUser || !selectedUser || !message.trim()) return;

    try {
      // Get recipient's public key
      const recipientRes = await fetch(`https://whatsapp-tmg9.onrender.com/api/auth/user/${selectedUser.id}/public-key`);
      const recipientData = await recipientRes.json();
      const recipientPublicKey = recipientData.publicKey;

      // Get my public key
      const myRes = await fetch(`https://whatsapp-tmg9.onrender.com/api/auth/user/${myUser.id}/public-key`);
      const myData = await myRes.json();
      const myPublicKey = myData.publicKey;

      const encryptedPayload = await encryptMessageHybrid(message, recipientPublicKey, myPublicKey);

      const newMsg = {
        sender: myUser.id,
        receiver: selectedUser.id,
        text: encryptedPayload.encryptedMessage,
        encryptedAESKeyForRecipient: encryptedPayload.encryptedAESKeyForRecipient,
        encryptedAESKeyForSender: encryptedPayload.encryptedAESKeyForSender,
        iv: encryptedPayload.iv,
        room,
        aesKeyUsed: encryptedPayload.aesKeyUsed,
      };

      socket.emit('send_message', newMsg);
      setMessages((prev) => [...prev, { text: message, sender: myUser.id, isMe: true }]);
      setMessage('');
    } catch (err) {
      console.error('Failed to send encrypted message:', err);
    }
  };

  const formatEncryptedPrivateKeyPEM = (base64: string): string => {
    if (base64.includes('-----BEGIN ENCRYPTED PRIVATE KEY-----')) {
      return base64.trim();
    }

    const lines = base64.match(/.{1,64}/g) || [];
    return `-----BEGIN ENCRYPTED PRIVATE KEY-----\n${lines.join('\n')}\n-----END ENCRYPTED PRIVATE KEY-----`;
  };

  const decryptMessageHybrid = (
    encryptedData: { 
      encryptedAESKeyForRecipient?: string; 
      encryptedAESKeyForSender?: string; 
      encryptedAESKey?: string; // For backward compatibility with old messages
      encryptedMessage: string; 
      iv: string 
    },
    privateKey: forge.pki.rsa.PrivateKey,
    isSentByMe: boolean
  ): string => {
    try {
      let encryptedAESKey: string | undefined;

      // Handle new dual-encryption format
      if (encryptedData.encryptedAESKeyForRecipient && encryptedData.encryptedAESKeyForSender) {
        encryptedAESKey = isSentByMe 
          ? encryptedData.encryptedAESKeyForSender 
          : encryptedData.encryptedAESKeyForRecipient;
      }
      // Handle old single-encryption format (backward compatibility)
      else if (encryptedData.encryptedAESKey) {
        encryptedAESKey = encryptedData.encryptedAESKey;
      }

      if (!encryptedAESKey) {
        throw new Error('No encrypted AES key found for this message');
      }

      const encryptedAESKeyBytes = forge.util.decode64(encryptedAESKey);
      const aesKey = privateKey.decrypt(encryptedAESKeyBytes, 'RSA-OAEP');

      const decipher = forge.cipher.createDecipher('AES-CBC', aesKey);
      const iv = forge.util.decode64(encryptedData.iv);
      const encryptedBytes = forge.util.decode64(encryptedData.encryptedMessage);

      decipher.start({ iv });
      decipher.update(forge.util.createBuffer(encryptedBytes));
      const success = decipher.finish();

      if (!success) throw new Error('AES decryption failed');

      return decipher.output.toString();
    } catch (error) {
      console.error('Hybrid decryption error:', error);
      return '[Decryption Failed]';
    }
  };

  // Fetch chat history
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!room || !myUser || !userPassword) {
        console.log('Missing requirements for fetching chat history');
        return;
      }

      try {
        // Fetch chat history
        const response = await axios.get(`https://whatsapp-tmg9.onrender.com/api/auth/get-chat-data/${room}`);
        const history = response.data;

        // Fetch encrypted private key
        const res = await fetch(`https://whatsapp-tmg9.onrender.com/api/auth/user/${myUser.id}/private-key`);
        const { encryptedPrivateKey } = await res.json();

        // Format and decrypt private key
        const formattedPrivateKey = formatEncryptedPrivateKeyPEM(encryptedPrivateKey);
        const decryptedPrivateKey = forge.pki.decryptRsaPrivateKey(formattedPrivateKey, userPassword);

        if (!decryptedPrivateKey) {
          throw new Error('Failed to decrypt private key');
        }

        // Decrypt each message in history
        const decryptedMessages = await Promise.all(
          history.map(async (msg: any) => {
            try {
              const isSentByMe = msg.sender === myUser.id;
              const decryptedText = decryptMessageHybrid(
                {
                  encryptedAESKeyForRecipient: msg.encryptedAESKeyForRecipient,
                  encryptedAESKeyForSender: msg.encryptedAESKeyForSender,
                  encryptedAESKey: msg.encryptedAESKey, // For backward compatibility
                  encryptedMessage: msg.text,
                  iv: msg.iv,
                },
                decryptedPrivateKey,
                isSentByMe
              );

              return {
                sender: msg.sender,
                text: decryptedText,
                isMe: isSentByMe,
              };
            } catch (err) {
              console.error('Error decrypting message:', err);
              return {
                sender: msg.sender,
                text: '[Failed to decrypt]',
                isMe: msg.sender === myUser.id,
              };
            }
          })
        );

        // Update state with decrypted messages
        setMessages(decryptedMessages);
      } catch (error) {
        console.error('Error fetching or decrypting chat history', error);
      }
    };

    fetchChatHistory();
  }, [room, myUser, userPassword]);

  // Handle incoming messages
  useEffect(() => {
    const handler = async (data: any) => {
      console.log("this is the data inside handler", data);
      if (data.room === room && myUser) {
        try {
          if (data.sender === myUser.id) {
            // Sent message - already in state
            return;
          }

          // Received message - decrypt it
          const res = await fetch(`https://whatsapp-tmg9.onrender.com/api/auth/user/${myUser.id}/private-key`);
          const { encryptedPrivateKey } = await res.json();

          console.log("this is the encrypted private key in handler", encryptedPrivateKey);

          const decryptedPrivateKey = userPassword
            ? forge.pki.decryptRsaPrivateKey(formatEncryptedPrivateKeyPEM(encryptedPrivateKey), userPassword)
            : null;
          console.log("this is the decrypted private key", decryptedPrivateKey);
          if (!decryptedPrivateKey) {
            throw new Error('Failed to decrypt private key. No password provided.');
          }
          
          const decryptedText = decryptMessageHybrid(
            {
              encryptedAESKeyForRecipient: data.encryptedAESKeyForRecipient,
              encryptedAESKeyForSender: data.encryptedAESKeyForSender,
              encryptedAESKey: data.encryptedAESKey, // For backward compatibility
              encryptedMessage: data.text,
              iv: data.iv,
            },
            decryptedPrivateKey,
            false // This is a received message
          );

          setMessages(prev => [
            ...prev,
            {
              sender: data.sender,
              text: decryptedText,
              isMe: false,
            }
          ]);
        } catch (err) {
          console.error('Error decrypting message:', err);
        }
      }
    };

    socket.on('receive_message', handler);
    return () => {
      socket.off('receive_message', handler);
    };
  }, [room, myUser, userPassword]);

  // Handle socket reconnection
  useEffect(() => {
    const handleReconnect = () => {
      if (myUser?.id) {
        socket.emit('user_connected', myUser.id);
      }
      if (room) {
        socket.emit('join_room', room);
      }
    };

    socket.on('connect', handleReconnect);
    return () => {
      socket.off('connect', handleReconnect);
    };
  }, [myUser?.id, room]);

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        staticStyles.messageContainer,
        item.isMe ? staticStyles.messageRight : staticStyles.messageLeft,
      ]}
    >
      {!item.isMe && (
        <Image source={require('../assets/images/user.png')} style={staticStyles.avatar} />
      )}
      <View style={staticStyles.messageBubble}>
        <Text style={staticStyles.messageText}>{item.text}</Text>
      </View>
      {item.isMe && (
        <Image source={require('../assets/images/user.png')} style={staticStyles.avatar} />
      )}
    </View>
  );

  return (
    <>
      <Header />
      <View style={staticStyles.container}>
        {/* Mobile - User List */}
        {isMobile && !selectedUser && (
          <View style={staticStyles.fullScreenSidebar}>
            <Text style={staticStyles.sectionTitle}>Contacts</Text>
            <TouchableOpacity style={staticStyles.toggleRow}>
              <Ionicons name="person" size={18} color="#ccc" />
              <Text style={staticStyles.toggleText}>Show online only</Text>
            </TouchableOpacity>

            <View>
              {myUser &&
                userList.filter((u) => u.id !== myUser.id).map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    style={staticStyles.contact}
                    onPress={() => selectUser(user)}
                  >
                    <Image source={require('../assets/images/user.png')} style={staticStyles.contactAvatar} />
                    <View>
                      <Text style={staticStyles.contactName}>{user.name}</Text>
                      <Text style={staticStyles.onlineText}>Online</Text>
                    </View>
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        )}

        {/* Mobile - Chat Screen */}
        {isMobile && selectedUser && (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={staticStyles.fullScreenChat}
            keyboardVerticalOffset={Platform.select({ ios: 60, android: 0 })}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={{ flex: 1 }}>
                <View style={staticStyles.header}>
                  <View style={staticStyles.headerLeft}>
                    <Image source={require('../assets/images/user.png')} style={staticStyles.headerAvatar} />
                    <View>
                      <Text style={staticStyles.contactName}>{selectedUser.name}</Text>
                      <Text style={staticStyles.onlineText}>Online</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedUser(null)}>
                    <Ionicons name="close" size={24} color="#aaa" />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={messages}
                  renderItem={renderMessage}
                  keyExtractor={(_, index) => index.toString()}
                  contentContainerStyle={{ padding: 16 }}
                  keyboardDismissMode="interactive"
                  style={{ flex: 1 }}
                />

                <View style={inputContainerStyle}>
                  <TextInput
                    editable={!!selectedUser}
                    placeholder="Type a message..."
                    placeholderTextColor="#aaa"
                    style={staticStyles.input}
                    value={message}
                    onChangeText={setMessage}
                  />
                  <TouchableOpacity style={staticStyles.iconButton}>
                    <MaterialIcons name="photo" size={22} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={staticStyles.iconButton} onPress={sendMessage}>
                    <Ionicons name="send" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        )}

        {/* Desktop Layout */}
        {!isMobile && (
          <>
            <View style={staticStyles.sidebar}>
              <Text style={staticStyles.logo}>ChatVibe</Text>
              <Text style={staticStyles.sectionTitle}>Contacts</Text>
              <TouchableOpacity style={staticStyles.toggleRow}>
                <Ionicons name="person" size={18} color="#ccc" />
                <Text style={staticStyles.toggleText}>Show online only</Text>
              </TouchableOpacity>

              <View>
                {myUser &&
                  userList.filter((u) => u.id !== myUser.id).map((user) => (
                    <TouchableOpacity
                      key={user.id}
                      style={staticStyles.contact}
                      onPress={() => selectUser(user)}
                    >
                      <Image source={require('../assets/images/user.png')} style={staticStyles.contactAvatar} />
                      <View>
                        <Text style={staticStyles.contactName}>{user.name}</Text>
                        <Text style={staticStyles.onlineText}>Online</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
              </View>
            </View>

            <View style={staticStyles.chatArea}>
              <View style={staticStyles.header}>
                <View style={staticStyles.headerLeft}>
                  <Image source={require('../assets/images/user.png')} style={staticStyles.headerAvatar} />
                  <View>
                    <Text style={staticStyles.contactName}>
                      {selectedUser ? selectedUser.name : 'Select a user'}
                    </Text>
                    <Text style={staticStyles.onlineText}>Online</Text>
                  </View>
                </View>
              </View>

              {selectedUser ? (
                <>
                  <FlatList
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(_, index) => index.toString()}
                    contentContainerStyle={{ padding: 16 }}
                  />

                  <View style={inputContainerStyle}>
                    <TextInput
                      editable={!!selectedUser}
                      placeholder="Type a message..."
                      placeholderTextColor="#aaa"
                      style={staticStyles.input}
                      value={message}
                      onChangeText={setMessage}
                    />
                    <TouchableOpacity style={staticStyles.iconButton}>
                      <MaterialIcons name="photo" size={22} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={staticStyles.iconButton} onPress={sendMessage}>
                      <Ionicons name="send" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View style={staticStyles.selectUserMessage}>
                  <Text>Select a user to start chat</Text>
                </View>
              )}
            </View>
          </>
        )}
      </View>
    </>
  );
};

export default ChatScreen;