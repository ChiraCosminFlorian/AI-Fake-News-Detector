// services/analyticsService.js
// Purpose: Aggregates and persists analytics data to the Analytics collection:
//   - recordQuery(queryData)         → log each prediction event
//   - getGlobalStats()               → return totals, fake/real ratio, top keywords
//   - exportAnalyticsCsv(dateRange)  → stream CSV to admin
