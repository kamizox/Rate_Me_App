import React, { useState,useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Image,
  Alert
} from 'react-native';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const LoginScreen = ({ navigation }) => {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '807058046291-ngttgnpce87anmnsrih9um8o817bb968.apps.googleusercontent.com',
    });
  }, []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);

  // Manual Email/Password Login
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    try {
      await signInWithEmailAndPassword(getAuth(), email, password);
      Alert.alert('Success', 'Logged in successfully!');
      // navigation.navigate('Home'); // Baad mein Home screen par bhejenge
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Google Login
  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      
      if (response.type === 'success') {
        const { idToken } = response.data;
        const googleCredential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(getAuth(), googleCredential);
        Alert.alert('Success', 'Google Login Successful!');
      }
    } catch (error) {
      console.log('Google Auth Error: ', error);
      Alert.alert('Error', 'Google login failed!');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Log In</Text>
        <View style={{ width: 24 }} />
      </View>
      <Text style={styles.subtitle}>Welcome back!</Text>

      {/* Email Field */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput 
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Password Field with Eye Icon */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputWithTextContainer}>
          <TextInput 
            style={styles.innerInput}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureText}
          />
          <TouchableOpacity onPress={() => setSecureText(!secureText)}>
            <Text style={styles.eyeIcon}>👁️‍🗨️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Forgot Password Link */}
      <TouchableOpacity style={styles.forgotContainer}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Log In Button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Log In</Text>
      </TouchableOpacity>

      {/* Divider / Social Login Text */}
      <Text style={styles.orText}>or continue with</Text>

      {/* Social Login Buttons (Google & Apple) */}
      <View style={styles.socialContainer}>
        {/* Google Button */}
        <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
          <Image
            source={require('../../assets/icons/google-logo.png')}
            style={styles.googleIconSt}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <Image
                      source={require('../../assets/icons/apple-logo.png')}
                      style= {styles.appleIconst}
                    />
        </TouchableOpacity>
      </View>

      {/* Footer / Sign Up Link */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.signUpLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    width: '100%',
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  backArrow: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 25,
    color: '#777',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#444',
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 14,
    backgroundColor: '#fafafa',
  },
  inputWithTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    backgroundColor: '#fafafa',
    paddingHorizontal: 15,
    height: 48,
  },
  innerInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#000',
  },
  eyeIcon: {
    fontSize: 16,
    color: '#888',
  },
  forgotContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: '#5A9624',
    fontWeight: '600',
    fontSize: 13,
  },
  loginButton: {
    backgroundColor: '#5A9624',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
    loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orText: {
    textAlign: 'center',
    color: '#777',
    fontSize: 14,
    marginBottom: 20,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 30,
  },
  socialButton: {
    width: 70,
    height: 45,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  socialIcon: {
    fontSize: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: '#777',
    fontSize: 13,
  },
  signUpLink: {
    color: '#5A9624',
    fontWeight: 'bold',
    fontSize: 13,
  },
   googleIconSt: {
    width: 22,
    height: 22
  },
  appleIconst: {
    width: 22,
    height: 22
  }
});

export { LoginScreen };