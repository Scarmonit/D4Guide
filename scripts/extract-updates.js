#!/usr/bin/env node
/**
 * D4Guide Content Extraction Script
 * Uses Claude API to intelligently extract and summarize guide updates
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'data');
const SOURCES_DIR = join(DATA_DIR, 'sources');

async function extractUpdates() {
  console.log('\n  D4Guide Content Extraction');
  console.log('  ---------------------------------\n');

  // Check for API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log('  [SKIP] ANTHROPIC_API_KEY not set - using basic extraction');
    return basicExtraction();
  }

  const anthropic = new Anthropic({ apiKey });

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
      content: snapshot.textContent?.substring(0, 30000) || JSON.stringify(snapshot.items, null, 2)
    });
  }

  if (sourceContents.length === 0) {
    console.log('  [SKIP] No content to analyze');
    return null;
  }

  console.log(`  Analyzing ${sourceContents.length} source(s) with Claude...`);

  try {
    const prompt = `You are analyzing Diablo 4 Blood Wave Necromancer guide updates from authoritative sources.

Here are the latest snapshots from the sources:

${sourceContents.map(s => `=== ${s.source} ===\n${s.content}`).join('\n\n')}

Please extract and summarize:

1. **Key Changes**: What significant changes have been made to the Blood Wave Necromancer build?
   - Skill changes
   - Gear/Aspect changes
   - Paragon board changes
   - Season 11 specific changes

2. **Meta Status**: Is this build still S-tier/A-tier? Any tier changes?

3. **Action Items**: What specific updates should be made to our guide?

Provide a structured summary in JSON format:
{
  "summary": "One-line summary of changes",
  "tierStatus": "S/A/B/C tier",
  "keyChanges": ["change1", "change2"],
  "skillUpdates": ["skill change details"],
  "gearUpdates": ["gear change details"],
  "paragonUpdates": ["paragon change details"],
  "seasonalUpdates": ["season 11 specific changes"],
  "actionItems": ["specific updates needed for our guide"],
  "urgency": "high/medium/low"
}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = response.content[0].text;

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    let extractedData = null;

    if (jsonMatch) {
      try {
        extractedData = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.log('  [WARN] Could not parse JSON response');
      }
    }

    // Save extraction results
    const extractionResult = {
      timestamp: new Date().toISOString(),
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
    console.error('  [ERROR] Claude API error:', error.message);
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
