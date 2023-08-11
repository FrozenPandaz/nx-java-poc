import {
  formatFiles,
  generateFiles,
  joinPathFragments,
  names,
  ProjectConfiguration,
  readProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { CopyProjectGeneratorSchema } from './schema';
import { join } from 'path';
import gradleProjectGenerator from '../gradle-project/generator';

export async function copyProjectGenerator(
  tree: Tree,
  options: CopyProjectGeneratorSchema
) {
  const projectToBeCopied: ProjectConfiguration = readProjectConfiguration(
    tree,
    options.project
  );

  const newProjectRoot = options.directory ?? options.name;
  const newProjectType = projectToBeCopied.projectType;
  const dsl = tree.exists(
    joinPathFragments(projectToBeCopied.root, 'build.gradle.kts').toString()
  )
    ? 'kotlin'
    : 'groovy';
  const language = tree.exists(
    joinPathFragments(projectToBeCopied.root, 'src/main/kotlin').toString()
  )
    ? 'kotlin'
    : tree.exists(
        joinPathFragments(projectToBeCopied.root, 'src/main/java').toString()
      )
    ? 'java'
    : 'groovy';
  const buildGradle = tree.read(
    joinPathFragments(
      projectToBeCopied.root,
      dsl === 'kotlin' ? 'build.gradle.kts' : 'build.gradle'
    ).toString()
  );
  const sourcePackage = buildGradle?.toString().match(/group = "(.*)"/)?.[1];
  const sourcePackagePath = sourcePackage?.replace(new RegExp('\\.', 'g'), '/');

  const task = gradleProjectGenerator(tree, {
    ...options,
    rootProjectName: '',
    sourcePackage,
    dsl,
    language,
    projectType: newProjectType,
  });

  // add src directory
  generateFiles(
    tree,
    join(__dirname, 'files', language),
    join(newProjectRoot),
    {
      ...options,
      sourcePackage,
      sourcePackagePath,
      projectClassName: names(options.name).className,
    }
  );
  await formatFiles(tree);

  return task;
}

export default copyProjectGenerator;
