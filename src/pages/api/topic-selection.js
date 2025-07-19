// API endpoint for intelligent topic selection
import TopicSelectionService from '../../lib/TopicSelectionService';

const topicService = new TopicSelectionService();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { type = 'smart', category = 'any', difficulty = 'any', count = 1 } = req.query;

      if (type === 'suggestions') {
        // Get multiple topic suggestions
        const suggestions = topicService.getTopicSuggestions(parseInt(count));
        return res.status(200).json({ suggestions });
      }

      if (type === 'smart') {
        // Get single smart topic selection
        const topic = topicService.getSmartTopic({
          category: category !== 'any' ? category : undefined,
          difficulty: difficulty !== 'any' ? difficulty : undefined,
          avoidRecent: true,
          balanceCategories: true
        });

        return res.status(200).json({ topic });
      }

      if (type === 'stats') {
        // Get category statistics
        const stats = topicService.getCategoryStats();
        return res.status(200).json({ stats });
      }

      return res.status(400).json({ error: 'Invalid type parameter' });

    } catch (error) {
      console.error('Topic selection error:', error);
      return res.status(500).json({ 
        error: 'Failed to select topic',
        details: error.message 
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { topicId } = req.body;

      if (!topicId) {
        return res.status(400).json({ error: 'Topic ID is required' });
      }

      // Mark topic as used
      topicService.markTopicAsUsed(topicId);
      
      return res.status(200).json({ success: true, message: 'Topic marked as used' });

    } catch (error) {
      console.error('Topic marking error:', error);
      return res.status(500).json({ 
        error: 'Failed to mark topic as used',
        details: error.message 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
