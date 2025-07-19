/**
 * TopicSelectionService - Intelligent topic selection for automated blog generation
 * Uses local data and algorithms only - no external APIs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load topic pool data
const topicPoolPath = path.join(__dirname, '../data/topicPool.json');
const topicPool = JSON.parse(fs.readFileSync(topicPoolPath, 'utf8'));

class TopicSelectionService {
  constructor() {
    this.topicPool = topicPool;
    this.usageHistoryPath = path.join(process.cwd(), 'src/data/topicUsageHistory.json');
    this.loadUsageHistory();
  }

  /**
   * Load topic usage history from file
   */
  loadUsageHistory() {
    try {
      if (fs.existsSync(this.usageHistoryPath)) {
        const history = JSON.parse(fs.readFileSync(this.usageHistoryPath, 'utf8'));
        this.updateTopicPoolWithHistory(history);
      }
    } catch (error) {
      console.warn('Could not load topic usage history:', error.message);
    }
  }

  /**
   * Save topic usage history to file
   */
  saveUsageHistory() {
    try {
      const history = this.extractUsageHistory();
      fs.writeFileSync(this.usageHistoryPath, JSON.stringify(history, null, 2));
    } catch (error) {
      console.error('Could not save topic usage history:', error.message);
    }
  }

  /**
   * Update topic pool with usage history
   */
  updateTopicPoolWithHistory(history) {
    Object.keys(this.topicPool.categories).forEach(categoryKey => {
      this.topicPool.categories[categoryKey].topics.forEach(topic => {
        if (history[topic.id]) {
          topic.lastUsed = history[topic.id].lastUsed;
          topic.useCount = history[topic.id].useCount || 0;
        }
      });
    });
  }

  /**
   * Extract usage history from topic pool
   */
  extractUsageHistory() {
    const history = {};
    Object.keys(this.topicPool.categories).forEach(categoryKey => {
      this.topicPool.categories[categoryKey].topics.forEach(topic => {
        history[topic.id] = {
          lastUsed: topic.lastUsed,
          useCount: topic.useCount
        };
      });
    });
    return history;
  }

  /**
   * Get a smart topic selection based on various factors
   */
  getSmartTopic(options = {}) {
    const {
      difficulty = 'any',
      category = 'any',
      avoidRecent = true,
      balanceCategories = true
    } = options;

    // Get all available topics
    let availableTopics = this.getAllTopics();

    // Filter by difficulty if specified
    if (difficulty !== 'any') {
      availableTopics = availableTopics.filter(topic => topic.difficulty === difficulty);
    }

    // Filter by category if specified
    if (category !== 'any') {
      availableTopics = availableTopics.filter(topic => topic.categoryKey === category);
    }

    // Avoid recently used topics
    if (avoidRecent) {
      availableTopics = this.filterRecentTopics(availableTopics);
    }

    // Apply category balancing
    if (balanceCategories) {
      availableTopics = this.applyWeightedSelection(availableTopics);
    }

    // If no topics available, fallback to any topic
    if (availableTopics.length === 0) {
      availableTopics = this.getAllTopics();
    }

    // Select topic using intelligent scoring
    const selectedTopic = this.selectTopicByScore(availableTopics);
    
    // Mark topic as used
    this.markTopicAsUsed(selectedTopic.id);

    return selectedTopic;
  }

  /**
   * Get all topics with category information
   */
  getAllTopics() {
    const allTopics = [];
    Object.keys(this.topicPool.categories).forEach(categoryKey => {
      const category = this.topicPool.categories[categoryKey];
      category.topics.forEach(topic => {
        allTopics.push({
          ...topic,
          categoryKey,
          categoryName: category.name,
          categoryWeight: category.weight
        });
      });
    });
    return allTopics;
  }

  /**
   * Filter out recently used topics (within last 7 days)
   */
  filterRecentTopics(topics) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return topics.filter(topic => {
      if (!topic.lastUsed) return true;
      return new Date(topic.lastUsed) < sevenDaysAgo;
    });
  }

  /**
   * Apply weighted selection based on category weights
   */
  applyWeightedSelection(topics) {
    // Group topics by category
    const categoryGroups = {};
    topics.forEach(topic => {
      if (!categoryGroups[topic.categoryKey]) {
        categoryGroups[topic.categoryKey] = [];
      }
      categoryGroups[topic.categoryKey].push(topic);
    });

    // Select category based on weights
    const categories = Object.keys(categoryGroups);
    const weights = categories.map(cat => 
      this.topicPool.categories[cat].weight
    );

    const selectedCategory = this.weightedRandomSelection(categories, weights);
    return categoryGroups[selectedCategory] || topics;
  }

  /**
   * Weighted random selection
   */
  weightedRandomSelection(items, weights) {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return items[i];
      }
    }
    
    return items[items.length - 1];
  }

  /**
   * Select topic based on intelligent scoring
   */
  selectTopicByScore(topics) {
    // Score each topic based on various factors
    const scoredTopics = topics.map(topic => ({
      ...topic,
      score: this.calculateTopicScore(topic)
    }));

    // Sort by score (higher is better)
    scoredTopics.sort((a, b) => b.score - a.score);

    // Use weighted selection from top topics to add some randomness
    const topTopics = scoredTopics.slice(0, Math.min(5, scoredTopics.length));
    const randomIndex = Math.floor(Math.random() * topTopics.length);
    
    return topTopics[randomIndex];
  }

  /**
   * Calculate score for topic selection
   */
  calculateTopicScore(topic) {
    let score = 100; // Base score

    // Favor less used topics
    score -= (topic.useCount || 0) * 10;

    // Favor topics not used recently
    if (topic.lastUsed) {
      const daysSinceUsed = (new Date() - new Date(topic.lastUsed)) / (1000 * 60 * 60 * 24);
      score += Math.min(daysSinceUsed * 2, 50);
    } else {
      score += 50; // Never used bonus
    }

    // Category weight factor
    score += (topic.categoryWeight || 0) * 100;

    // Difficulty balance (favor beginner and intermediate)
    if (topic.difficulty === 'beginner') score += 20;
    if (topic.difficulty === 'intermediate') score += 15;
    if (topic.difficulty === 'advanced') score += 5;

    // Reading time preference (5-8 minutes ideal)
    const readTime = topic.estimatedReadTime || 5;
    if (readTime >= 5 && readTime <= 8) score += 10;

    return score;
  }

  /**
   * Mark a topic as used
   */
  markTopicAsUsed(topicId) {
    Object.keys(this.topicPool.categories).forEach(categoryKey => {
      const topic = this.topicPool.categories[categoryKey].topics.find(t => t.id === topicId);
      if (topic) {
        topic.lastUsed = new Date().toISOString();
        topic.useCount = (topic.useCount || 0) + 1;
      }
    });
    
    this.saveUsageHistory();
  }

  /**
   * Get topic suggestions for manual selection
   */
  getTopicSuggestions(count = 5) {
    const suggestions = [];
    const usedCategories = new Set();

    for (let i = 0; i < count; i++) {
      // Try to get topics from different categories
      const availableCategories = Object.keys(this.topicPool.categories)
        .filter(cat => !usedCategories.has(cat));
      
      const category = availableCategories.length > 0 
        ? availableCategories[Math.floor(Math.random() * availableCategories.length)]
        : 'any';
      
      const topic = this.getSmartTopic({ 
        category: category === 'any' ? 'any' : category,
        avoidRecent: false 
      });
      
      suggestions.push(topic);
      usedCategories.add(topic.categoryKey);
    }

    return suggestions;
  }

  /**
   * Get topic by ID
   */
  getTopicById(topicId) {
    const allTopics = this.getAllTopics();
    return allTopics.find(topic => topic.id === topicId);
  }

  /**
   * Get category statistics
   */
  getCategoryStats() {
    const stats = {};
    
    Object.keys(this.topicPool.categories).forEach(categoryKey => {
      const category = this.topicPool.categories[categoryKey];
      const totalUses = category.topics.reduce((sum, topic) => sum + (topic.useCount || 0), 0);
      const lastUsed = category.topics
        .map(topic => topic.lastUsed)
        .filter(date => date)
        .sort()
        .pop();

      stats[categoryKey] = {
        name: category.name,
        topicCount: category.topics.length,
        totalUses,
        lastUsed,
        weight: category.weight
      };
    });

    return stats;
  }
}

export default TopicSelectionService;
