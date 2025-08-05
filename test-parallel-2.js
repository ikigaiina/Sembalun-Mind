// Test file 2 for parallel execution benchmarking
console.log('Parallel Test File 2 - Created for batch operation testing');

export const testFunction2 = () => {
  return 'Test function 2 executed';
};

export const performanceTest2 = (iterations = 1000) => {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    // Simulate different work pattern
    Array.from({length: 10}, (_, i) => i * 2);
  }
  const end = performance.now();
  return end - start;
};