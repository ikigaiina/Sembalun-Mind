# Sembalun Base Templates

This directory contains comprehensive base templates for creating new components, services, and other code structures in the Sembalun meditation app. These templates follow the established patterns and conventions of the project.

## 📋 Available Templates

### Core Templates

| Template | Description | File Path |
|----------|-------------|-----------|
| **React Component** | Full-featured React component with TypeScript | `components/ReactComponent.tsx` |
| **Service Class** | Supabase service with CRUD operations | `services/SupabaseService.ts` |
| **Page Component** | Complete page layout with routing | `pages/PageComponent.tsx` |
| **Custom Hook** | React hook with state management | `hooks/useCustomHook.ts` |
| **Context Provider** | React context with reducer pattern | `contexts/ContextProvider.tsx` |
| **API Endpoint** | REST API handler with validation | `api/ApiEndpoint.ts` |
| **Database Model** | PostgreSQL schema with RLS | `database/DatabaseModel.sql` |
| **Configuration** | Environment config with validation | `config/ConfigTemplate.ts` |
| **Utility Functions** | Helper functions with caching | `utils/UtilityFunction.ts` |
| **Test Suite** | Comprehensive test template | `tests/Component.test.tsx` |

## 🚀 Quick Start

### 1. Choose a Template
Select the appropriate template based on what you're building:
- Building a UI component? Use `ReactComponent.tsx`
- Creating a data service? Use `SupabaseService.ts`
- Adding a new page? Use `PageComponent.tsx`

### 2. Copy and Customize
```bash
# Copy template to your target location
cp templates/components/ReactComponent.tsx src/components/MyNewComponent.tsx

# Replace placeholders with your actual names
# COMPONENT_NAME → MyNewComponent
# TODO comments → Your actual implementation
```

### 3. Find and Replace
Each template uses consistent placeholder patterns:
- `COMPONENT_NAME` → Your component name
- `SERVICE_NAME` → Your service name
- `ENDPOINT_NAME` → Your API endpoint name
- `HOOK_NAME` → Your hook name
- `CONTEXT_NAME` → Your context name
- `TABLE_NAME` → Your database table name
- `TODO:` → Implementation tasks

## 📖 Template Features

### React Component Template
```typescript
// Features included:
✅ TypeScript interfaces
✅ State management with useState
✅ Effect cleanup with useEffect
✅ Error boundaries compatibility
✅ Loading and error states
✅ Accessibility considerations
✅ Indonesian language support
✅ Performance optimizations
```

### Service Class Template
```typescript
// Features included:
✅ Full CRUD operations
✅ Error handling and logging
✅ Caching strategies
✅ Real-time subscriptions
✅ Batch operations
✅ Type safety with PostgrestResponse
✅ Authentication integration
```

### API Endpoint Template
```typescript
// Features included:
✅ Request/response validation
✅ Authentication checks
✅ Input sanitization
✅ Rate limiting considerations
✅ Caching with TTL
✅ Error formatting
✅ RESTful patterns
```

## 🎯 Usage Examples

### Creating a New Component
```bash
# 1. Copy template
cp templates/components/ReactComponent.tsx src/components/MeditationTimer.tsx

# 2. Replace placeholders
sed -i 's/COMPONENT_NAME/MeditationTimer/g' src/components/MeditationTimer.tsx

# 3. Customize for your needs
# - Update interface properties
# - Implement component logic
# - Add specific styling
```

### Creating a New Service
```bash
# 1. Copy template
cp templates/services/SupabaseService.ts src/services/meditationService.ts

# 2. Replace placeholders
sed -i 's/SERVICE_NAME/Meditation/g' src/services/meditationService.ts
sed -i 's/SERVICE_TABLE_NAME/meditation_sessions/g' src/services/meditationService.ts

# 3. Define your data types
# - Update interfaces
# - Configure table name
# - Implement business logic
```

### Creating a New Page
```bash
# 1. Copy template
cp templates/pages/PageComponent.tsx src/pages/MeditationLibrary.tsx

# 2. Replace placeholders
sed -i 's/PAGE_NAME/MeditationLibrary/g' src/pages/MeditationLibrary.tsx

# 3. Add to router
# Add route in App.tsx
```

## 🏗️ Template Structure

