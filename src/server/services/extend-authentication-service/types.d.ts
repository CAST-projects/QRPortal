
export type UserIdentity = {
  userInfo: UserInfo
  roles: Array<string>
  customerRecord: CustomerRecord
  uid?: string
}

export type UserInfo = {
  fullname: string
  firstname: string
  lastname: string
  email: string
}

export type Restrictions = {
  highlight: boolean
  imaging: boolean
  security: boolean
}

export type CustomerRecord = {
  id?: number
  name: string
  domains: Array<string>
  country?: string
  maintenanceExpiration?: string
  restrictions: Restrictions
}
