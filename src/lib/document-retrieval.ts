/**
 * Document Chunking and Keyword-Relevance Retrieval (In-Memory RAG).
 *
 * Implements a lightweight, deterministic, and fast retrieval algorithm:
 * - Chunks long study materials into semantically bounded passages (~1,200 chars).
 * - Indexes passages by term frequency and keyword presence.
 * - Scores passages against the student's question to retrieve the top relevant context.
 * - Detects when the document lacks sufficient keyword overlap to answer the question.
 */

export interface DocumentChunk {
  id: string;
  chunkIndex: number;
  text: string;
  pageNumber?: number;
}

export interface RetrievalResult {
  relevantChunks: DocumentChunk[];
  hasSufficientContext: boolean;
  topScore: number;
  combinedContext: string;
}

const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
  "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
  "below", "between", "both", "but", "by", "can", "can't", "cannot", "could",
  "did", "do", "does", "doing", "don't", "down", "during", "each", "few", "for",
  "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers",
  "herself", "him", "himself", "his", "how", "i", "if", "in", "into", "is", "isn't",
  "it", "its", "itself", "me", "more", "most", "my", "myself", "no", "nor", "not",
  "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours",
  "ourselves", "out", "over", "own", "same", "she", "should", "so", "some", "such",
  "than", "that", "the", "their", "theirs", "them", "themselves", "then", "there",
  "these", "they", "this", "those", "through", "to", "too", "under", "until", "up",
  "very", "was", "we", "were", "what", "when", "where", "which", "while", "who",
  "whom", "why", "with", "would", "you", "your", "yours", "yourself",
]);

/**
 * Breaks a long text into overlapping chunks, respecting paragraph and line breaks.
 */
export function chunkDocument(
  text: string,
  chunkSize = 1200,
  overlap = 200
): DocumentChunk[] {
  if (!text || text.trim().length === 0) return [];

  // Short documents don't need splitting
  if (text.length <= chunkSize) {
    return [
      {
        id: "chunk-0",
        chunkIndex: 0,
        text: text.trim(),
      },
    ];
  }

  const chunks: DocumentChunk[] = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < text.length) {
    let endIndex = Math.min(startIndex + chunkSize, text.length);

    // Try to break at a paragraph boundary (\n\n) or newline (\n) or sentence period (.)
    if (endIndex < text.length) {
      const paragraphBreak = text.lastIndexOf("\n\n", endIndex);
      if (paragraphBreak > startIndex + chunkSize * 0.6) {
        endIndex = paragraphBreak;
      } else {
        const sentenceBreak = text.lastIndexOf(". ", endIndex);
        if (sentenceBreak > startIndex + chunkSize * 0.6) {
          endIndex = sentenceBreak + 1;
        } else {
          const spaceBreak = text.lastIndexOf(" ", endIndex);
          if (spaceBreak > startIndex + chunkSize * 0.6) {
            endIndex = spaceBreak;
          }
        }
      }
    }

    const chunkText = text.slice(startIndex, endIndex).trim();

    if (chunkText.length > 0) {
      // Extract page marker if present (e.g. --- Page 3 ---)
      const pageMatch = chunkText.match(/---\s*Page\s*(\d+)\s*---/i);
      const pageNumber = pageMatch ? parseInt(pageMatch[1], 10) : undefined;

      chunks.push({
        id: `chunk-${chunkIndex}`,
        chunkIndex,
        text: chunkText,
        pageNumber,
      });
      chunkIndex++;
    }

    // Step forward, maintaining overlap
    startIndex = endIndex - overlap;
    if (startIndex >= text.length - overlap) break;
  }

  return chunks;
}

/**
 * Tokenizes a string into lowercased non-stopword alphanumeric terms.
 */
function tokenizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^\w\s\u1200-\u137F]/gi, " ") // Support English and Ethiopic unicode
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 1 && !STOP_WORDS.has(term));
}

/**
 * Scores and retrieves the top relevant chunks for a student's query.
 */
export function retrieveRelevantChunks(
  query: string,
  chunks: DocumentChunk[],
  maxChunks = 4
): RetrievalResult {
  if (chunks.length === 0) {
    return {
      relevantChunks: [],
      hasSufficientContext: false,
      topScore: 0,
      combinedContext: "",
    };
  }

  // If there are few chunks, return all of them
  if (chunks.length <= maxChunks) {
    return {
      relevantChunks: chunks,
      hasSufficientContext: true,
      topScore: 10,
      combinedContext: chunks.map((c) => c.text).join("\n\n---\n\n"),
    };
  }

  const queryTerms = tokenizeQuery(query);
  const cleanQuery = query.toLowerCase().trim();

  const scoredChunks = chunks.map((chunk) => {
    const chunkLower = chunk.text.toLowerCase();
    let score = 0;

    // Exact phrase match bonus
    if (cleanQuery.length > 4 && chunkLower.includes(cleanQuery)) {
      score += 15;
    }

    // Term matches
    for (const term of queryTerms) {
      if (chunkLower.includes(term)) {
        score += 3;
        // Count frequencies up to 5
        const count = (chunkLower.match(new RegExp(term, "g")) || []).length;
        score += Math.min(count, 5);
      }
    }

    return { chunk, score };
  });

  // Sort descending by relevance score
  scoredChunks.sort((a, b) => b.score - a.score);

  const topScored = scoredChunks.slice(0, maxChunks);
  const topScore = topScored[0]?.score || 0;

  // If even the top chunk has score 0, the document does not contain keywords from the question
  const hasSufficientContext = topScore > 0;

  const relevantChunks = topScored.map((item) => item.chunk);
  const combinedContext = relevantChunks.map((c) => c.text).join("\n\n---\n\n");

  return {
    relevantChunks,
    hasSufficientContext,
    topScore,
    combinedContext,
  };
}
