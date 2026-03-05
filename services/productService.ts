export const productService = {
  async getAll() {
    // Database removed per project request — return mock data
    return [
      { id: 1, name: "Sample Product" }
    ];
  }
};
