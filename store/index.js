import Vuex from 'vuex'
import state from './state'
import user from './modules/user'

const store = () => {
  return new Vuex.Store({
    state,
    actions: {
      configVal({ commit }, { key, val }) {
        commit('CONFIGVAL', { key: key, val: val })
      }
    },
    mutations: {
      CONFIGVAL(state, { key, val }) {
        state[key] = val
      }
    },
    modules: {
      user
    }
  })
}
export default store
