import * as core from '@actions/core'
import * as api from './api'
import * as pullRequest from './pullRequest'
import { format } from './format'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const repository: string = core.getInput('github-repository')
    const githubToken: string = core.getInput('github-token')
    const eventName: string = core.getInput('github-event-name')
    //const beforeSha: string = core.getInput('github-event-before')
    //const skipDoubling: string = core.getInput('skip-depth-doubling')

    core.debug(`Event name is: ${eventName}`)
    switch (eventName) {
      case 'pull_request': {
        const defaultBranchName = await api.getDefaultBranch(
          repository,
          githubToken
        )
        const changes = await pullRequest.getChanges(defaultBranchName)
        core.setOutput('changes', await format(changes))
        break
      }
      case 'push':
        break
      default:
        core.error(`'${eventName}' events are not supported.`)
        break
    }

    // Set outputs for other workflow steps to use
    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
