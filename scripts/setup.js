const fs = require('fs');
const path = require('path');

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

function createSamplePosts() {
  const contentDir = path.join(process.cwd(), 'src', 'content');
  ensureDirectoryExists(contentDir);

  const samplePosts = [
    {
      title: "The Future of Artificial Intelligence in 2025",
      excerpt: "Exploring the latest developments and predictions for AI technology in the coming year.",
      content: `# The Future of Artificial Intelligence in 2025

Artificial Intelligence continues to evolve at an unprecedented pace, reshaping industries and transforming the way we live and work. As we move through 2025, several key trends are emerging that will define the next chapter of AI development.

## Key Developments This Year

### 1. Multimodal AI Systems
The integration of text, image, audio, and video processing in single AI models is becoming more sophisticated. These systems can understand and generate content across multiple modalities, opening new possibilities for human-computer interaction.

### 2. AI in Healthcare
Machine learning algorithms are revolutionizing medical diagnosis, drug discovery, and personalized treatment plans. AI-powered tools are helping doctors make more accurate diagnoses and develop targeted therapies.

### 3. Autonomous Systems
From self-driving cars to autonomous drones, AI-powered systems are becoming more reliable and widespread. The focus is shifting from basic automation to complex decision-making in unpredictable environments.

## Challenges and Opportunities

While AI presents enormous opportunities, it also brings challenges that need to be addressed:

- **Ethical AI**: Ensuring AI systems are fair, transparent, and unbiased
- **Privacy and Security**: Protecting user data and preventing misuse
- **Job Displacement**: Preparing for workforce changes and reskilling needs
- **Regulatory Frameworks**: Developing appropriate governance for AI development

## Looking Ahead

The future of AI lies in creating systems that augment human capabilities rather than replace them. As we continue to advance, the focus should be on building AI that is beneficial, safe, and aligned with human values.

The journey ahead is exciting, and 2025 promises to be a pivotal year in AI development.`,
      tags: ["AI", "Future", "Technology", "2025", "Trends"],
      date: "2025-01-18",
      slug: "future-of-artificial-intelligence-2025"
    },
    {
      title: "Getting Started with Machine Learning: A Beginner's Guide",
      excerpt: "Learn the fundamentals of machine learning and how to start your journey in this exciting field.",
      content: `# Getting Started with Machine Learning: A Beginner's Guide

Machine Learning (ML) is one of the most exciting and rapidly growing fields in technology today. Whether you're a complete beginner or looking to transition into ML, this guide will help you understand the basics and get started on your journey.

## What is Machine Learning?

Machine Learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed. Instead of following pre-programmed instructions, ML algorithms build mathematical models based on training data to make predictions or decisions.

## Types of Machine Learning

### 1. Supervised Learning
- Uses labeled training data
- Common algorithms: Linear Regression, Decision Trees, Random Forest
- Applications: Email spam detection, image classification

### 2. Unsupervised Learning
- Works with unlabeled data
- Common algorithms: K-means clustering, PCA
- Applications: Customer segmentation, anomaly detection

### 3. Reinforcement Learning
- Learns through interaction with an environment
- Applications: Game playing, robotics, autonomous vehicles

## Getting Started: Your Learning Path

### Step 1: Build Your Foundation
- **Mathematics**: Linear algebra, statistics, calculus
- **Programming**: Python or R
- **Data Manipulation**: pandas, NumPy (Python) or dplyr (R)

### Step 2: Learn Core Concepts
- Understanding different algorithms
- Model evaluation and validation
- Feature engineering
- Overfitting and underfitting

### Step 3: Practice with Projects
- Start with simple datasets
- Participate in online competitions (Kaggle)
- Build a portfolio of projects

### Step 4: Specialize
- Deep Learning
- Natural Language Processing
- Computer Vision
- Time Series Analysis

## Resources for Learning

### Online Courses
- Coursera: Machine Learning by Andrew Ng
- edX: MIT Introduction to Machine Learning
- Udacity: Machine Learning Nanodegree

### Books
- "Hands-On Machine Learning" by Aurélien Géron
- "Pattern Recognition and Machine Learning" by Christopher Bishop
- "The Elements of Statistical Learning" by Hastie, Tibshirani, and Friedman

### Practice Platforms
- Kaggle: Competitions and datasets
- Google Colab: Free GPU access
- GitHub: Open source projects

## Conclusion

Machine learning is a journey that requires patience, practice, and persistence. Start with the basics, work on real projects, and don't be afraid to experiment. The field is constantly evolving, so continuous learning is key to success.

Remember, every expert was once a beginner. Take your first step today!`,
      tags: ["Machine Learning", "Beginner", "Tutorial", "Learning", "AI"],
      date: "2025-01-17",
      slug: "getting-started-machine-learning-beginners-guide"
    },
    {
      title: "The Impact of Quantum Computing on Modern Technology",
      excerpt: "Exploring how quantum computing is set to revolutionize various industries and solve complex problems.",
      content: `# The Impact of Quantum Computing on Modern Technology

Quantum computing represents one of the most significant technological breakthroughs of our time. Unlike classical computers that use bits to process information, quantum computers use quantum bits (qubits) that can exist in multiple states simultaneously, offering unprecedented computational power.

## Understanding Quantum Computing

### Quantum Principles
- **Superposition**: Qubits can be in multiple states at once
- **Entanglement**: Qubits can be correlated in ways that classical bits cannot
- **Interference**: Quantum states can interfere with each other

These principles allow quantum computers to process vast amounts of information simultaneously, potentially solving problems that are intractable for classical computers.

## Applications and Impact

### 1. Cryptography and Security
Quantum computing poses both opportunities and challenges for cybersecurity:
- **Threat**: Could break current encryption methods
- **Opportunity**: Quantum cryptography offers unbreakable security

### 2. Drug Discovery and Healthcare
- Molecular simulation for drug development
- Protein folding predictions
- Personalized medicine optimization

### 3. Financial Modeling
- Risk analysis and portfolio optimization
- Fraud detection algorithms
- High-frequency trading strategies

### 4. Artificial Intelligence
- Enhanced machine learning algorithms
- Optimization problems
- Pattern recognition improvements

## Current State and Challenges

### Leading Companies
- IBM: Quantum Network with 200+ members
- Google: Achieved quantum supremacy in 2019
- Microsoft: Azure Quantum cloud platform
- Amazon: Braket quantum computing service

### Technical Challenges
- **Quantum Decoherence**: Qubits lose their quantum properties quickly
- **Error Rates**: Current quantum computers have high error rates
- **Scalability**: Building large-scale quantum systems is complex

## The Road Ahead

### Near-term (2025-2030)
- Quantum advantage in specific applications
- Hybrid quantum-classical algorithms
- Improved error correction methods

### Long-term (2030+)
- Fault-tolerant quantum computers
- Widespread commercial applications
- Quantum internet development

## Preparing for the Quantum Future

### For Businesses
- Assess potential quantum impact on your industry
- Invest in quantum-safe cryptography
- Partner with quantum research institutions

### For Individuals
- Learn quantum computing basics
- Develop programming skills (Qiskit, Cirq)
- Stay updated with quantum developments

## Conclusion

Quantum computing is not just a technological upgrade—it's a paradigm shift that will reshape how we approach complex problems. While we're still in the early stages, the potential applications are vast and transformative.

The quantum revolution is coming, and those who prepare now will be best positioned to harness its power. Whether you're a business leader, researcher, or technology enthusiast, understanding quantum computing is becoming increasingly important in our digital future.`,
      tags: ["Quantum Computing", "Technology", "Future", "Innovation", "Science"],
      date: "2025-01-16",
      slug: "impact-quantum-computing-modern-technology"
    }
  ];

  samplePosts.forEach(post => {
    const frontmatter = `---
title: "${post.title}"
excerpt: "${post.excerpt}"
date: "${post.date}"
author: "AI Blog"
tags: [${post.tags.map(tag => `"${tag}"`).join(', ')}]
image: "/images/blog/default-blog-image.jpg"
featured: ${post.slug === 'future-of-artificial-intelligence-2025' ? 'true' : 'false'}
---

`;

    const fullContent = frontmatter + post.content;
    const fileName = `${post.date}-${post.slug}.md`;
    const filePath = path.join(contentDir, fileName);
    
    fs.writeFileSync(filePath, fullContent);
    console.log(`Created sample post: ${fileName}`);
  });
}

