# 🤝 Contributing to Sembalun Mind
*Selamat datang! Welcome to the Sembalun Mind community!*

## 🎯 About Sembalun Mind

**Sembalun Mind** adalah platform meditasi Indonesia yang menggabungkan teknologi AI modern dengan kearifan tradisional Indonesia. Kami menciptakan pengalaman mindfulness yang autentik dan relevan untuk praktisi meditasi Indonesia, dengan sistem pelacakan mood revolusioner yang mencakup 40+ pilihan emosi dengan aksesibilitas WCAG 2.1 AA.

**Sembalun Mind** is an Indonesian meditation platform that combines modern AI technology with traditional Indonesian wisdom. We create authentic and relevant mindfulness experiences for Indonesian meditation practitioners, featuring a revolutionary mood tracking system with 40+ emotional options and WCAG 2.1 AA accessibility compliance.

---

## 🌟 Ways to Contribute

### 🎨 **Cultural Validation & Content**
- **Validate Indonesian cultural practices** for authenticity and respectfulness
- **Contribute traditional wisdom quotes** from various Indonesian regions
- **Review meditation techniques** for cultural accuracy
- **Translate content** into regional Indonesian languages (Javanese, Sundanese, Balinese)

### 💻 **Technical Development**
- **Enhanced Mood System**: 40+ mood options with intelligent categorization
- **Frontend Development**: React, TypeScript, Indonesian UX optimization
- **Accessibility Excellence**: WCAG 2.1 AA compliance with 7:1+ contrast ratios
- **Mobile-First Design**: Responsive modal system with viewport optimization
- **Backend Enhancement**: Supabase, cultural data structures, API optimization
- **Performance**: Progressive disclosure UX and mobile network optimization

### 📚 **Documentation & Education**
- **Improve documentation** (setup guides, API docs, cultural integration)
- **Create tutorials** for Indonesian developers
- **Write blog posts** about cultural preservation through technology
- **Translate documentation** into Bahasa Indonesia

### 🐛 **Quality Assurance**
- **Report bugs** with detailed reproduction steps
- **Test on Indonesian mobile networks** and devices
- **Validate cultural sensitivity** of features
- **Performance testing** on various connection speeds

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- Git knowledge
- Understanding of Indonesian culture (for cultural contributions)
- React/TypeScript skills (for technical contributions)

### **Setup Development Environment**

1. **Fork the repository**
   ```bash
   # Go to https://github.com/ikigaiina/sembalun
   # Click "Fork" button
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/sembalun.git
   cd sembalun
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Add your Supabase credentials
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Run tests**
   ```bash
   npm test
   npm run lint
   npm run typecheck
   ```

---

## 📋 Contribution Guidelines

### **Code Style**
- **TypeScript**: All new code must be TypeScript with strict mode
- **ESLint**: Follow existing ESLint configuration
- **Prettier**: Code formatting handled automatically
- **Accessibility**: Maintain WCAG 2.1 AA compliance (7:1+ contrast)
- **Mobile-First**: Responsive design with proper touch targets (44px+)
- **Cultural Naming**: Use respectful Indonesian terminology
- **Performance**: Optimize for mobile viewport and network conditions

### **Commit Messages**
Follow conventional commit format:
```
type(scope): description

feat(cultural): add Javanese meditation breathing techniques
fix(mobile): optimize loading for Indonesian 3G networks
docs(setup): improve Supabase setup guide in Bahasa Indonesia
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
**Scopes**: `mood`, `modal`, `accessibility`, `cultural`, `mobile`, `auth`, `ui`, `docs`, `backend`

**Recent Examples**:
- `feat(mood): add 40+ mood options with intelligent categorization`
- `fix(modal): resolve viewport height issues on mobile`
- `feat(accessibility): implement WCAG 2.1 AA compliant color system`
- `perf(modal): optimize animation performance and sizing`

