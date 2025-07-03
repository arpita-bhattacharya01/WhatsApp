import React, { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import Header from '@/component/Header';
import Footer from '@/component/Footer';
import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext'; 

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768; // Adjust this breakpoint as per your design

  const router = useRouter();
  const [email, setEmail] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  

  const { setUser, setToken, setPassword } = useAuth(); // ✅ from context

  const handleLogin = async () => {
    console.log("Handle login clicked")
    try {
      const response = await axios.post('https://whatsapp-tmg9.onrender.com/api/auth/login', {
        email,
        password: passwordInput,
      });

      const { token, user } = response.data;

      console.log("This is data from login" , token , user)

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('password', passwordInput);


      // 👇 Store in memory only
      setPassword(passwordInput);
      setUser(user);
      setToken(token);  

      alert('Login successful!');
      router.push('/chatscreen');
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      const message = error.response?.data?.message || 'Login failed';
      alert(message);
    }
  };



  return (
    <SafeAreaView style={styles.screen}>
      <Header />
      <View style={[styles.container, { flexDirection: isMobile ? 'column' : 'row' }]}>
        {/* Left Section: Login */}
        <View style={styles.leftSection}>
          <View style={styles.card}>
            <View style={styles.logocontainer}>
              <Image
                source={require('../assets/images/chat-logo.png')}
                style={styles.logoImage}
              />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
            
            <Text style={styles.emaillable}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              autoComplete="email"
              keyboardType="email-address"
            />
            <Text style={styles.passwordlable}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={passwordInput}
              onChangeText={setPasswordInput}
              autoComplete="password"
              textContentType="password"
            />
            
            <TouchableOpacity style={styles.forgetpassword} onPress={() => router.push('/forgetpassword')} >
              <Text>Forget Password</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Sign in</Text>
            </TouchableOpacity>

            <Text style={styles.footerText}>
              Don't have an account?{' '}
              <Text style={styles.link} onPress={() => router.push('/signup')}>
                Create account
              </Text>
            </Text>
          </View>
        </View>

        {/* Right Section: Placeholder Grid */}
        {!isMobile && (<View style={styles.rightSection}>
          <View style={styles.grid}>
            {Array.from({ length: 9 }).map((_, index) => (
              <View key={index} style={styles.gridBox} />
            ))}
          </View>
          <Text style={styles.rightText}>
            Welcome back!{'\n'}Sign in to continue your conversations and catch up with your messages.
          </Text>
        </View>
        )}
      </View>
      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  leftSection: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    // backgroundColor: '#1e293b',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 22,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 30,
  },
  logocontainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoImage: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
    marginRight: 8,

  },
  emaillable: {
    color: 'white',
    marginBottom: 12,
  },
  passwordlable: {
    color: 'white',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#334155',
    color: '#ffffff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#6366f1',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  forgetpassword: {
    color: "red",
    marginBottom: 12
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  footerText: {
    color: '#9ca3af',
    textAlign: 'center',
  },
  link: {
    color: '#6366f1',
    fontWeight: '600',
  },
  rightSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 120,
    backgroundColor: '#0f172a',

  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    // marginBottom: 15,
    width: 500,
    height: 450,
  },
  gridBox: {
    width: 120,
    height: 120,
    backgroundColor: '#1e293b',
    margin: 6,
    borderRadius: 10,
  },
  rightText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
  },
});
