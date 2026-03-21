import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { usePlotpaperSDK } from "@plotpaper/mini-app-sdk";
import { Plus, X, BarChart2 } from "lucide-react-native";

export default function MultiplayerPoll() {
  const sdk = usePlotpaperSDK();
  const colors = sdk.theme.colors;
  const [user, setUser] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  useEffect(() => {
    sdk.getUserInfo().then(setUser);
  }, []);

  const { isLoading: pollsLoading, data: pollsData } = sdk.db.useQuery({
    polls: { $: { order: { serverCreatedAt: "desc" } } },
  });
  const { isLoading: votesLoading, data: votesData } = sdk.db.useQuery({ votes: {} });

  const polls = pollsData?.polls ?? [];
  const allVotes = votesData?.votes ?? [];

  const createPoll = () => {
    const q = question.trim();
    const opts = options.map((o) => o.trim()).filter(Boolean);
    if (!q || opts.length < 2 || !user) return;

    sdk.db.transact(sdk.db.tx.polls[sdk.db.id()].update({
      question: q,
      options: opts,
      createdBy: user.profileId,
      createdByName: user.displayName,
    }));
    setQuestion("");
    setOptions(["", ""]);
    setShowCreate(false);
  };

  const vote = (pollId: string, optionIndex: number) => {
    if (!user) return;
    // Check if already voted
    const existing = allVotes.find((v: any) => v.pollId === pollId && v.votedBy === user.profileId);
    if (existing) {
      // Change vote
      sdk.db.transact(sdk.db.tx.votes[existing.id].update({ optionIndex }));
    } else {
      sdk.db.transact(sdk.db.tx.votes[sdk.db.id()].update({
        pollId,
        optionIndex,
        votedBy: user.profileId,
        votedByName: user.displayName,
      }));
    }
  };

  if (pollsLoading || votesLoading || !user) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Create Poll */}
      {showCreate ? (
        <View style={[styles.createCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
            value={question}
            onChangeText={setQuestion}
            placeholder="Ask a question..."
            placeholderTextColor={colors.mutedForeground}
            autoFocus
          />
          {options.map((opt, i) => (
            <View key={i} style={styles.optionInputRow}>
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, flex: 1 }]}
                value={opt}
                onChangeText={(t) => {
                  const next = [...options];
                  next[i] = t;
                  setOptions(next);
                }}
                placeholder={`Option ${i + 1}`}
                placeholderTextColor={colors.mutedForeground}
              />
              {options.length > 2 && (
                <Pressable onPress={() => setOptions(options.filter((_, j) => j !== i))}>
                  <X size={20} color={colors.destructive} />
                </Pressable>
              )}
            </View>
          ))}
          {options.length < 6 && (
            <Pressable onPress={() => setOptions([...options, ""])}>
              <Text style={{ color: colors.primary }}>+ Add option</Text>
            </Pressable>
          )}
          <View style={styles.createActions}>
            <Pressable onPress={() => setShowCreate(false)}>
              <Text style={{ color: colors.mutedForeground }}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.createBtn, { backgroundColor: colors.primary }]} onPress={createPoll}>
              <Text style={{ color: colors.primaryForeground, fontWeight: "600" }}>Create Poll</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable style={[styles.newPollBtn, { backgroundColor: colors.primary }]} onPress={() => setShowCreate(true)}>
          <Plus size={20} color={colors.primaryForeground} />
          <Text style={{ color: colors.primaryForeground, fontWeight: "600", fontSize: 16 }}>New Poll</Text>
        </Pressable>
      )}

      {/* Polls */}
      {polls.map((poll: any) => {
        const pollVotes = allVotes.filter((v: any) => v.pollId === poll.id);
        const totalVotes = pollVotes.length;
        const myVote = pollVotes.find((v: any) => v.votedBy === user.profileId);

        return (
          <View key={poll.id} style={[styles.pollCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.pollQuestion, { color: colors.foreground }]}>{poll.question}</Text>
            <Text style={[styles.pollAuthor, { color: colors.mutedForeground }]}>by {poll.createdByName}</Text>

            {(poll.options as string[]).map((opt: string, i: number) => {
              const optVotes = pollVotes.filter((v: any) => v.optionIndex === i).length;
              const pct = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
              const isMyVote = myVote?.optionIndex === i;

              return (
                <Pressable key={i} style={styles.voteOption} onPress={() => vote(poll.id, i)}>
                  <View style={[styles.voteBar, { width: `${pct}%`, backgroundColor: isMyVote ? colors.primary + "30" : colors.muted }]} />
                  <View style={styles.voteContent}>
                    <Text style={[styles.voteText, { color: colors.foreground, fontWeight: isMyVote ? "600" : "400" }]}>
                      {opt}
                    </Text>
                    <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>
                      {pct}% ({optVotes})
                    </Text>
                  </View>
                </Pressable>
              );
            })}

            <Text style={[styles.totalVotes, { color: colors.mutedForeground }]}>
              {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
            </Text>
          </View>
        );
      })}

      {polls.length === 0 && (
        <View style={styles.emptyState}>
          <BarChart2 size={48} color={colors.mutedForeground} />
          <Text style={{ color: colors.mutedForeground, marginTop: 12, fontSize: 16 }}>No polls yet</Text>
          <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>Create the first one!</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 48 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  newPollBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 12, marginBottom: 20 },
  createCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 20, gap: 12 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
  optionInputRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  createActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  createBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  pollCard: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 12 },
  pollQuestion: { fontSize: 17, fontWeight: "600", marginBottom: 4 },
  pollAuthor: { fontSize: 13, marginBottom: 12 },
  voteOption: { position: "relative", borderRadius: 8, overflow: "hidden", marginBottom: 6, minHeight: 44 },
  voteBar: { position: "absolute", top: 0, left: 0, bottom: 0, borderRadius: 8 },
  voteContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, zIndex: 1 },
  voteText: { fontSize: 15, flex: 1, marginRight: 8 },
  totalVotes: { fontSize: 13, marginTop: 8 },
  emptyState: { alignItems: "center", paddingTop: 64 },
});
