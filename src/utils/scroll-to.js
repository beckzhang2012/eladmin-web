/**
 * 平滑滚动到指定位置
 * @param {number} to - 目标位置
 * @param {number} duration - 动画持续时间
 */
function scrollTo(to, duration = 500) {
  const start = window.pageYOffset
  const change = to - start
  const increment = 20
  let currentTime = 0

  const animateScroll = function() {
    currentTime += increment
    const val = Math.easeInOutQuad(currentTime, start, change, duration)
    window.scrollTo(0, val)
    if (currentTime < duration) {
      setTimeout(animateScroll, increment)
    }
  }

  animateScroll()
}

// 缓动函数
Math.easeInOutQuad = function(t, b, c, d) {
  t /= d / 2
  if (t < 1) return c / 2 * t * t + b
  t--
  return -c / 2 * (t * (t - 2) - 1) + b
}

export { scrollTo }
