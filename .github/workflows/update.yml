name: Up to Date

on:
  schedule:
    - cron: '0 0 * * *'

jobs:
  update:
    name: Update
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: ./.github/actions/setup
      - run: pnpm run generate

      - name: Push New Cheat Sheet to Updated Branch
        run: |
          git diff --name-only --exit-code && exit 0
          git add README.md
          git config --global user.name "github-actions[bot]"
          git config --global user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git commit -m "docs(readme): update emoji-cheat-sheet"
          git push -qf "https://${{ secrets.GITHUB_TOKEN }}@github.com/${{ github.repository }}.git" HEAD:github-actions-auto-update

      - name: Create PR from Updated Branch
        uses: actions/github-script@v2
        with:
          github-token: ${{secrets.GITHUB_TOKEN}}
          script: |
            const {owner, repo} = context.repo
            const branch = 'github-actions-auto-update'
            const head = `${owner}:${branch}`
            const title = 'docs(readme): update emoji-cheat-sheet'
            const branchesResult = await github.repos.listBranches({ owner, repo })
            if (branchesResult.status !== 200 || !branchesResult.data.find(({ name }) => name === branch)) {
              return
            }
            const prsResult = await github.pulls.list({ owner, repo, head, state: 'open' })
            if (prsResult.status === 200 && prsResult.data.length === 0) {
              try {
                await github.pulls.create({ owner, repo, head, title, base: 'master' })
              } catch (error) {
                console.error(error)
              }
            }