### Common Patterns
All templates follow these patterns:
- **TypeScript-first**: Strong typing throughout
- **Error handling**: Comprehensive error states
- **Performance**: Caching and optimization
- **Accessibility**: ARIA labels and keyboard navigation
- **Internationalization**: Indonesian language support
- **Testing**: Test-ready structure
- **Documentation**: Inline comments and examples

### File Organization
```
templates/
├── components/          # UI component templates
├── services/           # Business logic services
├── pages/              # Full page components
├── hooks/              # Custom React hooks
├── contexts/           # React context providers
├── api/                # API endpoint handlers
├── database/           # Database schemas
├── config/             # Configuration files
├── utils/              # Utility functions
├── tests/              # Test templates
└── README.md           # This file
```

## 🔧 Customization Guide

### 1. Update Interfaces
```typescript
// Before (template)
interface COMPONENT_NAME_Props {
  title: string;
  description?: string;
}

// After (customized)
interface MeditationTimerProps {
  duration: number;
  soundEnabled: boolean;
  onComplete: () => void;
}
```

### 2. Implement Business Logic
```typescript
// Replace TODO comments with actual implementation
// TODO: Add your event handlers
const handleStart = () => {
  setIsActive(true);
  startTimer();
};
```

### 3. Add Styling
```typescript
// Use existing design system classes
<Card className="meditation-timer bg-gradient-to-br from-primary/5 to-accent/5">
```

### 4. Configure Database
```sql
-- Update table and column names
CREATE TABLE meditation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  duration INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);
```

## ✅ Best Practices

### 1. Follow Naming Conventions
- Components: PascalCase (`MeditationTimer`)
- Services: camelCase with Service suffix (`meditationService`)
- Hooks: camelCase with use prefix (`useMeditation`)
- Types: PascalCase with descriptive suffix (`MeditationData`)

### 2. Maintain Consistency
- Use established patterns from existing codebase
- Follow the same error handling approach
- Maintain the same logging format
- Use consistent styling patterns

### 3. Test Your Code
- Copy test template for each new component
- Update test cases for your specific logic
- Ensure accessibility tests pass
- Test error scenarios

### 4. Document Changes
- Add JSDoc comments for public APIs
- Update README files when adding new patterns
- Document breaking changes
- Include usage examples

## 🧪 Testing Templates

Each template includes comprehensive test examples:
```typescript
// Component tests
describe('COMPONENT_NAME', () => {
  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByTestId('component')).toBeInTheDocument();
  });
});

// Service tests
describe('SERVICE_NAME_Service', () => {
  it('creates record successfully', async () => {
    const result = await service.create(mockData);
    expect(result.id).toBeDefined();
  });
});
```

## 🔍 Template Validation

Before using templates in production:

### 1. Code Quality
- [ ] TypeScript types are properly defined
- [ ] Error handling is implemented
- [ ] Performance considerations are addressed
- [ ] Security practices are followed

### 2. Functionality
- [ ] All TODO comments are addressed
- [ ] Placeholder names are replaced
- [ ] Business logic is implemented
- [ ] Edge cases are handled

### 3. Integration
- [ ] Follows project conventions
- [ ] Integrates with existing services
- [ ] Maintains design system consistency
- [ ] Works with authentication flow

## 📚 Additional Resources

### Documentation
- [Supabase Documentation](https://supabase.com/docs)
- [React TypeScript Guide](https://react-typescript-cheatsheet.netlify.app/)
- [Testing Library Docs](https://testing-library.com/docs/)

### Project-Specific Guides
- `src/types/auth.ts` - Authentication types
- `src/components/ui/` - Design system components
- `src/config/supabase.ts` - Database configuration
- `src/test/setup.ts` - Test configuration

## 🚨 Important Notes

### Security Considerations
- Never hardcode secrets in templates
- Always validate user input
- Implement proper authentication checks
- Use RLS policies for database access

### Performance Tips
- Implement caching where appropriate
- Use memoization for expensive calculations
- Optimize database queries
- Consider bundle size impact

### Maintenance
- Keep templates updated with latest patterns
- Review and update dependencies regularly
- Monitor for security vulnerabilities
- Gather feedback from team usage

---

**Happy coding! 🎉**

These templates are designed to accelerate development while maintaining high code quality and consistency across the Sembalun meditation app.