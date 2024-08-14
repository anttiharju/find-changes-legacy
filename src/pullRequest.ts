import { exec } from 'child_process';

/**
 * Compares currently checked out branch to the default branch.
 * @param defaultBranch The name of the default branch.
 * @returns {Promise<string>} Resolves with git diff output.
 */
export async function getChanges(defaultBranch: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validate defaultBranch -- might be too strict but should cover most cases
    const branchNamePattern = /^[a-zA-Z0-9]+(?:[-/][a-zA-Z0-9]+)*$/;

    if (typeof defaultBranch !== 'string' || !branchNamePattern.test(defaultBranch)) {
      reject(new Error('Invalid branch name'));
      return;
    }
    // execute the below command
    // git fetch --depth=10 origin "${defaultBranch}:${defaultBranch}" --update-head-ok
    const command = `git fetch --depth=10 origin "${defaultBranch}:${defaultBranch}" --update-head-ok`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error fetching branch: ${stderr}`);
        return;
      }
      resolve(stdout);
    });
  });
}