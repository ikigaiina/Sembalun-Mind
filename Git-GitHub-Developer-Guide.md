# Git and GitHub Developer Guide

A comprehensive educational guide for developers to master version control with Git and collaboration with GitHub.

## Table of Contents

1. [Git Fundamentals](#git-fundamentals)
2. [Essential Git Commands](#essential-git-commands)
3. [GitHub Fundamentals](#github-fundamentals)
4. [Common Workflows](#common-workflows)
5. [Best Practices](#best-practices)
6. [Quick Reference](#quick-reference)

---

## Git Fundamentals

### What is Git and Version Control?

**Git** is a distributed version control system that tracks changes in files and coordinates work among multiple developers. Think of it as a sophisticated "save system" that:

- Records every change to your project over time
- Allows you to revert to previous versions
- Enables multiple developers to work on the same project simultaneously
- Maintains a complete history of who changed what and when

**Version Control Benefits:**
- Track changes and see project evolution
- Collaborate without overwriting each other's work
- Backup and recovery capabilities
- Branching for parallel development
- Merge changes from different contributors

### Key Concepts

#### Repository (Repo)
A **repository** is a directory that contains your project files and the complete history of changes. It includes:
- Your actual project files
- `.git` folder (contains all version history)
- Configuration and metadata

```
my-project/
├── .git/           # Git metadata (DON'T TOUCH)
├── src/
├── README.md
└── package.json
```

#### Commit
A **commit** is a snapshot of your project at a specific point in time. Each commit:
- Has a unique identifier (SHA hash)
- Contains a message describing what changed
- References the previous commit(s)
- Is immutable once created

```
Commit: a1b2c3d4
Author: John Doe
Date: 2024-01-15
Message: "Add user authentication feature"
```

#### Branch
A **branch** is a parallel version of your repository. It allows you to:
- Work on features without affecting the main code
- Experiment safely
- Collaborate on different features simultaneously

```
main branch:     A---B---C---F---G
                  \         /
feature branch:    D---E---/
```

#### Merge
**Merging** combines changes from different branches:
- Integrates feature branches back into main
- Automatically combines non-conflicting changes
- Requires manual resolution for conflicts

### Local vs Remote Repositories

#### Local Repository
- Lives on your computer
- Where you make changes and commits
- Can work offline
- Contains complete project history

#### Remote Repository
- Hosted on services like GitHub, GitLab, Bitbucket
- Shared among team members
- Acts as central source of truth
- Enables collaboration and backup

```
Local Repo (Your Computer) ←→ Remote Repo (GitHub)
     ↓ git push                    ↓ git pull
  Your changes           Latest team changes
```

---

## Essential Git Commands

### Repository Setup

#### Initialize a New Repository
```bash
# Create a new Git repository in current directory
git init

# Create a new directory and initialize Git
git init my-new-project
cd my-new-project
```

#### Clone an Existing Repository
```bash
# Clone from GitHub (HTTPS)
git clone https://github.com/username/repository.git

# Clone from GitHub (SSH)
git clone git@github.com:username/repository.git

# Clone to specific directory
git clone https://github.com/username/repository.git my-folder
```

### Basic Workflow

#### Check Repository Status
```bash
# See current status of files
git status

# Short status format
git status -s
```

#### Stage Changes
```bash
# Add specific file
git add filename.txt

# Add all files in directory
git add .

# Add all modified files (not new files)
git add -u

# Add files interactively
git add -i
```

#### Make Commits
```bash
# Commit staged changes with message
git commit -m "Add user login functionality"

# Commit all modified files (skip staging)
git commit -am "Fix navigation bug"

# Open editor for detailed commit message
git commit
```

#### Push and Pull Changes
```bash
# Push commits to remote repository
git push

# Push specific branch
git push origin feature-branch

# Pull latest changes from remote
git pull

# Pull from specific branch
git pull origin main
```

### Branch Management

#### Create and Switch Branches
```bash
# Create new branch
git branch feature-authentication

# Switch to branch
git checkout feature-authentication

# Create and switch in one command
git checkout -b feature-authentication

# Modern way to switch branches (Git 2.23+)
git switch feature-authentication
git switch -c feature-authentication  # create and switch
```

#### List and Delete Branches
```bash
# List all branches
git branch

# List all branches (including remote)
git branch -a

# Delete merged branch
git branch -d feature-authentication

# Force delete unmerged branch
git branch -D feature-authentication

# Delete remote branch
git push origin --delete feature-authentication
```

#### Merge Branches
```bash
# Switch to target branch (usually main)
git checkout main

# Merge feature branch
git merge feature-authentication

# Merge without fast-forward (creates merge commit)
git merge --no-ff feature-authentication
```

### Status and History

#### View Commit History
```bash
# Basic log
git log

# One line per commit
git log --oneline

# Graphical representation
git log --graph --oneline

# Show last 5 commits
git log -5

# Show commits by author
git log --author="John Doe"
```

#### View Changes
```bash
# See unstaged changes
git diff

# See staged changes
git diff --staged

# Compare branches
git diff main..feature-branch

# Show changes in specific commit
git show a1b2c3d4
```

### Undoing Changes

#### Unstage Files
```bash
# Unstage specific file
git reset filename.txt

# Unstage all files
git reset
```

#### Discard Changes
```bash
# Discard changes in working directory
git checkout -- filename.txt

# Discard all changes
git checkout -- .

# Modern way (Git 2.23+)
git restore filename.txt
git restore .
```

#### Undo Commits
```bash
# Undo last commit, keep changes staged
git reset --soft HEAD~1

# Undo last commit, unstage changes
git reset --mixed HEAD~1

# Undo last commit, discard changes (DANGEROUS)
git reset --hard HEAD~1

# Create new commit that undoes previous commit
git revert HEAD
```

---

## GitHub Fundamentals

### What is GitHub vs Git?

**Git**: The version control system (the engine)
- Runs locally on your computer
- Tracks changes and manages versions
- Works offline

**GitHub**: A cloud platform for Git repositories (the service)
- Hosts your Git repositories online
- Provides collaboration tools
- Offers additional features (Issues, Pull Requests, Actions)

### Key GitHub Concepts

#### Repository
Your project's home on GitHub containing:
- Source code
- Issues and discussions
- Pull requests
- Wiki and documentation
- Settings and permissions

#### Fork
A **fork** creates your own copy of someone else's repository:
- Allows you to make changes without affecting original
- Common in open source contributions
- Maintains connection to original repository

```bash
# After forking on GitHub, clone your fork
git clone https://github.com/yourusername/original-repo.git
cd original-repo

# Add original repository as upstream
git remote add upstream https://github.com/originalowner/original-repo.git
```

#### Clone vs Fork vs Download
- **Clone**: Copy repository to work with Git
- **Fork**: Create your own copy on GitHub
- **Download**: Get files without Git history (not recommended for development)

### Pull Requests and Code Review

#### What is a Pull Request?
A pull request (PR) is a proposal to merge changes from one branch into another. It enables:
- Code review before merging
- Discussion about changes
- Automated testing
- Collaboration and feedback

#### Creating a Pull Request
1. **Push your branch to GitHub:**
```bash
git push origin feature-authentication
```

2. **Create PR on GitHub:**
- Go to repository on GitHub
- Click "Compare & pull request"
- Add title and description
- Choose reviewers
- Submit PR

#### Pull Request Best Practices
```markdown
## PR Title: Add User Authentication System

### Description
Implements JWT-based authentication with login/logout functionality.

### Changes
- Add login form component
- Implement JWT token handling
- Add protected route middleware
- Update user model with authentication fields

### Testing
- Manual testing on dev environment
- Unit tests for auth service
- Integration tests for login flow

### Screenshots
[Include relevant screenshots]

### Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
```

### Issues and Project Management

#### GitHub Issues
Use issues to track:
- Bugs and problems
- Feature requests
- Tasks and improvements
- Questions and discussions

#### Issue Template Example
```markdown
## Bug Report

### Description
Brief description of the issue

### Steps to Reproduce
1. Go to login page
2. Enter invalid credentials
3. Click login button
4. See error

### Expected Behavior
Should show clear error message

### Actual Behavior
Page crashes

### Environment
- Browser: Chrome 96
- OS: macOS 12
- App version: 1.2.3
```

### GitHub Actions Basics

GitHub Actions automate workflows like:
- Running tests on pull requests
- Deploying to production
- Code quality checks
- Notifications and integrations

#### Simple CI Workflow
```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    - name: Install dependencies
      run: npm install
    - name: Run tests
      run: npm test
```

---

## Common Workflows

### Feature Branch Workflow

This is the most common workflow for teams:

#### 1. Start with Updated Main Branch
```bash
git checkout main
git pull origin main
```

#### 2. Create Feature Branch
```bash
git checkout -b feature/user-profile
```

#### 3. Work on Feature
```bash
# Make changes
echo "profile code" > profile.js

# Stage and commit
git add profile.js
git commit -m "Add user profile functionality"

# Continue making commits as needed
```

#### 4. Push Feature Branch
```bash
git push origin feature/user-profile
```

#### 5. Create Pull Request
- Go to GitHub
- Create pull request from feature branch to main
- Get code review and approval

#### 6. Merge and Cleanup
```bash
# After PR is merged, clean up
git checkout main
git pull origin main
git branch -d feature/user-profile
```

### Collaboration Patterns

#### Working with Teammates

**Before starting work:**
```bash
# Always start with latest code
git checkout main
git pull origin main
git checkout -b your-feature-branch
```

**During work:**
```bash
# Regularly update your branch with main
git checkout main
git pull origin main
git checkout your-feature-branch
git merge main
```

**Resolving merge conflicts:**
```bash
# If merge has conflicts
git merge main
# Edit files to resolve conflicts
# Look for conflict markers:
# <<<<<<< HEAD
# Your changes
# =======
# Incoming changes
# >>>>>>> main

# After resolving conflicts
git add resolved-file.js
git commit -m "Resolve merge conflicts"
```

#### Open Source Contribution

1. **Fork the repository** on GitHub
2. **Clone your fork:**
```bash
git clone https://github.com/yourusername/project.git
cd project
```

3. **Add upstream remote:**
```bash
git remote add upstream https://github.com/originalowner/project.git
```

4. **Create feature branch:**
```bash
git checkout -b fix-navigation-bug
```

5. **Make changes and commit:**
```bash
git add .
git commit -m "Fix navigation menu accessibility"
```

6. **Push to your fork:**
```bash
git push origin fix-navigation-bug
```

7. **Create pull request** from your fork to original repository

### Conflict Resolution

#### Understanding Conflicts
Conflicts occur when:
- Two people modify the same lines
- One person deletes a file another person modifies
- Complex merge situations

#### Resolving Conflicts Step by Step

1. **Pull latest changes that cause conflict:**
```bash
git pull origin main
# Auto-merging file.js
# CONFLICT (content): Merge conflict in file.js
# Automatic merge failed; fix conflicts and then commit the result.
```

2. **Check status:**
```bash
git status
# Unmerged paths:
#   both modified:   file.js
```

3. **Open conflicted file:**
```javascript
function greetUser(name) {
<<<<<<< HEAD
    return `Hello, ${name}! Welcome to our app!`;
=======
    return `Hi ${name}, glad you're here!`;
>>>>>>> main
}
```

4. **Resolve conflict by editing:**
```javascript
function greetUser(name) {
    return `Hello, ${name}! Welcome to our app!`;
}
```

5. **Stage and commit resolution:**
```bash
git add file.js
git commit -m "Resolve greeting message conflict"
```

#### Tools for Conflict Resolution
- **VS Code**: Built-in merge conflict resolution
- **Git tools**: `git mergetool` with various GUI tools
- **Command line**: Direct file editing

---

## Best Practices

### Commit Message Conventions

#### Good Commit Messages
Follow the format: `type(scope): description`

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat(auth): add JWT token validation"
git commit -m "fix(ui): correct button alignment on mobile"
git commit -m "docs(readme): update installation instructions"
git commit -m "refactor(api): simplify user service methods"
```

#### Detailed Commit Message Template
```
feat(auth): add JWT token validation

- Implement token verification middleware
- Add token expiration checking
- Include refresh token functionality

Closes #123
```

### Branch Naming Conventions

#### Consistent Naming Patterns
```bash
# Feature branches
feature/user-authentication
feature/payment-integration
feat/shopping-cart

# Bug fix branches
fix/login-validation
bugfix/navigation-menu
hotfix/security-patch

# Maintenance branches
chore/update-dependencies
refactor/user-service
docs/api-documentation
```

#### Include Issue Numbers
```bash
feature/123-user-authentication
fix/456-login-bug
```

### When to Commit and Push

#### Commit Frequency
**Commit often with logical chunks:**
- After completing a small feature
- After fixing a bug
- Before switching tasks
- At the end of each work session

**Good commit examples:**
```bash
git commit -m "Add user model validation"
git commit -m "Implement password hashing"
git commit -m "Add login form component"
git commit -m "Connect login form to API"
```

#### Push Frequency
**Push regularly but thoughtfully:**
- At least once per day of active work
- After completing features
- Before switching computers/locations
- When you want feedback

#### Don't Commit These
```bash
# Add to .gitignore
node_modules/
.env
*.log
.DS_Store
dist/
build/
```

### Repository Organization

#### Good README Structure
```markdown
# Project Name

Brief description of what the project does.

## Installation

```bash
npm install
```

## Usage

```bash
npm start
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT
```

#### Essential Files
- `README.md`: Project overview and setup
- `.gitignore`: Files Git should ignore
- `LICENSE`: Project license
- `CONTRIBUTING.md`: Contribution guidelines
- `.github/`: GitHub-specific files (templates, workflows)

---

## Quick Reference

### Essential Commands Cheat Sheet

```bash
# Repository Setup
git init                          # Initialize repository
git clone <url>                   # Clone repository

# Basic Workflow
git status                        # Check status
git add <file>                    # Stage file
git add .                         # Stage all files
git commit -m "message"           # Commit changes
git push                          # Push to remote
git pull                          # Pull from remote

# Branching
git branch                        # List branches
git checkout -b <branch>          # Create and switch branch
git checkout <branch>             # Switch branch
git merge <branch>               # Merge branch
git branch -d <branch>           # Delete branch

# Information
git log                          # Show commit history
git log --oneline               # Compact log
git diff                        # Show changes
git show <commit>               # Show commit details

# Undoing Changes
git reset <file>                # Unstage file
git checkout -- <file>          # Discard changes
git reset --soft HEAD~1         # Undo last commit (keep changes)
git reset --hard HEAD~1         # Undo last commit (lose changes)
git revert <commit>             # Create commit that undoes changes

# Remote Repositories
git remote -v                   # Show remotes
git remote add <name> <url>     # Add remote
git fetch                       # Download remote changes
git pull origin <branch>        # Pull specific branch
git push origin <branch>        # Push specific branch
```

### Common Git Workflows Summary

#### Daily Development Flow
```bash
1. git checkout main
2. git pull origin main
3. git checkout -b feature/my-feature
4. # Make changes
5. git add .
6. git commit -m "implement feature"
7. git push origin feature/my-feature
8. # Create PR on GitHub
9. # After PR merged:
10. git checkout main
11. git pull origin main
12. git branch -d feature/my-feature
```

#### Emergency Hotfix Flow
```bash
1. git checkout main
2. git pull origin main
3. git checkout -b hotfix/critical-bug
4. # Fix the bug
5. git commit -am "fix critical security issue"
6. git push origin hotfix/critical-bug
7. # Create PR for immediate review
```

### Troubleshooting Common Issues

#### "I committed to the wrong branch"
```bash
# Move last commit to correct branch
git reset --soft HEAD~1
git stash
git checkout correct-branch
git stash pop
git commit
```

#### "I need to update my fork"
```bash
git checkout main
git pull upstream main
git push origin main
```

#### "I made a typo in my last commit message"
```bash
git commit --amend -m "corrected commit message"
```

#### "I want to combine my last few commits"
```bash
# Interactive rebase to squash commits
git rebase -i HEAD~3
# Change "pick" to "squash" for commits you want to combine
```

---

## Learning Path Recommendations

### Beginner (Week 1-2)
1. Understand version control concepts
2. Practice basic commands (init, add, commit, status)
3. Learn to create and switch branches
4. Practice push/pull with remote repositories

### Intermediate (Week 3-4)
1. Master merge conflict resolution
2. Learn pull request workflow
3. Understand Git history and log commands
4. Practice collaborative development

### Advanced (Ongoing)
1. Learn Git internals and advanced commands
2. Master rebase and interactive rebase
3. Understand Git hooks and automation
4. Explore advanced GitHub features

### Practice Projects
1. **Personal Portfolio**: Practice basic Git with your own project
2. **Open Source Contribution**: Find a beginner-friendly project
3. **Team Collaboration**: Work on a project with friends
4. **Complex Workflow**: Practice feature branches, releases, and hotfixes

---

## Additional Resources

### Official Documentation
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Docs](https://docs.github.com/)
- [Pro Git Book](https://git-scm.com/book) (Free online)

### Interactive Learning
- [Learn Git Branching](https://learngitbranching.js.org/) (Interactive tutorial)
- [GitHub Learning Lab](https://lab.github.com/)
- [Atlassian Git Tutorials](https://www.atlassian.com/git/tutorials)

### Tools and Extensions
- **GUI Tools**: GitKraken, SourceTree, GitHub Desktop
- **VS Code Extensions**: GitLens, Git Graph
- **Terminal Enhancements**: Oh My Zsh with Git plugin

Remember: Git proficiency comes with practice. Start with basic commands and gradually incorporate more advanced features as you become comfortable. The key is to use Git consistently in your daily development work.