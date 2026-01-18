import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { getCategories, getLessons } from '../../src/modules/learn/data';
import { Lesson, Category, LearnProgress, QuizQuestion } from '../../src/modules/learn/types';
import { storage, STORAGE_KEYS } from '../../src/storage';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useFontScale } from '../../src/theme/FontScaleProvider';
import { Screen, ThemedCard, ThemedText, HeaderActionButton } from '../../src/components';

type ViewType = 'categories' | 'lessons' | 'lesson-detail' | 'quiz';

export default function LearnScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { typography } = useFontScale();
  const [viewType, setViewType] = useState<ViewType>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<LearnProgress>({ completedLessons: [], quizScores: {} });
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContent();
    loadProgress();
  }, [i18n.language]);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const cats = getCategories(i18n.language);
      const lsns = getLessons(i18n.language);
      setCategories(cats);
      setLessons(lsns);
    } catch (err) {
      console.error('Error loading content:', err);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      const storedProgress = await storage.get<LearnProgress>(STORAGE_KEYS.LEARN_PROGRESS);
      if (storedProgress) {
        setProgress(storedProgress);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const handleRetry = () => {
    loadContent();
  };

  const saveProgress = async (newProgress: LearnProgress) => {
    setProgress(newProgress);
    await storage.set(STORAGE_KEYS.LEARN_PROGRESS, newProgress);
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setViewType('lessons');
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setViewType('lesson-detail');
  };

  const handleStartQuiz = () => {
    if (selectedLesson?.quiz) {
      setCurrentQuizIndex(0);
      setQuizScore(0);
      setSelectedAnswer(null);
      setShowQuizResult(false);
      setViewType('quiz');
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedLesson?.quiz && selectedAnswer !== null) {
      const currentQuestion = selectedLesson.quiz[currentQuizIndex];
      if (selectedAnswer === currentQuestion.correctAnswer) {
        setQuizScore(quizScore + 1);
      }

      if (currentQuizIndex < selectedLesson.quiz.length - 1) {
        setCurrentQuizIndex(currentQuizIndex + 1);
        setSelectedAnswer(null);
      } else {
        const finalScore = selectedAnswer === currentQuestion.correctAnswer ? quizScore + 1 : quizScore;
        const newProgress = {
          ...progress,
          completedLessons: [...new Set([...progress.completedLessons, selectedLesson.id])],
          quizScores: {
            ...progress.quizScores,
            [selectedLesson.id]: Math.round((finalScore / selectedLesson.quiz.length) * 100),
          },
        };
        saveProgress(newProgress);
        setShowQuizResult(true);
      }
    }
  };

  const handleBack = () => {
    if (viewType === 'lesson-detail' || viewType === 'quiz') {
      setViewType('lessons');
      setSelectedLesson(null);
    } else if (viewType === 'lessons') {
      setViewType('categories');
      setSelectedCategory(null);
      setError(null);
    }
  };

  const renderBackIcon = () => (
    <HeaderActionButton
      name="chevron-back"
      color={colors.primary}
      onPress={handleBack}
      accessibilityLabel={t('common.back')}
      style={styles.backButton}
    />
  );

  const isLessonCompleted = (lessonId: string): boolean => {
    return progress.completedLessons.includes(lessonId);
  };

  const renderCategories = () => {
    if (loading) {
      return (
        <Screen edges={['top']}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <ThemedText variant="body" color="textSecondary" style={{ marginTop: 16 }}>
              {t('common.loading')}
            </ThemedText>
          </View>
        </Screen>
      );
    }

    if (error) {
      return (
        <Screen edges={['top']}>
          <View style={styles.errorContainer}>
            <ThemedText variant="h4" color="error" style={{ marginBottom: 8 }}>
              {t('common.error')}
            </ThemedText>
            <ThemedText variant="body" color="textSecondary" style={{ textAlign: 'center', marginBottom: 24, lineHeight: 24 }}>
              {error}
            </ThemedText>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={handleRetry}
            >
              <ThemedText variant="body" style={{ color: '#fff', fontWeight: '600' }}>
                {t('common.retry')}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </Screen>
      );
    }

    return (
      <Screen edges={['top']}>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
          const categoryLessons = lessons.filter((l) => l.category === item.id);
          const completed = categoryLessons.filter((l) => isLessonCompleted(l.id)).length;

          return (
            <TouchableOpacity onPress={() => handleSelectCategory(item.id)}>
              <ThemedCard style={{ marginBottom: 16 }}>
                <ThemedText variant="h3" style={{ fontWeight: '600', marginBottom: 8 }}>
                  {item.name}
                </ThemedText>
                <ThemedText variant="bodySmall" color="textSecondary" style={{ marginBottom: 12 }}>
                  {item.description}
                </ThemedText>
                <ThemedText variant="caption" color="primary" style={{ fontWeight: '500' }}>
                  {completed}/{categoryLessons.length} {t('learn.completed')}
                </ThemedText>
              </ThemedCard>
            </TouchableOpacity>
          );
        }}
        />
      </Screen>
    );
  };

  const renderLessons = () => {
    const categoryLessons = lessons.filter((l) => l.category === selectedCategory);

    return (
      <Screen edges={['top']}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          {renderBackIcon()}
        </View>
        <FlatList
          data={categoryLessons}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelectLesson(item)}>
              <ThemedCard style={{ marginBottom: 12 }}>
                <View style={styles.lessonHeader}>
                  <ThemedText variant="body" style={{ fontWeight: '600', flex: 1 }}>
                    {item.title}
                  </ThemedText>
                  {isLessonCompleted(item.id) && (
                    <ThemedText variant="h3" color="primary">✓</ThemedText>
                  )}
                </View>
                {item.quiz && (
                  <ThemedText variant="caption" color="primary" style={{ fontWeight: '500', marginTop: 8 }}>
                    {t('learn.quiz')}
                  </ThemedText>
                )}
              </ThemedCard>
            </TouchableOpacity>
          )}
        />
      </Screen>
    );
  };

  const renderLessonDetail = () => {
    if (!selectedLesson) return null;

    return (
      <Screen edges={['top', 'bottom']}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          {renderBackIcon()}
        </View>
        <ScrollView
          style={{ flex: 1, padding: 16 }}
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          <ThemedText variant="h2" style={{ fontWeight: '600', marginBottom: 16 }}>
            {selectedLesson.title}
          </ThemedText>
          <ThemedText variant="body" color="textSecondary" style={{ lineHeight: 24 }}>
            {selectedLesson.content}
          </ThemedText>

          {selectedLesson.quiz && (
            <TouchableOpacity
              style={[styles.startQuizButton, { backgroundColor: colors.primary }]}
              onPress={handleStartQuiz}
            >
              <ThemedText variant="body" style={{ color: '#fff', fontWeight: '600' }}>
                {t('learn.startQuiz')}
              </ThemedText>
            </TouchableOpacity>
          )}
        </ScrollView>
      </Screen>
    );
  };

  const renderQuiz = () => {
    if (!selectedLesson?.quiz) return null;

    const currentQuestion = selectedLesson.quiz[currentQuizIndex];

    if (showQuizResult) {
      const percentage = Math.round((quizScore / selectedLesson.quiz.length) * 100);

      return (
        <Screen edges={['top', 'bottom']}>
          <View style={styles.quizResultContainer}>
            <ThemedText variant="h2" style={{ fontWeight: '600', marginBottom: 16 }}>
              {t('learn.yourScore')}
            </ThemedText>
            <ThemedText variant="h1" color="primary" style={{ fontWeight: 'bold', marginBottom: 8 }}>
              {quizScore}/{selectedLesson.quiz.length}
            </ThemedText>
            <ThemedText variant="h2" color="textSecondary" style={{ marginBottom: 32 }}>
              {percentage}%
            </ThemedText>
            <TouchableOpacity
              style={[styles.doneButton, { backgroundColor: colors.primary }]}
              onPress={handleBack}
            >
              <ThemedText variant="body" style={{ color: '#fff', fontWeight: '600' }}>
                {t('common.done')}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </Screen>
      );
    }

    return (
      <Screen edges={['top', 'bottom']}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          {renderBackIcon()}
        </View>
        <View style={{ flex: 1, padding: 16 }}>
          <ThemedText variant="bodySmall" color="textSecondary" style={{ marginBottom: 16 }}>
            {t('learn.quiz')} {currentQuizIndex + 1}/{selectedLesson.quiz.length}
          </ThemedText>
          <ThemedText variant="h3" style={{ fontWeight: '600', marginBottom: 24 }}>
            {currentQuestion.question}
          </ThemedText>

          <View style={styles.quizOptions}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.quizOption,
                  {
                    backgroundColor: selectedAnswer === index ? colors.primary + '20' : colors.card,
                    borderColor: selectedAnswer === index ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleAnswerSelect(index)}
              >
                <ThemedText
                  variant="body"
                  color={selectedAnswer === index ? 'primary' : 'text'}
                  style={{ fontWeight: selectedAnswer === index ? '600' : 'normal' }}
                >
                  {option}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.nextButton,
              { backgroundColor: selectedAnswer === null ? colors.textSecondary : colors.primary },
            ]}
            onPress={handleNextQuestion}
            disabled={selectedAnswer === null}
          >
            <ThemedText variant="body" style={{ color: '#fff', fontWeight: '600' }}>
              {currentQuizIndex < selectedLesson.quiz.length - 1
                ? t('learn.nextQuestion')
                : t('learn.submitAnswer')}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  };

  switch (viewType) {
    case 'categories':
      return renderCategories();
    case 'lessons':
      return renderLessons();
    case 'lesson-detail':
      return renderLessonDetail();
    case 'quiz':
      return renderQuiz();
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {},
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  startQuizButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  quizOptions: {
    gap: 12,
  },
  quizOption: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  nextButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  quizResultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  doneButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
});
