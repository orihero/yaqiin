import Category from "../../models/Category";
import { CategoryWithAttributes, CategoryCreationResult } from './types';
import { PRODUCT_CATEGORY_STRUCTURE } from './productCategoryMapping';

/**
 * Category Service for Excel Import
 * Handles category creation and management
 */
export class CategoryService {
  /**
   * Get all categories with their attributes
   */
  async getAllCategoriesWithAttributes(): Promise<CategoryWithAttributes[]> {
    try {
      console.log(`📂 Fetching all categories with attributes...`);
      const categories = await Category.find({ isActive: true })
        .populate('attributes')
        .lean();

      const categoriesWithAttributes: CategoryWithAttributes[] = categories.map(category => ({
        _id: category._id.toString(),
        name: category.name,
        parentId: category.parentId?.toString() || null,
        attributes: category.attributes?.map((attr: any) => ({
          _id: attr._id.toString(),
          name: attr.name,
          value: attr.value
        })) || []
      }));

      console.log(`✅ Found ${categoriesWithAttributes.length} categories with attributes`);
      
      // If no categories exist, try to create comprehensive ones
      if (categoriesWithAttributes.length === 0) {
        console.log(`⚠️ No categories found. Attempting to create comprehensive categories...`);
        await this.createComprehensiveCategories();
        
        // Try to fetch again after creating comprehensive categories
        const newCategories = await Category.find({ isActive: true })
          .populate('attributes')
          .lean();

        const newCategoriesWithAttributes: CategoryWithAttributes[] = newCategories.map(category => ({
          _id: category._id.toString(),
          name: category.name,
          parentId: category.parentId?.toString() || null,
          attributes: category.attributes?.map((attr: any) => ({
            _id: attr._id.toString(),
            name: attr.name,
            value: attr.value
          })) || []
        }));

        console.log(`✅ Created and found ${newCategoriesWithAttributes.length} categories with attributes`);
        return newCategoriesWithAttributes;
      }
      
      return categoriesWithAttributes;
    } catch (error) {
      console.error("❌ Error fetching categories with attributes:", error);
      throw new Error("Failed to fetch categories with attributes");
    }
  }

  /**
   * Create comprehensive category structure as requested by user
   * This includes all 7 main categories with their subcategories and third-level categories
   */
  async createComprehensiveCategories(): Promise<CategoryCreationResult> {
    try {
      console.log(`🔧 Creating comprehensive category structure...`);

      // Clear existing categories first
      await Category.deleteMany({});
      console.log(`🗑️ Cleared existing categories`);

      // Function to extract English translation from category name
      const extractEnglishName = (name: string): string => {
        const match = name.match(/\(([^)]+)\)/);
        return match ? match[1] : name;
      };

      // Function to create category
      const createCategory = async (name: string, parentId: string | null = null, sortOrder: number = 0): Promise<string> => {
        const englishName = extractEnglishName(name);
        
        const category = await Category.create({
          name: {
            uz: name,
            ru: name
          },
          description: { 
            uz: englishName,
            ru: englishName
          },
          parentId: parentId,
          sortOrder: sortOrder,
          isActive: true
        });

        return (category._id as any).toString();
      };

      const mainCategoryIds: { [key: string]: string } = {};
      const subCategoryIds: { [key: string]: string } = {};

      // Create main categories from the new structure
      let mainSortOrder = 1;
      const mainCategories = PRODUCT_CATEGORY_STRUCTURE.filter(cat => !cat.parentCategory);
      
      for (const category of mainCategories) {
        const mainCategoryId = await createCategory(category.name.ru, null, mainSortOrder);
        mainCategoryIds[category.name.ru] = mainCategoryId;
        console.log(`✅ Created main category: ${category.name.ru} (ID: ${mainCategoryId})`);
        mainSortOrder++;
      }

      // Create subcategories
      const subCategories = PRODUCT_CATEGORY_STRUCTURE.filter(cat => cat.parentCategory && mainCategories.some(main => main.name.ru === cat.parentCategory));
      let subSortOrder = 1;
      
      for (const category of subCategories) {
        if (category.parentCategory && mainCategoryIds[category.parentCategory]) {
          const subCategoryId = await createCategory(category.name.ru, mainCategoryIds[category.parentCategory], subSortOrder);
          subCategoryIds[`${category.parentCategory}-${category.name.ru}`] = subCategoryId;
          console.log(`  ✅ Created subcategory: ${category.name.ru} (ID: ${subCategoryId})`);
          subSortOrder++;
        }
      }

      // Create brand categories (third level)
      const brandCategories = PRODUCT_CATEGORY_STRUCTURE.filter(cat => 
        cat.parentCategory && 
        subCategories.some(sub => sub.name.ru === cat.parentCategory)
      );
      let brandSortOrder = 1;
      
      for (const category of brandCategories) {
        if (category.parentCategory && subCategoryIds[`${subCategories.find(sub => sub.name.ru === category.parentCategory)?.parentCategory}-${category.parentCategory}`]) {
          const brandCategoryId = await createCategory(category.name.ru, subCategoryIds[`${subCategories.find(sub => sub.name.ru === category.parentCategory)?.parentCategory}-${category.parentCategory}`], brandSortOrder);
          console.log(`    ✅ Created brand category: ${category.name.ru} (ID: ${brandCategoryId})`);
          brandSortOrder++;
        }
      }

      // Count total categories
      const totalCategories = await Category.countDocuments();
      console.log(`\n🎉 Comprehensive category creation completed!`);
      console.log(`📊 Total categories created: ${totalCategories}`);
      console.log(`📂 Main categories: ${Object.keys(mainCategoryIds).length}`);
      
      return {
        success: true,
        totalCategories,
        mainCategories: Object.keys(mainCategoryIds).length,
        message: `Successfully created ${totalCategories} categories with ${Object.keys(mainCategoryIds).length} main categories`
      };
      
    } catch (error) {
      console.error(`❌ Failed to create comprehensive categories:`, error);
      return {
        success: false,
        totalCategories: 0,
        mainCategories: 0,
        message: `Failed to create categories: ${(error as any).message || 'Unknown error'}`
      };
    }
  }
}
