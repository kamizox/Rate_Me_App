import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, SafeAreaView } from 'react-native';

export default function ResultScreen({ route, navigation }) {
  // Data coming from HomeScreen after voting
  const { challenge, selectedOption, totalVotes, percentA, percentB } = route.params;

  // Calculate actual vote counts based on percentages
  const countA = Math.round((percentA / 100) * totalVotes);
  const countB = Math.round((percentB / 100) * totalVotes);

  // Check if it's A vs B or Yes/No type challenge
  const isAvsB = challenge.type === 'A_vs_B' || challenge.type === 'YES_NO';

  const handleShareResult = async () => {
    try {
      const shareUrl = `https://ratemeapp.com/challenge/${challenge.id}`;
      const message = `I just voted on "${challenge.question}" and chose ${selectedOption}!\n\nOverall Votes: ${totalVotes}\nSee full results and vote here: ${shareUrl}`;
      await Share.share({ message });
    } catch (error) {
      console.log(error.message);
    }
  };

  // Determine colors based on the selected option to match the design
  const colorA = '#84CC16'; // Green for A
  const colorB = '#F59E0B'; // Orange for B
  const selectedColor = selectedOption === 'A' ? colorA : colorB;
  const selectedPercent = selectedOption === 'A' ? percentA : percentB;

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Text style={styles.backIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Results</Text>
        <TouchableOpacity onPress={handleShareResult} style={styles.iconButton}>
          <Text style={styles.shareIcon}>🔗</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        
        {/* TOP TITLE: You voted X 🎉 */}
        <Text style={styles.youVotedText}>
          You voted <Text style={{ color: selectedColor, fontWeight: '900' }}>{selectedOption}</Text> 🎉
        </Text>

        {isAvsB ? (
          <>
            {/* CIRCULAR DONUT CHART SECTION */}
            <View style={styles.donutWrapper}>
              <View style={[styles.donutCircle, { borderColor: selectedColor }]}>
                <Text style={styles.donutPercentText}>{selectedPercent}%</Text>
                <View style={[styles.donutInnerBadge, { backgroundColor: selectedColor }]}>
                  <Text style={styles.donutInnerBadgeText}>{selectedOption}</Text>
                </View>
              </View>
              
              <Text style={styles.totalVotesLarge}>{totalVotes}</Text>
              <Text style={styles.totalVotesSub}>Total Votes</Text>
            </View>

            {/* BARS SECTION */}
            <View style={styles.barsContainer}>
              
              {/* Option A Bar */}
              <View style={styles.barRow}>
                <View style={[styles.badgeBase, { backgroundColor: colorA }]}>
                  <Text style={styles.badgeText}>A</Text>
                </View>
                <View style={styles.barMiddleInfo}>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${percentA}%`, backgroundColor: colorA }]} />
                  </View>
                  <Text style={styles.voteCountText}>{countA} votes</Text>
                </View>
                <Text style={styles.percentSideText}>{percentA}%</Text>
              </View>

              {/* Option B Bar */}
              <View style={styles.barRow}>
                <View style={[styles.badgeBase, { backgroundColor: colorB }]}>
                  <Text style={styles.badgeText}>B</Text>
                </View>
                <View style={styles.barMiddleInfo}>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${percentB}%`, backgroundColor: colorB }]} />
                  </View>
                  <Text style={styles.voteCountText}>{countB} votes</Text>
                </View>
                <Text style={styles.percentSideText}>{percentB}%</Text>
              </View>

            </View>
          </>
        ) : (
          // IF IT'S NOT A vs B (Poll or Guess), show simplified card
          <View style={styles.otherChallengeCard}>
            <Text style={styles.otherChallengeTitle}>{challenge.question}</Text>
            <Text style={{ fontSize: 16, color: '#888', marginTop: 20 }}>Your Choice:</Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#84CC16', marginTop: 5 }}>{selectedOption}</Text>
            <Text style={{ marginTop: 30, color: '#666', fontWeight: 'bold' }}>Total Votes: {totalVotes}</Text>
          </View>
        )}

        {/* BOTTOM BUTTONS ROW */}
        <View style={styles.bottomButtonsRow}>
          <TouchableOpacity style={styles.shareBtnOutline} onPress={handleShareResult}>
            <Text style={styles.shareBtnOutlineText}>Share Result</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextBtnSolid} onPress={() => navigation.goBack()}>
            <Text style={styles.nextBtnSolidText}>Next Challenge</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' }, // White background as per design
  
  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 10, backgroundColor: '#fff' },
  iconButton: { padding: 5 },
  backIcon: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  shareIcon: { fontSize: 22, color: '#000' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20, alignItems: 'center' },
  
  youVotedText: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 40 },
  
  // Circular Donut Area
  donutWrapper: { alignItems: 'center', marginBottom: 40 },
  donutCircle: { width: 160, height: 160, borderRadius: 80, borderWidth: 16, borderColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' },
  donutPercentText: { fontSize: 36, fontWeight: 'bold', color: '#000' },
  donutInnerBadge: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 5 },
  donutInnerBadgeText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  
  totalVotesLarge: { fontSize: 22, fontWeight: 'bold', color: '#000', marginTop: 20 },
  totalVotesSub: { fontSize: 14, color: '#666', fontWeight: '500' },
  
  // Bars Container
  barsContainer: { width: '100%', marginBottom: 30 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  badgeBase: { width: 34, height: 34, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  badgeText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  
  barMiddleInfo: { flex: 1, marginRight: 15 },
  progressBarBg: { width: '100%', height: 6, backgroundColor: '#f0f0f0', borderRadius: 3, marginBottom: 8 },
  progressBarFill: { height: '100%', borderRadius: 3 },
  voteCountText: { fontSize: 12, color: '#888', fontWeight: '600' },
  
  percentSideText: { fontSize: 18, fontWeight: 'bold', color: '#000', width: 45, textAlign: 'right' },
  
  // Other Challenges Card
  otherChallengeCard: { width: '100%', backgroundColor: '#f9f9f9', padding: 30, borderRadius: 20, alignItems: 'center', marginBottom: 40, flex: 1, justifyContent: 'center', borderWidth: 1, borderColor: '#eee' },
  otherChallengeTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#333' },

  // Bottom Buttons
  bottomButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 'auto', marginBottom: 20 },
  shareBtnOutline: { flex: 1, paddingVertical: 15, borderRadius: 12, borderWidth: 2, borderColor: '#eee', backgroundColor: '#fff', alignItems: 'center', marginRight: 10 },
  shareBtnOutlineText: { fontSize: 15, fontWeight: 'bold', color: '#000' },
  nextBtnSolid: { flex: 1, paddingVertical: 15, borderRadius: 12, backgroundColor: '#84CC16', alignItems: 'center', marginLeft: 10 },
  nextBtnSolidText: { fontSize: 15, fontWeight: 'bold', color: '#fff' }
});