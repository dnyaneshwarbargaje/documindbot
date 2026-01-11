
import { GoogleGenAI } from "@google/genai";
import { Message, Document } from "../types";

const SYSTEM_INSTRUCTION = `You are DocMind, an advanced Retrieval-Augmented Generation (RAG) platform. 

OPERATING MODES:
1. GENERAL CONVERSATION: For greetings, help requests, or questions about your identity, respond politely and professionally. Encourage the user to upload or query documents if they haven't.
2. DATA ANALYSIS: When the user asks about indexed data, prioritize the [RELEVANT_KNOWLEDGE_CHUNKS] provided below. 

CONSTRAINTS:
- CITATIONS: Use [File: Name] tags when referencing specific document data.
- ACCURACY: If information is clearly missing from the chunks provided, suggest what documents are available and ask for clarification.
- NO MARKDOWN: Use plain text only. Double line breaks for paragraphs.

[RELEVANT_KNOWLEDGE_CHUNKS]:
{CONTEXT_WINDOW}`;

interface ScoredChunk {
  content: string;
  source: string;
  score: number;
}

/**
 * Advanced Local RAG Retrieval Logic
 * Improved to handle general queries and provide better fallbacks.
 */
function performRAGRetrieval(query: string, documents: Document[]): string {
  if (documents.length === 0) {
    return "WORKSPACE_EMPTY: No documents have been indexed yet. Remind the user to plant some 'seeds' (upload files).";
  }

  const cleanQuery = query.toLowerCase();
  const queryTerms: string[] = cleanQuery.match(/\b(\w+)\b/g) || [];
  const importantTerms = queryTerms.filter(t => t.length > 3);

  // Intent Detection: Is this a greeting or a meta-question?
  const generalGreetingTerms = ['hi', 'hello', 'hey', 'who', 'what', 'you', 'help', 'docmind'];
  const isGeneralQuery = queryTerms.length < 4 || queryTerms.some(t => generalGreetingTerms.includes(t));

  const scoredChunks: ScoredChunk[] = [];

  documents.forEach(doc => {
    // Break into chunks of roughly 500 characters with overlap
    const segments = doc.content.split(/\n\n+/);
    
    segments.forEach((segment) => {
      const lowerSegment = segment.toLowerCase();
      let score = 0;

      importantTerms.forEach(term => {
        // Multi-tier scoring
        if (lowerSegment.includes(term)) {
          score += 2; // Basic match
          const count = (lowerSegment.match(new RegExp(term, 'g')) || []).length;
          score += count * 0.5; // Frequency boost
        }
      });

      if (score > 0) {
        scoredChunks.push({
          content: segment.trim(),
          source: doc.name,
          score: score
        });
      }
    });
  });

  // Re-rank and take top 8
  const topChunks = scoredChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  // Construction of Context Window
  if (topChunks.length > 0) {
    return topChunks.map(c => `[SOURCE: ${c.source}]\n${c.content}`).join('\n\n---\n\n');
  }

  // Fallback: If no chunks match but documents exist
  if (isGeneralQuery) {
    return `GENERAL_QUERY: The user is engaging in general conversation. Currently indexed documents: ${documents.map(d => d.name).join(', ')}.`;
  }

  return `LOW_RELEVANCE: No direct segments matched the query keywords. Available files in index: ${documents.map(d => d.name).join(', ')}. Provide a high-level response if possible or ask for more specific keywords.`;
}

export const getAssistantStreamingResponse = async function* (
  query: string,
  history: Message[],
  documents: Document[]
) {
  // Execute the enhanced RAG retrieval layer
  const contextWindow = performRAGRetrieval(query, documents);
  const finalInstruction = SYSTEM_INSTRUCTION.replace('{CONTEXT_WINDOW}', contextWindow);

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const contents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
    
    contents.push({ role: 'user', parts: [{ text: query }] });

    const stream = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: finalInstruction,
        temperature: 0.7, // Slightly higher temp for better conversational fallback
      },
    });

    for await (const chunk of stream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("DocMind RAG Error:", error);
    throw error;
  }
};
