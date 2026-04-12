# Bugfix Requirements Document

## Introduction

The betting markets functionality in the new-prediction-v2 page and related API endpoints is not displaying all available betting markets and options from The Odds API. Users are experiencing limited or empty betting options when comprehensive market coverage should be available. Additionally, there is a build error in the odds API route with a duplicate 'response' variable declaration, and the system is currently filtering to show only Soccer leagues instead of all available football leagues.

This bugfix addresses the incomplete market display, build errors, and league filtering issues to ensure users can access all available betting markets and football leagues from The Odds API.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the odds API route (`/api/sports/odds/route.ts`) is built THEN the system produces a TypeScript error due to duplicate 'response' variable declaration and type mismatch with handicap comparison

1.2 WHEN the odds-leagues API filters sports THEN the system only returns leagues where `sport.group === "Soccer"` instead of all football-related leagues

1.3 WHEN the odds API route processes markets THEN the system uses a hardcoded league-to-sportKey mapping that only covers 6 specific leagues (EPL, Champions League, La Liga, Serie A, Bundesliga, Ligue 1)

1.4 WHEN the odds-matches API fetches markets THEN the system requests only specific markets (`h2h,spreads,totals,btts,h2h_lay`) instead of all available markets from The Odds API

1.5 WHEN betting options are displayed on the new-prediction-v2 page THEN the system may show empty market arrays when no outcomes are available for a specific market type

1.6 WHEN the match-markets dedicated page loads THEN the system only displays markets that were explicitly requested in the odds-matches API call, potentially missing other available markets

### Expected Behavior (Correct)

2.1 WHEN the odds API route is built THEN the system SHALL compile without TypeScript errors by removing duplicate variable declarations and fixing type mismatches

2.2 WHEN the odds-leagues API filters sports THEN the system SHALL return all active leagues without filtering by group, allowing users to see all available football leagues from The Odds API

2.3 WHEN the odds API route processes markets THEN the system SHALL accept a sportKey parameter directly from the request instead of using hardcoded league-to-sportKey mapping

2.4 WHEN the odds-matches API fetches markets THEN the system SHALL request all available markets by omitting the markets parameter or using a comprehensive list, ensuring complete market coverage

2.5 WHEN betting options are displayed on the new-prediction-v2 page THEN the system SHALL only render market sections that contain at least one outcome, preventing empty betting option displays

2.6 WHEN the match-markets dedicated page loads THEN the system SHALL display all markets returned by The Odds API for the selected match, providing comprehensive market coverage

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the odds API route cannot find a match or the API key is not configured THEN the system SHALL CONTINUE TO return estimated odds as a fallback

3.2 WHEN the odds-matches API successfully fetches match data THEN the system SHALL CONTINUE TO calculate average odds across multiple bookmakers for each outcome

3.3 WHEN users add betting options to their betslip on the new-prediction-v2 page THEN the system SHALL CONTINUE TO allow selection, confidence level adjustment, and betslip posting

3.4 WHEN users navigate between the league selector, matches list, and match-markets page THEN the system SHALL CONTINUE TO maintain proper navigation flow and state management

3.5 WHEN the odds-leagues API encounters an error or missing API key THEN the system SHALL CONTINUE TO return appropriate error messages with status codes

3.6 WHEN bookmaker data is processed for market outcomes THEN the system SHALL CONTINUE TO track bookmaker count and calculate average odds correctly
