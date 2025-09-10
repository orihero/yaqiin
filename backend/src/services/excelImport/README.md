# Excel Import Service - Modular Structure

This directory contains the refactored Excel Import Service, organized into smaller, more manageable modules for better maintainability and readability.

## 📁 File Structure

```
excelImport/
├── index.ts                 # Main export file
├── types.ts                 # TypeScript interfaces and types
├── constants.ts             # Constants and configuration
├── productCategoryMapping.ts # Product category mapping with index ranges
├── prompts.ts              # AI prompts and templates
├── utils.ts                # Utility functions
├── categoryService.ts      # Category management service
├── WorkQueue.ts            # Thread-safe work queue
└── README.md               # This documentation
```

## 🔧 Module Overview

### `types.ts`
Contains all TypeScript interfaces and types used throughout the service:
- `ExcelProduct` - Raw product data from Excel
- `CategoryWithAttributes` - Category with its attributes
- `EnhancedProduct` - AI-enhanced product data
- `ThreadStatus` - Thread monitoring information
- `ImportResult` - Import operation results
- `CategoryCreationResult` - Category creation results

### `constants.ts`
Centralized configuration and constants:
- `UNIT_OPTIONS` - Available unit types for products
- `DEFAULT_CONFIG` - Default configuration values
- Environment variable defaults
- Token limits and thresholds

### `productCategoryMapping.ts`
Product category mapping with index-based assignment:
- `PRODUCT_CATEGORY_STRUCTURE` - Complete category structure with index ranges
- `findCategoryByIndex()` - Function to find category by product index
- `getMainCategories()` - Get all main categories
- `getSubcategories()` - Get subcategories for a main category
- `getBrandCategories()` - Get brand categories for a subcategory

### `prompts.ts`
AI prompt templates and generators:
- `SYSTEM_PROMPTS` - System prompts for different scenarios
- `generateMainPrompt()` - Main AI enhancement prompt
- `generateFallbackPrompt()` - Fallback prompt for token limits
- Category section generators for different optimization levels

### `utils.ts`
Utility functions for common operations:
- `estimateTokenCount()` - Token estimation for prompts
- `extractProductInfo()` - Extract weight/quantity from product names
- `generateFallbackUzbekName()` - Fallback name translation
- `cleanAndParseAIResponse()` - JSON response parsing
- Thread management utilities

### `categoryService.ts`
Category management operations:
- `getAllCategoriesWithAttributes()` - Fetch categories with attributes
- `createComprehensiveCategories()` - Create full category structure
- Automatic category creation when none exist

### `WorkQueue.ts`
Thread-safe work queue for parallel processing:
- `getNextProduct()` - Get next product (thread-safe)
- `markAsProcessed()` - Mark product as processed
- Progress tracking and statistics

## 🚀 Usage

### Basic Import
```typescript
import { ExcelImportService } from './excelImport';

// Use the service
const result = await ExcelImportService.importProducts('path/to/file.xlsx');
```

### Using Individual Components
```typescript
import { 
  CategoryService, 
  WorkQueue, 
  findCategoryByIndex,
  getMainCategories 
} from './excelImport';

// Use individual components
const categoryService = new CategoryService();
const categories = await categoryService.getAllCategoriesWithAttributes();
```

## 🔄 Migration from Monolithic Service

The original `excelImportService.ts` has been refactored into this modular structure:

### Before (Monolithic)
- Single 2,775-line file
- All functionality in one place
- Hard to maintain and test
- Difficult to reuse components

### After (Modular)
- Multiple focused files
- Clear separation of concerns
- Easy to test individual components
- Reusable modules
- Better code organization

## 🧪 Benefits

1. **Maintainability**: Each file has a single responsibility
2. **Testability**: Individual components can be tested in isolation
3. **Reusability**: Components can be used independently
4. **Readability**: Smaller, focused files are easier to understand
5. **Scalability**: Easy to add new features without affecting existing code
6. **Debugging**: Easier to locate and fix issues

## 🔧 Configuration

The service uses environment variables for configuration:

```bash
# AI Configuration
OPENROUTER_API_KEY=your_api_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=anthropic/claude-3.5-haiku

# Import Configuration
EXCEL_IMPORT_GENERATE_IMAGES=true
EXCEL_IMPORT_LIMIT=500

# Server Configuration
API_URL=http://localhost:8080
```

## 📊 Performance

The modular structure maintains the same performance characteristics as the original service:
- Multi-threaded processing
- AI-powered category selection
- Token optimization for large category structures
- Circuit breaker pattern for error handling
- Work queue for thread-safe processing

## 🛠️ Development

When adding new features:

1. **Types**: Add new interfaces to `types.ts`
2. **Constants**: Add configuration to `constants.ts`
3. **Utilities**: Add helper functions to `utils.ts`
4. **Prompts**: Add AI prompts to `prompts.ts`
5. **Services**: Create new service files as needed
6. **Exports**: Update `index.ts` to export new components

## 📝 Notes

- All original functionality is preserved
- The main service interface remains unchanged
- Backward compatibility is maintained
- The service can still be used as a drop-in replacement
