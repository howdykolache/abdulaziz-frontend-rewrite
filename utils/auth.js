import moment from 'moment'

export const isLoggedIn = () => {
  const isLoggedIn = localStorage.getItem('loggedIn')
  const lastLoginTime = localStorage.getItem('lastLogIn')

  if (!isLoggedIn) return false

  const loginDate = moment(lastLoginTime).local()
  const today = moment().local()

  const daysSinceLastLogIn = today.diff(loginDate, 'days')

  if (daysSinceLastLogIn > 7) {
    localStorage.setItem('loggedIn', false)
    return false
  }

  return true
}
