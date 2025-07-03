import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AxiosError } from 'axios';
import Header from '@/component/Header';
import axios from 'axios';
import Footer from '@/component/Footer';
export const ForgetPassword = () => {

  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  

  const handleSendOtp = async () => {
  try {
    const checkEmailRes = await axios.post('https://whatsapp-tmg9.onrender.com/api/auth/check-email-exist', {
      email: email,
    });

    
    if (!checkEmailRes.data.exists) {
      alert('Email is not registered. Please sign up.');
      return;
    }

    
    await axios.post('https://whatsapp-tmg9.onrender.com/api/auth/send-otp', {
      email: email,
    });

    setOtpSent(true);
    alert(`OTP sent to your email: ${email}`);
  } catch (err: unknown) {
    const error = err as AxiosError<{ message: string }>;
    alert(error.response?.data?.message || 'Error sending OTP');
  }
};


  const handleVerifyOtp = async () => {
    console.log("Verify OTP clicked");
    try {
      const otpClean = otp.trim();
      const res = await axios.post('https://whatsapp-tmg9.onrender.com/api/auth/verify-otp', {
        email: email,
        otp: otpClean,
      });
      setOtpVerified(true);
      alert(res.data.message);
    } catch (err :unknown) {
      const error = err as AxiosError<{message : String}>; 
      alert(error.response?.data?.message || 'OTP verification failed');
    }
  };

  const handlecreatepassword = async () => {
    if(!otpVerified){
      alert('Please verify OTP')
      return;
    }
    if(password !== confirmpassword){
      alert('Password and confirm password must be same')
      return;
    }
    try {
      const response = await axios.post('https://whatsapp-tmg9.onrender.com/api/auth/update-password', {
        email,
        password,
      });

      alert('Password Updated Successfully!');
      router.push('/login')
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      const message = error.response?.data?.message || 'Password Updation Failed';
      alert(message);
    }
  };

    return (
        <SafeAreaView style={styles.screen}>
            <Header />
            <View style={styles.container}>
                <View style={styles.leftSection}>
                    <View style={styles.card}>
                        <View style={styles.logocontainer}>
                            <Image
                                source={require('../assets/images/chat-logo.png')}
                                style={styles.logoImage}
                            />
                        </View>
                        <Text style={styles.title}>Create New Password</Text>
                        <Text style={styles.subtitle}>Verify your mail and create a new password </Text>
                        <Text style={styles.emaillable}>Email</Text>
                        <View style={styles.row}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Email"
                                placeholderTextColor="#9ca3af"
                                value={email}
                                onChangeText={setEmail}
                            />
                            <TouchableOpacity style={styles.otpButton} onPress={handleSendOtp}>
                                <Text style={styles.otpButtonText}>Send OTP</Text>
                            </TouchableOpacity>
                        </View>

                        {otpSent && (
                            <View style={styles.row}>
                                <TextInput
                                    style={[styles.input, { flex: 1 }, otpVerified && styles.disabledInput]}
                                    placeholder="Enter OTP"
                                    placeholderTextColor="#9ca3af"
                                    value={otp}
                                    onChangeText={setOtp}
                                    editable={!otpVerified}
                                    keyboardType="numeric"
                                />
                                <TouchableOpacity
                                    style={[styles.otpButton, otpVerified && styles.disabledButton]}
                                    onPress={handleVerifyOtp}
                                    disabled={otpVerified}
                                >
                                    <Text style={styles.otpButtonText}>
                                        {otpVerified ? 'Verified' : 'Verify OTP'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <Text style={styles.passwordlable}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#9ca3af"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                        <Text style={styles.passwordlable}> Confirm Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm Password"
                            placeholderTextColor="#9ca3af"
                            secureTextEntry
                            value={confirmpassword}
                            onChangeText={setConfirmPassword}
                        />

                        <TouchableOpacity style={styles.button} onPress={handlecreatepassword}>
                            <Text style={styles.buttonText}>Create Password</Text>
                        </TouchableOpacity>

                        <Text style={styles.footerText}>
                            Already have an account?{' '}
                            <Text style={styles.link} onPress={() => router.push('/login')}>
                                Sign Up
                            </Text>
                        </Text>
                    </View>
                </View>

                <View style={styles.rightSection}>
                    <View style={styles.grid}>
                        {Array.from({ length: 9 }).map((_, index) => (
                            <View key={index} style={styles.gridBox} />
                        ))}
                    </View>
                    <Text style={styles.rightText}>
                        Welcome back!{''}Sign in to continue your conversations and catch up with your messages.
                    </Text>
                </View>
            </View>
            <Footer />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0f172a',
    height: 100
  },
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  leftSection: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
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
    marginTop: 12,
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
    // marginBottom: 16,
  },
  button: {
    backgroundColor: '#6366f1',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
   
  },
  otpButton: {
    backgroundColor: '#4f46e5',
    padding: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  otpButtonText: {
    color: '#fff',
  },
  disabledInput: {
    backgroundColor: '#475569',
  },
  disabledButton: {
    backgroundColor: '#22c55e',
  },
});

