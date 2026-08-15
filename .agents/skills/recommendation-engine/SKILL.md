---
name: recommendation-engine
description: "Next Best Quest" recommendation algorithm with weighted multi-factor scoring and explainable output for TechQuest.
---

# "Next Best Quest" Recommendation Engine

This skill outlines the recommendation engine architecture, weighted multi-factor scoring model, and explainable recommendation string generation for TechQuest.

---

## 1. Algorithm Overview

The "Next Best Quest" engine analyzes user profiles, skill levels, stated interests, and historical completions against the catalog of available events to recommend the optimal quest for growth.

- **Target Candidate Pool**: Only uncompleted events (`completedEvents.indexOf(event.id) === -1`).
- **Scoring Goal**: Calculate a composite score $S \in [0, 100]$ for each candidate event.
- **Output**: The candidate with the highest composite score, accompanied by a clear, human-readable justification ("Explainable Reason").

---

## 2. Weighted Scoring Breakdown

The composite match score is calculated using five weighted criteria:

| Factor | Weight | Evaluation Criteria |
| :--- | :---: | :--- |
| **Skill Gap** | **40%** (`0.40`) | Higher score for quests targeting skills where the user has the lowest XP or largest growth opportunity. |
| **Interest Match** | **25%** (`0.25`) | Higher score if the event matches user's declared interest tags (e.g., Web, AI, Cybersecurity). |
| **Difficulty Alignment** | **15%** (`0.15`) | Matches event difficulty to user level (Beginner for Lvl 1-2, Intermediate for Lvl 3-4, Advanced for Lvl 5+). |
| **Diversity / Exploration**| **10%** (`0.10`) | Rewards exploring new categories or tech stacks not yet completed by the user. |
| **Popularity / Demand** | **10%** (`0.10`) | Normalized score based on registration count or community rating. |

### Mathematical Formulation

$$\text{Score}(e, u) = (0.40 \cdot \text{SkillGap}) + (0.25 \cdot \text{Interest}) + (0.15 \cdot \text{Difficulty}) + (0.10 \cdot \text{Diversity}) + (0.10 \cdot \text{Popularity})$$

---

## 3. Explainable Reason Generation

Every recommendation must produce an explainable justification highlighting the primary driver for the suggestion.

Examples of dynamic reasons:
- *"Recommended because it strengthens your lowest skill area (AI & ML) with high XP gains."*
- *"Matches your core interest in Cloud Architecture and fits your current skill tier."*
- *"Diversifies your portfolio into Web3 while offering beginner-friendly onboarding."*
- *"Trending quest with high community engagement aligned with your Next.js mastery goal."*

---

## 4. Reference Implementation (`js/recommendation.js`)

```javascript
// js/recommendation.js

/**
 * Computes Next Best Quest recommendation for a given user profile and event catalog.
 * @param {Object} profile - User profile object
 * @param {Array<Object>} allEvents - Full list of event definitions
 * @param {Array<string|number>} completedIds - List of completed event IDs
 * @returns {{ event: Object|null, score: number, reason: string }}
 */
export function getNextBestQuest(profile, allEvents, completedIds = []) {
  const uncompleted = allEvents.filter(e => !completedIds.includes(e.id));
  if (uncompleted.length === 0) {
    return {
      event: null,
      score: 0,
      reason: "You have conquered all available quests! Check back soon for new challenges."
    };
  }

  const scoredEvents = uncompleted.map(event => {
    const skillGapScore = calculateSkillGapScore(profile, event);
    const interestScore = calculateInterestScore(profile, event);
    const difficultyScore = calculateDifficultyScore(profile, event);
    const diversityScore = calculateDiversityScore(profile, event, completedIds, allEvents);
    const popularityScore = calculatePopularityScore(event);

    const totalScore = (
      (0.40 * skillGapScore) +
      (0.25 * interestScore) +
      (0.15 * difficultyScore) +
      (0.10 * diversityScore) +
      (0.10 * popularityScore)
    );

    const reason = generateReason({
      skillGapScore,
      interestScore,
      difficultyScore,
      diversityScore,
      popularityScore,
      event,
      profile
    });

    return { event, score: totalScore, reason };
  });

  scoredEvents.sort((a, b) => b.score - a.score);
  return scoredEvents[0];
}
```
