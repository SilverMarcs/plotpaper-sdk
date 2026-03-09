import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { usePlotpaperSDK } from "@plotpaper/mini-app-sdk";
import Feather from "@expo/vector-icons/Feather";

const TOPICS = [
  { label: "Science", icon: "zap", emoji: "🔬" },
  { label: "History", icon: "book", emoji: "📜" },
  { label: "Geography", icon: "globe", emoji: "🌍" },
  { label: "Sports", icon: "activity", emoji: "⚽" },
  { label: "Movies", icon: "film", emoji: "🎬" },
  { label: "Music", icon: "headphones", emoji: "🎵" },
];

export default function QuizGame() {
  const sdk = usePlotpaperSDK();
  const colors = sdk.theme.colors;
  const [generating, setGenerating] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  const { data } = sdk.db.useQuery({
    quizzes: { $: { where: { status: "completed" }, order: { serverCreatedAt: "desc" } } },
  });
  const pastQuizzes = data?.quizzes ?? [];

  const generateQuiz = async (topic: string) => {
    setGenerating(true);
    try {
      const { object } = await sdk.ai.generateObject({
        prompt: `Generate a 5-question multiple choice quiz about ${topic}. Each question should have 4 options and one correct answer.`,
        schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correctIndex: { type: "number" },
                },
              },
            },
          },
        },
      });

      setActiveQuiz({ topic, questions: object.questions });
      setCurrentQ(0);
      setScore(0);
      setSelected(null);
      setAnswered(false);
    } catch {
      sdk.showToast("Failed to generate quiz. Try again.");
    }
    setGenerating(false);
  };

  const selectAnswer = (index: number) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    if (index === activeQuiz.questions[currentQ].correctIndex) {
      setScore((s: number) => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= activeQuiz.questions.length) {
      // Quiz finished — save result
      const finalScore = score + (selected === activeQuiz.questions[currentQ].correctIndex ? 0 : 0); // score already updated
      sdk.db.transact(sdk.db.tx.quizzes[sdk.db.id()].update({
        topic: activeQuiz.topic,
        questions: activeQuiz.questions,
        score,
        total: activeQuiz.questions.length,
        status: "completed",
      }));
      sdk.setFeedAction({
        title: `Quiz: ${score}/${activeQuiz.questions.length}`,
        body: `${activeQuiz.topic} quiz completed`,
        icon: score === activeQuiz.questions.length ? "🏆" : "📝",
      });
      setActiveQuiz(null);
      return;
    }
    setCurrentQ((q) => q + 1);
    setSelected(null);
    setAnswered(false);
  };

  // Active quiz view
  if (activeQuiz) {
    const q = activeQuiz.questions[currentQ];
    const isLast = currentQ + 1 >= activeQuiz.questions.length;

    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
        <Text style={[styles.progress, { color: colors.mutedForeground }]}>
          Question {currentQ + 1} of {activeQuiz.questions.length}
        </Text>
        <Text style={[styles.question, { color: colors.foreground }]}>{q.question}</Text>

        {q.options.map((opt: string, i: number) => {
          let bg = colors.card;
          let border = colors.border;
          if (answered) {
            if (i === q.correctIndex) { bg = colors.success + "20"; border = colors.success; }
            else if (i === selected) { bg = colors.destructive + "20"; border = colors.destructive; }
          } else if (i === selected) {
            border = colors.primary;
          }
          return (
            <Pressable
              key={i}
              style={[styles.option, { backgroundColor: bg, borderColor: border }]}
              onPress={() => selectAnswer(i)}
            >
              <Text style={[styles.optionText, { color: colors.foreground }]}>{opt}</Text>
              {answered && i === q.correctIndex && <Feather name="check-circle" size={20} color={colors.success} />}
              {answered && i === selected && i !== q.correctIndex && <Feather name="x-circle" size={20} color={colors.destructive} />}
            </Pressable>
          );
        })}

        {answered && (
          <Pressable style={[styles.nextBtn, { backgroundColor: colors.primary }]} onPress={nextQuestion}>
            <Text style={{ color: colors.primaryForeground, fontWeight: "600", fontSize: 16 }}>
              {isLast ? `Finish (${score}/${activeQuiz.questions.length})` : "Next Question"}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    );
  }

  // Topic selection view
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {generating ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.mutedForeground, marginTop: 12 }}>Generating quiz...</Text>
        </View>
      ) : (
        <>
          <Text style={[styles.heading, { color: colors.foreground }]}>Pick a topic</Text>
          <View style={styles.topicGrid}>
            {TOPICS.map((t) => (
              <Pressable
                key={t.label}
                style={[styles.topicCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => generateQuiz(t.label)}
              >
                <Text style={styles.topicEmoji}>{t.emoji}</Text>
                <Text style={{ color: colors.foreground, fontWeight: "500" }}>{t.label}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {pastQuizzes.length > 0 && (
        <>
          <Text style={[styles.subheading, { color: colors.foreground }]}>Past Quizzes</Text>
          {pastQuizzes.slice(0, 5).map((q: any) => (
            <View key={q.id} style={[styles.pastRow, { borderBottomColor: colors.border }]}>
              <Text style={{ color: colors.foreground, flex: 1 }}>{q.topic}</Text>
              <Text style={{ color: colors.mutedForeground }}>{q.score}/{q.total}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 48 },
  heading: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  subheading: { fontSize: 18, fontWeight: "600", marginTop: 32, marginBottom: 12 },
  topicGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  topicCard: { width: "47%", padding: 20, borderRadius: 12, borderWidth: 1, alignItems: "center", gap: 8 },
  topicEmoji: { fontSize: 32 },
  loadingBox: { paddingVertical: 64, alignItems: "center" },
  progress: { fontSize: 14, marginBottom: 8 },
  question: { fontSize: 20, fontWeight: "600", marginBottom: 20, lineHeight: 28 },
  option: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 12, borderWidth: 1.5, marginBottom: 10, gap: 12 },
  optionText: { flex: 1, fontSize: 16 },
  nextBtn: { padding: 16, borderRadius: 12, alignItems: "center", marginTop: 12 },
  pastRow: { flexDirection: "row", paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
});
