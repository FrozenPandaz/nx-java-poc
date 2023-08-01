/* eslint-disable */
export default {
  displayName: 'tools-plugins-@nx-gradle',
  preset: '../../../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../../coverage/tools/plugins/@nx/gradle',
};
