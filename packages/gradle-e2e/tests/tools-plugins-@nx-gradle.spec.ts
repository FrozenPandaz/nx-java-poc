import { execSync } from 'child_process';
import { join } from 'path';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';

describe('tools-plugins-@nx-gradle', () => {
  let projectDirectory: string;

  function execInTestProject(command: string) {
    return execSync(command, {
      cwd: projectDirectory,
      stdio: 'inherit',
      env: process.env,
    });
  }

  beforeAll(() => {
    const projectName = 'test-project';
    projectDirectory = join(process.cwd(), 'tmp', projectName);

    // Cleanup the test project
    rmSync(projectDirectory, {
      recursive: true,
      force: true,
    });

    projectDirectory = createTestProject(projectName, projectDirectory);
    execInTestProject(`git init`);

    const nxJson = JSON.parse(
      readFileSync(join(projectDirectory, 'nx.json')).toString()
    );
    nxJson.installation.plugins = {
      '@nx/gradle': 'e2e',
    };
    writeFileSync(
      join(projectDirectory, 'nx.json'),
      JSON.stringify(nxJson, null, 2)
    );
  });

  afterAll(() => {
    execInTestProject('code .');
  });

  it('should setup a gradle project', () => {
    ['java', 'groovy', 'kotlin'].forEach((language, index) => {
      execInTestProject(
        `./nx g @nx/gradle:application app-${language} --language=${language} --dsl=groovy --sourcePackage=com.app${index} --rootProjectName=test`
      );
      execInTestProject(
        `./nx g @nx/gradle:library lib-${language} --language=${language} --dsl=groovy --sourcePackage=com.app${index} --rootProjectName=test`
      );
      execInTestProject(
        `./nx g @nx/gradle:copy-project app-${language}-copy --project=app-${language}`
      )
      execInTestProject(
        `./nx g @nx/gradle:copy-project lib-${language}-copy --project=lib-${language}`
      )

      execInTestProject(`nx build app-${language}`);
      execInTestProject(`nx build lib-${language}`);
      execInTestProject(`nx build app-${language}-copy`);
      execInTestProject(`nx build lib-${language}-copy`);
      execInTestProject(`nx test app-${language}`);
      execInTestProject(`nx test lib-${language}`);
      execInTestProject(`nx test app-${language}-copy`);
      execInTestProject(`nx test lib-${language}-copy`);
    });
  });
});

/**
 * Creates a test project with create-nx-workspace and installs the plugin
 * @returns The directory where the test project was created
 */
function createTestProject(projectName: string, projectDirectory: string) {
  // Ensure projectDirectory is empty
  rmSync(projectDirectory, {
    recursive: true,
    force: true,
  });
  mkdirSync(projectDirectory, {
    recursive: true,
  });

  execSync(`npx --yes nx@next init --useDotNxInstallation --no-interactive`, {
    cwd: projectDirectory,
    stdio: 'inherit',
    env: process.env,
  });
  console.log(`Created test project in "${projectDirectory}"`);

  return projectDirectory;
}
