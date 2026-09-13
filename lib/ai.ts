import { Thought, CategoryId, ActionItem } from './types';
import { CATEGORIES } from './constants';
import { generateId } from './storage';

interface AIResult {
  title: string;
  category: CategoryId;
  categoryConfidence: number;
  summary: string;
  tags: string[];
  actionItems: ActionItem[];
  importance: number;
}

const CATEGORY_KEYWORDS: Record<CategoryId, string[]> = {
  idea: ['idea', 'maybe', 'what if', 'could build', 'should build', 'concept', 'imagine', 'app', 'product', 'startup', 'invent'],
  principle: ['principle', 'always', 'never', 'consistency', 'motivation', 'discipline', 'belief', 'philosophy', 'life lesson', 'important to', 'matters more'],
  learning: ['learned', 'studying', 'notes', 'feature', 'engineering', 'chapter', 'course', 'tutorial', 'research', 'understand', 'how to'],
  goal: ['goal', 'want to', 'plan to', 'aiming', 'target', 'achieve', 'build', 'become', 'going to', 'resolve'],
  task: ['need to', 'must', 'have to', 'finish', 'complete', 'do tomorrow', 'send', 'email', 'call', 'buy', 'fix', 'deploy'],
  reflection: ['reflect', 'thinking about', 'feel like', 'realized', 'noticed', 'wondering', 'feel', 'today was', 'looking back'],
  work: ['work', 'project', 'meeting', 'deadline', 'client', 'boss', 'colleague', 'office', 'sprint', 'ticket', 'deploy'],
  thought: ['think', 'random', 'just', 'wonder', 'maybe', 'hmm'],
  journal: ['today', 'morning', 'evening', 'day was', 'went to', 'happened', 'feeling', 'grateful'],
  important: ['important', 'critical', 'must remember', 'dont forget', 'essential', 'urgent', 'key'],
  other: [],
};

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has',
  'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might',
  'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we',
  'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our',
  'their', 'about', 'what', 'when', 'where', 'why', 'how', 'which', 'who', 'if',
  'then', 'so', 'just', 'also', 'very', 'really', 'more', 'most', 'some', 'any',
  'all', 'no', 'not', 'as', 'than', 'too', 'up', 'out', 'into', 'over', 'after',
  'before', 'because', 'while', 'there', 'here', 'got', 'get', 'going', 'want',
  'need', 'like', 'know', 'think', 'said', 'say', 'one', 'two', 'thing', 'stuff',
  'mujhe', 'hai', 'se', 'ko', 'mein', 'aur', 'ya', 'par', 'kyunki', 'jab', 'tab',
  'woh', 'yeh', 'kya', 'kaise', 'kyun', 'kaun', 'mera', 'meri', 'tum', 'hum',
]);

function classifyCategory(transcript: string): { category: CategoryId; confidence: number } {
  const lower = transcript.toLowerCase();
  let bestCategory: CategoryId = 'thought';
  let bestScore = 0;
  let totalScore = 0;

  for (const cat of CATEGORIES) {
    const keywords = CATEGORY_KEYWORDS[cat.id];
    if (!keywords.length) continue;
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score += kw.length > 4 ? 2 : 1;
    }
    totalScore += score;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = cat.id;
    }
  }

  if (bestScore === 0) return { category: 'thought', confidence: 0.4 };
  const confidence = Math.min(0.95, 0.5 + bestScore * 0.08);
  return { category: bestCategory, confidence };
}

function generateTitle(transcript: string): string {
  const sentences = transcript.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const firstSentence = sentences[0]?.trim() || transcript.trim();
  const words = firstSentence.split(/\s+/).slice(0, 8);
  let title = words.join(' ');
  if (title.length > 60) title = title.substring(0, 57) + '...';
  if (!title) return 'Untitled thought';
  return title.charAt(0).toUpperCase() + title.slice(1);
}

