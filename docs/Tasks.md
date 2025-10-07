- Reset env data

- fix initial redirect from admin before user is fetched
- default all organisations to selected
- invalidate all relvant query cache when organisation selection changes
- enable single org to be deselected

- Signing in and out as different users doesn't always get all of the org data. I need to investigate the data loading pathway and understand if there are dependant fetches and how we can streamline the fetching to ensure that data displays quickly and correctly

- [ ] fix org adding
  - [ ] any user should be able to create an org
  - [ ] Adding an org via the invite page works, but not from the org selector component
  - [ ]