### **Pull Request Process**

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-contribution-name
   ```

2. **Make your changes**
   - Follow coding standards
   - Add tests for new functionality
   - Ensure cultural sensitivity
   - Update documentation

3. **Test thoroughly**
   ```bash
   npm run lint
   npm run typecheck  
   npm test
   npm run build
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat(cultural): add Balinese meditation practices"
   git push origin feature/your-contribution-name
   ```

5. **Create Pull Request**
   - Use descriptive title and description
   - Reference any related issues
   - Include screenshots for UI changes
   - Mention cultural validation (if applicable)

---

## 🏛️ Cultural Contribution Guidelines

### **Cultural Sensitivity Requirements**
- **Respectful Implementation**: All cultural content must be respectful and authentic
- **Cultural Validation**: Contributions should be validated by cultural practitioners
- **Inclusive Approach**: Welcome diverse Indonesian cultural perspectives
- **Educational Focus**: Prioritize educational value and cultural preservation

### **Regional Practices We Support**
- **Javanese** (Jawa): Traditional meditation, Javanese philosophy, batik patterns
- **Balinese** (Bali): Hindu-Buddhist practices, Tri Hita Karana, temple aesthetics  
- **Sundanese** (Sunda): West Java traditions, bamboo motifs, mountain spirituality
- **Minangkabau** (Sumatra): Adat philosophy, rumah gadang architecture, nature wisdom
- **Sembalun** (Lombok): Community practices, mountain meditation, local wisdom

### **Cultural Content Validation**
Before contributing cultural content:

1. **Research authenticity** from reliable cultural sources
2. **Consult with cultural practitioners** when possible
3. **Verify respectfulness** of implementation
4. **Provide cultural context** and educational notes
5. **Cite sources** for traditional practices or quotes

---

## 🎯 Priority Contribution Areas

### **High Impact - Needed Now**
1. **Mood System Enhancement**: Expand categories beyond current 40+ options
2. **Accessibility Testing**: Validate WCAG 2.1 AA compliance across devices
3. **Indonesian Cultural Validation**: Review existing cultural implementations
4. **Mobile UX Optimization**: Further optimize modal sizing and touch interactions
5. **Bahasa Indonesia Translation**: Translate documentation and UI
6. **Regional Practice Expansion**: Add more Indonesian regional practices

### **Medium Impact - Welcome**
1. **Advanced Analytics**: Enhanced user behavior insights
2. **Community Features**: Social meditation and group practices
3. **Accessibility**: Improve accessibility for Indonesian users with disabilities
4. **Testing**: Comprehensive test coverage expansion

### **Future Enhancement - Planned**
1. **React Native App**: Native mobile application
2. **Advanced AI**: Indonesian Natural Language Processing
3. **Enterprise Features**: Corporate meditation programs
4. **Academic Integration**: University and research partnerships

---

## 🐛 Bug Reports

### **Creating Good Bug Reports**
Include the following information:

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. See error

## Expected Behavior
What you expected to happen

## Actual Behavior  
What actually happened

## Environment
- OS: Windows 10 / macOS / Linux
- Browser: Chrome 118 / Safari / Firefox
- Device: Mobile (iPhone/Android) / Desktop
- Viewport: Portrait/Landscape orientation
- Network: 3G / 4G / WiFi
- Location: Indonesia (city/region)
- Accessibility: Screen reader / Keyboard navigation

## Screenshots
Add screenshots if applicable

## Cultural Context (if relevant)
Any cultural considerations or Indonesian-specific context
```

---

## 💡 Feature Requests

### **Suggesting New Features**
1. **Check existing issues** to avoid duplicates
2. **Provide detailed use case** and user story
3. **Consider Indonesian cultural context**
4. **Include implementation suggestions** if technical
5. **Assess impact** on Indonesian meditation practitioners

### **Feature Request Template**
```markdown
## Feature Title
Brief, clear title

## Problem Statement
What problem does this solve for Indonesian users?

## Proposed Solution
Detailed description of your idea

## Cultural Considerations
How does this respect/enhance Indonesian culture?

## Success Criteria
How do we know this feature is successful?

## Implementation Notes
Technical considerations (optional)
```

---

## 🌍 Internationalization & Localization

### **Language Support Priorities**
1. **Bahasa Indonesia** (primary) - Complete translation
2. **Javanese** (Jawa) - Cultural meditation terms
3. **Sundanese** (Sunda) - Regional practices
4. **Balinese** (Bali) - Spiritual terminology
5. **English** (international) - Developer documentation

### **Translation Guidelines**
- **Cultural Accuracy**: Use appropriate cultural terminology
- **Respectful Language**: Maintain spiritual and cultural respect
- **Consistency**: Follow established translation patterns
- **Context Awareness**: Consider meditation and spiritual context

---

## 📞 Community & Support

### **Communication Channels**
- **GitHub Issues**: Bug reports, feature requests, technical discussion
- **GitHub Discussions**: Community conversation, questions, cultural validation
- **Pull Requests**: Code review and collaboration
- **Documentation**: README, guides, and cultural information

