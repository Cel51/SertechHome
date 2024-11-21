import { useStorage } from "@vueuse/core";

export const categorizedActions = (data) => {
  if(!Array.isArray(data) || data.length == 0) {
    return;
  }
  // Helper function to recursively organize the data into categories and subcategories
  function createCategoryStructure(data) {
    // Create an object to group by categories
    const categoryMap = {};

    // Process each item in the data
    data.forEach(item => {
      const categories = item.categories.split(' | ');
      const sc = item.sc;
      const label = item.label;
      const action = item.action;

      // Base category
      const category = categories[0];

      // Ensure the category exists in the map
      if (!categoryMap[category]) {
        categoryMap[category] = { actions: [], subcategories: {} };
      }

      // If there are subcategories, process them
      if (categories.length > 1) {
        const subcategory = categories[1];
        if (!categoryMap[category].subcategories[subcategory]) {
          categoryMap[category].subcategories[subcategory] = { actions: [] };
        }
        categoryMap[category].subcategories[subcategory].actions.push({ sc, label, action });
      } else {
        // If there are no subcategories, add the action to the parent category
        categoryMap[category].actions.push({ sc, label, action});
      }
    });

    // Convert the map to the desired structure
    return Object.keys(categoryMap).map(category => {
      const categoryData = categoryMap[category];
      const subcategories = Object.keys(categoryData.subcategories).map(subcategory => {
        return {
          category: subcategory,
          actions: categoryData.subcategories[subcategory].actions,
          subcategories: [] // No further subcategories in this case
        };
      });

      return {
        category: category,
        actions: categoryData.actions,
        subcategories: subcategories
      };
    });
  }

  // Call the helper function to process the data
  return createCategoryStructure(data);
}