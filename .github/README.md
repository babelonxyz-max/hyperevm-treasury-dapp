# CI/CD Pipeline Documentation

This directory contains GitHub Actions workflows for the HyperEVM Treasury dApp project.

## 🚀 Workflows Overview

### 1. **CI/CD Pipeline** (`ci-cd.yml`)
Main workflow that runs on every push and pull request.

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main`
- Release creation

**Jobs:**
- **Lint & Test**: Code quality checks and testing
- **Build**: Application build and artifact creation
- **Security Audit**: Vulnerability scanning
- **Deploy to Vercel**: Production deployment
- **Deploy Preview**: Preview deployments for PRs
- **Deploy to GitHub Pages**: Alternative deployment target
- **Notify**: Success/failure notifications

### 2. **Dependency Updates** (`dependency-update.yml`)
Automated dependency management and security monitoring.

**Triggers:**
- Weekly schedule (Mondays at 9 AM UTC)
- Manual trigger

**Jobs:**
- **Check Outdated**: Identifies outdated dependencies
- **Security Scan**: Vulnerability detection
- **Update Lockfile**: Automated dependency updates (manual trigger)

### 3. **Code Quality** (`code-quality.yml`)
Comprehensive code quality and performance analysis.

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main`

**Jobs:**
- **Code Quality Analysis**: ESLint and complexity checks
- **Bundle Size Analysis**: Build size monitoring
- **Performance Testing**: Lighthouse CI analysis
- **Accessibility Testing**: pa11y accessibility checks
- **Code Coverage**: Test coverage analysis (when tests are implemented)

### 4. **Automated Release** (`release.yml`)
Automated release creation and deployment.

**Triggers:**
- Git tags (e.g., `v1.0.0`)
- Manual trigger with version input

**Jobs:**
- **Create Release**: GitHub release creation with changelog
- **Build and Upload**: Release asset creation
- **Deploy to Production**: Production deployment
- **Notify Deployment**: Success/failure notifications

## 🔧 Configuration

### Environment Variables

The following secrets need to be configured in your GitHub repository:

#### Required Secrets:
- `VERCEL_TOKEN`: Vercel deployment token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID

#### Optional Secrets:
- `VITE_HYPER_EVM_RPC_URL`: HyperEVM RPC endpoint
- `VITE_TREASURY_CORE_ADDRESS`: Treasury contract address
- `VITE_STAKING_REWARDS_ADDRESS`: Staking rewards contract address
- `VITE_UNSTAKING_QUEUE_ADDRESS`: Unstaking queue contract address
- `VITE_PRICE_ORACLE_ADDRESS`: Price oracle contract address

### Setting up Secrets:

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each required secret

## 📊 Quality Gates

The CI/CD pipeline enforces the following quality standards:

- **Code Quality**: ESLint passes without errors
- **Security**: No moderate or high severity vulnerabilities
- **Bundle Size**: JavaScript files < 500KB, CSS files < 100KB
- **Performance**: Lighthouse CI performance score > 90
- **Accessibility**: pa11y accessibility tests pass

## 🚀 Deployment

### Automatic Deployments:

- **Production**: Deploys to Vercel when pushing to `main` branch
- **Preview**: Creates preview deployments for pull requests
- **GitHub Pages**: Alternative deployment target for production

### Manual Deployments:

1. **Create a Release**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Manual Workflow Trigger**:
   - Go to Actions tab in GitHub
   - Select "Automated Release"
   - Click "Run workflow"
   - Enter version number

## 🔍 Monitoring

### Build Status:
- Check the Actions tab for workflow status
- Green checkmark = success
- Red X = failure (check logs for details)

### Performance Monitoring:
- Bundle size analysis in build logs
- Lighthouse CI results in performance job
- Accessibility test results in accessibility job

### Security Monitoring:
- Weekly security scans
- Dependency vulnerability alerts
- Automated security issue creation

## 🛠️ Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check for linting errors
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Deployment Failures**:
   - Verify Vercel secrets are configured
   - Check Vercel project settings
   - Review deployment logs

3. **Security Failures**:
   - Update vulnerable dependencies
   - Run `npm audit fix`
   - Check for new security advisories

### Getting Help:

- Check workflow logs in the Actions tab
- Review the specific job that failed
- Look for error messages in the logs
- Create an issue if the problem persists

## 📈 Metrics and Reporting

The CI/CD pipeline provides:

- **Build Time**: Track build performance over time
- **Bundle Size**: Monitor application size growth
- **Test Coverage**: Code coverage metrics (when tests are added)
- **Security Score**: Vulnerability count and severity
- **Performance Score**: Lighthouse performance metrics

## 🔄 Workflow Customization

To customize the workflows:

1. Edit the `.yml` files in this directory
2. Adjust quality gates in `config.yml`
3. Modify deployment targets as needed
4. Add new jobs for additional checks

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment Guide](https://vercel.com/docs/concepts/projects/overview)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [ESLint Configuration](https://eslint.org/docs/user-guide/configuring/)
