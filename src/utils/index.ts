/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable github/array-foreach */

export const getBranchByHead = (ref: string): string => {
  if (ref.includes('refs/heads/')) {
    return ref.replace('refs/heads/', '')
  }
  return ''
}

export const getBranchByTag = (ref: string): string => {
  if (ref.includes('refs/tags/release/')) {
    const commitMsg = ref.replace('refs/tags/', '')
    const index = commitMsg.lastIndexOf('-v')
    return commitMsg.slice(0, index)
  }
  return ''
}

export const getSyncBranch = (ref: string): string => {
  if (ref.includes('refs/heads/')) {
    return ref.replace('refs/heads/', '')
  }
  if (ref.includes('refs/tags/release/')) {
    const commitMsg = ref.replace('refs/tags/', '')
    const index = commitMsg.lastIndexOf('-dev-v')
    return commitMsg.slice(0, index)
  }
  return ''
}

export const getEnvPathByBranch = (branch: string): string => {
  if (['dev', 'uat', 'prod'].includes(branch)) {
    return branch
  }
  return 'dev'
}

export const getTagUrl = (repository: string): string => {
  return `https://api.github.com/repos/${repository}/releases`
}

/**
 * 格式化时间
 *
 * @param  {time} 时间
 * @param  {cFormat} 格式
 * @return {String} 字符串
 *
 * @example formatTime('2018-1-29', '{y}/{m}/{d} {h}:{i}:{s}') // -> 2018/01/29 00:00:00
 */
export const formatTime = (dateTime: any, cFormat: string): string => {
  let time = dateTime
  if (`${time}`.length === 10) {
    time = +time * 1000
  }

  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    date = new Date(time)
  }

  const formatObj: any = {
    y: date.getFullYear(),
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    if (key === 'a')
      return ['一', '二', '三', '四', '五', '六', '日'][value - 1]
    if (result.length > 0 && value < 10) {
      value = `0${value}`
    }
    return value || 0
  })
  return time_str
}

export const getEnvValueByBranch = (branch: string): any => {
  const envValueMap = {
    dev: {
      name: 'cms-dev',
      active: 'dev',
      image: 'registry.digitalocean.com/seechange/cms:dev',
      PORT: 3000,
      OUT_PORT: 13003
    },
    uat: {
      name: 'cms-uat',
      active: 'uat',
      image: 'registry.digitalocean.com/seechange/cms:uat',
      PORT: 3000,
      OUT_PORT: 3003
    },
    prod: {
      name: 'cms',
      active: 'prod',
      image: 'registry.digitalocean.com/seechange/cms',
      PORT: 3000,
      OUT_PORT: 3003
    }
  }
  return envValueMap?.[branch as keyof typeof envValueMap] || envValueMap.dev
}
