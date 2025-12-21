#!/usr/bin/env node
/**
 * D4Guide Content Extraction Script
 * Uses Ollama to intelligently extract and summarize guide updates
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'data');
const SOURCES_DIR = join(DATA_DIR, 'sources');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'mistral';

async function checkOllama() {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, { method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
}

async function ollamaGenerate(prompt) {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.3,
        num_predict: 2000
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status}`);
  }

  const data = await response.json();
  return data.response;
}

async function extractUpdates() {
  console.log('\n  D4Guide Content Extraction');
  console.log('  ---------------------------------\n');

  // Check if Ollama is available
  const ollamaAvailable = await checkOllama();
  if (!ollamaAvailable) {
    console.log('  [SKIP] Ollama not available - using basic extraction');
    return basicExtraction();
  }

  console.log(`  Using Ollama (${OLLAMA_MODEL}) at ${OLLAMA_URL}`);

  // Load changes
  const changesPath = join(DATA_DIR, 'changes.json');
  if (!existsSync(changesPath)) {
    console.log('  [SKIP] No changes.json found');
    return null;
  }

  const changes = JSON.parse(readFileSync(changesPath, 'utf-8'));

  if (!changes.hasSignificantChanges) {
    console.log('  [SKIP] No significant changes to extract');
    return null;
  }

  // Collect snapshot content for changed sources
  const sourceContents = [];

  for (const change of changes.changes) {
    if (!change.significant) continue;

    const snapshotPath = join(SOURCES_DIR, `${change.source}.json`);
    if (!existsSync(snapshotPath)) continue;

    const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf-8'));

    sourceContents.push({
      source: change.name,
      content: snapshot.textContent?.substring(0, 15000) || JSON.stringify(snapshot.items, null, 2)
    });
  }

  if (sourceContents.length === 0) {
    console.log('  [SKIP] No content to analyze');
    return null;
  }

  console.log(`  Analyzing ${sourceContents.length} source(s)...`);

  try {
    const prompt = `You are analyzing Diablo 4 Blood Wave Necromancer guide updates.

Here are the latest snapshots from authoritative sources:

${sourceContents.map(s => `=== ${s.source} ===\n${s.content.substring(0, 8000)}`).join('\n\n')}

Extract and summarize the key information about the Blood Wave Necromancer build.

Respond ONLY with valid JSON in this exact format (no other text):
{
  "summary": "One-line summary of the build status",
  "tierStatus": "S-tier or A-tier or B-tier",
  "keyChanges": ["change1", "change2"],
  "skillUpdates": ["skill info"],
  "gearUpdates": ["gear info"],
  "actionItems": ["updates needed"],
  "urgency": "high or medium or low"
}`;

    const responseText = await ollamaGenerate(prompt);

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    let extractedData = null;

    if (jsonMatch) {
      try {
        extractedData = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.log('  [WARN] Could not parse JSON response, using fallback');
        extractedData = {
          summary: 'Guide update detected - manual review recommended',
          tierStatus: 'Unknown',
          keyChanges: ['Content updated from source guides'],
          urgency: 'medium'
        };
      }
    }

    // Save extraction results
    const extractionResult = {
      timestamp: new Date().toISOString(),
      model: OLLAMA_MODEL,
      sources: sourceContents.map(s => s.source),
      rawResponse: responseText,
      extracted: extractedData
    };

    writeFileSync(join(DATA_DIR, 'extraction.json'), JSON.stringify(extractionResult, null, 2));

    // Write changelog summary for commit message
    if (extractedData?.summary) {
      writeFileSync(join(DATA_DIR, 'changelog-summary.txt'), extractedData.summary);
    }

    console.log('  Extraction complete!');

    if (extractedData) {
      console.log(`\n  Summary: ${extractedData.summary}`);
      console.log(`  Tier Status: ${extractedData.tierStatus}`);
      console.log(`  Urgency: ${extractedData.urgency}`);
      console.log(`  Key Changes: ${extractedData.keyChanges?.length || 0}`);
    }

    console.log('  ---------------------------------\n');

    return extractedData;
  } catch (error) {
    console.error('  [ERROR] Ollama error:', error.message);
    return basicExtraction();
  }
}

function basicExtraction() {
  // Fallback extraction without AI
  console.log('  Using basic extraction (no AI)...');

  const changesPath = join(DATA_DIR, 'changes.json');
  if (!existsSync(changesPath)) return null;

  const changes = JSON.parse(readFileSync(changesPath, 'utf-8'));
  const changedSources = changes.changes.filter(c => c.significant).map(c => c.name);

  const summary = `Updates detected from: ${changedSources.join(', ')}`;

  writeFileSync(join(DATA_DIR, 'changelog-summary.txt'), summary);

  const result = {
    timestamp: new Date().toISOString(),
    summary,
    sources: changedSources,
    mode: 'basic'
  };

  writeFileSync(join(DATA_DIR, 'extraction.json'), JSON.stringify(result, null, 2));

  console.log(`  Summary: ${summary}`);
  console.log('  ---------------------------------\n');

  return result;
}

// Run extraction
extractUpdates().catch(console.error);
