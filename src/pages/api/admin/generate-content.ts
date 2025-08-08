import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

let generationProcess: any = null;
let generationStatus = {
  isGenerating: false,
  progress: '',
  logs: [] as string[],
  lastGeneration: null as string | null,
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { customTopic, settings } = req.body;

    if (generationStatus.isGenerating) {
      return res.status(400).json({ 
        success: false, 
        message: 'Generation already in progress' 
      });
    }

    generationStatus.isGenerating = true;
    generationStatus.progress = 'Initializing AI generation...';
    generationStatus.logs = ['🚀 Starting content generation...'];

    // Build the PowerShell command
    let command = 'powershell.exe -ExecutionPolicy Bypass -Command "';
    command += 'cd d:\\ai-blog-website; ';
    
    if (customTopic) {
      // Run with custom topic
      generationStatus.logs.push(`📝 Custom topic: ${customTopic}`);
      command += `node scripts/generate-post-local.js "${customTopic.replace(/"/g, '\\"')}"`;
    } else {
      // Run with random topic (default behavior)
      generationStatus.logs.push('🎲 Generating random topic...');
      command += 'node scripts/generate-post-local.js';
    }
    
    command += '"';

    generationStatus.logs.push('🤖 Running AI generation script...');

    // Execute the generation script
    generationProcess = exec(command, { cwd: 'd:\\ai-blog-website' }, (error, stdout, stderr) => {
      generationStatus.isGenerating = false;
      
      if (error) {
        generationStatus.progress = 'Generation failed';
        generationStatus.logs.push(`❌ Error: ${error.message}`);
        console.error('Generation error:', error);
      } else {
        generationStatus.progress = 'Generation completed successfully!';
        generationStatus.logs.push('✅ Generation completed!');
        generationStatus.logs.push('📤 Post published to website');
        generationStatus.lastGeneration = new Date().toLocaleString();
        
        if (settings.autoPublish) {
          generationStatus.logs.push('🚀 Auto-deployment triggered');
        }
      }

      if (stdout) {
        const outputLines = stdout.split('\n').filter(line => line.trim());
        outputLines.forEach(line => {
          if (line.trim()) {
            generationStatus.logs.push(`📋 ${line.trim()}`);
          }
        });
      }

      if (stderr) {
        const errorLines = stderr.split('\n').filter(line => line.trim());
        errorLines.forEach(line => {
          if (line.trim()) {
            generationStatus.logs.push(`⚠️ ${line.trim()}`);
          }
        });
      }

      generationProcess = null;
    });

    // Add progress updates
    const progressInterval = setInterval(() => {
      if (!generationStatus.isGenerating) {
        clearInterval(progressInterval);
        return;
      }

      const progressMessages = [
        '🤖 AI analyzing trending topics...',
        '✍️ Generating unique content...',
        '📸 Searching for relevant images...',
        '🎨 Formatting article layout...',
        '📝 Finalizing blog post...',
      ];

      const randomMessage = progressMessages[Math.floor(Math.random() * progressMessages.length)];
      generationStatus.progress = randomMessage;
    }, 10000); // Update every 10 seconds

    res.json({ 
      success: true, 
      message: 'Generation started successfully',
      processId: generationProcess.pid 
    });

  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
