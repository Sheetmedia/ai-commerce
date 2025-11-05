# Fix PostgreSQL Null Price Constraint Violation

## Tasks
- [x] Modify app/api/scrape/route.ts to skip snapshot creation when scrapedData.price is null
- [x] Add logging for skipped snapshots due to null price
- [x] Test the fix by running the application and triggering a scrape request
- [x] Verify that snapshots are only created when valid price data exists
- [x] Ensure scraping process continues normally even when snapshots are skipped
