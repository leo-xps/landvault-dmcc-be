module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  moduleNameMapper: {
    '^@common/(.*)$': '<rootDir>/common/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
    '^@data/(.*)$': '<rootDir>/data/$1',
    '^@modules/(.*)$': '<rootDir>/modules/$1',
    '^@providers/(.*)$': '<rootDir>/providers/$1',
    '^@entities/(.*)$': '<rootDir>/entities/$1',
    '^@enums/(.*)$': '<rootDir>/enums/$1',
    '^@swagger/(.*)$': '<rootDir>/swagger/$1',
  },
};
