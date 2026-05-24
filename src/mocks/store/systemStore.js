import { mockOrgs } from '../data/orgs.js'
import { mockUsers } from '../data/users.js'
import { mockRoles } from '../data/roles.js'

let orgsStore = JSON.parse(JSON.stringify(mockOrgs))
let usersStore = JSON.parse(JSON.stringify(mockUsers))
let rolesStore = JSON.parse(JSON.stringify(mockRoles))

// Organization CRUD
export const getOrgs = () => orgsStore
export const addOrg = (org) => {
  const newOrg = { ...org, id: Math.max(...orgsStore.map(o => o.id), 0) + 1, status: 1 }
  orgsStore.push(newOrg)
  return newOrg
}
export const updateOrg = (id, patch) => {
  const index = orgsStore.findIndex(o => o.id === id)
  if (index >= 0) {
    orgsStore[index] = { ...orgsStore[index], ...patch }
    return orgsStore[index]
  }
  return null
}
export const deleteOrg = (id) => {
  orgsStore = orgsStore.filter(o => o.id !== id)
}

// User CRUD
export const getUsers = () => usersStore
export const addUser = (user) => {
  const newUser = { ...user, id: Math.max(...usersStore.map(u => u.id), 0) + 1, status: 1 }
  usersStore.push(newUser)
  return newUser
}
export const updateUser = (id, patch) => {
  const index = usersStore.findIndex(u => u.id === id)
  if (index >= 0) {
    usersStore[index] = { ...usersStore[index], ...patch }
    return usersStore[index]
  }
  return null
}
export const deleteUser = (id) => {
  usersStore = usersStore.filter(u => u.id !== id)
}
export const resetPassword = (id, newPassword) => {
  const user = usersStore.find(u => u.id === id)
  if (user) {
    user.password = newPassword
    return true
  }
  return false
}

// Role CRUD
export const getRoles = () => rolesStore
export const addRole = (role) => {
  const newRole = { ...role, id: Math.max(...rolesStore.map(r => r.id), 0) + 1 }
  rolesStore.push(newRole)
  return newRole
}
export const updateRole = (id, patch) => {
  const index = rolesStore.findIndex(r => r.id === id)
  if (index >= 0) {
    rolesStore[index] = { ...rolesStore[index], ...patch }
    return rolesStore[index]
  }
  return null
}
export const deleteRole = (id) => {
  rolesStore = rolesStore.filter(r => r.id !== id)
}
