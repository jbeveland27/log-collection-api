/**
 * This defines a series of scenarios:
 * 1. testFilesWithVariableEntries_ConstantArrivalRate - A fixed number of iterations are executed
      in a specified period of time (i.e. constant arrival rate of concurrent requests).
 * 2. testFilesWithVariableEntries_ConstantVus - fixed number of VUs execute as many iterations as
 *    possible for a specified amount of time (i.e. constant number of users).
 *
 */
export const scenarios = {
  testFilesWithVariableEntries_ConstantArrivalRate: {
    executor: 'constant-arrival-rate',
    startTime: '1s',
    gracefulStop: '5s',
    rate: 2000,
    timeUnit: '1s',
    duration: '10s',
    preAllocatedVUs: 100,
    maxVUs: 1000,
    exec: 'testFilesWithVariableEntries',
    tags: { test_type: 'testFilesWithVariableEntries_ConstantArrivalRate' },
  },
  testFilesWithVariableEntries_ConstantVus: {
    executor: 'constant-vus',
    startTime: '1s',
    gracefulStop: '5s',
    vus: 200,
    duration: '10s',
    exec: 'testFilesWithVariableEntries',
    tags: { test_type: 'testFilesWithVariableEntries_ConstantArrivalRate' },
  },
};

module.exports = {
  scenarios,
};
