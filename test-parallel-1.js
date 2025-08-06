// Test file 1 for parallel execution benchmarking
console.log('Parallel Test File 1 - Created for batch operation testing');

export const testFunction1 = () => {
  return 'Test function 1 executed';
};

export const performanceTest1 = (iterations = 1000) => {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    // Simulate some work
    Math.random() * Math.random();
  }
  const end = performance.now();
  return end - start;
};