import router from '@/router'

export function nodeLink() {
  if('node' in router.currentRoute.params) {
    return '/' + router.currentRoute.params.node + '/'
  }
  return '/'
}
