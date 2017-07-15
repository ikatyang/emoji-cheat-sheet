yarn run generate

git config --global user.name ikatyang-bot
git config --global user.email ikatyang+bot@gmail.com
git config --global push.default simple

git add --all
git commit -m "docs(readme): update emoji-cheat-sheet"
git push -q origin HEAD:master
