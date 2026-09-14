import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constant/colors';

const { width } = Dimensions.get('window');

export default function ResultScreen({ route, navigation }) {
  // HomeScreen se vote karne ke baad yeh data yahan aayega
  const { challenge, selectedOption, totalVotes, percentA, percentB, optCount } = route.params;

  // Jab screen open ho tou choti si celebration animation ke liye aap yahan Lottie ya basic animation use kar sakte hain
  useEffect(() => {
    console.log("Result Screen Loaded!");
  }, []);

  const handleShareResult = async () => {
    try {
      const shareUrl = `https://ratemeapp.com/challenge/${challenge.id}`;
      const message = `I just voted on "${challenge.question}" and chose ${selectedOption}!\n\nOverall Votes: ${totalVotes}\nSee full results and vote here: ${shareUrl}`;
      await Share.share({ message });
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Results 📊</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.congratsText}>Vote Cast Successfully! 🎉</Text>
        <Text style={styles.question}>{challenge.question}</Text>

        <View style={styles.resultCard}>
          <Text style={styles.yourChoiceLabel}>Your Choice:</Text>
          <Text style={styles.yourChoiceText}>
            {challenge.type === 'POLL' ? challenge.pollOptions[selectedOption] : selectedOption}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.statsLabel}>Current Standings:</Text>
          
          {/* A vs B ya Yes/No ka result */}
          {(challenge.type === 'A_vs_B' || challenge.type === 'YES_NO') && (
            <View>
              <View style={styles.statRow}>
                <Text style={styles.statOpt}>Option A (Yes)</Text>
                <Text style={styles.statPerc}>{percentA}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${percentA}%` }]} />
              </View>

              <View style={[styles.statRow, { marginTop: 15 }]}>
                <Text style={styles.statOpt}>Option B (No)</Text>
                <Text style={styles.statPerc}>{percentB}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${percentB}%`, backgroundColor: '#FF3B30' }]} />
              </View>
            </View>
          )}

          {/* POLL Ka Result */}
          {challenge.type === 'POLL' && (
            <View>
              {['A', 'B', 'C', 'D'].map(opt => {
                if (!challenge.pollOptions[opt]) return null;
                const pCount = challenge[`voteCount${opt}`] || 0;
                // Agar user ne abhi vote kiya hai tou uski percentage update kar ke dikhani hogi (logic already handled in optCount if passed properly, but we calculate here)
                const currentTotal = totalVotes; 
                const perc = currentTotal > 0 ? Math.round((pCount / currentTotal) * 100) : 0;
                
                return (
                  <View key={opt} style={{ marginBottom: 15 }}>
                    <View style={styles.statRow}>
                      <Text style={styles.statOpt}>{challenge.pollOptions[opt]}</Text>
                      <Text style={styles.statPerc}>{perc}%</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${perc}%` }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <Text style={styles.totalVotes}>Total Votes: {totalVotes}</Text>
        </View>

        <TouchableOpacity style={styles.shareButton} onPress={handleShareResult}>
          <Text style={styles.shareButtonText}>🔗 Share Result</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={() => navigation.goBack()}>
          <Text style={styles.nextButtonText}>Next Challenge ➡️</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: '#fff', elevation: 2 },
  backButton: { padding: 5 },
  backIcon: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  
  content: { flex: 1, padding: 20, alignItems: 'center' },
  congratsText: { fontSize: 18, color: COLORS.primary || '#5A9624', fontWeight: 'bold', marginBottom: 10, marginTop: 10 },
  question: { fontSize: 22, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 30 },
  
  resultCard: { width: '100%', backgroundColor: '#fff', borderRadius: 15, padding: 20, elevation: 3, marginBottom: 30 },
  yourChoiceLabel: { fontSize: 14, color: '#888', textAlign: 'center' },
  yourChoiceText: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary || '#5A9624', textAlign: 'center', marginTop: 5 },
  
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
  
  statsLabel: { fontSize: 16, fontWeight: 'bold', color: '#000', marginBottom: 15 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  statOpt: { fontSize: 15, color: '#333', fontWeight: '500' },
  statPerc: { fontSize: 15, fontWeight: 'bold', color: '#000' },
  progressBarBg: { width: '100%', height: 10, backgroundColor: '#f0f0f0', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: COLORS.primary || '#5A9624', borderRadius: 5 },
  
  totalVotes: { textAlign: 'center', marginTop: 20, fontSize: 14, color: '#888', fontWeight: 'bold' },

  shareButton: { width: '100%', backgroundColor: '#000', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  shareButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  nextButton: { width: '100%', backgroundColor: '#fff', padding: 15, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
  nextButtonText: { color: '#333', fontSize: 16, fontWeight: 'bold' },
});