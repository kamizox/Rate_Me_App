import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadImageToCloudinary } from '../../services/cloudinaryService';

// Firebase Auth & Firestore imports
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from '@react-native-firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from '@react-native-firebase/firestore'; // NAYA: Firestore import kiya
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const SignupScreen = ({navigation}) => {

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '807058046291-ngttgnpce87anmnsrih9um8o817bb968.apps.googleusercontent.com', 
    });
  }, []);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [profilePicUri, setProfilePicUri] = useState(null);
  const [isSigningUp, setIsSigningUp] = useState(false);

  // 1. UPDATED: Firebase Signup Function (Auth + Firestore)
  const pickProfileImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.5 });
    if (!result.didCancel && result.assets) {
      setProfilePicUri(result.assets[0].uri);
    }
  };
const handleSignup = async () => {
    // Validation mein name aur username bhi add kar diye
    if (!email || !password || !fullName || !username) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    
    setIsSigningUp(true); // NAYA: Button loading shuru

    try {
      // Step A: Firebase Auth mein user create karna
      const userCredential = await createUserWithEmailAndPassword(getAuth(), email, password);
      const uid = userCredential.user.uid;

      // NAYA: Agar user ne gallery se pic select ki hai tou pehle Cloudinary par upload karein
      let uploadedPicUrl = null;
      if (profilePicUri) {
        uploadedPicUrl = await uploadImageToCloudinary(profilePicUri);
      }

      // Step B: Firestore ke 'users' collection mein profile document banana
      const db = getFirestore();
      await setDoc(doc(db, 'users', uid), {
        name: fullName,
        username: username.toLowerCase().replace(/\s+/g, ''), // Spaces hata kar lower case
        email: email,
        profilePic: uploadedPicUrl, // NAYA: Upload hui pic ka URL yahan save hoga
        bio: '',
        followersCount: 0,
        followingCount: 0,
        avgRating: 0,
        createdAt: serverTimestamp(),
      });

      Alert.alert('Success', 'Account created successfully!');
      
      // Account banne ke baad Login screen par bhej dein
      // navigation.navigate('Login'); 
      
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Error', 'That email address is already in use!');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Error', 'That email address is invalid!');
      } else {
        Alert.alert('Error', error.message);
      }
    } finally {
      setIsSigningUp(false); // NAYA: Loading band kar do, chahe success ho ya error
    }
  };
  // 2. UPDATED: Google Login / Signup Logic (Auth + Firestore)
  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      const response = await GoogleSignin.signIn();

      if (response.type === 'success') {
        const { idToken } = response.data;
        const googleCredential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(getAuth(), googleCredential);

        // Agar user pehli dafa Google se signup kar raha hai, tou Firestore me document banao
        if (userCredential.additionalUserInfo.isNewUser) {
          const uid = userCredential.user.uid;
          const user = userCredential.user;
          const db = getFirestore();
          
          // Google user ka default username generate kar lo
          const defaultUsername = user.displayName ? user.displayName.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000) : 'user_' + uid.slice(0,5);

          await setDoc(doc(db, 'users', uid), {
            name: user.displayName || 'Google User',
            username: defaultUsername,
            email: user.email,
            profilePic: user.photoURL || null,
            bio: '',
            followersCount: 0,
            followingCount: 0,
            avgRating: 0,
            createdAt: serverTimestamp(),
          });

          Alert.alert('Welcome!', 'Your new account has been created successfully using Google.');
        } else {
          Alert.alert('Welcome Back!', 'You have successfully logged in.');
        }
      } else {
        console.log('User cancelled Google sign in');
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
        <Text style={styles.title}>Create Account</Text>
      </View>
      <Text style={styles.subtitle}>Join RateMe and start your journey</Text>

    {/* Profile Picture with Camera Icon */}
      <TouchableOpacity style={styles.profileContainer} onPress={pickProfileImage}>
        <Image 
          source={{ uri: profilePicUri || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500' }} 
          style={styles.profileImage} 
        />
        <View style={styles.cameraBadge}>
          <Image
          style= {{width:13,height:13}}
          source={require('../../assets/icons/photo-camera-interface-symbol-for-button.png')}
          />
        </View>
      </TouchableOpacity>

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
          autoCapitalize="none"
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
          autoCapitalize="none"
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
    <TouchableOpacity 
        style={[styles.signUpButton, isSigningUp && { opacity: 0.7 }]} 
        onPress={handleSignup}
        disabled={isSigningUp}
      >
        {isSigningUp ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.signUpText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      {/* Divider / Social Login Text */}
      <Text style={styles.orText}>or continue with</Text>

      {/* Social Login Buttons (Google & Apple) */}
      <View style={styles.socialContainer}>
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
    backgroundColor: '#fff' 
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
    backgroundColor: '#5A9624', 
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