### **Community Guidelines**
- **Be respectful** of Indonesian culture and traditions
- **Be inclusive** of diverse backgrounds and experience levels
- **Be constructive** in feedback and suggestions
- **Be patient** with cultural learning and validation processes
- **Be collaborative** in building authentic Indonesian meditation technology

### **Getting Help**
- **Technical Issues**: Create GitHub issue with "help wanted" label
- **Cultural Questions**: Use GitHub Discussions for community input
- **Setup Problems**: Check documentation or ask in Discussions
- **Contribution Guidance**: Reach out to maintainers for guidance

---

## 🏆 Recognition & Credits

### **Contributor Recognition**
- **All contributors** are listed in our credits
- **Significant contributions** are highlighted in release notes
- **Cultural validators** receive special recognition for preserving Indonesian heritage
- **Regular contributors** may be invited as project collaborators

### **Types of Recognition**
- **GitHub Contributors**: Automatic recognition in repository
- **Release Notes**: Major contributions highlighted
- **Community Recognition**: Cultural and technical expertise acknowledgment
- **Academic Citations**: Contributions to cultural preservation research

---

## 📋 Code Review Process

### **Review Criteria**
- **Functionality**: Does the code work as intended?
- **Accessibility**: WCAG 2.1 AA compliance with 7:1+ contrast ratios
- **Mobile Responsiveness**: Proper viewport handling and touch targets
- **Cultural Sensitivity**: Is cultural content respectful and authentic?
- **Performance**: Does it work well on Indonesian networks and devices?
- **TypeScript**: Strict type safety and comprehensive interfaces
- **Testing**: Appropriate tests including accessibility testing
- **Documentation**: Well-documented with cultural context
- **Progressive Enhancement**: Graceful degradation and enhancement

### **Review Timeline**
- **Small fixes**: 1-3 days
- **Feature additions**: 3-7 days  
- **Cultural content**: 5-10 days (requires cultural validation)
- **Major changes**: 7-14 days

---

## 🚀 Release Process

### **Release Schedule**
- **Minor releases**: Monthly with new features
- **Patch releases**: As needed for bug fixes
- **Major releases**: Quarterly with significant enhancements

### **Release Participation**
- **Beta Testing**: Help test pre-release versions
- **Release Notes**: Contribute to changelog and documentation
- **Cultural Validation**: Validate cultural features before release

---

## 💝 Thank You

**Terima kasih!** Thank you for contributing to Sembalun Mind and helping preserve Indonesian cultural heritage through respectful technology. Your contributions help millions of Indonesian meditation practitioners connect with their authentic spiritual traditions while enjoying modern, accessible meditation experiences.

Together, we're building more than just a meditation app - we're creating a bridge between traditional Indonesian wisdom and modern wellness technology, fostering cultural pride and spiritual growth for Indonesian communities worldwide.

**Selamat berkontribusi! Happy contributing!** 🙏

---

## 🎭 Recent Major Enhancement: Mood Modal System

We've recently implemented a revolutionary mood tracking system featuring:

- **40+ Mood Options**: Comprehensive emotional expression across 7 categories
- **WCAG 2.1 AA Compliance**: 7:1+ contrast ratios for accessibility
- **Progressive Disclosure UX**: Context-aware mood refinement
- **Mobile Optimization**: Viewport-aware sizing with proper scrolling
- **Cultural Integration**: Indonesian time-based check-ins (pagi/sore/malam)
- **Journal Sync**: Seamless integration with comprehensive journaling

Contributors are especially welcome to:
- Test accessibility across different devices and assistive technologies
- Validate cultural appropriateness of mood expressions in Indonesian context
- Suggest additional mood categories relevant to Indonesian emotional expression
- Improve mobile UX and performance optimization

*"Sembalun Mind: Preserving Indonesian wisdom through respectful technology with world-class accessibility"*

**Project Maintainers**: [Maintainer list will be updated]
**Cultural Advisors**: [Cultural validation team will be updated]  
**Accessibility Experts**: [WCAG 2.1 AA compliance team will be updated]
**Community Leaders**: [Community contributors will be recognized]

**Current Focus Areas**:
- 🎭 Mood system enhancement and cultural validation
- ♿ Accessibility testing and WCAG 2.1 AA compliance
- 📱 Mobile UX optimization for Indonesian users
- 🌏 Indonesian cultural integration and authenticity