// Smart Suggestions - Keyword extraction and matching logic
import { Project } from '@/types';

// Common stopwords to filter out
const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who',
  'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few',
  'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
  'own', 'same', 'so', 'than', 'too', 'very', 'just', 'also', 'now',
  'new', 'get', 'make', 'use', 'need', 'want', 'like', 'about', 'into',
]);

/**
 * Extract meaningful keywords from text
 */
export function extractKeywords(text: string): Set<string> {
  if (!text) return new Set();
  
  // Lowercase, split by whitespace and punctuation
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => 
      word.length >= 3 && 
      !STOPWORDS.has(word) &&
      !/^\d+$/.test(word) // Filter pure numbers
    );
  
  return new Set(words);
}

/**
 * Calculate match score between two keyword sets
 */
export function scoreMatch(itemKeywords: Set<string>, projectKeywords: Set<string>): number {
  if (itemKeywords.size === 0 || projectKeywords.size === 0) return 0;
  
  let score = 0;
  
  for (const keyword of itemKeywords) {
    for (const projectKeyword of projectKeywords) {
      // Exact match
      if (keyword === projectKeyword) {
        score += 10 + keyword.length; // Longer words = more specific
      }
      // Partial match (one contains the other)
      else if (keyword.includes(projectKeyword) || projectKeyword.includes(keyword)) {
        score += 5;
      }
    }
  }
  
  // Normalize by the size of both sets
  const maxPossible = Math.min(itemKeywords.size, projectKeywords.size) * 15;
  return Math.min(100, Math.round((score / maxPossible) * 100));
}

export interface ProjectSuggestion {
  project: Project;
  score: number;
  matchingKeywords: string[];
}

/**
 * Get project suggestions based on text content
 */
export function suggestProjects(
  text: string, 
  allProjects: Project[],
  excludeIds: string[] = [],
  threshold: number = 15
): ProjectSuggestion[] {
  const itemKeywords = extractKeywords(text);
  
  if (itemKeywords.size === 0) return [];
  
  const suggestions: ProjectSuggestion[] = [];
  
  for (const project of allProjects) {
    // Skip excluded projects
    if (excludeIds.includes(project.id)) continue;
    
    // Get project keywords from name and description
    const projectText = `${project.name} ${project.description}`;
    const projectKeywords = extractKeywords(projectText);
    
    const score = scoreMatch(itemKeywords, projectKeywords);
    
    if (score >= threshold) {
      // Find matching keywords for display
      const matchingKeywords: string[] = [];
      for (const keyword of itemKeywords) {
        for (const projectKeyword of projectKeywords) {
          if (keyword === projectKeyword || 
              keyword.includes(projectKeyword) || 
              projectKeyword.includes(keyword)) {
            if (!matchingKeywords.includes(projectKeyword)) {
              matchingKeywords.push(projectKeyword);
            }
          }
        }
      }
      
      suggestions.push({
        project,
        score,
        matchingKeywords: matchingKeywords.slice(0, 3), // Top 3 matching keywords
      });
    }
  }
  
  // Sort by score descending, return top 3
  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

/**
 * Suggest related projects based on an existing project
 */
export function suggestRelatedProjects(
  project: Project,
  allProjects: Project[]
): ProjectSuggestion[] {
  const text = `${project.name} ${project.description}`;
  return suggestProjects(text, allProjects, [project.id]);
}