function generateSummary(transcript: string): string {
  const sentences = transcript.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 10);
  if (sentences.length <= 2) return transcript.trim();
  const sorted = sentences
    .map((s, i) => ({ s, i, score: s.split(' ').length }))
    .sort((a, b) => b.score - a.score);
  const top = sorted.slice(0, 2).sort((a, b) => a.i - b.i).map((x) => x.s);
  let summary = top.join('. ');
  if (summary.length > 200) summary = summary.substring(0, 197) + '...';
  return summary;
}

function generateTags(transcript: string): string[] {
  const lower = transcript.toLowerCase();
  const words = lower.split(/[\s,.;:!?'"]+/).filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  const freq: Record<string, number> = {};
  for (const word of words) {
    freq[word] = (freq[word] || 0) + 1;
  }
  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([word]) => word);
  return sorted;
}

function extractActionItems(transcript: string): ActionItem[] {
  const lower = transcript.toLowerCase();
  const actionPatterns = [
    /(?:i need to|i have to|i must|i should|got to|have got to)\s+(.{5,80}?)(?:[.!?;]|$)/g,
    /(?:tomorrow|today|tonight|this week|next week)\s+(?:i will|i'll|i need to|i have to|must|should)\s+(.{5,80}?)(?:[.!?;]|$)/g,
    /(?:remind me to|don't let me forget to|make sure i)\s+(.{5,80}?)(?:[.!?;]|$)/g,
  ];

  const items: ActionItem[] = [];
  const seen = new Set<string>();

  for (const pattern of actionPatterns) {
    let match;
    while ((match = pattern.exec(lower)) !== null) {
      const text = match[1].trim();
      if (text.length < 5 || seen.has(text)) continue;
      seen.add(text);
      const capitalized = text.charAt(0).toUpperCase() + text.slice(1);
      let dueDate: string | null = null;
      if (lower.includes('tomorrow')) dueDate = 'Tomorrow';
      else if (lower.includes('today')) dueDate = 'Today';
      else if (lower.includes('this week')) dueDate = 'This week';
      else if (lower.includes('next week')) dueDate = 'Next week';
      items.push({ id: generateId(), text: capitalized, dueDate, completed: false });
    }
  }

  return items.slice(0, 5);
}

function estimateImportance(transcript: string, category: CategoryId): number {
  let score = 0.5;
  const lower = transcript.toLowerCase();
  if (lower.includes('important') || lower.includes('critical') || lower.includes('must remember')) score += 0.2;
  if (lower.includes('urgent') || lower.includes('asap') || lower.includes('right now')) score += 0.15;
  if (category === 'important' || category === 'principle' || category === 'goal') score += 0.1;
  if (transcript.length > 300) score += 0.05;
  return Math.min(1, Math.round(score * 100) / 100);
}

export function processThought(transcript: string): AIResult {
  const cleanTranscript = transcript.trim();
  const { category, confidence } = classifyCategory(cleanTranscript);
  const title = generateTitle(cleanTranscript);
  const summary = generateSummary(cleanTranscript);
  const tags = generateTags(cleanTranscript);
  const actionItems = extractActionItems(cleanTranscript);
  const importance = estimateImportance(cleanTranscript, category);

  return {
    title,
    category,
    categoryConfidence: confidence,
    summary,
    tags,
    actionItems,
    importance,
  };
}

export function reprocessThought(thought: Thought, newTranscript?: string): Thought {
  const transcript = newTranscript || thought.rawTranscript;
  const result = processThought(transcript);
  return {
    ...thought,
    ...result,
    rawTranscript: transcript,
    updatedAt: Date.now(),
    version: thought.version + 1,
    syncStatus: thought.syncStatus === 'SYNCED' ? 'PENDING_UPDATE' : thought.syncStatus,
  title: thought.title !== 'Untitled thought' ? thought.title : result.title,
  category: thought.categoryConfidence >= 0.8 ? thought.category : result.category,
    categoryConfidence: Math.max(thought.categoryConfidence, result.categoryConfidence),
  tags: result.tags,
    actionItems: result.actionItems,
    summary: result.summary,
    importance: result.importance,
  };
}
