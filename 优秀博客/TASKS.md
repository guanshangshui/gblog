# Two-hop blog scan plan

## Rules
- Max 2 hops per start URL
- Only fetch page metadata/headings; do not download full article bodies
- Keep blogs about AI/programming, reading, philosophy, economics, politics, or life reflection
- Output final curated links to `优秀博客/curated_links_2hop.md`

## Batches
- [x] Batch 1: `优秀博客/agent_batch_1.txt` -> `优秀博客/agent2_result_1.md`
- [x] Batch 2: `优秀博客/agent_batch_2.txt` -> `优秀博客/agent2_result_2.md`
- [x] Batch 3: `优秀博客/agent_batch_3.txt` -> `优秀博客/agent2_result_3.md`
- [x] Batch 4: `优秀博客/agent_batch_4.txt` -> `优秀博客/agent2_result_4.md`

## Aggregation
- [x] Merge results -> `优秀博客/curated_links_2hop.md`

## Notes
- Use the order from `优秀博客/owenyoung_sources_all.md`
- Stop at 2 hops even if more links look promising
