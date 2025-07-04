import * as core from '@actions/core'
import * as github from '@actions/github'
import {
  formatTime,
  getBranchByHead,
  getBranchByTag,
  getEnvPathByBranch,
  getTagUrl
} from './utils'

import axios from 'axios'
// debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true
const ref = github.context.ref
const pushPayload: any = github.context.payload

console.log('github-----', github)
console.log('github.context', github.context)

async function run(): Promise<void> {
  try {
    const topRepository: string = core.getInput('repository')
    const githubToken: string = core.getInput('githubToken')
    const type: string = core.getInput('type')
    if (type === 'stringify') {
      const branch = getBranchByHead(ref) || getBranchByTag(ref)
      const {repository, pusher} = pushPayload || {}
      const {full_name} = repository || {}
      const {name: pusherName} = pusher || {}
      const [, outRepository] = full_name.split('/')

      console.log('topRepository: ', topRepository)
      const tagUrl = getTagUrl(topRepository || full_name)
      const timesTamp = formatTime(new Date(), '{yy}-{mm}-{dd}-{h}-{i}-{s}')

      const tagName = `${outRepository}/${branch}/${timesTamp}`
      const tagMessage = {
        branch,
        repository: outRepository,
        pushRef: getEnvPathByBranch(branch),
        pusherName
      }
      console.log('tagName: ', tagName)
      console.log('tagUrl: ', tagUrl)
      console.log('tagMessage: ', tagMessage)
      console.log('githubToken:***** ',  `Bearer ${githubToken}`)
      const ret = await axios({
        method: 'POST',
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'content-type': 'application/json',
          Authorization: `Bearer ${githubToken}`
        },
        url: tagUrl,
        data: {
          tag_name: tagName,
          body: JSON.stringify(tagMessage)
        }
      })
      console.log('ret------: ', ret.data)
    }
    if (type === 'parse') {
      const {release} = pushPayload || {}
      const {body} = release || {}
      const tagInfo: any = JSON.parse(body)
      console.log('tagInfo: ', tagInfo)
      const {
        branch: tagBranch,
        repository: tagRepository,
        pusherName,
        pushRef,
      } = tagInfo || {}
      console.log('Branch----', tagBranch)
      console.log('repository----', tagRepository)
      console.log('pusherName----', pusherName)
      console.log('pushRef----', pushRef)

      core.exportVariable('BRANCH', tagBranch)
      core.exportVariable('REPOSITORY', tagRepository)
      core.exportVariable('PUSHREF', pushRef)
    }
  } catch (error) {
    const e: any = error
    core.setFailed(e.message)
  }
}
run()