function createPublicAssets() {
  const imagesDir = path.join(process.cwd(), 'public', 'images');
  const blogImagesDir = path.join(imagesDir, 'blog');
  
  ensureDirectoryExists(imagesDir);
  ensureDirectoryExists(blogImagesDir);

  // Create robots.txt
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${process.env.SITE_URL || 'https://yourdomain.github.io'}/sitemap.xml
`;
  
  fs.writeFileSync(path.join(process.cwd(), 'public', 'robots.txt'), robotsTxt);
  console.log('Created robots.txt');

  // Create a simple favicon if it doesn't exist
  const faviconPath = path.join(process.cwd(), 'public', 'favicon.ico');
  if (!fs.existsSync(faviconPath)) {
    console.log('Note: Add a favicon.ico file to the public directory');
  }
}

function main() {
  console.log('Setting up AI Blog project...');
  
  createSamplePosts();
  createPublicAssets();
  
  console.log('Setup completed successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Add your OpenAI API key to .env.local');
  console.log('2. Run "npm run dev" to start the development server');
  console.log('3. Run "npm run generate-post" to create AI-generated content');
  console.log('4. Deploy to GitHub Pages or Vercel');
}

if (require.main === module) {
  main();
}

module.exports = { createSamplePosts, createPublicAssets };
