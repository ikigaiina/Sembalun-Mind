// Parallel Execution Performance Test
import { testFunction1, performanceTest1 } from './test-parallel-1.js';
import { testFunction2, performanceTest2 } from './test-parallel-2.js';
import { testFunction3, performanceTest3 } from './test-parallel-3.js';

console.log('=== PARALLEL EXECUTION BENCHMARK ===');

// Test sequential execution
const testSequential = async () => {
  console.log('Starting Sequential Test...');
  const start = performance.now();
  
  const result1 = performanceTest1(5000);
  const result2 = performanceTest2(5000);
  const result3 = performanceTest3(5000);
  
  const end = performance.now();
  console.log(`Sequential execution time: ${end - start}ms`);
  return { time: end - start, results: [result1, result2, result3] };
};

// Test parallel execution
const testParallel = async () => {
  console.log('Starting Parallel Test...');
  const start = performance.now();
  
  const promises = [
    Promise.resolve(performanceTest1(5000)),
    Promise.resolve(performanceTest2(5000)),
    Promise.resolve(performanceTest3(5000))
  ];
  
  const results = await Promise.all(promises);
  const end = performance.now();
  console.log(`Parallel execution time: ${end - start}ms`);
  return { time: end - start, results };
};

// Run benchmark
const runBenchmark = async () => {
  const sequential = await testSequential();
  const parallel = await testParallel();
  
  const improvement = ((sequential.time - parallel.time) / sequential.time * 100).toFixed(2);
  
  console.log('\n=== BENCHMARK RESULTS ===');
  console.log(`Sequential: ${sequential.time.toFixed(2)}ms`);
  console.log(`Parallel: ${parallel.time.toFixed(2)}ms`);
  console.log(`Performance improvement: ${improvement}%`);
  
  return { sequential, parallel, improvement };
};

export { runBenchmark, testSequential, testParallel };