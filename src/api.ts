import * as core from '@actions/core';
import axios from 'axios';

/**
 * Calls GitHub API to fetch the default branch name of the current repository.
 * @returns {Promise<string>} Resolves with default branch name.
 */
export async function getDefaultBranch(repository: string, githubToken: string): Promise<string> {
    const url = `https://api.github.com/repos/${repository}`;
    const headers = {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
    };

    const fetchDefaultBranch = async (): Promise<string> => {
        try {
            const response = await axios.get(url, { headers });
            return response.data.default_branch;
        } catch (error) {
            core.warning('Failed to fetch default branch: ' + error);
            throw error;
        }
    };

    const retryWithBackoff = async (retries: number, delay: number): Promise<string> => {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                return await fetchDefaultBranch();
            } catch (error) {
                if (attempt < retries) {
                    core.info(`Retrying in ${delay / 1000 }s...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 5; // Increase delay for next retry
                } else {
                    const msg = `Failed to fetch default branch after ${retries} attempts`;
                    core.error(msg);
                    throw new Error(msg);
                }
            }
        }
        throw new Error('Unexpected error');
    };

    return retryWithBackoff(3, 1000); // 3 attempts: initial, after 1s, after 5s, and finally throw an error
}