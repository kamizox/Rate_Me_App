import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView 
} from 'react-native';

const SignupScreen = ({navigation}) => {
  const [fullName, setFullName] = useState();
  const [username, setUsername] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [secureText, setSecureText] = useState(true);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create Account</Text>
      </View>
      <Text style={styles.subtitle}>Join RateMe and start your journey</Text>

      {/* Profile Picture with Camera Icon */}
      <View style={styles.profileContainer}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500' }} 
          style={styles.profileImage} 
        />
        <View style={styles.cameraBadge}>
          <Image
          style= {{width:13,height:13}}
          source={require('../../assets/icons/photo-camera-interface-symbol-for-button.png')}
          />
        </View>
      </View>

      {/* Full Name Field */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput 
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
        />
      </View>

   {/* Username Field */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Username</Text>
        <TextInput 
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />
      </View>

      {/* Email Field */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput 
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
      </View>

      {/* Password Field */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <TextInput 
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={secureText}
        />
      </View>

      {/* Sign Up Button */}
      <TouchableOpacity style={styles.signUpButton}>
        <Text style={styles.signUpText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Divider / Social Login Text */}
      <Text style={styles.orText}>or continue with</Text>

      {/* Social Login Buttons (Google & Apple) */}
      <View style={styles.socialContainer}>
        <TouchableOpacity style={styles.socialButton}>
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

      {/* Footer / Login Link */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={()=> navigation.navigate('Login')}>
          <Text style={styles.loginLink} >Log In</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    width:'100%'
  },
  backButton: {
    marginRight: 15,
    padding:5,
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
    marginRight: 33
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    color: 'black',
    textAlign: 'center',
  },
  profileContainer: {
    alignSelf: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#eee',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cameraIcon: {
    fontSize: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
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
    borderColor: '#e0e0e0',
    borderRadius: 10,
    backgroundColor: '#fafafa',
    paddingHorizontal: 15,
    height: 48,
  },
  availableText: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 13,
  },
  eyeIcon: {
    fontSize: 16,
    color: '#888',
  },
  signUpButton: {
    backgroundColor: '#5A9624', // Match green theme
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 15,
  },
  signUpText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orText: {
    textAlign: 'center',
    color: 'black',
    fontSize: 16,
    marginBottom: 15,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 20,
  },
  socialButton: {
    width: 90,
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
    marginTop: 10,
  },
  footerText: {
    color: '#777',
    fontSize: 13,
  },
  loginLink: {
    color: '#4CAF50',
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

export { SignupScreen };